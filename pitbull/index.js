const songlist = require('./pitbull.json');

function getRandomSong() {
    return songlist[Math.floor(Math.random() * songlist.length)];
}

function makeSongMessage() {
    const songData = getRandomSong();
    return `\`${songData.title}\` ${songData.url}`
}

module.exports = {
    makeSongMessage,
}