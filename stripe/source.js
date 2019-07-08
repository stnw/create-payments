const initStripe = require('./init')
const finance = require('../utils/finance')
const packagesModule = require('../packages')

const sourceSettingsMap = ({ successReturnUrl }) => ({
    'sofort': {
        sofort: {
            country: 'DE'
        },
        redirect: {
            return_url: successReturnUrl
        }
    }
})

const createStripeSourceData = (paymentMethod, packages, ticketId, returnUrls) => ({
    type: paymentMethod,
    amount: finance.convertToCent(packagesModule.getGrossTotal(packages)),
    currency: 'eur',
    statement_descriptor: ticketId,
    ...sourceSettingsMap(returnUrls)[paymentMethod] || {}
})

const createStripeSource = (stripeSourceData, stripe) => new Promise(
    (res, rej) =>
        stripe.sources.create(
            stripeSourceData,
            (err, source) => err ? rej(err) : res(source)
        )
)

const hasClientCreatedSource = paymentProviderId => paymentProviderId && paymentProviderId.length > 0

const getSource = (paymentMethod, packages, ticketId, returnUrls, stripe, providerPaymentId) => {
    const stripeSourceData = createStripeSourceData(paymentMethod, packages, ticketId, returnUrls)

    if (hasClientCreatedSource(paymentProviderId)) {
        return ({ ...stripeSourceData, id: providerPaymentId })
    }
    return createStripeSource(stripeSourceData, stripe)

}

const getRedirectUrl = source => {
    const { redirect: { url = '' } = {} } = source
    return url
}

const create = async (paymentMethod, packages, ticketId, providerPaymentId, returnUrls, secretParameterName, publicParameterName) => {
    const { stripe, stripePublicId } = await initStripe(secretParameterName, publicParameterName)
    const source = await getSource(paymentMethod, packages, ticketId, returnUrls, stripe, providerPaymentId)

    return ({
        ...source,
        redirectUrl: getRedirectUrl(source),
        paymentMethod,
        publicId: stripePublicId,
        provider: 'stripe',
        charged: false
    })
}

module.exports = {
    create
}