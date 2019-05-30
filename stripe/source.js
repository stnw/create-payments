const initStripe = require('./init')
const finance = require('./finance')
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

const create = async (paymentMethod, packages, returnUrls, secretParameterName, publicParameterName) =>
    initStripe(secretParameterName, publicParameterName)
        .then(async ({ stripe, stripePublicId }) => ({
            stripePublicId,
            source: await new Promise(
                (res, rej) =>
                    stripe.sources.create(
                        {
                            type: paymentMethod,
                            amount: finance.convertToCent(packagesModule.getGrossTotal(packages)),
                            currency: 'eur',
                            ...sourceSettingsMap(returnUrls)[paymentMethod]
                        },
                        (err, source) => err ? rej(err) : res(source)
                    )
            )
        }))
        .then(({ source, stripePublicId }) => ({
            ...source,
            redirectUrl: source.redirect.url,
            paymentMethod,
            publicId: stripePublicId,
            provider: 'stripe',
            charged: false
        }))

module.exports = {
    create
}