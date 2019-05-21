const convertToCent = amount => {
    if (typeof amount !== 'number') {
        throw new Error('Input amount is not a number')
    }
    return Math.round(amount * 100)
}

module.exports = {
    convertToCent
}