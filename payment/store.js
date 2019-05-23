const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true })

const blacklistSecrets = ({ providerPaymentSecret, ...item }) => item

const prepareItem = item => blacklistSecrets({
    ...item,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    success: false
})

const store = (TableName, Item) => new Promise((resolve, reject) => {
    docClient.put(
        { TableName, Item: prepareItem(Item) },
        (err, data) => err ? reject(err) : resolve(data)
    )
})

module.exports = store