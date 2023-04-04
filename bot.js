const { Client, MessageAttachment, Message } = require('discord.js');
const axios = require('axios');
const winston = require('winston');
const ImageManipulator = require('./image-manip');
const fs = require('fs');
const moment = require('moment');
const envVars = require('./envVars.json');
const auth = require('./auth.json');
const gameClass = require('./blackjack/blackjack.js');
const Acro = require('./acro/acro');
const Madlibs = require('./madlibs/madlibs');
const { c2f, f2c, cad2usd, usd2cad, km2mi, mi2km, kg2lb, lb2kg } = require('./utils/converter.js');
const { help } = require('./utils/help.js');
const quotes = require('./gandhiQuotes.json');
const chrisQuotes = require('./chrisQuotes.json');
const fortunes = require('./magic8ball.json');
const madComps = require('./madlibComponents.json');
const drinks = require('./drinks.json');
const food = require('./food.json');
const commands = require('./commands.json');

const client = new Client();
const prefix = 'h.';

let game = new gameClass;
let acro = new Acro;
let madlibs = new Madlibs;
let cancelConfirm = false;
let handInProgress = false;
let gameStarted = false;
let currentGameChannel;
let fifteen = false;
let blacklistUsers = [];

const imgManip = new ImageManipulator();
const logger = winston.createLogger({
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ format: winston.format.colorize(), filename: './HonLogs/error.log', level: 'error' }),
        new winston.transports.File({ format: winston.format.colorize(), filename: './HonLogs/combined.log' }),
        new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple())})
    ]
});

