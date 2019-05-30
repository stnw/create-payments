const initStripe = require('./init')
const finance = require('./finance')
const packagesModule = require('../packages')

const init = (secretParameterName, publicParameterName) =>
    initStripe(secretParameterName, publicParameterName)
        .then(({ stripe, stripePublicId }) => ({
            paymentIntents: stripe.paymentIntents,
            stripePublicId
        }))

const create = async (paymentMethod, packages, secretParameterName, publicParameterName) =>
    init(secretParameterName, publicParameterName)
        .then(async ({ paymentIntents, stripePublicId }) => ({
            stripePaymentIntent: await paymentIntents.create({
                currency: 'eur',
                amount: finance.convertToCent(packagesModule.getGrossTotal(packages)),
                description: packagesModule.flattenDescription(packages)
            }),
            stripePublicId
        }))
        .then(({ stripePaymentIntent, stripePublicId }) => ({
            ...stripePaymentIntent,
            publicId: stripePublicId,
            paymentMethod,
            provider: 'stripe'
        }))

module.exports = {
    create
}