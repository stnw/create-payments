
const {
    GET_PACKAGES_ENDPOINT,
    STRIPE_SECRET_KEY_SSM_NAME,
    STRIPE_PUBLIC_KEY_SSM_NAME
} = process.env
const Sentry = require('@sentry/node')
const {
    getResponseObject,
    getErrorResponseBody,
    logException,
    validateRequestParams,
    getHeaderFromApiGatewayEvent,
    handleBackendException,
    getSSMParameterValue
} = require('@mineko-io/lambda-basics')

const paymentModule = require('../payment')
const stripeModule = require('../stripe')
const packagesModule = require('../packages')

const requiredParams = ['customerId', 'packages', 'ticketId']

const createStripePaymentIntent = packages =>
    stripeModule.paymentIntents
        .init(STRIPE_SECRET_KEY_SSM_NAME, STRIPE_PUBLIC_KEY_SSM_NAME)
        .then(async ({ paymentIntents, stripePublicId }) => ({
            stripePaymentIntent: await paymentIntents.create({
                currency: 'eur',
                amount: stripeModule.finance.convertToCent(packagesModule.getGrossTotal(packages)),
                description: packagesModule.flattenDescription(packages)
            }),
            stripePublicId
        }))

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
                getErrorResponseBody(`Some Package(s) not supported for you partner`, 'Validation')
            )
        }

        return createStripePaymentIntent(packages)
            // @TODO: Store as well in database
            .then(({ stripePaymentIntent, stripePublicId }) => paymentModule.create(stripePaymentIntent, stripePublicId, params.customerId, params.ticketId))
            .then(payments => getResponseObject(201, headers, { payments }))

    } catch (err) {
        logException(err)
        return getResponseObject(500, headers, getErrorResponseBody('Unexpected error occurred', 'Internal'))
    } finally {
        await Sentry.flush(2000)
    }
}