client.on('message', msg => {
    let hasPrefix = false;
    let str = msg.content;
    if(!envVars.TEST_MODE) {
        if(msg.author.id != '266744954922074112' && !userInBlacklist(msg.author.id) || msg.author.id === '167138850995437568') {
            if(str.toLowerCase().startsWith(prefix)) {
                hasPrefix = true;
                str = str.substring(prefix.length);
                switch(str.toLowerCase()) {
                    
                    case 'patchnotes':
                        msg.channel.send(`\`Apr. 3rd, 2023\nI don't know why it took so long, but you can now create a random number with a customizable max and quantity. h.help number\``);
                        break;

                    case 'face':
                        msg.channel.send(`:eyes:\n:nose:\n:lips:`);
                        break;

                    case 'ngandhi':
                        let subsetSize = quotes.quotes.length * 0.40;
                        let nQuoteNum = quotes.quotes.length - Math.floor(Math.random() * subsetSize) - 1;
                        msg.channel.send(`\`\`\`Gandhi Quote #${nQuoteNum + 1}/${quotes.quotes.length}:\n${quotes.quotes[nQuoteNum]} \n\n--Gandhi\`\`\``);
                        break;

                    case 'dr':
                        msg.channel.send(`<:dontread:675498364040642576> __DON'T__ https://youtu.be/sHJ5HqG_JvI __READ__ <:dontread:675498364040642576>`);
                        break;

                    case 'h':
                        const attachment = new MessageAttachment('./media/h.gif');
                        msg.channel.send(attachment);
                        break;

                    case '15':
                        if (fifteen) {
                            msg.channel.send(new MessageAttachment('./media/15.png'));
                        }
                        break;
                    
                    case 'git':
                        msg.channel.send(`README & Source Code here: https://github.com/CptPalindrome/HonBot`);
                        break;
                    
                    case 'mike':
                        const ripboyz = ['265065191731888130', '186268546106523648', '450763119149449226',
                            '167138850995437568', '265567107280797696', '182325251927965697']
                        if(ripboyz.includes(msg.author.id)) {
                            msg.channel.send('🙏');
                        }
                        break;
                    
                    case 'commands':
                        msg.channel.send(`\`\`\`${getCommands()}\n\nDo help <command name> for more info on individual commands.\`\`\``)
                        break;
                    
                    case 'bljk':
                        if(gameIsStarted()) {
                            msg.channel.send(`A game is already in progress!`);
                        }
                        else {
                            setTimeout(() => play(), 15000);
                            msg.channel.send(`Game starts in 15 seconds. Use \`h.join\` to join the game!`);
                            gameStarted = true;
                            currentGameChannel = msg.channel;
                        }
                        break;

                    case 'join':
                        let joinPos = isPlayerInGame(game.players, msg.author.id);
                        if (gameIsStarted() && !isHandInProgress() && joinPos === -1) {
                            game.addPlayer(msg.author.id, msg.author.username);
                            joinPos = isPlayerInGame(game.players, msg.author.id);
                            msg.react(`✅`);
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
                                msg.react(`✅`);
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

                    case 'cf':
                        let coin = Math.floor(Math.random() * 2);
                        if(coin) {
                            msg.channel.send(`Heads 👌`);
                        }
                        else {
                            msg.channel.send(`Tails 🚫`);
                        }
                        break;
                    case 'acro':
                        if (acro.getState() === 'none') {
                            acro.acroStart(msg.channel);
                        }
                        break;

                    case 'remaining': 
                        if(madlibs.getState() === 'none')
                            msg.channel.send(`\`\`\`${madlibs.getRemainingStories()}\`\`\``);
                        break;

                    case 'resetstories':
                        if(madlibs.getState() === 'none') {
                            if(!cancelConfirm) {
                                msg.channel.send(`Are you sure you want to reset? \`h.resetstories\` again to confirm.`);
                                cancelConfirm = true;
                                setTimeout(() => 
                                {
                                    cancelConfirm = false;
                                }, 30000);
                            }
                            else { 
                                cancelConfirm = false;
                                madlibs.resetStories(msg.channel);
                            }
                        }
                        break;

                    case 'stopmad':
                        if(madlibs.getState() !== 'none' && madlibs.getState() !== 'joining') {
                            if(!cancelConfirm) {
                                msg.channel.send(`Are you sure you want to stop? \`h.stopmad\` again to confirm.`);
                                cancelConfirm = true;
                                setTimeout(() => 
                                {
                                    cancelConfirm = false;
                                }, 30000);
                            }
                            else { 
                                msg.channel.send(`Madlibs has been reset.`);
                                cancelConfirm = false;
                                madlibs.reset();
                            }
                        }
                        break;
    
                    case 'j': 
                        if(madlibs.getState() !== 'none') {
                            if (madlibs.playerCanJoin(msg.author.id)) {
                                madlibs.addPlayer(msg.author.id, msg.author.username, msg.author);
                                msg.channel.send(`${msg.author.username} has joined.`);
                            }
                        }
                        break;
    
                    case 'votekick':
                        if(madlibs.getState() === 'waitingForWord' && !madlibs.playerCanJoin(msg.author.id))
                        madlibs.voteKick();
                        break;
    
                    case 'pass':
                        if(madlibs.getState() === 'waitingForWord' && madlibs.verifyInput(msg.author.id)) {
                            madlibs.pass();
                        }
                        break;

                    case 'ifunny':
                        msg.channel.send(new MessageAttachment('./media/ifunny.jpg'));
                        break;

                    case 'repost':
                        msg.channel.send(new MessageAttachment('./media/repost.png'));
                        break;
                }

                if (str.toLowerCase().startsWith('gandhi')) {
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

                if (str.toLowerCase().startsWith('wyd')) {
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
                                case '{oven}':
                                    number = 50;
                                    wydArgs.shift();
                                    break;
                                case '{navy}':
                                    number = 72;
                                    wydArgs.shift();
                                    break;
                                case '{lagg}':
                                    number = 73;
                                    wydArgs.shift();
                                    break;
                                case '{nft}':
                                    number = 78;
                                    wydArgs.shift();
                                    break;
                                case '{eggman}':
                                    number = 80;
                                    wydArgs.shift();
                                    break;
                                default:
                                    if(reg.test(wydArgs[1])) {
                                        number = wydArgs[1].substring(1, wydArgs[1].length - 1) - 1;
                                        console.log(number)
                                        if (number > madComps.sentences.length - 1 || number < 0) {
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

                if (str.toLowerCase().startsWith('chris')) {
                    chrisQuote(msg);
                }

                if (str.toLowerCase().startsWith('8ball')) {
                    let question = str.substring(6);
                    fortune(msg, question);
                }

                if(str.toLowerCase().startsWith("roulette")) {
                    let options = []
                    if(str.substring(8)) {
                        options = str.substring(8).split(',');
                    }
                    if(options.length === 0) {
                        msg.channel.send(`To use the roulette, enter 2 or more items separated by commas. Ex. 'h.roulette ham, turkey, the goofy goober theme song'`);
                    }
                    else if(options.length == 1) {
                        msg.channel.send(`You must submit more than 1 item, or it's not a roulette you big stupid **DOOF**`);
                    }
                    else if(options.length > 1) {
                        let num = Math.floor(Math.random() * options.length);
                        msg.channel.send(`**__${options[num].trim()}__** has been selected.`);
                    }
                }

                if(str.toLowerCase().startsWith("drink")) {
                    let options = ""
                    if (str.substring(5)) {
                        options = str.substring(5);
                    }
                    let drinkStr = "";
                    if (options) {
                        if (options.includes("mystery")) {
                            if (options.includes("group") || options.includes("round")) {
                                drinkStr = serveDrink(true, true);
                            }
                            else {
                                drinkStr = serveDrink(true, false);
                            }
                        }
                        else {
                            if (options.includes("group") || options.includes("round")) {
                                drinkStr = serveDrink(false, true);
                            }
                            else {
                                drinkStr = serveDrink(false, false);
                            }
                        }
                    }
                    else {
                        drinkStr = serveDrink(false, false);
                    }
                    msg.channel.send(drinkStr);
                }

                if(str.toLowerCase().startsWith("food")) {
                    let options = ""
                    if (str.substring(4)) {
                        options = str.substring(4);
                    }
                    let foodStr = "";
                    if (options) {
                        if (options.includes("plain")) {
                            if (options.includes("group") || options.includes("round")) {
                                foodStr = serveFood(true, true);
                            }
                            else {
                                foodStr = serveFood(true, false);
                            }
                        }
                        else {
                            if (options.includes("group") || options.includes("round")) {
                                foodStr = serveFood(false, true);
                            }
                            else {
                                foodStr = serveFood(false, false);
                            }
                        }
                    }
                    else {
                        foodStr = serveFood(false, false);
                    }
                    msg.channel.send(foodStr);
                }

                if(str.toLowerCase().startsWith('banish') && checkAdmin(msg)) {
                    let banishOpts = str.split(' ').slice(1).join(' ');
                    try {
                        if (banishOpts) {
                            addToBlacklist(msg);
                            logger.info(`${now()} Ban command used: ${msg.mentions?.members.map(member => member.displayName)}`);
                        }
                    }
                    catch(e) {
                        logger.error(`${now()} ${e}`)
                        msg.react('❌');
                    }
                }

                if(str.toLowerCase().startsWith('unbanish')) {
                    let unbanishOpts = str.split(' ').slice(1).join(' ');
                    try {
                        if (unbanishOpts) {
                            removeFromBlacklist(msg, unbanishOpts);
                        }
                    }
                    catch(e) {
                        logger.error(`${now()} ${e}`)
                        msg.react('❌');
                    }
                }

                if(str.toLowerCase().startsWith('sugg')) {
                    let suggOptions = str.split(' ').slice(1).join(' ');
                    try {
                        if (suggOptions) {
                            addSuggestion(suggOptions, msg.author.username)
                            msg.react('✅');
                        }
                        else {
                            msg.channel.send(`Type a title (optional) and then put a vertical bar (|) to split the title from the suggestion.`)
                        }
                    }
                    catch(e) {
                        logger.error(`${now()} ${e}`)
                        msg.react('❌');
                    }
                }

                if(str.toLowerCase().startsWith('mad')) {
                    let madOptions = str.split(' ').slice(1).join(' ');
            
                    if(madlibs.getState() === 'none') {
                        if(!madlibs.isMad && Math.floor(Math.random() * 10) === 1) {
                            msg.channel.send(`Yeah, I'm mad`);
                            madlibs.setMad(true);
                        }

                        else if(madlibs.isMad) {
                            let rand = Math.floor(Math.random() * 10);
                            if(rand === 1 || rand === 3) {
                                msg.channel.send(`Still mad`);
                            }
                            else if(rand === 2) {
                                msg.channel.send(`Less mad, but try again.`);
                                madlibs.setMad(false);
                            }
                            else {
                                if(madOptions) madlibs.madlibsStart(msg.channel, madOptions);
                                else madlibs.madlibsStart(msg.channel);
                                madlibs.setMad(false);    
                            }
                        }
                        
                        else {
                            if(madOptions) madlibs.madlibsStart(msg.channel, madOptions);
                            else madlibs.madlibsStart(msg.channel);
                            madlibs.setMad(false);
                        }
                    }
                }

                if(str.toLowerCase().startsWith('noun')) {
                    let numWords = str.split(' ')[1];
                    if(numWords) 
                        msg.channel.send(`Example noun: \`${getWord('noun', numWords)}\``);
                    else
                        msg.channel.send(`Example nouns: \`${getWord('noun')}\``);
                }

                if(str.toLowerCase().startsWith('people')) {
                    let numWords = str.split(' ')[1];
                    if(numWords) 
                        msg.channel.send(`Example people: \`${getWord('people', numWords)}\``);
                    else
                        msg.channel.send(`Example people: \`${getWord('people')}\``);
                }
                
                if(str.toLowerCase().startsWith('person')) {
                    let numWords = str.split(' ')[1];
                    if(numWords) 
                        msg.channel.send(`Example people: \`${getWord('people', numWords)}\``);
                    else
                        msg.channel.send(`Example people: \`${getWord('people')}\``);
                }
                
                if(str.toLowerCase().startsWith('location')) {
                    let numWords = str.split(' ')[1];
                    if(numWords) 
                        msg.channel.send(`Example locations: \`${getWord('location', numWords)}\``);
                    else
                        msg.channel.send(`Example locations: \`${getWord('location')}\``);
                }
                    
                if(str.toLowerCase().startsWith('verb')) {
                    let numWords = str.split(' ')[1];
                    if(numWords)                             
                        msg.channel.send(`Example verbs: \`${getWord('verb', numWords)}\``);
                    else
                        msg.channel.send(`Example verbs: \`${getWord('verb')}\``);
                }
                
                if(str.toLowerCase().startsWith('iverb')) {
                    let numWords = str.split(' ')[1];
                    if(numWords) 
                        msg.channel.send(`Example intransitive verbs: \`${getWord('intransitive', numWords)}\``);
                    else
                        msg.channel.send(`Example intransitive verbs: \`${getWord('intransitive')}\``);
                }
                
                if(str.toLowerCase().startsWith('adjective')) {
                    let numWords = str.split(' ')[1];
                    if(numWords) 
                        msg.channel.send(`Example adjectives: \`${getWord('adjective', numWords)}\``);
                    else
                        msg.channel.send(`Example adjectives: \`${getWord('adjective')}\``);
                }
                    
                if(str.toLowerCase().startsWith('adverb')) {
                    let numWords = str.split(' ')[1];
                    if(numWords) 
                        msg.channel.send(`Example adverbs: \`${getWord('adverb', numWords)}\``);
                    else
                        msg.channel.send(`Example adverbs: \`${getWord('adverb')}\``);
                }

                if(str.toLowerCase().startsWith('preposition')) {
                    let numWords = str.split(' ')[1];
                    if(numWords) 
                        msg.channel.send(`Example prepositions: \`${getWord('preposition', numWords)}\``);    
                    else
                        msg.channel.send(`Example prepositions: \`${getWord('preposition')}\``);
                }

                if(str.toLowerCase().startsWith('c2f')) {
                    let temp = str.split(' ')[1];
                    if(temp && !isNaN(temp)) {
                        let temp2 = c2f(temp);
                        msg.channel.send(`**${Math.round(temp)}C** is about **${temp2}F**`);
                    }
                }

                if(str.toLowerCase().startsWith('f2c')) {
                    let temp = str.split(' ')[1];
                    if(temp && !isNaN(temp)) {
                        let temp2 = f2c(temp);
                        msg.channel.send(`**${Math.round(temp)}F** is about **${temp2}C**`);
                    }
                }

                if(str.toLowerCase().startsWith('cad2usd')) {
                    let amnt = str.split(' ')[1];
                    if(amnt && !isNaN(amnt)) {
                        let amnt2 = cad2usd(amnt);
                        msg.channel.send(`**$${amnt} CAD** is about **$${amnt2} USD**`);
                    }
                }

                if(str.toLowerCase().startsWith('usd2cad')) {
                    let amnt = str.split(' ')[1];
                    if(amnt && !isNaN(amnt)) {
                        let amnt2 = usd2cad(amnt);
                        msg.channel.send(`**$${amnt} USD** is about **$${amnt2} CAD**`);
                    }
                }

                if(str.toLowerCase().startsWith('km2mi')) {
                    let dist = str.split(' ')[1];
                    if(dist && !isNaN(dist)) {
                        let dist2 = km2mi(dist);
                        msg.channel.send(`**${Math.round(dist)}km** is about **${dist2}mi**`);
                    }
                }

                if(str.toLowerCase().startsWith('mi2km')) {
                    let dist = str.split(' ')[1];
                    if(dist && !isNaN(dist)) {
                        let dist2 = mi2km(dist);
                        msg.channel.send(`**${Math.round(dist)}mi** is about **${dist2}km**`);
                    }
                }

                if(str.toLowerCase().startsWith('kg2lb')) {
                    let weight = str.split(' ')[1];
                    if(weight && !isNaN(weight)) {
                        let weight2 = kg2lb(weight);
                        msg.channel.send(`**${Math.round(weight)}kg** is about **${weight2}lbs**`);
                    }
                }

                if(str.toLowerCase().startsWith('lb2kg')) {
                    let weight = str.split(' ')[1];
                    if(weight && !isNaN(weight)) {
                        let weight2 = lb2kg(weight);
                        msg.channel.send(`**${Math.round(weight)}lbs** is about **${weight2}kg**`);
                    }
                }

                if(str.toLowerCase().startsWith('help')) {
                    let cmnd = str.split(' ')?.[1];
                    msg.channel.send(help(cmnd));
                }

                if(str.toLowerCase().startsWith('obliterate') || str.toLowerCase().startsWith('obl')) {
                    const files = [...msg.attachments.values()];
                    if(files[0]?.name) imgManip.obliterate(files[0].url, msg.channel, { width: files[0]?.width, height: files[0]?.height });
                    else msg.channel.send('No attachment sent.');
                }
                if(str.toLowerCase().startsWith('zoomandmaintaincurrenthance') || str.toLowerCase().startsWith('zamch')) {
                    const files = [...msg.attachments.values()];
                    if(files[0]?.name) imgManip.zoomCurrentHance(files[0].url, msg.channel, { width: files[0]?.width, height: files[0]?.height });
                    else msg.channel.send('No attachment sent.');
                }
                if(str.toLowerCase().startsWith('num')) {
                    let aNumber = '';
                    let max = str.split(' ')?.[1] || Number.MAX_SAFE_INTEGER;
                    if (max > Number.MAX_SAFE_INTEGER) max = Number.MAX_SAFE_INTEGER;
                    let quant = str.split(' ')?.[2] || 1;
                    if (quant > 20) quant = 20;
                    for(let i = 0; i < quant; i++) {
                        aNumber += `${Math.floor(Math.random() * max)} `;
                    }
                    try {
                        msg.channel.send(aNumber);
                    } catch (e) { console.log('message too lawnnng'); }
                }
            } //end of h. requirements
            else {
                if (acro.getState() === 'writing') {
                    if (acro.playerCanJoin(msg.author.id, str)) {
                        acro.addPlayer(msg.author.id, msg.author.username, str);
                        msg.delete()
                            .then()
                            .catch(console.error);
                    }
                }
    
                if (acro.getState() === 'voting') {
                    if (acro.playerCanVote(msg.author.id, str)) {
                        acro.addVoter(msg.author.id, msg.author.username, str);
                        msg.delete()
                            .then()
                            .catch(console.error);
                    }
                }
    
                if(madlibs.getState() === 'waitingForWord' && !hasPrefix && msg.channel === madlibs.getChannel()) {
                    if(!str.includes('{') && !str.includes('}')) {
                        madlibs.fillBlank(msg.author.id, str);
                        cancelConfirm = false;
                    }
                    else {
                        if (madlibs.verifyInput(msg.author.id))
                        msg.reply(`Do not put curly braces ( '{' or '}' ) in your input!`);
                    }
                }

                if(msg.embeds && msg.embeds.some(element => element?.provider?.name === 'Humble Bundle') && Math.floor(Math.random() * 10) <= 2)
                    msg.reply(`do you get paid for these links?`);
            }
        }
    }
    //TESTING CODE ZONE
    else {
        if(msg.author.id != '266744954922074112') {

            let hasPrefix;
            if(str.toLowerCase().startsWith(prefix)) {
                hasPrefix = true;
                str = str.substring(prefix.length);
                switch(str) {
                    case 'test':
                        msg.reply(`yeahhh we testin`);
                        break;
                }
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
    let startMessage = '';
    game.players.forEach(player => {
        player.reset();
        game.hit(player);
        game.hit(player);
        if (player.handTotal() == 21) {
            player.status = 'bj';
        }
        if(player.userId !== 'dealer') {
            startMessage += `***${player.username}*** has **${player.currentHand()}** *(${player.handTotal()})*\n`;
        }
        else {
            startMessage += `***__${player.username}__*** showing **${player.getFirst()}** \n`;
            if (player.status != 'bj') {
                player.status = 'unflipped';
            }
        }
    });
    currentGameChannel.send(startMessage);
    
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
    let endMessage = '';
    let dealerTotal = game.players[dealerPos].handTotal();
    endMessage += `***__Dealer__*** drew ${cardsDrawnByDealer} card(s) and has **${game.players[dealerPos].currentHand()}** *(${game.players[dealerPos].handTotal()})*\n`
    if (dealerTotal > 21) {
        endMessage += `***__Dealer__*** has busted!\n`;
    }

    game.players.forEach(player => {
        if (player.userId !== 'dealer') {
            if (player.status == 'done' || player.status == 'double') {
                if (dealerTotal <= 21) {
                    if (player.handTotal() < dealerTotal) {
                        endMessage += `***${player.username}*** *(${player.handTotal()})*, you lose.\n`;
                        player.resolveBet('lose');
                    }
                    if (player.handTotal() == dealerTotal) {
                        endMessage += `***${player.username}*** *(${player.handTotal()})*, you push.\n`;
                        player.resolveBet('push');
                    }
                    if (player.handTotal() > dealerTotal) {
                        endMessage += `***${player.username}*** *(${player.handTotal()})*, you win!\n`;
                        player.resolveBet('win');
                    }
                }
                
                if (dealerTotal > 21) {
                    endMessage += `***${player.username}*** *(${player.handTotal()})*, you win!\n`;
                    player.resolveBet('win');
                }
            }
            else if (player.status == 'bj') {
                if (game.players[dealerPos].status == 'bj') {
                    endMessage += `***${player.username}*** *(${player.handTotal()})*, you push.\n`;
                    player.resolveBet('push');
                }
                else {
                    endMessage += `***${player.username}*** *(${player.handTotal()})*, you win!\n`;
                    player.resolveBet('bj');
                }
            }

            else if (player.status == 'busted') {
                endMessage += `***${player.username}*** *(${player.handTotal()})*, you lose.\n`;
                player.resolveBet('lose');
            }
        }
    });
    currentGameChannel.send(endMessage);
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
        name = msg.mentions.members.first().displayName;
    }

    msg.channel.send(`\`\`\`${outString} \n\n--${name}\`\`\``);
}

function buildString(number) {
    let sentence = madComps.sentences[number];
    let parsedSentence = sentence.s;
    const nounsCopy = [...madComps.nouns];
    const peopleCopy = [...madComps.people];
    const locationsCopy = [...madComps.locations];
    const verbsCopy = [...madComps.verbs];
    const iverbsCopy = [...madComps.verbsIntransitive];
    const adjectivesCopy = [...madComps.adjectives];
    const adverbsCopy = [...madComps.adverbs];
    const prepositionsCopy = [...madComps.prepositions];

    if(sentence.n > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.n, nounsCopy, 'n', '', 'singular');
    }
    
    if(sentence.npl > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.npl, nounsCopy, 'n', 'pl', 'plural');
    }

    if(sentence.p > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.p, peopleCopy, 'p', '');
    }

    if(sentence.l > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.l, locationsCopy, 'l', '');
    }
    
    if(sentence.v > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.v, verbsCopy, 'v', '', 'present');
    }
    
    if(sentence.vp > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.vp, verbsCopy, 'v', 'p', 'past');
    }
    
    if(sentence.ving > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.ving, verbsCopy, 'v', 'ing', 'ing');
    }

    if(sentence.iv > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.iv, iverbsCopy, 'iv', '', 'present');
    }

    if(sentence.ived > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.ived, iverbsCopy, 'iv', 'ed', 'past');
    }

    if(sentence.iving > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.iving, iverbsCopy, 'iv', 'ing', 'ing');
    }

    if(sentence.a > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.a, adjectivesCopy, 'a', '', 'regular');
    }

    if(sentence.aer > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.aer, adjectivesCopy, 'a', 'er', 'er');
    }

    if(sentence.ae > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.ae, adjectivesCopy, 'a', 'e', 'est');
    }

    if(sentence.adv > 0) {
        parsedSentence = parseSentence(parsedSentence, sentence.adv, adverbsCopy, 'adv', '');
    }

    if(sentence.prep > 0) {
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
        msg.channel.send(`> ${question}\n\`\`\`🎱 ${fortunes.fortunes[fortuneNum]}\`\`\``);
    }
    else {
        msg.channel.send(`\`\`\`🎱 ${fortunes.fortunes[fortuneNum]}\`\`\``);
    }
}

