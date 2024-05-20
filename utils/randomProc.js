// odds is the number to be under to proc, total is the maximum it can be.
function randomProc(odds, total) {
    if (Math.floor(Math.random() * total) <= odds) return true;
    return false;
}

module.exports = randomProc;