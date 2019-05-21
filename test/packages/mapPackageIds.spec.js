const assert = require('assert')
const { mapPackageIds } = require('../../packages')

describe('mapPackageIds', () => {
    const availablePackages = [{ id: 'package1' }, { id: 'package2' }, { id: 'package3' }]

    it('should return array of full package objects of given package ids', () => {
        const expected = [{ id: 'package1' }, { id: 'package2' }]

        const actual = mapPackageIds(availablePackages, ['package1', 'package2'])
        assert.deepEqual(actual, expected)
    })

    it('should only return full package objects if available', () => {
        const expected = [{ id: 'package1' }]

        const actual = mapPackageIds(availablePackages, ['package1', 'package4'])
        assert.deepEqual(actual, expected)
    })

    it('should return empty array if no packageId is part of available packages', () => {
        const expected = []

        const actual = mapPackageIds(availablePackages, ['package4', 'package5'])
        assert.deepEqual(actual, expected)
    })
})