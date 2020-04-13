import { Player } from './player';
import { Card } from './card';
import { DeckUtility } from './deckUtility';
import fs = require('fs');

/** RULES: 
 * 
 * Standard Win 1:1 (Get your bet back & same amount from house. Don't double it if you don't subtract their current bet.
 * If you don't subtract their current bet, just add their bet to their total.
 * 
 * Dealt Blackjack 3:2 (1.5x winnings. Same other rules as regular win)
 * 
 * Double Down 2:2 (Literally the same, but you either win double or lose double)
 * 
 * Push (Net neutral. Win/Lose nothing)
 * 
 * Split - Just splits into two hands each with their own bets, which follow the above rules.
 */
export class Game {
    public players: Player[] = [];
    public deck: Card[] = DeckUtility.buildDeck();

    // TODO: type
    private _saveData: any = require('./playerSaveData.json');

    public addPlayer(id: string, username: string): void {
        if(!this._saveData.players)
        {
            this._saveData.players = [];
        }
        // TODO: type for save data and players from save data
        if (!this._saveData.players.find((player: any) => player.id === id)) {
            this._saveData.players.push({
                id: id,
                username: username,
                totalPoints: 1000
            });
            fs.writeFileSync('./playerSaveData.json', JSON.stringify(this._saveData, null, 4));
        }
        this.players.push(new Player(id, username, this._saveData.players.find((player: any) => player.id === id).totalPoints));
    }

    public removePlayer(id: string): void {
        // TODO: get latest changes that actually work
    }

    /**
     * TODO: Does this work when passing Player like this?
     */
    public hit(player: Player): void {
        const newCard: Card = this.drawRandomCard();
        player.addCard(newCard);
    }

    /**
     * Is this better off in DeckUtility?
     */
    private drawRandomCard(): Card {
        const cardIndex: number = Math.floor(Math.random() * this.deck.length);
        const cardOfDeck: Card = this.deck[cardIndex];
        this.deck.splice(cardIndex, 1);

        return cardOfDeck;
    }
}
