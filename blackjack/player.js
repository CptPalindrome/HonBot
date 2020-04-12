class Player {

  constructor(userId, username, amount) {
    this.userId = userId;
    this.username = username;
    this.hand = [];
    this._bet = 0;
    this.money = amount;
  }
  
  addCard(card) {
    this.hand.push(card);
  }

  get bet() {
    return this._bet;
  }

  set bet(amount) {
    if(amount > this.money) {
      throw new Error('Bet amount cannot be larger than your money pool');
    }

    this._bet = amount;
  }

  handTotal() {
    let total = 0;
    let aceCount = 0;
    for(let card in this.hand) {
      if(this.hand[card].number == 'Jack' || this.hand[card].number == 'Queen' || this.hand[card].number == 'King') {
        total += 10;
      }
      else if(this.hand[card].number == 'Ace') {
        total += 11;
        aceCount++;
      }
      else {
        total = total + parseInt(this.hand[card].number);
      }
    }
    if(total > 21 && aceCount > 0) {
      while(total > 21 && aceCount > 0) {
        total -= 10;
        aceCount--;
      }
    }
    return total;
  }
}

module.exports = Player