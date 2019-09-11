const Stripe = require('stripe')
const { SSMParameterInstance } = require('@mineko/lambda-core')

const init = async (secretParameterName, publicParameterName) => {
    const stripe = SSMParameterInstance.getValue(secretParameterName)
        .then(Stripe)
    const stripePublicId = SSMParameterInstance.getValue(publicParameterName)

    return {
        stripe: await stripe,
        stripePublicId: await stripePublicId
    }
}

module.exports = init