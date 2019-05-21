const axios = require('axios')

const requestAvailablePackages = (endpoint, token) => axios.get(endpoint, {
    headers: {
        'Authorization': token
    }
}).then(res => res.data.packages)

module.exports = requestAvailablePackages