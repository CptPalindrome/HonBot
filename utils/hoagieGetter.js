const fs = require('fs');
const randomProc = require('./randomProc');

const getHoagie = () => {
    
    if (randomProc(1, 50)) {
        const hoagieList = fs.readdirSync('./hoagies/shinies');
        const hoagie = 'shinies/' + hoagieList[Math.floor(Math.random() * hoagieList.length)];
        return {fileName: hoagie, hoagieName: `${hoagie.replace('shinies/', '').replaceAll('-', ' ').replace('.gif', '').trim()}`};
    }
    
    const hoagieList = fs.readdirSync('./hoagies');
    const hoagie = hoagieList[Math.floor(Math.random() * hoagieList.length)];
    return {fileName: hoagie, hoagieName: hoagie.replaceAll('-', ' ').replace('.gif', '').trim()};
}

module.exports = getHoagie;