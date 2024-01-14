function c2f(temp) {
    return Math.round((temp *  (9/5)) + 32);
}

function f2c(temp) {
    return Math.round((temp - 32) * (5/9));
}

function cad2usd(amnt) {
    return Math.round(((amnt * 0.74) * 100)) / 100
}

function usd2cad(amnt) {
    return Math.round(((amnt * 1.36) * 100)) / 100
}

function km2mi(dist) {
    return Math.round(((dist * 0.621371) * 10)) / 10
}

function mi2km(dist) {
    return Math.round(((dist * 1.60934) * 10)) / 10
}

function in2cm(dist) {
    return Math.round(((dist * 2.54) * 10)) / 10
}

function cm2in(dist) {
    return Math.round(((dist / 2.54) * 10)) / 10
}

function ft2m(dist) {
    return Math.round(((dist / 3.281) * 10)) / 10
}

function m2ft(dist) {
    return Math.round(((dist * 3.281) * 10)) / 10
}

function kg2lb(weight) {
    return Math.round(((weight * 2.205) * 10)) / 10
}

function lb2kg(weight) {
    return Math.round(((weight / 2.205) * 10)) / 10
}

module.exports = { c2f, f2c, usd2cad, cad2usd, km2mi, mi2km, kg2lb, lb2kg, in2cm, cm2in, ft2m, m2ft };