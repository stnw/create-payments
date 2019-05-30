const getGrossTotal = require('./getGrossTotal')

const validate = (mappedPackages, packageIds) =>
    mappedPackages.length > 0
    && mappedPackages.every(package => packageIds.includes(package.id))
    && getGrossTotal(mappedPackages) > 0

module.exports = validate