function randomNumberWithinQuoteCount() {
    return Math.floor(Math.random() * quotes.quotes.length);
}

function serveDrink(isMystery, isGroupOrder) {
    const containerName = drinks.containers[Math.floor(Math.random() * drinks.containers.length)];
    const honbarMessage = drinks.serviceMessages[Math.floor(Math.random() * drinks.serviceMessages.length)];
    let drinkName = "";
    let outString = "Honbar serves you ";
    if (isMystery) {
        const mysteriesCopy = [...drinks.mysteryIngredients];
        let ingredients = [];
        let ingredientNum = 0;
        const ingredientCount = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < ingredientCount; i++) {
            ingredientNum = Math.floor(Math.random() * mysteriesCopy.length)
            ingredients.push(mysteriesCopy[ingredientNum]);
            mysteriesCopy.splice(ingredientNum, 1);
        }

        ingredients[ingredients.length - 1] = 'and ' + ingredients[ingredients.length - 1];

        if (isGroupOrder) {
            const quantityName = drinks.groupQuantities[Math.floor(Math.random() * drinks.groupQuantities.length)];
            outString += (`__${quantityName}__ __${containerName.plural}__ ***${ingredients.join(", ")}***. *"${honbarMessage}"*`);
        }
        else {
            outString += (`__${containerName.singular}__ ***${ingredients.join(", ")}***. *"${honbarMessage}"*`);
        }
    }

    else {
        const drinkNum = Math.floor(Math.random() * drinks.drinks.length);
        if (!isGroupOrder) {
            drinkName = drinks.drinks[drinkNum].name;
            outString += (`__${containerName.singular}__ ***${drinkName}***. *"${honbarMessage}"*`);
        }
        else {
            const quantityName = drinks.groupQuantities[Math.floor(Math.random() * drinks.groupQuantities.length)];
            drinkName = drinks.drinks[drinkNum].namePlural;
            outString += (`__${quantityName}__ __${containerName.plural}__ ***${drinkName}***. *"${honbarMessage}"*`);
        }   
    }
    return outString;
}

