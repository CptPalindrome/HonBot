const fs = require('fs');
const Utils = require('./utils');

class HonbuxHelper {
    constructor() {
        this.utils = new Utils();
        this.init();
    }

    init() {
        try {
            if(!fs.existsSync('./honbuxHandler/honbuxData.json')) {
                fs.writeFileSync('./honbuxHandler/honbuxData.json', JSON.stringify({honbuxData: []}, 0, 2));
            }
            this.resultMessages = JSON.parse(fs.readFileSync('./honbuxHandler/resultMessages.json'));
        } catch (e) {
            console.log(e);
        }
    }

    generateDailyRandom() {
        const randomNum = Math.floor(Math.random() * 100);

        if (randomNum < 70) {
            return { random: Math.floor(Math.random() * 150) + 200, rarity: 'common' }
        } else if (randomNum < 94 && randomNum > 70) {
            return { random: Math.floor(Math.random() * 200) + 500, rarity: 'scarce' }
        } else {
            return { random: Math.floor(Math.random() * 500) + 1000, rarity: 'rare' }
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

    getBadMessage(timeDiffHours, timeDiffMinutes) {
        const messageList = this.resultMessages.badMessages;
        const randomNum = Math.floor(Math.random() * messageList.length);
        return messageList[randomNum].message.replace('{hours}', timeDiffHours).replace('{minutes}', timeDiffMinutes);
    }

    tagCfbuxTime(id) {
        const honbuxData = JSON.parse(fs.readFileSync('./honbuxHandler/honbuxData.json', 'utf8')).honbuxData;
        const endData = { honbuxData: honbuxData.map((userdata) => { 
            if(userdata.id === id) {
                userdata.lastCf = Date.now();
            }
            return userdata;
        })};

        fs.writeFileSync('./honbuxHandler/honbuxData.json', JSON.stringify(endData, 0, 2));
    }

    daily(msg) {
        const { id, username } = msg.author;
        let honbuxData = JSON.parse(fs.readFileSync('./honbuxHandler/honbuxData.json', 'utf8')).honbuxData;
        const resetTimeInMilliseconds = 79200000;
        const { random, rarity } = this.generateDailyRandom();
        const dataForModify = [
            { propName: 'lastDaily', propValue: Date.now(),  propFunc: 'set'}
        ];

        honbuxData = this.utils.checkIfUserExistsOrCreateNewUser(id, username, honbuxData);
        let wasDailyValid = false
        const user = honbuxData?.find((userdata) => userdata?.id === id);
        const dailyTimeDiff = Date.now() - user.lastDaily;
        let endData;
        let balance;
        if(user.lastDaily && dailyTimeDiff < resetTimeInMilliseconds) {
            wasDailyValid = false;
        } else {
            endData = this.utils.modifyData(honbuxData, id, dataForModify );
            fs.writeFileSync('./honbuxHandler/honbuxData.json', JSON.stringify(endData, 0, 2));
            balance = this.modifyBux(msg.author, Number(random), 'daily');
            wasDailyValid = true;
        }

        const timeDiffHours = Math.floor((resetTimeInMilliseconds - dailyTimeDiff) / 3600000).toString().padStart(2, '0');
        const timeDiffMinutes = Math.floor((resetTimeInMilliseconds - dailyTimeDiff) % 3600000 / 60000).toString().padStart(2, '0');
        
        return wasDailyValid ? this.getSuccessMessage(rarity, random, balance) : this.getBadMessage(timeDiffHours, timeDiffMinutes);
    }

    modifyBux(recipient, amount, source) {
        // amount can be negative to remove bux from the user
        const { id, username } = recipient;
        let honbuxData = JSON.parse(fs.readFileSync('./honbuxHandler/honbuxData.json', 'utf8')).honbuxData;
        let balance;
        honbuxData = this.utils.checkIfUserExistsOrCreateNewUser(id, username, honbuxData);
        const dataForModify = [
            { propName: 'honbalance', propValue: amount, propFunc: 'inc' }, 
            { propName: `${amount > 0 ? 'gained' : 'lost'}From${source}`, propValue: amount, propFunc: 'inc/set' }, 
        ];
        const endData = this.utils.modifyData(honbuxData, id, dataForModify);

        fs.writeFileSync('./honbuxHandler/honbuxData.json', JSON.stringify(endData, 0, 2));
        balance = endData?.honbuxData?.find((userdata) => userdata.id === id || userdata.username === username)?.honbalance;
        return balance;
    }

    getUserData(author) {
        let honbuxData = JSON.parse(fs.readFileSync('./honbuxHandler/honbuxData.json', 'utf8')).honbuxData;
        const { id, username } = author;
        honbuxData = this.utils.checkIfUserExistsOrCreateNewUser(id, username, honbuxData);
        return honbuxData?.find((userdata) => userdata?.id === id);
    }
}

module.exports = HonbuxHelper;