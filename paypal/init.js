const { getSSMParameterValue, requestOAuth2AccessToken } = require('@mineko-io/lambda-basics')

const API_URLS = {
    'staging': 'https://api.sandbox.paypal.com',
    'production': 'https://api.paypal.com'
}

const OAUTH_ENDPOINT = '/v1/oauth2/token'


const getSSMParameterValues = async (clientIdParameterName, clientSecretParameterName) => {
    const clientId = getSSMParameterValue(clientIdParameterName)
    const clientSecret = getSSMParameterValue(clientSecretParameterName)

    return {
        clientId: await clientId,
        clientSecret: await clientSecret
    }
}

const init = async (clientIdParameterName, clientSecretParameterName, env) => {
    const apiUrl = API_URLS[env]

    return getSSMParameterValues(clientIdParameterName, clientSecretParameterName)
        .then(({ clientId, clientSecret }) => requestOAuth2AccessToken(`${apiUrl}${OAUTH_ENDPOINT}`, clientId, clientSecret))
        .then(res => res.data['access_token'])
        .then(accessToken => ({
            accessToken,
            apiUrl
        }))
}

module.exports = init