class Card {
    public getNumber(): number {
        return this.number;
    }

    public getSuit(): string {
        return this.suit;
    }

    public constructor(
        public readonly number: number,
        public readonly suit: string) { }
}

module.exports = Card