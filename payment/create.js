const uuid = require('uuid/v4')

const create = (providerPaymentIntent, customerId, ticketId) => ({
    id: uuid(),
    provider: providerPaymentIntent.provider,
    providerPublicId: providerPaymentIntent.publicId,
    providerPaymentId: providerPaymentIntent.id,
    providerPaymentSecret: providerPaymentIntent.client_secret,
    charged: providerPaymentIntent.charged,
    paymentMethod: providerPaymentIntent.paymentMethod,
    amount: providerPaymentIntent.amount,
    currency: providerPaymentIntent.currency,
    description: providerPaymentIntent.description || '',
    customerId,
    ticketId
})

module.exports = create