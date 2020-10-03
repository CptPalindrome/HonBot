const { Client, Attachment, Message } = require('discord.js');
const client = new Client();
const auth = require('./auth.json');
const winston = require('winston');
const moment = require('moment');

let prefix = 'h.';
let bannedWords = require('./bannedWords.json');
let quotes = require('./gandhiQuotes.json');
let chrisQuotes = require('./chrisQuotes.json');
let fortunes = require('./magic8ball.json');
let madlibComponents = require('./madlibComponents.json');

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
                    msg.channel.send(`Honbar would be happy to assist. The prefix is "h.". My commands are face, git, say, dr, roulette, cf, cfsim, chris, 8ball, wyd, gandhi, and ngandhi. More info on the readme on github.`);
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
                
                case 'start':
                    if(gameIsStarted()) {
                        msg.channel.send(`A game is already in progress!`);
                    }
                    else {
                        setTimeout(() => play(), 10000);
                        msg.channel.send(`Game starts in 60 seconds. Use h.join to join the game!`);
                        game = new gameClass;
                        gameStarted = true;
                        currentGameChannel = msg.channel;
                    }
                    break;

                case 'join':
                    if (gameIsStarted() && !isHandInProgress()) {
                        game.addPlayer(msg.author.id, msg.author.username);
                        msg.channel.send(`${msg.author.username} has joined the game.`);
                        //say a message confirming the username who joined and their money total
                    }
                    else if (gameIsStarted() && isHandInProgress()) {
                        msg.channel.send(`${msg.author} a hand in progress, please wait until after.`);
                    }
                    else {
                        msg.channel.send(`A game has not been started yet! Type h.blackjack to start a game!`);
                    }
                    break;                      

                case 'leave':
                    if (!gameIsStarted()) {
                        msg.channel.send(`You can't leave a game that hasn't started, doofus!`);
                    }
                    else if (!isHandInProgress()) {
                        let playerRemoved = game.tryRemovePlayer(msg.author.id);
                        if (playerRemoved) {
                            msg.channel.send(`Okay, bye ${msg.author.username}`);
                        }
                    }
                    break;
            }

            if (str.startsWith('join')) {
                if (gameIsStarted() && !isHandInProgress()) {
                    game.addPlayer(msg.author.id, msg.author.username);
                    msg.channel.send(`${msg.author.username} has joined the game.`);
                    //say a message confirming the username who joined and their money total
                }
                else if (gameIsStarted() && isHandInProgress()) {
                    msg.channel.send(`${msg.author} a hand in progress, please wait until after.`);
                }
                else {
                    msg.channel.send(`A game has not been started yet! Type h.blackjack to start a game!`);
                }
                if(!gameIsStarted()) {
                    msg.channel.send(`A game has not been started yet! Type h.blackjack to start a game!`);
                    return;
                }
                if (isHandInProgress()) {
                    msg.channel.send(`Wait for the next round.`);
                }
                let betArgs = str.split(' ');
                if (betArgs.length > 1) {
                    let bet = parseInt(betArgs[1]);
                    if (isNaN(bet)) {
                        msg.channel.send(`Invalid bet amount. Example "h.join 100".`);
                        return;
                    }
                    if (game.players.find(player => player.userId === msg.author.id)) {
                        game.players.forEach((player, index) => {
                            if (player.userId === msg.author.id) {
                                player.bet = bet;
                            }
                        });
                    }
                    else {
                        msg.channel.send(`Dweeb! You are not in the game! Dweeb!`);
                    }
                }
                return;
            }

            if (str.startsWith('stop')) {
                //TODO: remove this later. This is just for testing purposes
                if(gameIsStarted()) {
                    msg.channel.send(`Game has stopped`);
                    gameStarted = false;
                    handInProgress = false;
                    
                }
                else {
                    msg.channel.send(`Game is not started yet`);
                }
                return;
            }

            if (str.startsWith('gandhi')) {
                let gandhiArgs = str.split(' ');
                let gandhiDeafened = Math.floor(Math.random() * 100);
                if (gandhiDeafened === 69) {
                    msg.channel.send(`Gandhi is deafened and cannot hear your desperate pleas for wisdom.`);
                    return;
                }
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

            if (str.startsWith('wyd')) {
                //take an @ and use them if present, otherwise do "I"
                let wydArgs = str.split(' ');
                if(wydArgs.length == 1) {
                    wyd(msg, '');
                }

                else if(wyd.length > 1) {
                    wydArgs.shift();
                    wyd(msg, wydArgs.join(' '));
                }

            }

            if (str.startsWith('chris')) {
                chrisQuote(msg);
            }

            if (str.startsWith('8ball')) {
                str = str.substr(6);
                fortune(msg, str);
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
    }
            
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

function play() {
    console.log(`Now playing!`);
    if (game.players.length === 0) {
        currentGameChannel.send(`Wait, nobody's here.`);
        return;
    }
    else if (game.players.length === 1) {
        currentGameChannel.send(`Now beginning game. ${game.players[0].username} is in.`);
    }
    else {
        currentGameChannel.send(`Now beginning game.`);
    }
    handInProgress = true;
    game.players.forEach(player => {
        game.hit(player);
        game.hit(player);
        currentGameChannel.send(`\`\`\`${player.username}: ${player.handToString().trim()}. Total: ${player.handTotal()}\`\`\``);
    });

    return;
}

function gameIsStarted() {
    if(!gameStarted) {
        return false;
    }
    return true;
}

function isHandInProgress() {
    return handInProgress;
}

function now() {
    return moment().format('lll');
}

function gandhiQuote(quoteNum, msg) {
    msg.channel.send(`\`\`\`Gandhi Quote #${quoteNum + 1}/${quotes.quotes.length}:\n${quotes.quotes[quoteNum]} \n\n--Gandhi\`\`\``);
}

function chrisQuote(msg) {
    let cQuoteNum = Math.floor(Math.random() * chrisQuotes.quotes.length);
    if (cQuoteNum == 10) {
        let cVerbNum = Math.floor(Math.random() * chrisQuotes.verbs.length);
        let cNounNum = Math.floor(Math.random() * chrisQuotes.nouns.length);
        let cQuote = chrisQuotes.quotes[cQuoteNum];
        let cVerb = chrisQuotes.verbs[cVerbNum];
        let cNoun = chrisQuotes.nouns[cNounNum];
        cQuote = cQuote.replace('1', cVerb)
        cQuote = cQuote.replace('2', cNoun)
        msg.channel.send(`\`\`\`${cQuote} \n\n--Chris\`\`\``);
    }
    else {
        msg.channel.send(`\`\`\`${chrisQuotes.quotes[cQuoteNum]} \n\n--Chris\`\`\``);
    }
}

function wyd(msg, name) {
    let outString = buildString();
    if(name == '') {
        name = 'Honbar';
    }

    if(msg.mentions.users.size > 0) {
        name = msg.mentions.users.first().username;
    }
    msg.channel.send(`\`\`\`${outString} \n\n--${name}\`\`\``);
}

function buildString() {
    let noun1 = Math.floor(Math.random() * madlibComponents.nouns.length);
    let noun2 = Math.floor(Math.random() * madlibComponents.nouns.length);
    while (noun1 == noun2) {
        noun2 = Math.floor(Math.random() * madlibComponents.nouns.length);
    }

    let person1 = Math.floor(Math.random() * madlibComponents.people.length);
    let person2 = Math.floor(Math.random() * madlibComponents.people.length);
    while (person1 == person2) {
        person2 = Math.floor(Math.random() * madlibComponents.people.length);
    }

    let verb1 = Math.floor(Math.random() * madlibComponents.verbs.length);
    let verb2 = Math.floor(Math.random() * madlibComponents.verbs.length);
    while (verb1 == verb2) {
        verb2 = Math.floor(Math.random() * madlibComponents.verbs.length);
    }

    let iverb1 = Math.floor(Math.random() * madlibComponents.verbsIntransitive.length);
    let iverb2 = Math.floor(Math.random() * madlibComponents.verbsIntransitive.length);
    while (iverb1 == iverb2) {
        iverb2 == Math.floor(Math.random() * madlibComponents.verbsIntransitive.length);
    }

    let adjective1 = Math.floor(Math.random() * madlibComponents.adjectives.length);
    let adjective2 = Math.floor(Math.random() * madlibComponents.adjectives.length);
    while (adjective1 == adjective2) {
        adjective2 = Math.floor(Math.random() * madlibComponents.adjectives.length);
    }

    let adverb1 = Math.floor(Math.random() * madlibComponents.adverbs.length);
    let adverb2 = Math.floor(Math.random() * madlibComponents.adverbs.length);
    while (adverb1 == adverb2) {
        adverb2 = Math.floor(Math.random() * madlibComponents.adverbs.length);
    }

    let sentence = madlibComponents.sentences[Math.floor(Math.random() * madlibComponents.sentences.length)];

    sentence = sentence.replace('{n1}', madlibComponents.nouns[noun1]);
    sentence = sentence.replace('{n2}', madlibComponents.nouns[noun2]);
    sentence = sentence.replace('{v1}', madlibComponents.verbs[verb1]);
    sentence = sentence.replace('{v2}', madlibComponents.verbs[verb2]);
    sentence = sentence.replace('{a1}', madlibComponents.adjectives[adjective1]);
    sentence = sentence.replace('{a2}', madlibComponents.adjectives[adjective2]);
    sentence = sentence.replace('{advb1}', madlibComponents.adverbs[adverb1]);
    sentence = sentence.replace('{advb2}', madlibComponents.adverbs[adverb2]);
    sentence = sentence.replace('{iv1}', madlibComponents.verbsIntransitive[iverb1]);
    sentence = sentence.replace('{iv2}', madlibComponents.verbsIntransitive[iverb2]);
    sentence = sentence.replace('{p1}', madlibComponents.people[person1]);
    sentence = sentence.replace('{p2}', madlibComponents.people[person2]);

    return sentence;

}

function fortune(msg, question) {
    let fortuneNum = Math.floor(Math.random() * fortunes.fortunes.length);
    if(question != null && question != '') {
        msg.channel.send(`> ${question}\n\`\`\`${fortunes.fortunes[fortuneNum]}\`\`\``);
    }
    else {
        msg.channel.send(`\`\`\`${fortunes.fortunes[fortuneNum]}\`\`\``);
    }
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
