const { URL } = require('url')

const setSearchParamToUrl = (urlString, key, value) => {
    const url = new URL(urlString)
    url.searchParams.set(key, value)
    return url.toString()
}

const create = (returnUrl, paymentMethod) => {
    const preReturnUrl = setSearchParamToUrl(returnUrl, 'payment_method', paymentMethod)
    return {
        successReturnUrl: setSearchParamToUrl(preReturnUrl, 'success', true),
        errorReturnUrl: setSearchParamToUrl(preReturnUrl, 'success', false)
    }
}

module.exports = create