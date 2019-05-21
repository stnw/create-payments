const Stripe = require('stripe')
const { getSSMParameterValue } = require('@mineko-io/lambda-basics')

const init = ssmParameterName => getSSMParameterValue(ssmParameterName)
    .then(Stripe)
    .then(stripe => stripe.paymentIntents)

module.exports = {
    init
}