function serveFood(isMystery, isGroupOrder) {
    const containerName = food.containers[Math.floor(Math.random() * food.containers.length)];
    const honbarMessage = food.serviceMessages[Math.floor(Math.random() * food.serviceMessages.length)];
    let foodName = "";
    let outString = "Honbar serves you ";
    if (!isMystery) {
        const mysteriesCopy = [...food.mysteryIngredients];
        let ingredients = [];
        let ingredientNum = 0;
        const ingredientCount = 3 + Math.floor(Math.random() * 4);
        const foodNum = Math.floor(Math.random() * drinks.drinks.length);
        for (let i = 0; i < ingredientCount; i++) {
            ingredientNum = Math.floor(Math.random() * mysteriesCopy.length)
            ingredients.push(mysteriesCopy[ingredientNum]);
            mysteriesCopy.splice(ingredientNum, 1);
        }
        
        ingredients[ingredients.length - 1] = 'and ' + ingredients[ingredients.length - 1];

        if (isGroupOrder) {
            const quantityName = food.groupQuantities[Math.floor(Math.random() * food.groupQuantities.length)];
            foodName = food.food[foodNum].plural;
            outString += (`__${quantityName}__ __${containerName.plural}__ ***${foodName}*** `);
            outString += (`with ***${ingredients.join(", ")}***. *"${honbarMessage}"*`);
        }
        else {
            foodName = food.food[foodNum].singular;
            outString += (`__${containerName.singular}__ ***${foodName}*** `);
            outString += (`with ***${ingredients.join(", ")}***. *"${honbarMessage}"*`);
        }
    }

    else {
        const foodNum = Math.floor(Math.random() * drinks.drinks.length);
        if (!isGroupOrder) {
            drinkName = food.food[foodNum].singular;
            outString += (`__${containerName.singular}__ ***${drinkName}***. *"${honbarMessage}"*`);
        }
        else {
            const quantityName = drinks.groupQuantities[Math.floor(Math.random() * drinks.groupQuantities.length)];
            drinkName = food.food[foodNum].plural;
            outString += (`__${quantityName}__ __${containerName.plural}__ ***${drinkName}***. *"${honbarMessage}"*`);
        }
    }
    return outString;
}

