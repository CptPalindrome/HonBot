// author: Chris --Github @sermicsalot

let tiers = ['Lowest', 'Low', 'Medium', 'High', 'Extreme'];
let weights = [13, 7, 4, 2, 1];
let payoutRatios = [1.2, 3.08, 6.15, 13.3, 27.6];
let wheel = [];

weights.forEach((weight, index) => {
    for (let i = 0; i < weight; i++) {
        wheel.push(tiers[index]);
    }
})

let simulationAmount = 1000;
let betPerSpin = 10;
let playerBalances = {'LowestGuy': 0, 'LowGuy': 0, 'MediumGuy': 0, 'HighGuy': 0, 'ExtremeGuy': 0};
let occurences = {'lowest': 0, 'low': 0, 'medium': 0, 'high': 0, 'extreme': 0};

for (let i = 0; i < simulationAmount; i++) {
    switch (spinWheel()) {
        case 'Lowest':
            playerBalances.LowestGuy += betPerSpin*payoutRatios[0];
            playerBalances.LowGuy -= betPerSpin;
            playerBalances.MediumGuy -= betPerSpin;
            playerBalances.HighGuy -= betPerSpin;
            playerBalances.ExtremeGuy -= betPerSpin;
            occurences.lowest += 1;
            break;
        case 'Low':
            playerBalances.LowestGuy -= betPerSpin;
            playerBalances.LowGuy += betPerSpin*payoutRatios[1];
            playerBalances.MediumGuy -= betPerSpin;
            playerBalances.HighGuy -= betPerSpin;
            playerBalances.ExtremeGuy -= betPerSpin;
            occurences.low += 1;
            break;
        case 'Medium':
            playerBalances.LowestGuy -= betPerSpin;
            playerBalances.LowGuy -= betPerSpin;
            playerBalances.MediumGuy += betPerSpin*payoutRatios[2];
            playerBalances.HighGuy -= betPerSpin;
            playerBalances.ExtremeGuy -= betPerSpin;
            occurences.medium += 1;
            break;
        case 'High':
            playerBalances.LowestGuy -= betPerSpin;
            playerBalances.LowGuy -= betPerSpin;
            playerBalances.MediumGuy -= betPerSpin;
            playerBalances.HighGuy += betPerSpin*payoutRatios[3];
            playerBalances.ExtremeGuy -= betPerSpin;
            occurences.high += 1;
            break;
        case 'Extreme':
            playerBalances.LowestGuy -= betPerSpin;
            playerBalances.LowGuy -= betPerSpin;
            playerBalances.MediumGuy -= betPerSpin;
            playerBalances.HighGuy -= betPerSpin;
            playerBalances.ExtremeGuy += betPerSpin*payoutRatios[4];
            occurences.extreme += 1;
            break;
    }
    if ((i+1) != simulationAmount && (i+1) % (simulationAmount/10) == 0) {
        console.log(`Progress: ${100*(i+1)/simulationAmount}% done`);
    }
}
console.log(`Net Profits:\n`,playerBalances, '\n\nOccurences:\n', occurences);

function spinWheel() {
    return wheel[Math.floor(Math.random()*wheel.length)];
}