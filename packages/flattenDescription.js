const flattenDescription = packages => packages.map(package => package.description).join(' / ')

module.exports = flattenDescription