"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Card = /** @class */ (function () {
    function Card(value, suit, type) {
        if (type === void 0) { type = CardType.NonFace; }
        this.value = value;
        this.suit = suit;
        this.type = type;
    }
    Card.prototype.getNumber = function () {
        return this.value;
    };
    Card.prototype.getSuit = function () {
        return CardSuit[this.suit];
    };
    Card.prototype.toString = function () {
        return this.value + " of " + this.suit + "s";
    };
    return Card;
}());
exports.Card = Card;
var FaceCard = /** @class */ (function (_super) {
    __extends(FaceCard, _super);
    function FaceCard() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FaceCard.prototype.toString = function () {
        return CardType[this.type] + " of " + CardSuit[this.suit] + "s";
    };
    return FaceCard;
}(Card));
exports.FaceCard = FaceCard;
var CardSuit;
(function (CardSuit) {
    CardSuit[CardSuit["Clubs"] = 0] = "Clubs";
    CardSuit[CardSuit["Diamonds"] = 1] = "Diamonds";
    CardSuit[CardSuit["Hearts"] = 2] = "Hearts";
    CardSuit[CardSuit["Spades"] = 3] = "Spades";
})(CardSuit = exports.CardSuit || (exports.CardSuit = {}));
var CardType;
(function (CardType) {
    CardType[CardType["Ace"] = 0] = "Ace";
    CardType[CardType["Jack"] = 1] = "Jack";
    CardType[CardType["King"] = 2] = "King";
    CardType[CardType["NonFace"] = 3] = "NonFace";
    CardType[CardType["Queen"] = 4] = "Queen";
})(CardType = exports.CardType || (exports.CardType = {}));
// module.exports = Card
//# sourceMappingURL=card.js.map