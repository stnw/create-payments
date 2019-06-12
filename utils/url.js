const { URL } = require('url')

const setSearchParamToUrl = (urlString, key, value) => {
    const url = new URL(urlString)
    url.searchParams.set(key, value)
    return url.toString()
}

module.exports = {
    setSearchParamToUrl
}