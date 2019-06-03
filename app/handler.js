
const {
    GET_PACKAGES_ENDPOINT,
    STRIPE_SECRET_KEY_SSM_NAME,
    STRIPE_PUBLIC_KEY_SSM_NAME,
    DYNAMODB_TABLE,
    PAYPAL_CLIENT_ID_SSM_NAME,
    PAYPAL_CLIENT_SECRET_SSM_NAME,
    APP_ENVIRONMENT
} = process.env
const Sentry = require('@sentry/node')
const {
    getResponseObject,
    getErrorResponseBody,
    logException,
    validateRequestParams,
    getHeaderFromApiGatewayEvent,
    handleBackendException
} = require('@mineko-io/lambda-basics')

const paymentModule = require('../payment')
const stripeModule = require('../stripe')
const paypalModule = require('../paypal')
const packagesModule = require('../packages')
const returnUrlModule = require('../returnUrl')

const requiredParams = ['customerId', 'packages', 'ticketId', 'paymentMethod']

const createStripePaymentIntent = paymentMethod => packages =>
    stripeModule.paymentIntents
        .create(
            paymentMethod,
            packages,
            STRIPE_SECRET_KEY_SSM_NAME,
            STRIPE_PUBLIC_KEY_SSM_NAME
        )

const createStripeSource = paymentMethod => (packages, returnUrl) =>
    stripeModule.source
        .create(
            paymentMethod,
            packages,
            returnUrlModule.create(returnUrl, paymentMethod),
            STRIPE_SECRET_KEY_SSM_NAME,
            STRIPE_PUBLIC_KEY_SSM_NAME
        )

const createPaypalOrder = paymentMethod => (packages, returnUrl) =>
    paypalModule.order
        .create(
            paymentMethod,
            packages,
            returnUrlModule.create(returnUrl, paymentMethod),
            PAYPAL_CLIENT_ID_SSM_NAME,
            PAYPAL_CLIENT_SECRET_SSM_NAME,
            APP_ENVIRONMENT
        )

const createResponseData = (providerPaymentIntent, payment) => {
    let data = {
        payment
    }

    if (providerPaymentIntent.redirectUrl)
        data.links = [{
            href: providerPaymentIntent.redirectUrl,
            rel: 'approve',
            type: 'GET'
        }]

    return data
}

const paymentMethodHandlerMap = {
    'creditcard': createStripePaymentIntent('creditcard'),
    'paypal': createPaypalOrder('paypal'),
    'sofort': createStripeSource('sofort')
}

module.exports = async event => {
    let headers = {}
    try {
        const body = event.body
        if (!body)
            return getResponseObject(400, headers, getErrorResponseBody('Request body is missing', 'Validation'))

        const params = JSON.parse(body)

        const validatedParams = validateRequestParams(requiredParams)(params)
        if (validatedParams.length > 0) {
            return getResponseObject(
                400,
                headers,
                getErrorResponseBody(`Required request parameters missing in application/json body: ${validatedParams.join(',')}`, 'Validation')
            )
        }

        let availablePackages = {}
        try {
            availablePackages = await packagesModule.requestAvailablePackages(GET_PACKAGES_ENDPOINT, getHeaderFromApiGatewayEvent('Authorization', event))
        } catch (err) {
            return handleBackendException(err)
        }

        const packages = packagesModule.mapPackageIds(availablePackages, params.packages)

        if (!packagesModule.validate(packages, params.packages)) {
            return getResponseObject(
                400,
                headers,
                getErrorResponseBody(`Some Package(s) not supported for you partner or total price of all packages is 0`, 'Validation')
            )
        }

        const paymentMethodHandler = paymentMethodHandlerMap[params.paymentMethod]

        const providerPaymentIntent = await paymentMethodHandler(packages, params.returnUrl)
        const payment = await paymentModule.create(providerPaymentIntent, params.customerId, params.ticketId)

        return paymentModule.store(DYNAMODB_TABLE, payment)
            .then(storeResult => getResponseObject(201, headers, createResponseData(providerPaymentIntent, payment)))

    } catch (err) {
        logException(err)
        return getResponseObject(500, headers, getErrorResponseBody('Unexpected error occurred: ' + err.message, 'Internal'))
    } finally {
        await Sentry.flush(2000)
    }
}