const fs = require('fs');

const getHoagie = () => {
    const hoagieList = fs.readdirSync('./hoagies');

    const hoagie = hoagieList[Math.floor(Math.random() * hoagieList.length)];
    return {fileName: hoagie, hoagieName: hoagie.replaceAll('-', ' ').replace('.gif', '').trim()};
}

module.exports = getHoagie;