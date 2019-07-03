const AWS = require('aws-sdk')
const sns = new AWS.SNS()

const publish = (TopicArn, message) => sns.publish({
    TopicArn,
    Message: JSON.stringify(message)
}).promise()

module.exports = publish