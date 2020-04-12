class Card {
    constructor(number, suit) {
        this.number = number;
        this.suit = suit;
    }

    getNumber() {
        return this.number;
    }

    getSuit() {
        return this.suit;
    }
}

module.exports = Card