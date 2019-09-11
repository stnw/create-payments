const { SSMParameterInstance, OAuthInstance } = require('@mineko/lambda-core')

const API_URLS = {
    'staging': 'https://api.sandbox.paypal.com',
    'production': 'https://api.paypal.com'
}

const OAUTH_ENDPOINT = '/v1/oauth2/token'


const getSSMParameterValues = async (clientIdParameterName, clientSecretParameterName) => {
    const clientId = SSMParameterInstance.getValue(clientIdParameterName)
    const clientSecret = SSMParameterInstance.getValue(clientSecretParameterName)

    return {
        clientId: await clientId,
        clientSecret: await clientSecret
    }
}

const init = async (clientIdParameterName, clientSecretParameterName, env) => {
    const apiUrl = API_URLS[env]

    return getSSMParameterValues(clientIdParameterName, clientSecretParameterName)
        .then(({ clientId, clientSecret }) => OAuthInstance.getAccessToken(`${apiUrl}${OAUTH_ENDPOINT}`, clientId, clientSecret))
        .then(data => data['access_token'])
        .then(accessToken => ({
            accessToken,
            apiUrl
        }))
}

module.exports = init