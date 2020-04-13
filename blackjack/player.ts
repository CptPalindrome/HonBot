import { Card, CardType } from './card';

export class Player {
    public hand: Card[] = [];
    private _bet = 0;

    public constructor(
        public readonly userId: string,
        public readonly username: string,
        public money = 0) { }

    public addCard(card: Card): void {
        this.hand.push(card);
    }

    public get bet(): number {
        return this._bet;
    }

    public set bet(amount: number) {
        if (amount > this.money) {
            throw new Error('Bet amount cannot be larger than your money pool');
        }

        this._bet = amount;
    }

    public handTotal(): number {
        let total = 0;
        let aceCount = 0;
        
        this.hand.forEach((card: Card) => {
            if (card.type === CardType.Ace) {
                aceCount++;
            }
            total += card.value;
        });

        if (total > 21 && aceCount > 0) {
            while (total > 21 && aceCount > 0) {
                total -= 10;
                aceCount--;
            }
        }
        return total;
    }
}

// module.exports = Player