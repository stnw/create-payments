const mapPackageIds = (availablePackages, packageIds) => availablePackages.filter(package => packageIds.includes(package.id))

module.exports = mapPackageIds