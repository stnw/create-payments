const validate = (mappedPackages, packageIds) => mappedPackages.every(package => packageIds.includes(package.id))

module.exports = validate