function addSuggestion(msg, user) {
    let [title, ...content] = msg.split('|');
    content = content.map(part => part.trim()).join(' ');
    if (!content) {
        content = title;
        title = '';
    }

    let temp = JSON.parse(fs.readFileSync('./suggestions.json'));
    temp.suggestions.push({title: title.trim(), content: content, suggester: user});
    logger.info(`${user} @ ${moment().format('MMM D YYYY, h:mm a')} -- ${title} | ${content}`);
    fs.writeFileSync('./suggestions.json', JSON.stringify(temp,null,2));
}

function emailSuggestions() {
    let suggestionsList = JSON.parse(fs.readFileSync('./suggestions.json'));
    let date = moment().format('MM-DD-YYYY');
    suggestionsList = suggestionsList.suggestions;
    suggestionsList.forEach((suggestion, index) => {
        let params = suggestion;
        params.date = date;
        params.sugnum = index + 1;
        axios.post('https://api.emailjs.com/api/v1.0/email/send', {service_id: envVars.serviceid, template_id: envVars.templateid, template_params: params, user_id: envVars.userid})
        .then(res => {
            logger.info(`${moment().format('MMM D YYYY, h:mm:ss a')} Email ${index + 1} status: ${res.data}`);
            resetSugg();
        })
        .catch(e => {
            logger.error(`${moment().format('MMM D YYYY, h:mm:ss a')} Email ${index + 1} status: ${e.data}`);
        });
    })
}

