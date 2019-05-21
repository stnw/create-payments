const getGrossTotal = packages => packages.reduce((total, package) => total + package.priceGross || 0, 0)

module.exports = getGrossTotal