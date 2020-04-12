const { Client, Attachment, Message } = require('discord.js');
const client = new Client();
const auth = require('./auth.json');
const winston = require('winston');
const moment = require('moment');

let prefix = 'h.';
let bannedWords = require('./bannedWords.json');
let quotes = require('./gandhiQuotes.json');

const logger = winston.createLogger({
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ filename: './HonLogs/error.log', level: 'error' }),
        new winston.transports.File({ filename: './HonLogs/combined.log' })
    ]
});

client.on('message', msg => {
    if(msg.author.id != '266744954922074112') {
        let str = msg.content;
        if(str.startsWith(prefix)) {
            str = str.substr(prefix.length);
            switch(str) {

                case 'face':
                    msg.channel.send(`:eyes:`);
                    msg.channel.send(`:nose:`);
                    msg.channel.send(`:lips:`);
                    break;

                case 'ngandhi':
                    let subsetSize = quotes.quotes.length * 0.40;
                    let nQuoteNum = quotes.quotes.length - Math.floor(Math.random() * subsetSize) - 1;
                    msg.channel.send(`\`\`\`Gandhi Quote #${nQuoteNum + 1}/${quotes.quotes.length}:\n${quotes.quotes[nQuoteNum]} \n\n--Gandhi\`\`\``);
                    break;

                case 'dr':
                    msg.channel.send(`<:dontread:675498364040642576> __DON'T__ https://youtu.be/DtAiDUymlBk __READ__ <:dontread:675498364040642576>`);
                    break;
                
                case 'git':
                    msg.channel.send(`README & Source Code here: https://github.com/CptPalindrome/HonBot`);
                    break;

                case 'help':
                    msg.channel.send(`Honbar would be happy to assist. The prefix is "h.". My commands are face, git, say, dr, roulette, cf, cfsim, gandhi, and ngandhi. More info on the readme on github.`);
                    break;

                case 'help gandhi':
                    msg.channel.send(`Using 'h.gandhi' will dispense one of Gandhi's glorious and enlightened quotes. You can add a number afterwards to select a specific quote. Using 'h.ngandhi' will send from the newest 40% of quotes added. Quote count always rising!* \n\n*Quote count not actually always rising`);
                    break;

                case 'cf':
                    let coin = Math.floor(Math.random() * 2);
                    if(coin) {
                        msg.channel.send(`Heads 👌`);
                    }
                    else {
                        msg.channel.send(`Tails 🚫`);
                    }
                    break;
                
            }

            if (str.startsWith('gandhi')) {
                let gandhiArgs = str.split(' ');
                if(gandhiArgs.length == 1) {
                    gandhiQuote(randomNumberWithinQuoteCount(), msg);
                }

                else if(gandhiArgs.length > 1) {
                    let quoteNum = gandhiArgs[1] - 1;
                    if(quoteNum > 0 && quoteNum <= quotes.quotes.length) {
                        gandhiQuote(quoteNum, msg);
                    }
                    else {
                        gandhiQuote(randomNumberWithinQuoteCount(), msg);
                    }
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
                    bannedWords.bannedWords.forEach(word => {
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
                    logger.info(`${now()}<${msg.author.username}> used say command: ${str}`);
                    msg.delete().catch(console.error);
            }

            if(str.startsWith("roulette")) {
                let options = []
                if(str.substr(8)) {
                    options = str.substr(8).split(',');
                }
                if(options.length == 1) {
                    msg.channel.send(`You must submit more than 1 item, or it's not a roulette you big stupid **DOOF**`);
                }
                if(options.length > 1) {
                    let num = Math.floor(Math.random() * options.length - 1);
                    msg.channel.send(options[num])
                    .then(message => {
                        roulette(message, options);
                    });
                }
            }

            if(str.startsWith('cfsim')) {
                let coinSimArgs = str.split(' ');
                let simulationCount;
                if(coinSimArgs.length == 1) {
                    simulationCount = 100;
                }

                else if(coinSimArgs.length > 1) {
                    simulationCount = coinSimArgs[1];
                    if(simulationCount > 10000) {
                        simulationCount = 10000;
                    }
                }
                let coinSim;
                let headsCount = 0;
                let tailsCount = 0;
                for (i = 0; i < simulationCount; i++) {
                    coinSim = Math.floor(Math.random() * 2);
                    if(coinSim) {
                        headsCount++;
                    }
                    else {
                        tailsCount++;
                    }
                }
                msg.channel.send(`In **${simulationCount}** trials, it was heads **${headsCount}** times and tails **${tailsCount}** times.`);
            }
        }

        const hdt = 'honbar, delete this';
        const hdt2 = 'honbar delete this';
        if(msg.author.id != '266744954922074112') {
            if(str.toLowerCase().indexOf(hdt) != -1 || str.toLowerCase().indexOf(hdt2) != -1) {
                console.log(str.indexOf('delete this') != -1);
                msg.channel.send(`As you wish, ${msg.author.username}.`);
                logger.info(`${now()}: Deleted message '${msg} from ${msg.author.username}, as they desired.`);
                msg.delete(2000)
                    .then(msg => console.log(`Deleted message '${msg} from ${msg.author.username}, as they desired.`))
                    .catch(console.error);
            }
        }
    }
            
});

client.on('channelCreate', channel => {
    channel.send(`Honbar notices your new channel :eyes: and steals the first message :sunglasses:`);
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setStatus('available');
    client.user.setPresence({
        game: {
            name: 'Use h. as the default prefix! You can\'t change it!',
        }
    });
});

function now() {
    return moment().format('lll');
}

function gandhiQuote(quoteNum, msg) {
    msg.channel.send(`\`\`\`Gandhi Quote #${quoteNum + 1}/${quotes.quotes.length}:\n${quotes.quotes[quoteNum]} \n\n--Gandhi\`\`\``);
}

function randomNumberWithinQuoteCount() {
    return Math.floor(Math.random() * quotes.quotes.length);
}

function roulette(botMsg, options) {
    options = options.map(item => item.trim());
    let curOption = options.indexOf(botMsg.content);
    let interval = 1375;
    let numberOfSpins = 0;
    let maxSpins = Math.floor(Math.random() * 20) + (2 * options.length);
    timer = function() {
        if(curOption < options.length - 1) {
            curOption++;
        }
        else {
            curOption = 0;
        }
        botMsg.edit(options[curOption])
        if (numberOfSpins < maxSpins) {
            numberOfSpins++;
            setTimeout(timer, interval);
        }
        else {
            botMsg.edit(`**__${options[curOption]}__** is the winner!`);
        }
    }
    timer();
}

client.login(auth.token);