function resetSugg() {
    fs.writeFileSync('./suggestions.json', JSON.stringify({
        suggestions: []
    }, null, 2));
}

function suggestionsReady() {
    if (fs.existsSync('./suggestions.json')) {
        let suggestionsList = JSON.parse(fs.readFileSync('./suggestions.json'));
        if (suggestionsList?.suggestions.length > 0) {
            return true;
        }
    }
    else {
        fs.writeFileSync('./suggestions.json', JSON.stringify({suggestions: []}));
    }
    return false;
}

async function addToBlacklist(msg) {
    if(msg.mentions?.users?.size > 0) {
        msg?.mentions?.users.forEach(user => {
            if (user?.id != msg.author?.id) {
                blacklistUsers.push(user?.id);
                msg.react('✅');
            }
        });
    }
}

function removeFromBlacklist(msg, str) {
    if(msg.mentions.users.size > 0) {
        msg.mentions.users.forEach(user => {
            blacklistUsers.forEach((blstUser, index) => {
                if (user.id === blstUser) {
                    blacklistUsers.splice(index, 1);
                    msg.react('✅');
                }
            })
        });
    }
    else if(str.toUpperCase() === 'ALL') {
        blacklistUsers = [];
        msg.react('✅');
    }
}

function userInBlacklist(id) {
    let flag = false;
    blacklistUsers.forEach(userid => {
        if(userid === id) {
            flag = true;
        }
    });
    return flag;
}

