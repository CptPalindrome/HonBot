const { Client, Attachment, Message } = require('discord.js');
const client = new Client();
const auth = require('./auth.json');

let prefix = 'h.';
let bannedWords = ["chink", "dago", "daygo", "dego", "dyke", "gook", "kike", "negro", "nigga", "nigger", "nigguh", "spic", "wop", "zaddy"];
let quotes = require('./gandhiQuotes.json');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if(msg.author.id != '266744954922074112') {
        let str = msg.content;
        if(str.startsWith(prefix)) {
            str = str.substr(prefix.length);
            switch(str) {
                case 'hi':
                    msg.channel.send(`Honbar says hello to you, ${msg.author.username}`);
                    break;

                case 'face':
                    msg.channel.send(`:eyes:`);
                    msg.channel.send(`:nose:`);
                    msg.channel.send(`:lips:`);
                    break;

                case 'gandhi':
                    let quoteNum = Math.floor(Math.random() * quotes.quotes.length);
                    msg.channel.send(`\`\`\`Gandhi Quote #${quoteNum}/${quotes.quotes.length}:\n${quotes.quotes[quoteNum]} \n\n--Gandhi\`\`\``);
                    break;
                
                case 'git':
                    msg.channel.send(`README & Source Code here: https://github.com/CptPalindrome/HonBot`);
                    break;

                case 'help':
                    msg.channel.send(`Honbar would be happy to assist. My commands are hi, face, say, and gandhi. If you include the text 'Honbar, delete this' in any message, I will delete it for you.`);
                    break;

                case 'help gandhi':
                    msg.channel.send(`Using 'h.gandhi' will dispense one of 52 of Gandhi's glorious and enlightened quotes.`);
                    break;
                
            }
        }

        if(str.startsWith('say')) {
            let appendTts = false;
            str = str.substr(4);
            if(str.startsWith('/tts')) {
                str = str.substr(5);
                appendTts = true;
            }
            tagUser = false;
                bannedWords.forEach(word => {
                    if(str.indexOf(word) != -1) {
                        tagUser = true;
                    }
                });
                    if(tagUser) {
                        msg.channel.send(`<${msg.author.username}> ${str}`, {tts: appendTts});
                    }
                    else {
                        msg.channel.send(str, {tts: appendTts});
                    }
                msg.delete().catch(console.error);
        }

        const hdt = 'honbar, delete this';
        const hdt2 = 'honbar delete this';
        if(msg.author.id != '266744954922074112') {
            if(str.toLowerCase().indexOf(hdt) != -1 || str.toLowerCase().indexOf(hdt2) != -1) {
                console.log(str.indexOf('delete this') != -1);
                msg.channel.send(`As you wish, ${msg.author.username}.`);
                msg.delete(2000)
                    .then(msg => console.log(`Deleted message '${msg} from ${msg.author.username}, as they desired.`))
                    .catch(console.error);
            }
        }
    }
            
});

client.on('channelCreate', channel => {
    channel.send(`Honbar notices your new channel :eyes:`);
    channel.send(`Honbar steals the first message :sunglasses:`)
});

client.on('ready', () => {
    client.user.setStatus('available');
    client.user.setPresence({
        game: {
            name: 'Use h. as the default prefix! You can\'t change it!',
        }
    });
});

client.login(auth.token);
