const fs = require('fs');
const Utils = require('./utils');
const Coinflipper = require('./coinflipper');
const WheelHelper = require('./wheelHelper');

class HonbuxHelper {
    constructor() {
        this.utils = new Utils();
        this.coinflipper = new Coinflipper();
        this.wheelHelper = new WheelHelper();
        this.init();
    }

    init() {
        try {
            if(!fs.existsSync('./honbuxHandler/honbuxData.json')) {
                fs.writeFileSync('./honbuxHandler/honbuxData.json', JSON.stringify({honbuxData: []}, 0, 2));
            }
            if(!fs.existsSync('./honbuxHandler/gameMetrics.json')) {
                fs.writeFileSync('./honbuxHandler/gameMetrics.json', JSON.stringify({metrics: {}}, 0, 2));
            }
            this.resultMessages = JSON.parse(fs.readFileSync('./honbuxHandler/resultMessages.json'));
        } catch (e) {
            console.log(e);
        }
        const d = new Date();
        d.setHours(2);
        this.dailyResetTime = d.valueOf();
    }

    generateDailyRandom() {
        const randomNum = Math.floor(Math.random() * 100);

        if (randomNum < 70) {
            return { random: Math.floor(Math.random() * 200) + 350, rarity: 'common' }
        } else if (randomNum < 94 && randomNum > 70) {
            return { random: Math.floor(Math.random() * 250) + 675, rarity: 'scarce' }
        } else {
            return { random: Math.floor(Math.random() * 600) + 1300, rarity: 'rare' }
        }
    }

    getResultMessage(rarity, amountGained, balance, isValid, timeDiffHours, timediffMinutes) {
        if (isValid) {
            return this.getSuccessMessage(rarity, amountGained, balance);
        } else {
            return this.getBadMessage(timeDiffHours, timediffMinutes);
        }
    }
    
    getSuccessMessage(rarity, amountGained, balance) {
        const messageList = this.resultMessages.successMessages.filter((message) => message.rarity === rarity);
        const randomNum = Math.floor(Math.random() * messageList.length);
        return messageList[randomNum].message.replace('{amount}', amountGained).replace('{balance}', balance);
    }

    getBadMessage() {
        const messageList = this.resultMessages.badMessages;
        const randomNum = Math.floor(Math.random() * messageList.length);
        return messageList[randomNum].message;
    }

    tagCfbuxTime(id) {
        const honbuxData = this.getHonbuxData();
        const endData = { honbuxData: honbuxData.map((userdata) => { 
            if(userdata.id === id) {
                userdata.lastCf = Date.now();
            }
            return userdata;
        })};

        fs.writeFileSync('./honbuxHandler/honbuxData.json', JSON.stringify(endData, 0, 2));
    }

    tagWheelTime(id) {
        const honbuxData = this.getHonbuxData();
        const endData = { honbuxData: honbuxData.map((userdata) => { 
            if(userdata.id === id) {
                userdata.lastWheelSpin = Date.now();
            }
            return userdata;
        })};

        fs.writeFileSync('./honbuxHandler/honbuxData.json', JSON.stringify(endData, 0, 2));
    }

    verifyBet(userData, bet, minBet, maxBet) {
        if (bet >= minBet && bet <= maxBet) {
            if (userData.honbalance >= bet) return { valid: true }; 
            else return { valid: false, message: 'You don\'t have enough Honbux.' }
        }
        else return { valid: false, message: `Bet must be between ${minBet} and ${maxBet}.`}
    }

    daily(msg) {
        const { id, username } = msg.author;
        let honbuxData = this.getHonbuxData();
        const { random, rarity } = this.generateDailyRandom();
        const dataForModify = [
            { propName: 'lastDaily', propValue: Date.now(),  propFunc: 'set'}
        ];

        honbuxData = this.utils.checkIfUserExistsOrCreateNewUser(id, username, honbuxData);
        let wasDailyValid = false
        const user = honbuxData?.find((userdata) => userdata?.id === id);
        let endData;
        let balance;
        if(user.lastDaily && user.lastDaily > this.dailyResetTime) {
                wasDailyValid = false;
        } else {
            endData = this.utils.modifyData(honbuxData, id, dataForModify );
            fs.writeFileSync('./honbuxHandler/honbuxData.json', JSON.stringify(endData, 0, 2));
            balance = this.modifyBux(msg.author, Number(random), 'Daily');
            wasDailyValid = true;
        }
        
        return wasDailyValid ? this.getSuccessMessage(rarity, random, balance) : this.getBadMessage();
    }

