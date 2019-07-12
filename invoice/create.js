const packagesModule = require('../packages')
const { convertToCent } = require('../utils/finance')

const create = async (paymentMethod, packages) =>
{
    const amount = packagesModule.getGrossTotal(packages)
    const currency = 'EUR'

    return {
        amount: convertToCent(amount),
        currency,
        paymentMethod,
        provider: 'mineko'
    }
}

module.exports = create