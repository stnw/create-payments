const initStripe = require('./init')
const finance = require('../utils/finance')
const packagesModule = require('../packages')

const init = (secretParameterName, publicParameterName) =>
    initStripe(secretParameterName, publicParameterName)
        .then(({ stripe, stripePublicId }) => ({
            paymentIntents: stripe.paymentIntents,
            stripePublicId
        }))

const getDescription = (ticketId, packages) => {
    let description = ticketId
    const packageDescription = packagesModule.flattenDescription(packages)
    if (packageDescription.length > 0)
        description += ` / ${packageDescription}`
    return description
}

const create = async (paymentMethod, packages, ticketId, secretParameterName, publicParameterName) =>
    init(secretParameterName, publicParameterName)
        .then(async ({ paymentIntents, stripePublicId }) => ({
            stripePaymentIntent: await paymentIntents.create({
                currency: 'eur',
                amount: finance.convertToCent(packagesModule.getGrossTotal(packages)),
                description: getDescription(ticketId, packages)
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