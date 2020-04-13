"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var player_1 = require("./player");
var deckUtility_1 = require("./deckUtility");
var fs = require("fs");
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
var Game = /** @class */ (function () {
    function Game() {
        this.players = [];
        this.deck = deckUtility_1.DeckUtility.buildDeck();
        // TODO: type
        this._saveData = require('./playerSaveData.json');
    }
    Game.prototype.addPlayer = function (id, username) {
        if (!this._saveData.players) {
            this._saveData.players = [];
        }
        // TODO: type for save data and players from save data
        if (!this._saveData.players.find(function (player) { return player.id === id; })) {
            this._saveData.players.push({
                id: id,
                username: username,
                totalPoints: 1000
            });
            fs.writeFileSync('./playerSaveData.json', JSON.stringify(this._saveData, null, 4));
        }
        this.players.push(new player_1.Player(id, username, this._saveData.players.find(function (player) { return player.id === id; }).totalPoints));
    };
    Game.prototype.removePlayer = function (id) {
        // TODO: get latest changes that actually work
    };
    /**
     * TODO: Does this work when passing Player like this?
     */
    Game.prototype.hit = function (player) {
        var newCard = this.drawRandomCard();
        player.addCard(newCard);
    };
    /**
     * Is this better off in DeckUtility?
     */
    Game.prototype.drawRandomCard = function () {
        var cardIndex = Math.floor(Math.random() * this.deck.length);
        var cardOfDeck = this.deck[cardIndex];
        this.deck.splice(cardIndex, 1);
        return cardOfDeck;
    };
    return Game;
}());
exports.Game = Game;
//# sourceMappingURL=game.js.map