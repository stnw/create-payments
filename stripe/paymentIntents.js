const Stripe = require('stripe')
const { getSSMParameterValue } = require('@mineko-io/lambda-basics')

const init = async (secretParameterName, publicParameterName) => {
    const paymentIntents = getSSMParameterValue(secretParameterName)
        .then(Stripe)
        .then(stripe => stripe.paymentIntents)
    const stripePublicId = getSSMParameterValue(publicParameterName)

    return {
        paymentIntents: await paymentIntents,
        stripePublicId: await stripePublicId
    }
}

module.exports = {
    init
}