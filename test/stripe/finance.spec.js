const assert = require('assert')
const { finance } = require('../../stripe')

describe('finance', () => {
    describe('#convertToCent', () => {
        it('should convert float in cents', () => {
            const expected = 1099
            const actual = finance.convertToCent(10.99)
            assert.equal(actual, expected)
        })

        it('should convert integer to cents', () => {
            const expected = 129300
            const actual = finance.convertToCent(1293)
            assert.equal(actual, expected)
        })

        it('should throw an error if input is a string as it will not handle string to float conversion', () => {
            assert.throws(() => finance.convertToCent('123.97'), Error, 'Input amount is not a number')
        })
    })
})
