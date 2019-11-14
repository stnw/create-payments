
const {
    GET_PACKAGES_ENDPOINT,
    STRIPE_SECRET_KEY_SSM_NAME,
    STRIPE_PUBLIC_KEY_SSM_NAME,
    DYNAMODB_TABLE,
    PAYPAL_CLIENT_ID_SSM_NAME,
    PAYPAL_CLIENT_SECRET_SSM_NAME,
    PAYPAL_MIDDLEWARE_URL,
    APP_ENVIRONMENT,
    SNS_TOPIC_ARN
} = process.env
const { 
    RuntimeInstance,
    ResponseHandlerInstance,
    ApiGatewayHeaderInstance,
    ValidateInstance,
    LoggerInstance
} = require('@mineko/lambda-core')

const paymentModule = require('../payment')
const stripeModule = require('../stripe')
const paypalModule = require('../paypal')
const invoiceModule = require('../invoice')
const prepayModule = require('../prepay')
const packagesModule = require('../packages')
const returnUrlModule = require('../returnUrl')
const snsModule = require('../sns')

const requiredParams = ['customerId', 'packages', 'ticketId', 'paymentMethod']

const createStripePaymentIntent = paymentMethod => (packages, returnUrl, ticketId, providerPaymentId) =>
    stripeModule.paymentIntents
        .create(
            paymentMethod,
            packages,
            ticketId,
            STRIPE_SECRET_KEY_SSM_NAME,
            STRIPE_PUBLIC_KEY_SSM_NAME
        )

const createStripeSource = paymentMethod => (packages, returnUrl, ticketId, providerPaymentId) =>
    stripeModule.source
        .create(
            paymentMethod,
            packages,
            ticketId,
            providerPaymentId,
            returnUrlModule.create(returnUrl, paymentMethod),
            STRIPE_SECRET_KEY_SSM_NAME,
            STRIPE_PUBLIC_KEY_SSM_NAME
        )

const createPaypalOrder = paymentMethod => (packages, clientReturnUrl, ticketId, providerPaymentId) =>
    paypalModule.order
        .create(
            paymentMethod,
            packages,
            ticketId,
            returnUrlModule.create(
                paypalModule.returnUrl(clientReturnUrl, PAYPAL_MIDDLEWARE_URL),
                paymentMethod
            ),
            PAYPAL_CLIENT_ID_SSM_NAME,
            PAYPAL_CLIENT_SECRET_SSM_NAME,
            APP_ENVIRONMENT
        )

const createInvoiceOrder = paymentMethod => packages =>
    invoiceModule.create(
            paymentMethod,
            packages
        )

const createPrepayOrder = paymentMethod => packages =>
    prepayModule.create(
            paymentMethod,
            packages
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
    'sepa': createStripeSource('sepa_debit'),
    'sofort': createStripeSource('sofort'),
    'invoice': createInvoiceOrder('invoice'),
    'prepay': createPrepayOrder('prepay'),
}

const handler = async event => {
    let headers = {}
    try {
        const body = event.body
        if (!body)
            return ResponseHandlerInstance.getResponseObject(400, headers, ResponseHandlerInstance.getErrorResponseBody('Request body is missing', 'Validation'))

        const params = JSON.parse(body)

        const validatedParams = ValidateInstance.requestParams(requiredParams)(params)
        if (validatedParams.length > 0) {
            return ResponseHandlerInstance.getResponseObject(
                400,
                headers,
                ResponseHandlerInstance.getErrorResponseBody(`Required request parameters missing in application/json body: ${validatedParams.join(',')}`, 'Validation')
            )
        }

        let availablePackages = {}
        try {
            availablePackages = await packagesModule.requestAvailablePackages(GET_PACKAGES_ENDPOINT, ApiGatewayHeaderInstance.get(event, 'Authorization'))
        } catch (err) {
            return ResponseHandlerInstance.handleBackendException(err)
        }

        const packages = packagesModule.mapPackageIds(availablePackages, params.packages)

        if (!packagesModule.validate(packages, params.packages)) {
            return ResponseHandlerInstance.getResponseObject(
                400,
                headers,
                ResponseHandlerInstance.getErrorResponseBody(`Some Package(s) not supported for you partner or total price of all packages is 0`, 'Validation')
            )
        }

        const paymentMethodHandler = paymentMethodHandlerMap[params.paymentMethod]

        const providerPaymentIntent = await paymentMethodHandler(packages, params.returnUrl, params.ticketId, params.providerPaymentId)
        LoggerInstance.log(`Created providerPaymentIntent with id ${providerPaymentIntent.id} and provider ${providerPaymentIntent.provider}`)

        const payment = await paymentModule.create(providerPaymentIntent, params.customerId, params.ticketId)
        LoggerInstance.log(`Created payment with id ${payment.id}`)

        return paymentModule.store(DYNAMODB_TABLE, payment)
            .then(async () => {
                const data = await snsModule.publish(SNS_TOPIC_ARN, payment)
                LoggerInstance.log(`Published created payment to SNS: TicketId: ${payment.ticketId} / PaymentId: ${payment.id}`)
            })
            .then(() => ResponseHandlerInstance.getResponseObject(201, headers, createResponseData(providerPaymentIntent, payment)))

    } catch (err) {
        return ResponseHandlerInstance.getResponseObject(500, headers, ResponseHandlerInstance.getErrorResponseBody('Unexpected error occurred: ' + err.message, 'Internal'))
    }
}

module.exports = async event => {
    return RuntimeInstance.execute(handler, event);
}