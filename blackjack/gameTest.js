let Player = require('./player.js');
let Card = require('./card.js');
let saveData = require('./playerSaveData.json');
const fs = require('fs');

/** RULES: 
 * Standard Win: 1:1 (Get your bet back & same amount from house. Don't double it if you don't subtract their current bet. If you don't subtract their current bet, just add their bet to their total)
 * Dealt Blackjack 3:2 (1.5x winnings. Same other rules as regular win)
 * Double Down 2:2 (Literally the same, but you either win double or lose double)
 * Push (Net neutral. Win/Lose nothing)
 * Split - Just splits into two hands each with their own bets, which follow the above rules.
 */

class Game {

    constructor() {
        this.round = {
            players: []
        };
        this.players = [];
        this.deck = [];
        this.cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King', 'Ace'];
        this.suit = ['Spades', 'Clubs', 'Hearts', 'Diamonds']
    }

    buildDeck(numberOfDecks) {
        this.deck = [];
        for (let i = 0; i < numberOfDecks; i++) {
            for (let j = 0; j < this.cards.length; j++) {
                this.deck.push(new Card(this.cards[j], this.suit[0]));
                this.deck.push(new Card(this.cards[j], this.suit[1]));
                this.deck.push(new Card(this.cards[j], this.suit[2]));
                this.deck.push(new Card(this.cards[j], this.suit[3]));
            }
        }
    }

    addPlayer(id, username) {
        if(!saveData.players)
            {
                saveData.players = [];
            }
        if (!saveData.players.find(player => player.id === id)) {
            saveData.players.push({
                id: id,
                username: username,
                totalPoints: 1000
            });
            fs.writeFileSync('./playerSaveData.json', JSON.stringify(saveData, null, 4));
        }
        this.players.push(new Player(id, username, saveData.players.find(player => player.id === id).totalPoints));
    }

    removePlayer(id) {
        let foundAtIndex = -1;
        this.players.forEach((player, index) => {
            if (player.userId === id) {
                foundAtIndex = index;
            }
        });
        if (foundAtIndex !== -1) {
            this.players.splice(foundAtIndex, 1);
        }
    }

    removePlayers(ids) {
        for (let i = 0; i < ids.length; i++) {
            let foundAtIndex = -1;
            this.players.forEach((player, index) => {
                if (player.userId === ids[i]) {
                    foundAtIndex = index;
                }
            });
            if (foundAtIndex !== -1) {
                this.players.splice(foundAtIndex, 1);
            }
        }
    }
    
    resetPlayers() {
        this.players.splice(0, this.players.length);
    }

    drawRandomCard() {
        let cardOfDeck = this.deck[Math.floor(Math.random() * this.deck.length)];
        this.deck.splice(this.deck.indexOf(cardOfDeck), 1);
        return cardOfDeck;
    }

    hit(player) {
        let newCard = this.drawRandomCard();
        player.addCard(newCard);
        player.checkBust();
    }
}

module.exports = Game;