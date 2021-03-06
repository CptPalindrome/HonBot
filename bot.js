const { Client } = require('discord.js');
const auth = require('./auth.json');
const winston = require('winston');
const moment = require('moment');
const gameClass = require('./blackjack/gameTest.js');
const bannedWords = require('./bannedWords.json');
const quotes = require('./gandhiQuotes.json');
const chrisQuotes = require('./chrisQuotes.json');
const fortunes = require('./magic8ball.json');
const madComps = require('./madlibComponents.json');
const client = new Client();
const prefix = 'h.';

let game = new gameClass;
let handInProgress = false;
let gameStarted = false;
let currentGameChannel;

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

                case 'help blackjack':
                    msg.channel.send(`\`\`\`Blackjack Commands: \n h.bljk -- starts a new game\n h.join -- join a game in progress\n h.leave -- leave a game you've joined\n h.hit/h.stand -- gameplay functions\n h.afk -- will end a round if people are afk and remove them\n h.stop -- stops a game in progress\n h.nh -- starts a new hand with the same players\`\`\``);
                    break;
                
                case 'bljk':
                    if(gameIsStarted()) {
                        msg.channel.send(`A game is already in progress!`);
                    }
                    else {
                        setTimeout(() => play(), 15000);
                        msg.channel.send(`Game starts in 15 seconds. Use h.join to join the game!`);
                        gameStarted = true;
                        currentGameChannel = msg.channel;
                    }
                    break;

                case 'join':
                    let joinPos = isPlayerInGame(game.players, msg.author.id);
                    if (gameIsStarted() && !isHandInProgress() && joinPos === -1) {
                        game.addPlayer(msg.author.id, msg.author.username);
                        joinPos = isPlayerInGame(game.players, msg.author.id);
                        msg.channel.send(`${msg.author.username} has joined the game.`);
                        // msg.channel.send(`${msg.author.username} has joined the game. They have ${game.players[joinPos].getMoney()} HonBucks`);
                        //say a message confirming the username who joined and their money total
                        //TODO: Get score saving to work!!!!
                    }
                    else if (joinPos != -1) {
                        msg.channel.send(`***${msg.author.username}***, you're already in the game.`);
                    }
                    else {
                        msg.channel.send(`Either a game has not been started or a hand is in progress.`);
                    }
                    break;

                case 'leave':
                    if (!gameIsStarted()) {
                        msg.channel.send(`You can't leave a game that hasn't started!`);
                    }
                    else if (isPlayerInGame(game.players, msg.author.id) === -1) {
                        msg.channel.send(`You have not joined the game.`);
                    }
                    else if (!isHandInProgress()) {
                        game.removePlayer(msg.author.id);
                        msg.channel.send(`Okay, bye ${msg.author.username}`);
                    }
                    break;

                case 'hit':
                    if (!gameIsStarted()) {
                        msg.channel.send(`A game has not been started yet!`);
                        break;
                    }
                    
                    let pos = isPlayerInGame(game.players, msg.author.id);
                    if (isHandInProgress() && pos !== -1) {
                        if (game.players[pos].status == 'not done') {
                            game.hit(game.players[pos]);
                            currentGameChannel.send(`***${game.players[pos].username}*** hits. They now have **${game.players[pos].currentHand()}** *(${game.players[pos].handTotal()})*`)
                            if (game.players[pos].status == 'busted') {
                                currentGameChannel.send(`***${game.players[pos].username}*** has busted.`);
                            }
                            if (checkPlayers(game)) {
                                cardsDrawnByDealer = resolveDealer(game);
                                resolveHand(game);
                            }
                        }
                    }

                    else {
                        msg.channel.send(`You're either not in the game, or there is not an active hand.`);
                    }
                    break;
                
                case 'stand':
                    if (!gameIsStarted()) {
                        msg.channel.send(`A game has not been started yet!`);
                        break;
                    }
                    
                    let standPos = isPlayerInGame(game.players, msg.author.id);
                    if (isHandInProgress() && standPos !== -1) {
                        if (game.players[standPos].status == 'not done') {
                            game.players[standPos].status = 'done';
                            if (checkPlayers(game)) {
                                cardsDrawnByDealer = resolveDealer(game);
                                resolveHand(game);
                            }
                        }
                    }
                    else {
                        msg.channel.send(`You're either not in the game, or there is not an active hand.`);
                    }
                    break;

                case 'nh':
                    if (gameIsStarted() && !isHandInProgress()) {
                        currentGameChannel.send(`Starting a new hand! You have 10 seconds to leave or join!`);
                        setTimeout(() => play(), 10000);
                    }
                    else if (!gameIsStarted() || isHandInProgress()) {
                        currentGameChannel.send(`Either a game isn't started or you're in a hand already.`);
                    }
                    break;
                    
                case 'afk':
                    if (gameIsStarted() && isHandInProgress()) {
                        currentGameChannel.send(`Resolving AFK Players in 15 seconds.`);
                        
                        setTimeout(() => resolveAFK(), 15000);
                    }
                    else {
                        currentGameChannel.send(`Either a game or a hand have not started.`);
                    }
                    break;

                case 'stop':
                        if(gameIsStarted() && !isHandInProgress()) {
                            msg.channel.send(`Game has stopped.`);
                            gameStarted = false;
                            handInProgress = false;
                            game.resetPlayers();
                        }
                        else {
                            msg.channel.send(`Game is not started yet, or a hand is in progress.`);
                        }
                        break;

            // if (str.startsWith('bet')) {
            //     if(!gameIsStarted()) {
            //         msg.channel.send(`A game has not been started yet! Type h.start to start a game!`);
            //         return;
            //     }
            //     let betArgs = str.split(' ');
            //     if (betArgs.length > 1) {
            //         let bet = parseInt(betArgs[1]);
            //         let foundAtIndex = -1;
            //         foundAtIndex = isPlayerInGame(game.players, msg.author.id);
            //         if (isNaN(bet)) {
            //             msg.channel.send(`Invalid bet amount. Example "h.bet 100".`);
            //             return;
            //         }
                    
            //         if (foundAtIndex !== -1) {
            //             msg.channel.send(`${msg.author.username} places a bet of ${bet}.`)
            //             game.players[foundAtIndex].bet = bet;
            //         }
            //         else {
            //             msg.channel.send(`You are not in the game!`);
            //         }
            //     }
            //     return;
            // }

                case 'help wyd':
                    msg.channel.send(`You can use numbers or *super secret phrases* to select specific sentence templates. Format as {#}`);
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
                return;
            }

            if (str.startsWith('wyd')) {
                //take an @ and use them if present, otherwise do "I"
                let wydArgs = str.split(' ');
                let number = -1;
                const reg = new RegExp(`{[0-9]+}`);
                try {
                    if(wydArgs.length == 1) {
                        number = Math.floor(Math.random() * madComps.sentences.length);
                        wyd(msg, number, '');
                    }

                    else if(wyd.length > 1) {
                        switch(wydArgs[1]) {
                            case '{navy}':
                                number = 72;
                                wydArgs.shift();
                                break;
                            case '{lagg}':
                                number = 73;
                                wydArgs.shift();
                                break;
                            case '{shrek}':
                                number = 78;
                                wydArgs.shift();
                                break;
                            case '{eggman}':
                                number = 80;
                                wydArgs.shift();
                                break;
                            default:
                                if(reg.test(wydArgs[1])) {
                                    number = wydArgs[1].substr(1, wydArgs[1].length - 2) - 1;
                                    if (number > madComps.sentences.length - 1) {
                                        number = Math.floor(Math.random() * madComps.sentences.length);
                                    }
                                    wydArgs.shift();
                                }
                                else {
                                    number = Math.floor(Math.random() * madComps.sentences.length);
                                }
                                break;
                        }
                        wydArgs.shift();
                        wyd(msg, number, wydArgs.join(' '));
                    }
                }
                catch(e) {
                    logger.error(`${now()}: ${e}`);
                }

            }

            if (str.startsWith('chris')) {
                chrisQuote(msg);
            }

            if (str.startsWith('8ball')) {
                str = str.substr(6);
                fortune(msg, str);
            }

            if(str.startsWith("roulette")) {
                let options = []
                if(str.substr(8)) {
                    options = str.substr(8).split(',');
                }
                if(options.length === 0) {
                    msg.channel.send(`To use the roulette, enter 2 or more items separated by commas. Ex. 'h.roulette ham, turkey, the goofy goober theme song'`);
                }
                if(options.length == 1) {
                    msg.channel.send(`You must submit more than 1 item, or it's not a roulette you big stupid **DOOF**`);
                }
                if(options.length > 1) {
                    let num = Math.floor(Math.random() * options.length - 1);
                    msg.channel.send(`**__${options[num].trim()}__** has been selected.`);
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

let cardsDrawnByDealer = 0;
function play() {
    if (game.players.length == 0) {
            currentGameChannel.send(`No one has joined! Ending game.`);
            gameStarted = false;
            handInProgress = false;
            return;
        }
    console.log(`Now playing!`);
    currentGameChannel.send(`Now beginning game. Players: ${generatePlayerList(game)}.`);
    game.addPlayer('dealer', 'Dealer');
    game.buildDeck(2);
    game.players.forEach(player => {
        player.reset();
        game.hit(player);
        game.hit(player);
        if (player.handTotal() == 21) {
            player.status = 'bj';
        }
        if(player.userId !== 'dealer') {
            currentGameChannel.send(`***${player.username}*** has **${player.currentHand()}** *(${player.handTotal()})*`);
        }
        else {
            currentGameChannel.send(`***__${player.username}__*** showing **${player.getFirst()}**`);
            if (player.status != 'bj') {
                player.status = 'unflipped';
            }
        }
    });
    handInProgress = true;
    return;
}

function resolveAFK() {
    let inactivePlayerNames = [];
    let nameList = '';
    game.players.forEach(player => {
        if (player.status == 'not done') {
            player.status = 'afk';
            inactivePlayerNames.push(player.username);
        }
    });
    nameList = inactivePlayerNames.join(', ');
    currentGameChannel.send(`Resolved Inactive Players: ***${nameList}***.`);
    if (checkPlayers(game)) {
        cardsDrawnByDealer = resolveDealer(game);
        resolveHand(game);
    }
}

function generatePlayerList(game) {
    let playerList = '';
    let index = 1;
    if (game.players.length > 0) {
        playerList += game.players[0].username;
    }
    while (index <= game.players.length - 1) {
        playerList += `, ${game.players[index].username}`;
        index++;
    }
    return playerList;
}

function gameIsStarted() {
    if(!gameStarted) {
        return false;
    }
    return true;
}

function checkPlayers(game) {
    let doneStatus = true;
    game.players.forEach(player => {
        if (player.status == 'not done') {
            doneStatus = false;
        }
    })
    return doneStatus; //oh no it's 5:30 am
}

function resolveDealer(game) {
    let cardsDrawnByDealer = 0;
    game.players.forEach(player => {
        if (player.userId == 'dealer') {
            while (player.handTotal() < 17) {
                game.hit(player);
                cardsDrawnByDealer++;
            }
            player.status = 'done';
        }
    });
    return cardsDrawnByDealer;
}

function resolveHand(game) {
    let dealerPos = isPlayerInGame(game.players, 'dealer');
    let dealerTotal = game.players[dealerPos].handTotal();
    currentGameChannel.send(`***__Dealer__*** drew ${cardsDrawnByDealer} card(s) and has **${game.players[dealerPos].currentHand()}** *(${game.players[dealerPos].handTotal()})*`)
    if (dealerTotal > 21) {
        currentGameChannel.send(`***__Dealer__*** has busted!`);
    }

    game.players.forEach(player => {
        if (player.userId !== 'dealer') {
            if (player.status == 'done' || player.status == 'double') {
                if (dealerTotal <= 21) {
                    if (player.handTotal() < dealerTotal) {
                        currentGameChannel.send(`***${player.username}*** *(${player.handTotal()})*, you lose.`);
                        player.resolveBet('lose');
                    }
                    if (player.handTotal() == dealerTotal) {
                        currentGameChannel.send(`***${player.username}*** *(${player.handTotal()})*, you push.`);
                        player.resolveBet('push');
                    }
                    if (player.handTotal() > dealerTotal) {
                        currentGameChannel.send(`***${player.username}*** *(${player.handTotal()})*, you win!`);
                        player.resolveBet('win');
                    }
                }
                
                if (dealerTotal > 21) {
                    currentGameChannel.send(`***${player.username}*** *(${player.handTotal()})*, you win!`);
                    player.resolveBet('win');
                }
            }
            else if (player.status == 'bj') {
                if (game.players[dealerPos].status == 'bj') {
                    currentGameChannel.send(`***${player.username}*** *(${player.handTotal()})*, you push.`);
                    player.resolveBet('push');
                }
                else {
                    currentGameChannel.send(`***${player.username}*** *(${player.handTotal()})*, you win!`);
                    player.resolveBet('bj');
                }
            }

            else if (player.status == 'busted') {
                currentGameChannel.send(`***${player.username}*** *(${player.handTotal()})*, you lose.`);
                player.resolveBet('lose');
            }
        }
    });
    handInProgress = false;
    game.removePlayer('dealer');
    let afkIds = [];
    game.players.forEach(player => {
        if (player.status == 'afk') {
            afkIds.push(player.userId);
        }
    });
    game.removePlayers(afkIds);
}

function isPlayerInGame(players, id) {
    //if player is not found, will return -1, otherwise will return their position in player order
    if (!players) {
        return -1;
    }
    let pos = -1;
    players.forEach((player, index) => {
        if (player.userId === id) {
            pos = index;
        }
    });
    return pos;
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

function wyd(msg, number, name) {
    let outString = buildString(number);
    if(name == '') {
        name = 'Honbar';
    }

    if(msg.mentions.users.size > 0) {
        name = msg.mentions.users.first().username;
    }

    msg.channel.send(`\`\`\`${outString} \n\n--${name}\`\`\``);
}

function buildString(number) {
    let sentence = madComps.sentences[number];
    let parsedSentence = sentence.s;

    if(sentence.n > 0) {
        const nounsCopy = [...madComps.nouns];
        parsedSentence = parseSentence(parsedSentence, sentence.n, nounsCopy, 'n', '', 'singular');
    }
    
    if(sentence.npl > 0) {
        const nounsCopy = [...madComps.nouns];
        parsedSentence = parseSentence(parsedSentence, sentence.npl, nounsCopy, 'n', 'pl', 'plural');
    }

    if(sentence.p > 0) {
        const peopleCopy = [...madComps.people];
        parsedSentence = parseSentence(parsedSentence, sentence.p, peopleCopy, 'p', '');
    }

    if(sentence.l > 0) {
        const locationsCopy = [...madComps.locations];
        parsedSentence = parseSentence(parsedSentence, sentence.l, locationsCopy, 'l', '');
    }
    
    if(sentence.v > 0) {
        const verbsCopy = [...madComps.verbs];
        parsedSentence = parseSentence(parsedSentence, sentence.v, verbsCopy, 'v', '', 'present');
    }
    
    if(sentence.vp > 0) {
        const verbsCopy = [...madComps.verbs];
        parsedSentence = parseSentence(parsedSentence, sentence.vp, verbsCopy, 'v', 'p', 'past');
    }
    
    if(sentence.ving > 0) {
        const verbsCopy = [...madComps.verbs];
        parsedSentence = parseSentence(parsedSentence, sentence.ving, verbsCopy, 'v', 'ing', 'ing');
    }

    if(sentence.iv > 0) {
        const iverbsCopy = [...madComps.verbsIntransitive];
        parsedSentence = parseSentence(parsedSentence, sentence.iv, iverbsCopy, 'iv', '', 'present');
    }

    if(sentence.ived > 0) {
        const iverbsCopy = [...madComps.verbsIntransitive];
        parsedSentence = parseSentence(parsedSentence, sentence.ived, iverbsCopy, 'iv', 'ed', 'past');
    }

    if(sentence.iving > 0) {
        const iverbsCopy = [...madComps.verbsIntransitive];
        parsedSentence = parseSentence(parsedSentence, sentence.iving, iverbsCopy, 'iv', 'ing', 'ing');
    }

    if(sentence.a > 0) {
        const adjectivesCopy = [...madComps.adjectives];
        parsedSentence = parseSentence(parsedSentence, sentence.a, adjectivesCopy, 'a', '', 'regular');
    }

    if(sentence.aer > 0) {
        const adjectivesCopy = [...madComps.adjectives];
        parsedSentence = parseSentence(parsedSentence, sentence.aer, adjectivesCopy, 'a', 'er', 'er');
    }

    if(sentence.ae > 0) {
        const adjectivesCopy = [...madComps.adjectives];
        parsedSentence = parseSentence(parsedSentence, sentence.ae, adjectivesCopy, 'a', 'e', 'est');
    }

    if(sentence.adv > 0) {
        const adverbsCopy = [...madComps.adverbs];
        parsedSentence = parseSentence(parsedSentence, sentence.adv, adverbsCopy, 'adv', '');
    }

    if(sentence.prep > 0) {
        const prepositionsCopy = [...madComps.prepositions];
        parsedSentence = parseSentence(parsedSentence, sentence.prep, prepositionsCopy, 'prep', '');
    }

    parsedSentence = parsedSentence.charAt(0).toUpperCase() + parsedSentence.slice(1);
    return parsedSentence;
}

/**
 * 
 * @param {string} sentenceToParse 
 * @param {number} count 
 * @param {any[]} category 
 * @param {string} prefix 
 * @param {string} suffix 
 * @param {string} categorySubtype 
 */
function parseSentence(sentenceToParse, count, category, prefix, suffix, categorySubtype) {
        for(let i = 0; i < count; i++) {
            let categoryIndex = Math.floor(Math.random() * category.length);
            const reg = new RegExp(`{${prefix}${i+1}${suffix}}`, 'g',);
            if(categorySubtype) {
                sentenceToParse = sentenceToParse.replace(reg, category[categoryIndex][categorySubtype]);
            }
            else {
                sentenceToParse = sentenceToParse.replace(reg, category[categoryIndex]);
            }
            category.splice(categoryIndex, 1);
        }
    return sentenceToParse;
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

client.login(auth.token);
