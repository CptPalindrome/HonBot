var Card = /** @class */ (function () {
    function Card(number, suit) {
        this.number = number;
        this.suit = suit;
    }
    Card.prototype.getNumber = function () {
        return this.number;
    };
    Card.prototype.getSuit = function () {
        return this.suit;
    };
    return Card;
}());
module.exports = Card;
//# sourceMappingURL=card.js.map