function c2f(temp) {
    return Math.round((temp *  (9/5)) + 32);
}

function f2c(temp) {
    return Math.round((temp - 32) * (5/9));
}

module.exports = { c2f, f2c };