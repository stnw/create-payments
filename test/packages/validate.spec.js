const assert = require('assert')
const { validate } = require('../../packages')

describe('validate', () => {

    it('should be true if mapped packages are the same as packages from params', () => {
        const expected = true
        const actual = validate([{ id: 'package1' }], ['package1'])
        assert.equal(actual, expected)
    })

    it('is false otherwise', () => {
        const expected = false
        const actual = validate([{ id: 'package2' }], ['package1'])
        assert.equal(actual, expected)
    })
})