function checkAdmin(msg) {
    return msg.member.hasPermission('ADMINISTRATOR');
}

function getWord(type, numWords = 5) {
    const nounsCopy = [...madComps.nouns];
    const peopleCopy = [...madComps.people];
    const locationsCopy = [...madComps.locations];
    const verbsCopy = [...madComps.verbs];
    const iverbsCopy = [...madComps.verbsIntransitive];
    const adjectivesCopy = [...madComps.adjectives];
    const adverbsCopy = [...madComps.adverbs];
    const prepositionsCopy = [...madComps.prepositions];
    let wordsArr = [];
    let randomNum;
    let numOfWords = numWords;
    if(numOfWords === '0') numOfWords = 5;
    else if (numOfWords > 25) numOfWords = 25;

    try {
        switch(type) {
            case 'noun':
                for(let i = 0; i < numOfWords; i++) {
                    randomNum = Math.floor(Math.random() * nounsCopy.length);
                    wordsArr.push(nounsCopy[randomNum].singular);
                    nounsCopy.splice(randomNum, 1);
                }
                break;

            case 'people':
                for(let i = 0; i < numOfWords; i++) {
                    randomNum = Math.floor(Math.random() * peopleCopy.length);
                    wordsArr.push(peopleCopy[randomNum]);
                    peopleCopy.splice(randomNum, 1);
                }
                break;

            case 'location':
                for(let i = 0; i < numOfWords; i++) {
                    randomNum = Math.floor(Math.random() * locationsCopy.length);
                    wordsArr.push(locationsCopy[randomNum]);
                    locationsCopy.splice(randomNum, 1);
                }
                break;

            case 'verb':
                for(let i = 0; i < numOfWords; i++) {
                    randomNum = Math.floor(Math.random() * verbsCopy.length);
                    wordsArr.push(verbsCopy[randomNum].present);
                    verbsCopy.splice(randomNum, 1);
                }
                break;

            case 'intransitive':
                for(let i = 0; i < numOfWords; i++) {
                    randomNum = Math.floor(Math.random() * iverbsCopy.length);
                    wordsArr.push(iverbsCopy[randomNum].present);
                    iverbsCopy.splice(randomNum, 1);
                }
                break;

            case 'adjective':
                for(let i = 0; i < numOfWords; i++) {
                    randomNum = Math.floor(Math.random() * adjectivesCopy.length);
                    wordsArr.push(adjectivesCopy[randomNum].regular);
                    adjectivesCopy.splice(randomNum, 1);
                }
                break;

            case 'adverb':
                for(let i = 0; i < numOfWords; i++) {
                    randomNum = Math.floor(Math.random() * adverbsCopy.length);
                    wordsArr.push(adverbsCopy[randomNum]);
                    adverbsCopy.splice(randomNum, 1);
                }
                break;

            case 'preposition':
                for(let i = 0; i < numOfWords; i++) {
                    randomNum = Math.floor(Math.random() * prepositionsCopy.length);
                    wordsArr.push(prepositionsCopy[randomNum]);
                    prepositionsCopy.splice(randomNum, 1);
                }
                break;
        } 
    }
    catch (e) {
        logger.error(`Words error. Type: ${type}. Number: ${numOfWords}. >> ${e}`)
    }
    return wordsArr.join(', ');
}

function getCommands() {
    return commands.commandlist.join('\n');
}

client.on('ready', () => {
    if(suggestionsReady()) {
        emailSuggestions()
    }
    let fifteenSent = JSON.parse(fs.readFileSync('./fifteenSentStatus.json')).sent;
    if(moment().format('D') === '15' && !fifteenSent) {
        fifteen = true;
        client.channels.cache.find(x => x.id == '452011709859627019').send(new MessageAttachment('./media/15.png')).then(msg => {
            msg.react('1️⃣')
                .then(() => msg.react('5️⃣'))
                .catch(error => console.error('Reaction FAILURE. No emotions now', error));
        });
        try {
            fs.writeFileSync('./fifteenSentStatus.json', '{ "sent": true }');
        } catch(e) {
            console.log(e);
        }
    }
    else if(moment().format('D') !== '15') {
        try {
            fs.writeFileSync('./fifteenSentStatus.json', '{ "sent": false }');
        } catch(e) {
            console.log(e);
        }
    }
});

client.login(auth.token);