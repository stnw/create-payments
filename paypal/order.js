const axios = require('axios')
const initPaypal = require('./init')
const packagesModule = require('../packages')
const { convertToCent } = require('../utils/finance')

const ORDER_ENDPOINT = '/v2/checkout/orders'

// intent": "CAPTURE",
//   "purchase_units": [
//     {
//       "amount": {
//         "currency_code": "USD",
//         "value": "100.00"
//       }
//     }
//   ]

const getOrderData = (amount, currency, description, returnUrls) => ({
    intent: 'CAPTURE',
    purchase_units: [
        {
            amount: {
                currency_code: currency,
                value: amount
            },
            description
        }
    ],
    application_context: {
        return_url: returnUrls.successReturnUrl,
        cancel_url: returnUrls.errorReturnUrl
    }
})

const getApproveLink = order => order.links.find(link => link.rel == 'approve').href

const createOrder = ({ apiUrl, accessToken, data }) => axios
    .post(
        `${apiUrl}${ORDER_ENDPOINT}`,
        data,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )
    .then(res => res.data)

const create = async (paymentMethod, packages, ticketId, returnUrls, clientIdParameterName, clientSecretParameterName, env) =>
    initPaypal(clientIdParameterName, clientSecretParameterName, env)
        .then(async paypal => {
            const amount = packagesModule.getGrossTotal(packages)
            const currency = 'EUR'

            const order = await createOrder({
                ...paypal,
                data: getOrderData(amount, currency, ticketId, returnUrls)
            })

            return {
                id: order.id,
                amount: convertToCent(amount),
                currency,
                redirectUrl: getApproveLink(order),
                paymentMethod,
                provider: 'paypal'
            }
        })

module.exports = {
    create
}