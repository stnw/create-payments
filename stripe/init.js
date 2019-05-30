const Stripe = require('stripe')
const { getSSMParameterValue } = require('@mineko-io/lambda-basics')

const init = async (secretParameterName, publicParameterName) => {
    const stripe = getSSMParameterValue(secretParameterName)
        .then(Stripe)
    const stripePublicId = getSSMParameterValue(publicParameterName)

    return {
        stripe: await stripe,
        stripePublicId: await stripePublicId
    }
}

module.exports = init