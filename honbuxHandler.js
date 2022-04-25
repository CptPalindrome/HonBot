const fs = require('fs');

class HonbuxHandler {
    constructor() {
        if(!fs.existsSync('./playerSaveData.json')) {
            fs.writeFileSync('./playerSaveData.json', JSON.stringify({ players: [] }, null, 2));
        }
    }

    giveBux(user, amnt) {
        let userData = this.findPlayer(user.id, user.username);
        userData.player.honbux += Number(amnt);
        let data = JSON.parse(fs.readFileSync('./playerSaveData.json'));
        data.players[userData.index] = userData.player;
        fs.writeFileSync('./playerSaveData.json', JSON.stringify(data, null, 2));
        return `**${userData.player.username}**, you have been given **${amnt} Honbux**! Now **${userData.player.honbux}** <:honbux:966533492030730340>`;
    }

    //gets player data for printing out to chat
    getUserData(user) {
        const userData = this.findPlayer(user.id, user.username);
        return `**${userData.player.username}**, you have **${userData.player.honbux} Honbux** <:honbux:966533492030730340>`;
    }

    //get player data & index for saving/creating
    findPlayer(id, username) {
        let data = JSON.parse(fs.readFileSync('./playerSaveData.json'));
        let pos = undefined;
        let player = undefined;
        if(data.players) {
            player = data.players.find((value, index) => {
                if (value.id === id) {
                    pos = index;
                    return true;
                }
            });
        }
        if(player === undefined && pos === undefined) {
            this.createPlayer(id, username, data);
            data = JSON.parse(fs.readFileSync('./playerSaveData.json'));
            return { player: data.players[data.players.length - 1], index: data.players.length - 1 }
        }
        return { player: player, index: pos };
    }

    createPlayer(id, username, saveData) {
        saveData.players.push({ 
            id: id,
            username: username,
            honbux: 0
        });
        fs.writeFileSync('./playerSaveData.json', JSON.stringify(saveData, null, 2));
    }
}
module.exports = HonbuxHandler;