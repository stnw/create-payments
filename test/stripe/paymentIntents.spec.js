const assert = require('assert')
const proxyquire = require('proxyquire')
const paymentIntents = proxyquire('../../stripe/paymentIntents', {
    '@mineko/lambda-core': {
        SSMParameterInstance: {getValue: name => new Promise((resolve, reject) => resolve(name + 'Resolved'))}
    }
})

describe('paymentIntents', () => {
    describe('#init', () => {
        it('should initialize stripe and return constructed stripe object', async () => {
            const expected = 'object'

            const { paymentIntents: paymentIntentsInitialized } = await paymentIntents.init('secretParameterName', 'publicParameterName')
            const actual = typeof paymentIntentsInitialized

            assert.equal(actual, expected)
        })

        it('should be possible to create stripe paymentIntents', async () => {
            const expected = true
            const { paymentIntents: paymentIntentsInitialized } = await paymentIntents.init('secretParameterName', 'publicParameterName')

            const actual = 'create' in paymentIntentsInitialized

            assert.equal(actual, expected)
        })

        it('should return stripe public id as well', async () => {
            const expected = 'publicParameterNameResolved'
            
            const { stripePublicId: actual } = await paymentIntents.init('secretParameterName', 'publicParameterName')

            assert.equal(actual, expected)
        })
    })
})
