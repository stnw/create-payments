const assert = require('assert')
const { flattenDescription } = require('../../packages')

describe('flattenDescription', () => {

    it('should return descriptions of all packages as one string', () => {
        const expected = 'package1 / package2'
        const actual = flattenDescription([{ description: 'package1' }, { description: 'package2' }])
        assert.equal(actual, expected)
    })
})
