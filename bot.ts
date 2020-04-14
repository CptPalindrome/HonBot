import { Client, Message } from 'discord.js';//= require('discord.js');
const client = new Client();
const auth = require('./auth.json');
// const winston = require('winston');
import * as winston from 'winston';
// const moment = require('moment');
// import { Moment, moment } from 'moment';
import moment = require('moment');
// const gameClass = require('./blackjack/gameTest.js');
import { Game } from './blackjack/game';
import { Player } from './blackjack/player';

let prefix = 'h.';
// let game = new gameClass;
let currentGame: Game = null;
let handInProgress = false;
let bannedWords = require('./bannedWords.json');
let quotes = require('./gandhiQuotes.json');
let gameStarted = false;
let currentGameChannel: any;

const logger = winston.createLogger({
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ filename: './HonLogs/error.log', level: 'error' }),
        new winston.transports.File({ filename: './HonLogs/combined.log' })
    ]
});

client.on('message', msg => {
    if(msg.author.id !== '266744954922074112') {
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
                        setTimeout(() => play(), 10000);
                        msg.channel.send(`Game starts in 60 seconds. Use h.join to join the game!`);
                        currentGame = new Game();
                        gameStarted = true;
                        currentGameChannel = msg.channel;
                    }
                    break;

                case 'join':
                    if (gameIsStarted()) {
                        currentGame.addPlayer(msg.author.id, msg.author.username);
                        msg.channel.send(`${msg.author.username} has joined the game.`);
                        //say a message confirming the username who joined and their money total
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
                        currentGame.removePlayer(msg.author.id);
                        msg.channel.send(`Okay, bye ${msg.author.username}`);
                    }
                    break;
            }

            if (str.startsWith('bet')) {
                if(!gameIsStarted()) {
                    msg.channel.send(`A game has not been started yet! Type h.blackjack to start a game!`);
                    return;
                }
                let betArgs = str.split(' ');
                if (betArgs.length > 1) {
                    let bet = parseInt(betArgs[1]);
                    if (isNaN(bet)) {
                        msg.channel.send(`Invalid bet amount. Example "h.bet 100".`);
                        return;
                    }

                    let foundPlayer = false;
                    currentGame.players.forEach((player: Player, index: number) => {
                        if(player.userId === msg.author.id) {
                            currentGame.players[index].bet = bet;
                            foundPlayer = true;
                        }
                    });
                    if (!foundPlayer) {
                        msg.channel.send('Dweeb! You are not in the game! Dweeb!')
                    }
                }
                return;
            }

            if (str.startsWith('stop')) {
                //TODO: remove this later. This is just for testing purposes
                if(gameIsStarted()) {
                    msg.channel.send(`Game has stopped`);
                    gameStarted = false;
                }
                else {
                    msg.channel.send(`Game is not started yet`);
                }
                return;
            }

            if (str.startsWith('gandhi')) {
                let gandhiArgs = str.split(' ');
                if(gandhiArgs.length == 1) {
                    gandhiQuote(randomNumberWithinQuoteCount(), msg);
                }

                else if(gandhiArgs.length > 1) {
                    let quoteNum = Number(gandhiArgs[1]) - 1;
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
                let tagUser = false;
                bannedWords.bannedWords.forEach((word: string) => {
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

/**
 * TODO: finish classifying HonBot
 */
// class HonBot {
//     public static play(): void {
//         console.log('Now playing!');
//         currentGameChannel.send(`Now beginning game. ${currentGame.players[0].username} are in.`);
//     }

//     public static get gameIsStarted(): boolean {
//         return gameStarted;
//     }

//     public static get handInProgress(): boolean {
//         return handInProgress;
//     }

//     public static get now(): string {
//         return moment().format('lll');
//     }

//     public static sendGandhiQuote(quoteNumber: number, message: Message): void {
//         message.channel.send(`\`\`\`Gandhi Quote #${quoteNumber + 1}/${quotes.quotes.length}:\n${quotes.quotes[quoteNumber]} \n\n--Gandhi\`\`\``);
//     }

//     public static randomNumberWithinQuoteCount(): number {
//         return Math.floor(Math.random() * quotes.quotes.length);
//     }
// }

client.on('channelCreate', channel => {
    // This seems like it would have crashed HonBot, since send doesn't exist on channel
    // channel.send(`Honbar notices your new channel :eyes: and steals the first message :sunglasses:`);
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setStatus('online');
    client.user.setPresence({
        game: {
            name: 'Use h. as the default prefix! You can\'t change it!',
        }
    });
});

function play() {
    console.log(`Now playing!`);
    currentGameChannel.send(`Now beginning game. ${currentGame.players[0].username} are in.`);
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

function gandhiQuote(quoteNum: number, msg: Message) {
    msg.channel.send(`\`\`\`Gandhi Quote #${quoteNum + 1}/${quotes.quotes.length}:\n${quotes.quotes[quoteNum]} \n\n--Gandhi\`\`\``);
}

function randomNumberWithinQuoteCount() {
    return Math.floor(Math.random() * quotes.quotes.length);
}

client.login(auth.token);
