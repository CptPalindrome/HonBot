const fs = require('fs');

class HonbuxHelper {
    constructor() {
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

    daily(msg) {
        const { id, username } = msg.author;
        const honbuxData = JSON.parse(fs.readFileSync('./honbuxHandler/honbuxData.json', 'utf8')).honbuxData;
        const resetTimeInMilliseconds = 79200000;
        const { random, rarity } = this.generateDailyRandom();

        if (!honbuxData?.find((userdata) => userdata?.id === id || userdata?.username === username)) {
            honbuxData.push({
                id,
                username,
                honbalance: 0
            });
        }

        let wasValid = false;
        let timeDiff;
        let endData = { honbuxData: honbuxData.map((userdata) => { 
            if(userdata.id === id) {
                timeDiff = Date.now() - userdata.lastDaily;
                if(userdata.lastDaily && timeDiff < resetTimeInMilliseconds) {
                    wasValid = false;
                }
                else {
                    wasValid = true;
                    userdata.honbalance += random;
                    userdata.lastDaily = Date.now();
                }
            } 
            return userdata;
        })};

        const balance = endData?.honbuxData?.find((userdata) => userdata.id === id || userdata.username === username)?.honbalance;
        const timeDiffHours = Math.floor((resetTimeInMilliseconds - timeDiff) / 3600000).toString().padStart(2, '0');
        const timeDiffMinutes = Math.floor((resetTimeInMilliseconds - timeDiff) % 3600000 / 60000).toString().padStart(2, '0');
        
        fs.writeFileSync('./honbuxHandler/honbuxData.json', JSON.stringify(endData, 0, 2));
        return wasValid ? this.getSuccessMessage(rarity, random, balance) : this.getBadMessage(timeDiffHours, timeDiffMinutes);
    }

    modifyBux(recipient, amount) {
        // amount can be negative to remove bux from the user
        const { id, username } = recipient;
        const honbuxData = JSON.parse(fs.readFileSync('./honbuxHandler/honbuxData.json', 'utf8')).honbuxData;
        let balance;

        if (!honbuxData?.find((userdata) => userdata?.id === id || userdata?.username === username)) {
            honbuxData.push({
                id,
                username,
                honbalance: 0
            });
        }

        const endData = { honbuxData: honbuxData.map((userdata) => { 
            if(userdata.id === id) {
                userdata.honbalance += Number(amount);
                if (userdata.honbalance < 0) userdata.honbalance = 0;
                balance = userdata.honbalance;
            }
            return userdata;
        })};

        fs.writeFileSync('./honbuxHandler/honbuxData.json', JSON.stringify(endData, 0, 2));
        return balance;
    }

    getBalance(author) {
        const honbuxData = JSON.parse(fs.readFileSync('./honbuxHandler/honbuxData.json', 'utf8')).honbuxData;
        const { id, username } = author;
        if (!honbuxData?.find((userdata) => userdata?.id === id || userdata?.username === username)) {
            honbuxData.push({
                id,
                username,
                honbalance: 0
            });
        }
        return honbuxData?.find((userdata) => userdata?.id === id).honbalance;
    }
}

module.exports = HonbuxHelper;