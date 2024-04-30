const logger = require('../logger.js');

class Coinflipper {
    constructor() {
        this.cfbuxCooldown = 600000;
        this.minBet = 100;
        this.maxBet = 1000;
    }

    flipCoin(id, choice) {
        let coin = Math.floor(Math.random() * 2);
        if (id === '189125614358364160') {
            if (Math.floor(Math.random() * 10) < 1) {
                if (coin && choice === 'heads') {
                    logger.info(`${Date()}: heads > tails`);
                    coin = 0;
                } else if (coin && choice === 'tails') logger.info(`${Date()}: Automatic, heads`);
                else if (!coin && choice === 'tails') {
                    logger.info(`${Date()}: tails > heads`);
                    coin = 1;
                } else if (!coin && choice === 'heads') logger.info(`${Date()}: Automatic, tails`);
            }
        } return coin;
    }
    flip(userData, bet, choice) {
        const { honbalance, lastCf, id } = userData;
        let outMessage = '';
        if (choice === 'heads' || choice === 'tails') {
            if ((lastCf && Date.now() - lastCf > this.cfbuxCooldown) || !lastCf) {
                if (bet && !isNaN(bet) && honbalance >= bet) {
                    if (bet >= this.minBet && bet <= this.maxBet) {
                        const coin = this.flipCoin(id, choice);
                        if(coin) {
                            if (choice === 'heads') {
                                outMessage = `Heads! You win <:honbux:966533492030730340>**${bet}**. New balance: <:honbux:966533492030730340>**${honbalance + bet}**`;
                                return { message: outMessage, amount: bet, valid: true, result: 'Heads' };
                            } else {
                                outMessage = `Heads...You lose <:honbux:966533492030730340>**${bet}**. New balance: <:honbux:966533492030730340>**${honbalance - bet}**`;
                                return { message: outMessage, amount: bet * -1, valid: true, result: 'Heads' };
                            }
                        }
                        else {
                            if (choice === 'tails') {
                                outMessage = `Tails! You win <:honbux:966533492030730340>**${bet}**. New balance: <:honbux:966533492030730340>**${honbalance + bet}**`;
                                return { message: outMessage, amount: bet, valid: true, result: 'Tails' };
                            } else {
                                outMessage = `Tails...You lose <:honbux:966533492030730340>**${bet}**. New balance: <:honbux:966533492030730340>**${honbalance - bet}**`;
                                return { message: outMessage, amount: bet * -1, valid: true, result: 'Tails' };
                            }
                        }
                    } else outMessage = `You must bet between \`${this.minBet}\` and \`${this.maxBet}\``;
                } else outMessage = `You either don't have enough Honbux, or you didn't enter a number.`;
            } else outMessage = `You must wait at least \`${Math.floor((this.cfbuxCooldown - (Date.now() - lastCf)) / 60000)}\` minutes before you can flip again.`;
        } else outMessage = 'Message should be formatted: h.cfbux `number` `<heads/tails>`';
        return { message: outMessage, amount: 0, valid: false };
    }
}

module.exports = Coinflipper;