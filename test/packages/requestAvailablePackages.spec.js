const assert = require('assert')
const moxios = require('moxios')
const { requestAvailablePackages } = require('../../packages')

describe('requestAvailablePackages', () => {
    beforeEach(function () {
        moxios.install()
    })

    afterEach(function () {
        moxios.uninstall()
    })

    it('should be return array of available packages for this partner token', async () => {
        const expected = [{ id: 'package1' }, { id: 'package2' }]

        let token, endpoint;
        moxios.wait(() => {
            let request = moxios.requests.mostRecent()

            endpoint = request.url
            token = request.headers.Authorization
            
            request.respondWith({
                status: 200,
                response: {
                    packages: expected
                }
            })
        })

        const actual = await requestAvailablePackages('https://package-api/packages', 'accessToken')
        
        assert.equal(endpoint, 'https://package-api/packages')
        assert.equal(token, 'accessToken')
        assert.equal(actual, expected)
    })
})
