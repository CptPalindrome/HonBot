const Player = require('./player.js');
const fs = require('fs');
const corejs = require('core-js');
let stories = require('./stories.json');
const { channel } = require('diagnostics_channel');

/** GAMEFLOW: 
 * Collect players who will join until time limit or command? Decide which >:(
 * Once all players have joined (or none) begin the game by asking players in join order for the words that are requested in the story that is selected. 
 * Once players have filled all the required words stop and print out the Title and filled in story.
 */


class Madlibs {

    constructor() {
        this.players = [];
        this.gameChannel = null;
        this.gameState = 'none';
        this.playerIndex = 0;
        this.story = null;
        this.currentWordType = null;
        this.kickinEm = false;
        this.isMad = false;
    }
    
    
    madlibsStart(channel) {
        this.gameState = 'joining';
        this.story = this.getStory();
        this.gameChannel = channel;
        this.gameChannel.send('10s to join madlibs. Join with \`h.j\`!');
        setTimeout(() => this.shuffleStart(), 10000);
    }

    shuffleStart() {
        this.shufflePlayers(this.players);
        this.getBlank();
    }

    voteKick() {
        if(this.players.length >= 2) {
            this.gameChannel.send(`You have 20s to send your answer. Or *perish*.`)
            this.kickinEm = true;
            setTimeout(() => this.clutchOrKick(), 20000);
        }
    }

    clutchOrKick() {
        if(this.kickinEm) {
            this.players.splice(this.playerIndex, 1);
            this.kickinEm = false;
            this.gameChannel.send(`Kicked em`);
            if(this.playerIndex > this.players.length - 1) {
                this.playerIndex = 0;
            }
            this.getBlank();
        }
    }

    getBlank() {
        if (this.players.length === 0) {
            this.gameChannel.send(`No one joined >:(`);
            this.setMad(true);
            this.reset();
            return;
        }
        else {
            this.setMad(false);
        }
        let storyText = this.story.story;
        let startIndex = 0;
        let endIndex = 0;
        //print word to be filled
        //accept from given user at index position
        //replace word placeholder in the story as the user enters it to simplify the replacement process (find first index of { and first of }, take substr and replace that or whatever).
        //^char replace any {} to make sure this works
        //^ this will also make it easier to get the next template word as the previous no longer needs to be skipped.
        if (storyText.indexOf('{') !== -1) {
            let randomStartIndex = Math.floor(Math.random() * storyText.length);
            startIndex = storyText.indexOf('{', randomStartIndex);
            endIndex = storyText.indexOf('}', startIndex);
            if (startIndex === -1 || startIndex >= storyText.length) {
                startIndex = storyText.indexOf('{') + 1;
                endIndex = storyText.indexOf('}');
            }
            else {
                startIndex++;
            }
            this.currentWordType = storyText.substr(startIndex, endIndex - startIndex);
            if(/\d/.test(this.currentWordType)) {
                this.gameChannel.send(`${this.players[this.playerIndex].username}: \`${this.currentWordType.substr(0, this.currentWordType.length - 1)}\``);
            }
            else {
                this.gameChannel.send(`${this.players[this.playerIndex].username}: \`${this.currentWordType}\``);
            }
            this.gameState = 'waitingForWord';
            clearTimeout(this.inTheClutch);
        }
        else {
            this.gameState = 'storyFinished';
            this.endStory();
            return;
        }
    }

    verifyInput(id) {
        //checks if it's the person who submitted's turn
        if(id === this.players[this.playerIndex].userId)
            return true;
        return false;
    }

    fillBlank(id, input) {
        if (this.verifyInput(id)) {
            input = input.trim();
            if(/\d/.test(this.currentWordType)) {
                this.story.story = this.story.story.replaceAll(`{${this.currentWordType}}`, input);
            }
            this.story.story = this.story.story.replace(`{${this.currentWordType}}`, input);
            this.gameState ='wordReplaced';
            if (this.playerIndex < this.players.length - 1) {
                this.playerIndex++;
            }
            else {
                this.playerIndex = 0;
            }
            this.kickinEm = false;
            this.getBlank();
        }
    }

    pass() {
        if (this.playerIndex < this.players.length - 1) {
            this.playerIndex++;
        }
        else {
            this.playerIndex = 0;
        }
        this.kickinEm = false;
        this.getBlank();
    }

    getStory() {
        let storyNum = Math.floor(Math.random() * stories.stories.length)
        // let storyNum = stories.stories.length - 2;
        let story = stories.stories[storyNum];
        stories.stories.splice(storyNum, 1);
        return story;
    }

    getState() {
        return this.gameState;
    }

    addPlayer(id, username) {
        let foundAtIndex = -1;
        this.players.forEach((player, index) => {
            if (player.id === id) {
                foundAtIndex = index;
            }
        });
        if (foundAtIndex == -1) {
            this.players.push(new Player(id, username));
        }
    }

    playerCanJoin(id) {
        let foundAtIndex = -1;
        this.players.forEach((player, index) => {
            if (player.userId === id) {
                foundAtIndex = index;
            }
        });
        if (foundAtIndex !== -1) {
            return false;
        }
        return true;
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

    setMad(bool) {
        this.isMad = bool;
    }

    endStory() {
        this.gameChannel.send(`\`${this.story.title}:\`\n\`\`\`${this.story.story}\`\`\``);
        this.reset();
    }
    reset() {
        this.gameState = 'none';
        this.gameChannel = null;
        this.players = [];
        this.playerIndex = 0;
        this.story = null;
        if(stories.stories.length === 0) {
            stories = JSON.parse(fs.readFileSync('./madlibs/stories.json'));
            channel.send(`\`Story list has been exhausted and will now be reset.\``);
        }
    }
}

module.exports = Madlibs;