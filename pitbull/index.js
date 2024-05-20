const songlist = require('./pitbull.json');

function getRandomSong() {
    return songlist[Math.floor(Math.random() * songlist.length)];
}

module.exports = {
    getRandomSong,
}