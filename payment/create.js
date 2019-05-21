const uuid = require('uuid/v4')

const create = (stripePaymentIntent, customerId, ticketId) => ({
    id: uuid(),
    provider: 'stripe',
    providerPaymentId: stripePaymentIntent.id,
    providerPaymentSecret: stripePaymentIntent.client_secret,
    amount: stripePaymentIntent.amount,
    currency: stripePaymentIntent.currency,
    description: stripePaymentIntent.description || '',
    customerId,
    ticketId
})

module.exports = create