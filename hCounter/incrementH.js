const fs = require('fs');

// counts number of times Hiro gets his reactions destroyed
if (!fs.existsSync('./hCounter/hCounter.json')) {
    fs.writeFileSync('./hCounter/hCounter.json', JSON.stringify({ count: 0 }, null, 2));
}

function incrementH() {
    const counter = JSON.parse(fs.readFileSync('./hCounter/hCounter.json', 'utf8'));
    counter.count++;
    fs.writeFileSync('./hCounter/hCounter.json', JSON.stringify(counter, null, 2));
}

function getH() {
    return JSON.parse(fs.readFileSync('./hCounter/hCounter.json', 'utf8')).count;
}

module.exports = { incrementH, getH};