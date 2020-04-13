import { CardSuit, Card, FaceCard, CardType } from "./card";

export class DeckUtility {
    public static buildDeck(): Card[] {
        return DeckUtility.buildSuit(CardSuit.Clubs)
            .concat(DeckUtility.buildSuit(CardSuit.Diamonds))
            .concat(DeckUtility.buildSuit(CardSuit.Hearts))
            .concat(DeckUtility.buildSuit(CardSuit.Spades));
    }

    private static buildSuit(cardSuit: CardSuit): Card[] {
        return [
            new Card(2, cardSuit),
            new Card(3, cardSuit),
            new Card(4, cardSuit),
            new Card(5, cardSuit),
            new Card(6, cardSuit),
            new Card(7, cardSuit),
            new Card(8, cardSuit),
            new Card(9, cardSuit),
            new Card(10, cardSuit),

            new FaceCard(10, cardSuit, CardType.Jack),
            new FaceCard(10, cardSuit, CardType.Queen),
            new FaceCard(10, cardSuit, CardType.King),
            new FaceCard(11, cardSuit, CardType.Ace)
        ];
    }
}
