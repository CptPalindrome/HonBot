let Player = require('./player.js');
let Card = require('./card.js');
let saveData = require('./playerSaveData.json');
const fs = require('fs');

//THIS FILE IS DEFUNCT WHY IS IT STILL HERE

/** RULES: 
 * Standard Win: 1:1 (Get your bet back & same amount from house. Don't double it if you don't subtract their current bet. If you don't subtract their current bet, just add their bet to their total)
 * Dealt Blackjack 3:2 (1.5x winnings. Same other rules as regular win)
 * Double Down 2:2 (Literally the same, but you either win double or lose double)
 * Push (Net neutral. Win/Lose nothing)
 * Split - Just splits into two hands each with their own bets, which follow the above rules.
 */

let round = {
    players: []
};
let players = [];
let deck = [];
let cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King', 'Ace'];
let suit = ['Spades', 'Clubs', 'Hearts', 'Diamonds']

function buildDeck(numberOfDecks) {
    for (let i = 0; i < numberOfDecks; i++) {
        for (let j = 0; j < cards.length; j++) {
            deck.push(new Card(cards[j], suit[0]));
            deck.push(new Card(cards[j], suit[1]));
            deck.push(new Card(cards[j], suit[2]));
            deck.push(new Card(cards[j], suit[3]));
        }
    }
}

function addPlayer(id, username) {
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
    players.push(new Player(id, username, saveData.players.find(player => player.id === id).totalPoints));
}

function removePlayer(id) {
    let foundAtIndex = -1;
    players.forEach((player, index) => {
        if (player.id === id) {
            foundAtIndex = index;
            break;
        }
    });
    if (foundAtIndex !== -1) {
        players.splice(foundAtIndex, 1);
    }
}

function drawRandomCard() {
    cardOfDeck = deck[Math.floor(Math.random() * deck.length)];
    deck.splice(deck.indexOf(cardOfDeck), 1);
    return cardOfDeck;
}

function hit(player) {
    newCard = drawRandomCard();
    player.addCard(newCard);
}

// addPlayer('123', 'Todd');
// addPlayer('124', 'Greg');
// buildDeck(2);
// hit(players[0]);
// hit(players[0]);
// console.log(`${players[0].handTotal()}, ${players[0].currentCards()}`)