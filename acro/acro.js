let Player = require('./player.js');
let bannedWords = require('./bannedwords.json');

/** GAMEFLOW: 
 * Send a message that contains words that start with the provided letters in order.
 * Afterwards, players will vote on their favorite and a winner will be decided.
 * Using -w will determine writing time (default is 30s)
 * Using -v will determine voting time (default is 25s)
 */

class Acro {

    constructor() {
        this.players = [];
        this.voters = []
        this.gameChannel = null;
        this.gameState = 'none';
        this.acro = '';
        this.alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        this.weights = [9, 2, 2, 4, 12, 2, 3, 2, 9, 1, 1, 4, 2, 6, 8, 2, 1, 6, 4, 6, 4, 2, 2, 1, 2, 1];
    }
    
    acroStart(channel, writeTime, voteTime) {
        if (!writeTime) {
            writeTime = 30;
        }
        else if (writeTime > 90) {
            writeTime = 90;
        }
        if (!voteTime) {
            voteTime = 20;
        }
        else if (voteTime > 60) {
            voteTime = 60;
        }
        this.gameState = 'writing';
        this.gameChannel = channel;
        this.generateAcronym();
        channel.send(`\`${this.acro}\` (${writeTime} seconds)`);
        setTimeout(() => this.voting(voteTime), writeTime * 1000);
        setTimeout(() => this.writeWarning(), (writeTime - 5) * 1000);
    }

    getAcro() {
        return this.acro;
    }

    getState() {
        return this.gameState;
    }

    addPlayer(id, username, acro) {
        let foundAtIndex = -1;
        this.players.forEach((player, index) => {
            if (player.id === id) {
                foundAtIndex = index;
            }
        });
        if (foundAtIndex == -1) {
            this.players.push(new Player(id, username, acro));
        }
    }

    addVoter(id, username, vote) {
        let foundAtIndex = -1;
        this.voters.forEach((voters, index) => {
            if (voters.id === id) {
                foundAtIndex = index;
            }
        });
        if (foundAtIndex == -1) {
            this.voters.push(new Player(id, username, vote));
            this.players[vote - 1].incrVotes();
        }
    }

    playerCanJoin(id, acronym) {
        let foundAtIndex = -1;
        this.players.forEach((player, index) => {
            if (player.userId === id) {
                foundAtIndex = index;
            }
        });
        if (foundAtIndex !== -1) {
            return false;
        }
        acronym = acronym.split(' ');
        let mismatch = false;
        if (acronym.length === this.acro.length) {
            acronym.forEach((word, index) => {
                if (word.charAt(0).toLowerCase() !== this.acro.charAt(index)) {
                    mismatch = true;
                }
            });
            if (mismatch) {
                return false;
            }
        }
        else {
            return false;
        }
        return true;
    }

    playerCanVote(id, vote) {
        let foundAtIndex = -1;
        this.voters.forEach((voter, index) => {
            if (voter.userId === id) {
                foundAtIndex = index;
            }
        });
        if (foundAtIndex !== -1) {
            return false;
        }
        if (vote) {
            if (vote > 0 && vote <= this.players.length && id !== this.players[vote - 1].userId) {
                return true;
            }
        }
        return false;
    }

    writeWarning() {
        this.gameChannel.send(`\`5 seconds to submit.\``);
    }

    voteWarning() {
        this.gameChannel.send(`\`5 seconds to vote.\``);
    }

    voting(voteTime) {
        this.gameState = 'voting';
        if (this.players.length === 0) {
            this.gameChannel.send(`\`No submissions found. Ending game.\``);
            this.reset();
            return;
        }
        this.players = this.shufflePlayers(this.players);
        let outString = '';
        this.players.forEach((player, index) => {
            outString += `${index + 1}. ${player.acro}\n`
        });
        this.gameChannel.send(`\`\`\`Vote now! (${voteTime} seconds)\n${outString}\`\`\``)
        setTimeout(() => {
            this.putResults();
        }, voteTime * 1000);
        setTimeout(() => {
            this.voteWarning();
        }, (voteTime - 5) * 1000);
        return;
    }

    putResults() {
        this.gameState = 'none';
        let outString = '';
        let highScore = 0;
        let winners = [];
        let winner = null;
        this.sortPlayers();
        this.players.forEach((player, index) => {
            if (player.votes > highScore) {
                highScore = player.votes;
                winners = [];
                winners.push(player);
            }
            else if (player.votes == highScore) {
                winners.push(player);
            }
            outString += `${index + 1}. ${player.acro} -${player.username} (${player.votes})\n`
        });
        if (winners.length === 1) {
            winner = winners[0];
        }
        else if (winners.length > 1) {
            let names = '';
            winners.forEach((player) => {
                names += `${player.username}, `;
            })
            winner = {username: `${names.substr(0,names.length - 1)}`, votes: `${highScore}`};
        }
        outString = `\`\`\`The winner(s): ${winner.username} with ${highScore} vote(s)! \n\n${outString}\`\`\``
        this.gameChannel.send(outString);
        this.reset();
        return;
    }

    generateAcronym() {
        let acroUnsafe = false;
        let acronym = '';
        let weighted = this.weightedAlphabet();
        do {
            const acroLength = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < acroLength; i++) {
                acronym += weighted[Math.floor(Math.random() * weighted.length)];
            }
            acroUnsafe = false;
            bannedWords.bannedWords.forEach(word => {
                if (word === acronym) {
                    acroUnsafe = true;
                }
            });
        } while(acroUnsafe);
        
        this.acro = acronym;
    }

    weightedAlphabet() {
        let weightedLetters = [];
        this.alphabet.forEach((letter, index) => {
            for (let i = 0; i < this.weights[index]; i++) {
                weightedLetters.push(letter);
            }
        });
        return weightedLetters;
    }

    shufflePlayers(array) {
        if (array.length > 1) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        return array;
    };

    sortPlayers() {
        this.players.sort(( a, b ) => {
            let num1 = a.votes;
            let num2 = b.votes;
      
            if (num1 > num2) {
                return -1;
            }
      
            if (num1 < num2) {
                return 1;
            }
      
            return 0;
            });
    }

    reset() {
        this.gameState = 'none';
        this.gameChannel = null;
        this.players = [];
        this.voters = [];
    }
}

module.exports = Acro;