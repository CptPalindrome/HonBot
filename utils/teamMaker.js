const teamParts = require('./teamParts.json');

function createTeams(names) {
    let shuffledNames = names.slice().sort(() => Math.random() - 0.5);
    let splitIndex = Math.ceil(shuffledNames.length / 2);
    let firstList = shuffledNames.slice(0, splitIndex).map(item => item.trim()).join(', ');
    let secondList = shuffledNames.slice(splitIndex).map(item => item.trim()).join(', ');
    return [firstList, secondList];
}

function generateTeamName() {
    const adjective = teamParts.adjectives[Math.floor(Math.random() * teamParts.adjectives.length)];
    const animal = teamParts.animalsPlural[Math.floor(Math.random() * teamParts.animalsPlural.length)];
    return `${adjective} ${animal}`;
}

function generateTeamNameAlliteration() {
    const adjective = teamParts.adjectives[Math.floor(Math.random() * teamParts.adjectives.length)];
    const selectiveAnimals = teamParts.animalsPlural.filter(animal => {
        const letter = adjective[0];
        return animal.startsWith(letter);
    });
    const animal = selectiveAnimals[Math.floor(Math.random() * selectiveAnimals.length)];
    return `${adjective} ${animal}`;
}


module.exports = {
    createTeams, 
    generateTeamName,
    generateTeamNameAlliteration,
}
