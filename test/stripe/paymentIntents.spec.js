const assert = require('assert')
const proxyquire = require('proxyquire')
const paymentIntents = proxyquire('../../stripe/paymentIntents', {
    '@mineko-io/lambda-basics': {
        getSSMParameterValue: name => new Promise((resolve, reject) => resolve(name))
    }
})

describe('paymentIntents', () => {
    describe('#init', () => {
        it('should initialize stripe and return constructed stripe object', async () => {
            const expected = 'object'
            const actual = typeof await paymentIntents.init('parameterName')
            assert.equal(actual, expected)
        })

        it('should be possible to create stripe paymentIntents', async () => {
            const expected = true
            const paymentIntentsInitialized = await paymentIntents.init('parameterName')

            const actual = 'create' in paymentIntentsInitialized

            assert.equal(actual, expected)
        })
    })
})
