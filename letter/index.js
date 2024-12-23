class Letter {
    constructor () {
        this.alphaLower = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
        ];      
        this.alphaUpper = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        ];
    }

    getRandomLetter(startingLetter = 'a', endLetter = 'z') {
        let subAlphaLower = this.alphaLower;
        let subAlphaUpper = this.alphaUpper;
        try {
            if(startingLetter.toLowerCase() !== 'a' || endLetter.toLowerCase !== 'z') {
                subAlphaLower = subAlphaLower.slice(subAlphaLower.findIndex((letter) => letter === startingLetter.toLowerCase()), subAlphaLower.findIndex((letter) => letter === endLetter.toLowerCase()));
                subAlphaUpper = subAlphaUpper.slice(subAlphaUpper.findIndex((letter) => letter === startingLetter.toUpperCase()), subAlphaUpper.findIndex((letter) => letter === endLetter.toUpperCase()));
            }
        } catch(e) {
            console.error(e);
            return 'Hmm...something went wrong, are your parameters broke'
        }
            const subsetAlpha = subAlphaLower.concat(subAlphaUpper);
            return subsetAlpha[Math.floor(Math.random() * subsetAlpha.length)];
    }
}

module.exports = Letter;