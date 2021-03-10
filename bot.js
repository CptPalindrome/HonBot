const { Client } = require('discord.js');
const client = new Client();
const auth = require('./auth.json');
const winston = require('winston');
const moment = require('moment');
const gameClass = require('./blackjack/gameTest.js');

let prefix = 'h.';
let game = new gameClass;
let handInProgress = false;
let bannedWords = require('./bannedWords.json');
let quotes = require('./gandhiQuotes.json');
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
                    msg.channel.send(`Honbar would be happy to assist. The prefix is "h.". My commands are face, git, say, dr, gandhi, and ngandhi. More info on the readme on github.`);
                    break;

                case 'help gandhi':
                    msg.channel.send(`Using 'h.gandhi' will dispense one of Gandhi's glorious and enlightened quotes. You can add a number afterwards to select a specific quote. Using 'h.ngandhi' will send from the newest 40% of quotes added. Quote count always rising!* \n\n*Quote count not actually always rising`);
                    break;
                
                case 'start':
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
                    else if (!isPlayerInGame() || isPlayerInGame() === -1) {
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
                        currentGameChannel.send(`Starting a new hand! You have 10 seconds to leave with h.leave`);
                        setTimeout(() => play(), 10000);
                    }
                    else if (!gameIsStarted() || isHandInProgress()) {
                        currentGameChannel.send(`Either a game isn't started or you're in a hand already.`);
                    }
                    break;
                    
                case 'end':
                    if (gameIsStarted() && isHandInProgress()) {
                        currentGameChannel.send(`Resolving AFK Players in 15 seconds.`);
                        
                        setTimeout(() => resolveAFK(), 15000);
                    }
                    else {
                        currentGameChannel.send(`Either a game or a hand have not started.`);
                    }
                    break;
            }

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

            if (str.startsWith('stop')) {
                if(gameIsStarted() && !isHandInProgress()) {
                    msg.channel.send(`Game has stopped.`);
                    gameStarted = false;
                    handInProgress = false;
                    game.resetPlayers();
                }
                else {
                    msg.channel.send(`Game is not started yet, or a hand is in progress.`);
                }
                return;
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
                return;
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
                return;
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

function randomNumberWithinQuoteCount() {
    return Math.floor(Math.random() * quotes.quotes.length);
}

client.login(auth.token);
