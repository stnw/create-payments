const assert = require('assert')
const proxyquire = require('proxyquire')

const docClientMock = class DocumentClient {
    constructor() { }
    put(params, callback) { params.Item.reject ? callback(params, null) : callback(null, params) }

}

const store = proxyquire('../../payment/store', {
    'aws-sdk': {
        DynamoDB: {
            DocumentClient: docClientMock
        }
    }
})

describe('store', () => {
    it('should store given object', async () => {
        const item = { id: 'paymentId', attribute: 'value' }
        const tableName = 'table'
        const expected = {
            TableName: tableName,
            Item: item
        }

        const actual = await store(tableName, item)

        assert.deepEqual(actual, expected)
    })

    it('should filter providerPaymentSecret', async () => {
        const item = { id: 'paymentId', attribute: 'value', providerPaymentSecret: 'secret' }
        const tableName = 'table'
        const expected = {
            TableName: tableName,
            Item: { id: 'paymentId', attribute: 'value' }
        }

        const actual = await store(tableName, item)

        assert.deepEqual(actual, expected)
    })


    it('should reject on put error', async () => {
        const expected = 'promise rejected'
        let actual = ''

        try {
            await store('tableName', { reject: true })
        } catch (err) {
            actual = expected
        }

        assert.equal(actual, expected)
    })
})
