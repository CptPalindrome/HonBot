class Letter {
    constructor () {
        this.alphaLower = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
        ];      
        this.alphaUpper = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        ];
    }

    getRandomLetter(startingLetter = 'a', lowerOnly = false) {
        let subAlphaLower = this.alphaLower;
        let subAlphaUpper = this.alphaUpper;
        if(startingLetter.toLowerCase() !== 'a') {
            subAlphaLower = subAlphaLower.slice(subAlphaLower.findIndex((letter) => letter === startingLetter.toLowerCase()));
            subAlphaUpper = subAlphaUpper.slice(subAlphaUpper.findIndex((letter) => letter === startingLetter.toUpperCase()));
        }
        const subsetAlpha = lowerOnly ? subAlphaLower : subAlphaLower.concat(subAlphaUpper);
        return subsetAlpha[Math.floor(Math.random() * subsetAlpha.length)];
    }
}

module.exports = Letter;