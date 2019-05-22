const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true })

const blacklistSecrets = ({ providerPaymentSecret, ...item }) => item

const setUpdated = item => ({
    ...item,
    updated: new Date().toISOString()
})

const setCreated = item => ({
    ...item,
    created: new Date().toISOString()
})

const prepareItem = item => blacklistSecrets(setUpdated(setCreated(item)))

const store = (TableName, Item) => new Promise((resolve, reject) => {
    docClient.put(
        { TableName, Item: prepareItem(Item) },
        (err, data) => err ? reject(err) : resolve(data)
    )
})

module.exports = store