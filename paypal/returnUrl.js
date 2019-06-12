const { setSearchParamToUrl } = require('../utils/url')

const create = (returnUrl, paypalMiddlewareUrl) => {
    const encodedReturnUrl = Buffer.from(returnUrl).toString('base64')
    return setSearchParamToUrl(paypalMiddlewareUrl, 'returnUrl', encodedReturnUrl)
}

module.exports = create