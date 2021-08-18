class Player {

  constructor(userId, username, acro) {
    this.userId = userId;
    this.username = username;
    this._acro = acro;
    this._votes = 0;
  }

  get acro() {
    return this._acro;
  }

  set acro(acro) {
    this._acro = acro;
  }

  get votes() {
    return this._votes;
  }
  
  set votes(votes) {
   this._votes = votes;
  }

  incrVotes() {
    this._votes++;
  }
}

module.exports = Player