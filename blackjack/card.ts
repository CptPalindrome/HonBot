export class Card {
    public getNumber(): number {
        return this.value;
    }

    public getSuit(): string {
        return CardSuit[this.suit];
    }

    public toString(): string {
        return `${this.value} of ${this.suit}s`;
    }

    public constructor(
        public readonly value: number,
        public readonly suit: CardSuit,
        public readonly type: CardType = CardType.NonFace) { }
}

export class FaceCard extends Card {
    public toString(): string {
        return `${CardType[this.type]} of ${CardSuit[this.suit]}s`;
    }
}

export enum CardSuit {
    Clubs,
    Diamonds,
    Hearts,
    Spades
}

export enum CardType {
    Ace,
    Jack,
    King,
    NonFace,
    Queen
}

// module.exports = Card