    modifyBux(recipient, amount, source) {
        // amount can be negative to remove bux from the user
        const { id, username } = recipient;
        let honbuxData = this.getHonbuxData();
        let balance;
        honbuxData = this.utils.checkIfUserExistsOrCreateNewUser(id, username, honbuxData);
        const dataForModify = [
            { propName: 'honbalance', propValue: amount, propFunc: 'inc' }, 
            { propName: `${amount > 0 ? 'gained' : 'lost'}From${source}`, propValue: amount, propFunc: 'inc' }, 
            { propName: `times${source}Used`, propValue: 1, propFunc: 'inc' },
        ];
        if (source !== 'Daily' && source !== 'Bail' && source !== 'AddBux') {
            dataForModify.push({ propName: `times${amount > 0 ? 'Winning' : 'Losing'}From${source}`, propValue: 1,  propFunc:'inc' });
        }
        const endData = this.utils.modifyData(honbuxData, id, dataForModify);

        fs.writeFileSync('./honbuxHandler/honbuxData.json', JSON.stringify(endData, 0, 2));
        balance = endData?.honbuxData?.find((userdata) => userdata.id === id || userdata.username === username)?.honbalance;
        return balance;
    }

    getUserData(author) {
        let honbuxData = this.getHonbuxData();
        const { id, username } = author;
        honbuxData = this.utils.checkIfUserExistsOrCreateNewUser(id, username, honbuxData);
        return honbuxData?.find((userdata) => userdata?.id === id);
    }

    getTopHonbux() {
        let honbuxData = this.getHonbuxData();
        return honbuxData.reduce((prev, current) => (prev && prev.honbalance > current.honbalance) ? prev : current)
    }

    getRankings() {
        let honbuxData = this.getHonbuxData();
        const orderedData = honbuxData.map((data) => {
            const outdata = { username: data.username, honbalance: data.honbalance};
            return outdata;
        }).sort((a, b) => b.honbalance - a.honbalance);
        let outString = '';
        orderedData.forEach((data, index) => {
            outString += `${index + 1}. ${data.username} -- $${data.honbalance} Honbux\n`;
        });
        return outString;
    }

    getMetrics(author) {
        let userData = this.getUserData(author);
        const keys = Object.keys(userData);
        const values = Object.values(userData);

        const filtered = keys.reduce((acc, key, index) => {
            if (key.startsWith('gainedFrom') || key.startsWith('lostFrom') || key.startsWith('times')) {
                let categoryHeader = 'wheel';
                if (key.includes('Coin') || key.includes('Heads') || key.includes('Tails') || key.includes('Cf')) {
                    categoryHeader = 'cf';
                }
                else if (key.includes('Bail') || key.includes('Daily') || key.includes('Add')) {
                    categoryHeader = 'other'
                }
                acc.push({ key: key, value: values[index], header: categoryHeader });
            } return acc;
        }, []).sort((a, b) => {
            if (a.key.toLowerCase() < b.key.toLowerCase()) return -1;
            else if (a.key.toLowerCase() > b.key.toLowerCase()) return 1;
            else return 0;
        });

        // let outString = '';
        // filtered.forEach((data) => {
        //     outString += `${data.key}: ${data.value}\n`;
        // });
        return this.splitMetrics(filtered, 'user');
    }

    getGameMetricsData() {
        return JSON.parse(fs.readFileSync('./honbuxHandler/gameMetrics.json')).metrics;
    }
    
    getHonbuxData() {
        return JSON.parse(fs.readFileSync('./honbuxHandler/honbuxData.json', 'utf8')).honbuxData;
    }

    getGameMetrics() {
        const metricsData = this.getGameMetricsData();
        const keys = Object.keys(metricsData);
        const values = Object.values(metricsData);

        const filtered = keys.reduce((acc, key, index) => {
            if (key.startsWith('amount') || key.startsWith('last') || key.startsWith('times')) {
                let categoryHeader = 'wheel';
                if (key.includes('Coin') || key.includes('Heads') || key.includes('Tails') || key.includes('Cf')) {
                    categoryHeader = 'cf';
                }
                acc.push({ key: key, value: values[index], header: categoryHeader });
            } return acc;
        }, []).sort((a, b) => {
            if (a.key.toLowerCase() < b.key.toLowerCase()) return -1;
            else if (a.key.toLowerCase() > b.key.toLowerCase()) return 1;
            else return 0;
        });

        
        return this.splitMetrics(filtered, 'game');
    }

