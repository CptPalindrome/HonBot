"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var card_1 = require("./card");
var Player = /** @class */ (function () {
    function Player(userId, username, money) {
        if (money === void 0) { money = 0; }
        this.userId = userId;
        this.username = username;
        this.money = money;
        this.hand = [];
        this._bet = 0;
    }
    Player.prototype.addCard = function (card) {
        this.hand.push(card);
    };
    Object.defineProperty(Player.prototype, "bet", {
        get: function () {
            return this._bet;
        },
        set: function (amount) {
            if (amount > this.money) {
                throw new Error('Bet amount cannot be larger than your money pool');
            }
            this._bet = amount;
        },
        enumerable: true,
        configurable: true
    });
    Player.prototype.handTotal = function () {
        var total = 0;
        var aceCount = 0;
        this.hand.forEach(function (card) {
            if (card.type === card_1.CardType.Ace) {
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
    };
    return Player;
}());
exports.Player = Player;
// module.exports = Player
//# sourceMappingURL=player.js.map