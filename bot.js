"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js"); //= require('discord.js');
var client = new discord_js_1.Client();
var auth = require('./auth.json');
// const winston = require('winston');
var winston = require("winston");
// const moment = require('moment');
// import { Moment, moment } from 'moment';
var moment = require("moment");
// const gameClass = require('./blackjack/gameTest.js');
var game_1 = require("./blackjack/game");
var prefix = 'h.';
// let game = new gameClass;
var currentGame = null;
var handInProgress = false;
var bannedWords = require('./bannedWords.json');
var quotes = require('./gandhiQuotes.json');
var gameStarted = false;
var currentGameChannel;
var logger = winston.createLogger({
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ filename: './HonLogs/error.log', level: 'error' }),
        new winston.transports.File({ filename: './HonLogs/combined.log' })
    ]
});
client.on('message', function (msg) {
    if (msg.author.id !== '266744954922074112') {
        var str_1 = msg.content;
        if (str_1.startsWith(prefix)) {
            str_1 = str_1.substr(prefix.length);
            switch (str_1) {
                case 'face':
                    msg.channel.send(":eyes:");
                    msg.channel.send(":nose:");
                    msg.channel.send(":lips:");
                    break;
                case 'ngandhi':
                    var subsetSize = quotes.quotes.length * 0.40;
                    var nQuoteNum = quotes.quotes.length - Math.floor(Math.random() * subsetSize) - 1;
                    msg.channel.send("```Gandhi Quote #" + (nQuoteNum + 1) + "/" + quotes.quotes.length + ":\n" + quotes.quotes[nQuoteNum] + " \n\n--Gandhi```");
                    break;
                case 'dr':
                    msg.channel.send("<:dontread:675498364040642576> __DON'T__ https://youtu.be/DtAiDUymlBk __READ__ <:dontread:675498364040642576>");
                    break;
                case 'git':
                    msg.channel.send("README & Source Code here: https://github.com/CptPalindrome/HonBot");
                    break;
                case 'help':
                    msg.channel.send("Honbar would be happy to assist. The prefix is \"h.\". My commands are face, git, say, dr, gandhi, and ngandhi. More info on the readme on github.");
                    break;
                case 'help gandhi':
                    msg.channel.send("Using 'h.gandhi' will dispense one of Gandhi's glorious and enlightened quotes. You can add a number afterwards to select a specific quote. Using 'h.ngandhi' will send from the newest 40% of quotes added. Quote count always rising!* \n\n*Quote count not actually always rising");
                    break;
                case 'start':
                    if (gameIsStarted()) {
                        msg.channel.send("A game is already in progress!");
                    }
                    else {
                        setTimeout(function () { return play(); }, 10000);
                        msg.channel.send("Game starts in 60 seconds. Use h.join to join the game!");
                        currentGame = new game_1.Game();
                        gameStarted = true;
                        currentGameChannel = msg.channel;
                    }
                    break;
                case 'join':
                    if (gameIsStarted()) {
                        currentGame.addPlayer(msg.author.id, msg.author.username);
                        msg.channel.send(msg.author.username + " has joined the game.");
                        //say a message confirming the username who joined and their money total
                    }
                    else {
                        msg.channel.send("A game has not been started yet! Type h.blackjack to start a game!");
                    }
                    break;
                case 'leave':
                    if (!gameIsStarted()) {
                        msg.channel.send("You can't leave a game that hasn't started, doofus!");
                    }
                    else if (!isHandInProgress()) {
                        currentGame.removePlayer(msg.author.id);
                        msg.channel.send("Okay, bye " + msg.author.username);
                    }
                    break;
            }
            if (str_1.startsWith('bet')) {
                if (!gameIsStarted()) {
                    msg.channel.send("A game has not been started yet! Type h.blackjack to start a game!");
                    return;
                }
                var betArgs = str_1.split(' ');
                if (betArgs.length > 1) {
                    var bet_1 = parseInt(betArgs[1]);
                    if (isNaN(bet_1)) {
                        msg.channel.send("Invalid bet amount. Example \"h.bet 100\".");
                        return;
                    }
                    var foundPlayer_1 = false;
                    currentGame.players.forEach(function (player, index) {
                        if (player.userId === msg.author.id) {
                            currentGame.players[index].bet = bet_1;
                            foundPlayer_1 = true;
                        }
                    });
                    if (!foundPlayer_1) {
                        msg.channel.send('Dweeb! You are not in the game! Dweeb!');
                    }
                }
                return;
            }
            if (str_1.startsWith('stop')) {
                //TODO: remove this later. This is just for testing purposes
                if (gameIsStarted()) {
                    msg.channel.send("Game has stopped");
                    gameStarted = false;
                }
                else {
                    msg.channel.send("Game is not started yet");
                }
                return;
            }
            if (str_1.startsWith('gandhi')) {
                var gandhiArgs = str_1.split(' ');
                if (gandhiArgs.length == 1) {
                    gandhiQuote(randomNumberWithinQuoteCount(), msg);
                }
                else if (gandhiArgs.length > 1) {
                    var quoteNum = Number(gandhiArgs[1]) - 1;
                    if (quoteNum > 0 && quoteNum <= quotes.quotes.length) {
                        gandhiQuote(quoteNum, msg);
                    }
                    else {
                        gandhiQuote(randomNumberWithinQuoteCount(), msg);
                    }
                }
                return;
            }
            if (str_1.startsWith('say')) {
                var appendTts = false;
                str_1 = str_1.substr(4);
                if (str_1.startsWith('/tts')) {
                    str_1 = str_1.substr(5);
                    appendTts = true;
                }
                var tagUser_1 = false;
                bannedWords.bannedWords.forEach(function (word) {
                    if (str_1.indexOf(word) != -1) {
                        tagUser_1 = true;
                    }
                });
                if (tagUser_1) {
                    msg.channel.send("<" + msg.author.username + "> " + str_1, { tts: appendTts });
                }
                else {
                    msg.channel.send(str_1, { tts: appendTts });
                }
                logger.info(now() + "<" + msg.author.username + "> used say command: " + str_1);
                msg.delete().catch(console.error);
                return;
            }
        }
        var hdt = 'honbar, delete this';
        var hdt2 = 'honbar delete this';
        if (msg.author.id != '266744954922074112') {
            if (str_1.toLowerCase().indexOf(hdt) != -1 || str_1.toLowerCase().indexOf(hdt2) != -1) {
                console.log(str_1.indexOf('delete this') != -1);
                msg.channel.send("As you wish, " + msg.author.username + ".");
                logger.info(now() + ": Deleted message '" + msg + " from " + msg.author.username + ", as they desired.");
                msg.delete(2000)
                    .then(function (msg) { return console.log("Deleted message '" + msg + " from " + msg.author.username + ", as they desired."); })
                    .catch(console.error);
            }
        }
    }
});
client.on('channelCreate', function (channel) {
    // This seems like it would have crashed HonBot, since send doesn't exist on channel
    // channel.send(`Honbar notices your new channel :eyes: and steals the first message :sunglasses:`);
});
client.on('ready', function () {
    console.log("Logged in as " + client.user.tag + "!");
    client.user.setStatus('online');
    client.user.setPresence({
        game: {
            name: 'Use h. as the default prefix! You can\'t change it!',
        }
    });
});
function play() {
    console.log("Now playing!");
    currentGameChannel.send("Now beginning game. " + currentGame.players[0].username + " are in.");
    return;
}
function gameIsStarted() {
    if (!gameStarted) {
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
    msg.channel.send("```Gandhi Quote #" + (quoteNum + 1) + "/" + quotes.quotes.length + ":\n" + quotes.quotes[quoteNum] + " \n\n--Gandhi```");
}
function randomNumberWithinQuoteCount() {
    return Math.floor(Math.random() * quotes.quotes.length);
}
client.login(auth.token);
//# sourceMappingURL=bot.js.map