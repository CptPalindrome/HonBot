class Player {

  constructor(userId, username, amount) {
    this.userId = userId;
    this.username = username;
    this.hand = [];
    this._bet = 0;
    this.money = amount;
    this._status = 'not done';
  }
  
  addCard(card) {
    this.hand.push(card);
  }

  reset() {
    this.hand = [];
    this._status = 'not done';
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

  get status() {
    return this._status;
  }

  set status(status) {
    this._status = status;
  }

  currentHand() {
    let tempText = '';
    if(this.hand.length > 0) {
      tempText = this.hand[0].getText();
      let i = 1;
      while(i < this.hand.length - 1) {
        tempText += `, ${this.hand[i].getText()}`;
        i++;
      }
      tempText += `, and ${this.hand[this.hand.length-1].getText()}`;
    }
    return tempText;
  }

  handLength() {
    return this.hand.length;
  }

  getMoney() {
    return this.money;
  }

  resolveBet(winLossPush) {
    if (winLossPush == 'win') {
      if (this.status == 'double') {
        this.total += this.bet * 2;
      }
      else {
        this.total += this.bet;
      }
    }
    else if (winLossPush == 'loss') {
      if (this.status == 'double') {
        this.total -= this.bet * 2;
      }
      else {
        this.total -= this.bet;
      }
    }
    else if (winLossPush == 'bj') {
      this.total += this.bet * 1.5;
    }
  }

  getFirst() {
    return this.hand[0].getText();
  }

  checkBust() {
    if (this.handTotal() > 21) {
      this.status = 'busted';
    }
    if (this.handTotal() == 21) {
      this.status = 'done';
    }
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