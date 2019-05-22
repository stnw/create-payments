const assert = require('assert')
const proxyquire = require('proxyquire')
const create = proxyquire('../../payment/create', {
    'uuid/v4': () => 'mockedUUID'
})

const getExpected = description => ({
    id: 'mockedUUID',
    provider: 'stripe',
    providerPaymentId: 'stripeId',
    providerPaymentSecret: 'stripeSecret',
    providerPublicId: 'publicId',
    amount: 12345,
    currency: 'eur',
    description,
    customerId: '987633',
    ticketId: 'ABC-123'
})

const getStripePaymentIntentsMock = description => ({
    id: 'stripeId',
    client_secret: 'stripeSecret',
    amount: 12345,
    currency: 'eur',
    description
})

describe('create', () => {
    it('should create payment object from inputs', () => {
        const expected = getExpected('test')

        const stripePaymentIntents = getStripePaymentIntentsMock('test')

        const actual = create(stripePaymentIntents, 'publicId', '987633', 'ABC-123')

        assert.deepEqual(actual, expected)
    })

    it('should create paymey object with empty description if not given', () => {
        const expected = getExpected('')

        const stripePaymentIntents = getStripePaymentIntentsMock(null)

        const actual = create(stripePaymentIntents, 'publicId', '987633', 'ABC-123')

        assert.deepEqual(actual, expected)
    })
})