    splitMetrics(metricsArray, source) {
        const coinMetrics = metricsArray.filter((item) => item.header === 'cf');
        const wheelMetrics = metricsArray.filter((item) => item.header === 'wheel');
        const otherMetrics = metricsArray.filter((item) => item.header === 'other');
        let outString = 'Coinflip Metrics:\n';
        coinMetrics.forEach((data) => {
            outString += ` - ${data.key}: ${data.value}\n`;
        });
        outString += '\nWheel Metrics:\n';
        wheelMetrics.forEach((data) => {
            outString += ` - ${data.key}: ${data.value}\n`;
        });
        if (source === 'user') {
            outString += '\nOther Metrics:\n';
            otherMetrics.forEach((data) => {
                outString += ` - ${data.key}: ${data.value}\n`;
            }); 
        }
        return outString;
    }

    coinflip(author, bet, choice) {
        const userData = this.getUserData(author);
        const result = this.coinflipper.flip(userData, bet, choice);
        const params = [
            { propName: `times${result.result}`, propValue: 1, propFunc: 'inc' },
            { propName: `amount${result.amount > 0 ? 'Gained' : 'Lost'}ByCfBux`, propValue: result.amount, propFunc: 'inc' },
            { propName: `last${result.result}`, propValue: Date(), propFunc: 'set' },
            { propName: 'timesCoinFlipped', propValue: 1, propFunc: 'inc' }
        ]
        if (result.valid) {
            this.modifyBux(userData, result.amount, 'CfBux');
            // you didn't forget to re-enable this did you
            this.tagCfbuxTime(author.id);
            const updatedMetrics = this.utils.gameMetrics(this.getGameMetricsData(), params);
            fs.writeFileSync('./honbuxHandler/gameMetrics.json', JSON.stringify(updatedMetrics, 0, 2));
        }
        return result.message;
    }

    spinWheel(author, bet, choice) {
        const userData = this.getUserData(author);
        const minBet = 500;
        const maxBet = 5000;
        const validBet = this.verifyBet(userData, bet, minBet, maxBet);
        let outMessage = 'Input should be `h.wheel <bet number> <guess>`';
        if (validBet.valid) {
            const result = this.wheelHelper.spinWheel(userData, bet, choice, minBet, maxBet);
            if (result.valid) {
                const params = [
                    { propName: `times${result.result}`, propValue: 1, propFunc: 'inc' },
                    { propName: `amount${result.payout > 0 ? 'Gained' : 'Lost'}ByWheelSpin`, propValue: result.payout, propFunc: 'inc' },
                    { propName: `last${result.result}`, propValue: Date(), propFunc: 'set' },
                    { propName: 'timesWheelSpun', propValue: 1, propFunc: 'inc' },
                    { propName: `timesWheelSpin${result.payout > 0 ? 'Won' : 'Lost'}`, propValue: 1, propFunc: 'inc' }
                ]
                const balance = this.modifyBux(userData, Number(result.payout), 'WheelSpin');
                const updatedMetrics = this.utils.gameMetrics(this.getGameMetricsData(), params);
                this.tagWheelTime(author.id);
                fs.writeFileSync('./honbuxHandler/gameMetrics.json', JSON.stringify(updatedMetrics, 0, 2));
                outMessage = result.message.replace('{balance}', balance);
            } else outMessage = result.message;
        } else outMessage = validBet.message;
        return outMessage;
    }

    isHouseWinning() {
        const gmetrics = this.getGameMetricsData();
        const total = gmetrics?.amountLostByWheelSpin + gmetrics?.amountLostByCfBux + gmetrics?.amountGainedByWheelSpin + gmetrics?.amountGainedByCfBux;
        if (total > 0) {
            return `The house is losing. Players are ahead by ${total} Honbux.`;
        } else {
            return `The house is winning. Players are behind by ${Math.abs(total)} Honbux.`;
        }
    }

    bailOut(user) {
        const userdata = this.getUserData(user);
        if (userdata.honbalance < 100) this.modifyBux(user, 100 - userdata.honbalance, 'BailOut');
    }

    bailOutAll() {
        const honbuxData = this.getHonbuxData();
        honbuxData.forEach((user) => {
            this.bailOut(user);
        });
    }
}

module.exports = HonbuxHelper;