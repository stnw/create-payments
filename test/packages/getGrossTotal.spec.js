const assert = require('assert')
const { getGrossTotal } = require('../../packages')

describe('getGrossTotal', () => {
    const availablePackages = [{ id: 'package1' }, { id: 'package2' }, { id: 'package3' }]

    it('should return gross total of all given packages', () => {
        const expected = 110.43

        const actual = getGrossTotal([{ priceGross: 10 }, { priceGross: 90.43 }, { priceGross: 7 }, { priceGross: 3 }])

        assert.equal(actual, expected)
    })

    it('should return gross total even if some packages are without price', () => {
        const expected = 100.43

        const actual = getGrossTotal([{}, { priceGross: 90.43 }, { priceGross: 7 }, { priceGross: 3 }])

        assert.equal(actual, expected)
    })

    it('should return 0 on empty array', () => {
        expected = 0

        const actual = getGrossTotal([])

        assert.equal(actual, expected)
    })
})