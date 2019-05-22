const uuid = require('uuid/v4')

const create = (stripePaymentIntent, stripePublicId, customerId, ticketId) => ({
    id: uuid(),
    provider: 'stripe',
    providerPublicId: stripePublicId,
    providerPaymentId: stripePaymentIntent.id,
    providerPaymentSecret: stripePaymentIntent.client_secret,
    amount: stripePaymentIntent.amount,
    currency: stripePaymentIntent.currency,
    description: stripePaymentIntent.description || '',
    customerId,
    ticketId
})

module.exports = create