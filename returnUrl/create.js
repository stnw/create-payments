const { setSearchParamToUrl } = require('../utils/url')

const setStandardParams = (url, paymentMethod) => setSearchParamToUrl(url, 'payment_method', paymentMethod)

const create = (returnUrl, paymentMethod) => {
    try {
        const preReturnUrl = setStandardParams(returnUrl, paymentMethod)
        return {
            successReturnUrl: setSearchParamToUrl(preReturnUrl, 'success', true),
            errorReturnUrl: setSearchParamToUrl(preReturnUrl, 'success', false)
        }
    } catch (err) {
        throw new Error(`returnUrl '${returnUrl}' invalid: ` + JSON.stringify(err))
    }

}

module.exports = create