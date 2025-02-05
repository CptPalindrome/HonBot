/* eslint-disable no-case-declarations */
//author: Brian P. --Github@cptpalindrome
const { Client, Events, GatewayIntentBits, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const ImageManipulator = require('./image-manip');
const Acro = require('./acro/acro');
const Madlibs = require('./madlibs/madlibs');
const HonbuxHelper = require('./honbuxHandler');
const Letter = require('./letter');
const { createTeams, generateTeamName, generateTeamNameAlliteration } = require('./utils/teamMaker.js');
const { c2f, f2c, cad2usd, usd2cad, km2mi, mi2km, kg2lb, lb2kg, m2ft, cm2in, ft2m, in2cm, f2chirp, chirp2f } = require('./utils/converter.js');
const { help } = require('./utils/help.js');
const { makeSongMessage } = require('./pitbull');
const getHoagie = require('./utils/hoagieGetter.js');
const getCard = require('./yugioh');
const randomProc = require('./utils/randomProc');
const logger = require('./logger.js');
const envVars = require('./envVars.json');
const auth = require('./auth.json');
const quotes = require('./gandhiQuotes.json');
const chrisQuotes = require('./chrisQuotes.json');
const fortunes = require('./magic8ball.json');
const madComps = require('./madlibComponents.json');
const drinks = require('./drinks.json');
const food = require('./food.json');
const commands = require('./commands.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions] });
const prefix = 'h.';

let acro = new Acro;
let madlibs = new Madlibs;
let honbuxHelper = new HonbuxHelper;
let cancelConfirm = false;
let blacklistUsers = [];

const imgManip = new ImageManipulator();

const patchnoteText = `\`\`\`Jan 32nd 2025\nRemoving blackjack and associated commands. It may return at a later time but at present it is poorly implemented garbage and I don't like looking at it so it's bye bye for now.\`\`\``;

client.on(Events.MessageCreate, msg => {
    let hasPrefix = false;
    let str = msg.content;
    if(!envVars.TEST_MODE) {
        if(msg.author.id != '266744954922074112' && !userInBlacklist(msg.author.id) || msg.author.id === '167138850995437568') {
            if(str.toLowerCase().startsWith(prefix)) {
                hasPrefix = true;
                str = str.substring(prefix.length);
                switch(str.toLowerCase()) {
                    case 'patchnotes':
                        msg.channel.send(patchnoteText);
                        break;

                    case 'pn':
                        msg.channel.send(patchnoteText);
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
                        msg.channel.send({files: [new AttachmentBuilder('./media/h.gif')]});
                        break;

                    case 'npb':
                        msg.channel.send({files: [new AttachmentBuilder('./media/newportbiden.png')]});

                        break;

                    case 'newportbiden':
                        msg.channel.send({files: [new AttachmentBuilder('./media/newportbiden.png')]});
                        break;

                    case 'die':
                        msg.channel.send(`${Math.floor(Math.random() * 6) + 1}`)
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

                    case 'gtn':
                        msg.channel.send(generateTeamName());
                        break;

                    case 'generateteamname':
                        msg.channel.send(generateTeamName());
                        break;    
                    
                    case 'gtna':
                        msg.channel.send(generateTeamNameAlliteration());
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
                        msg.channel.send({ files: [new AttachmentBuilder('./media/ifunny.jpg')] });
                        break;

                    case 'repost':
                        msg.channel.send({ files: [new AttachmentBuilder('./media/repost.png')] });
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

                if (str.toLowerCase().startsWith('gettags') || str.toLowerCase().startsWith('tags')) {
                    const tagList = [];
                    madComps.sentences.forEach((sentence) => {
                        if(sentence.tags) {
                            sentence.tags.forEach(tag => tagList.push(tag));
                            tagList.push('TAGBREAKER');
                        }
                    });

                    const tags = tagList.join(' ').split('TAGBREAKER').map(item => item.trim()).join('\n');
                    msg.channel.send(`These are all the tags for h.wyd templates:\n\`\`\`\n${tags}\`\`\``)
                }

                if (str.toLowerCase().startsWith('wyd')) {
                    //take an @ and use them if present, otherwise do "I"
                    let wydArgs = str.split(' ');
                    let number = -1;
                    try {
                        if(wydArgs.length == 1) {
                            number = Math.floor(Math.random() * madComps.sentences.length);
                            wyd(msg, number, '');
                        }

                        else if(wyd.length > 1) {
                            if (wydArgs[1].includes('{') && wydArgs[1].includes('}')) {
                                madComps.sentences.forEach((sentence, index) => {
                                    if(sentence.tags) {
                                        if (sentence.tags.some(tag => {
                                            return tag.toLowerCase() === wydArgs[1].substring(1, wydArgs[1].length - 1).toLowerCase();
                                        })) {
                                            number = index;
                                        }
                                    }
                                });
                                wydArgs.shift();
                            } else number = Math.floor(Math.random() * madComps.sentences.length);

                            wydArgs.shift();
                            wyd(msg, number, wydArgs.join(' ').trim());
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
                        if(!madlibs.isMad && randomProc(1, 10)) {
                            msg.channel.send(`Yeah, I'm mad`);
                            madlibs.setMad(true);
                        }

                        else if(madlibs.isMad) {
                            if(randomProc(2, 10)) {
                                msg.channel.send(`Still mad`);
                            }
                            else if(randomProc(1, 10)) {
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
                    return;
                }

                if(str.toLowerCase().startsWith('f2chirp')) {
                    let temp = str.split(' ')[1];
                    if(temp && !isNaN(temp)) {
                        let chrip = f2chirp(temp);
                        msg.channel.send(`**${Math.round(temp)}F** is about **${chrip} chirps/minute**`);
                    }
                    return;
                }

                if(str.toLowerCase().startsWith('chirp2f')) {
                    let chirp = str.split(' ')[1];
                    if(chirp && !isNaN(chirp)) {
                        let temp = chirp2f(chirp);
                        msg.channel.send(`**${Math.round(chirp)} chirps/minute** is about **${temp}F**`);
                    }
                    return;
                }

                if(str.toLowerCase().startsWith('f2c')) {
                    let temp = str.split(' ')[1];
                    if(temp && !isNaN(temp)) {
                        let temp2 = f2c(temp);
                        msg.channel.send(`**${Math.round(temp)}F** is about **${temp2}C**`);
                    }return;
                }

                if(str.toLowerCase().startsWith('cad2usd')) {
                    let amnt = str.split(' ')[1];
                    if(amnt && !isNaN(amnt)) {
                        let amnt2 = cad2usd(amnt);
                        msg.channel.send(`**$${amnt} CAD** is about **$${amnt2} USD**`);
                    }
                    return;
                }

                if(str.toLowerCase().startsWith('usd2cad')) {
                    let amnt = str.split(' ')[1];
                    if(amnt && !isNaN(amnt)) {
                        let amnt2 = usd2cad(amnt);
                        msg.channel.send(`**$${amnt} USD** is about **$${amnt2} CAD**`);
                    }
                    return;
                }

                if(str.toLowerCase().startsWith('km2mi')) {
                    let dist = str.split(' ')[1];
                    if(dist && !isNaN(dist)) {
                        let dist2 = km2mi(dist);
                        msg.channel.send(`**${Math.round(dist)}km** is about **${dist2}mi**`);
                    }
                    return;
                }

                if(str.toLowerCase().startsWith('mi2km')) {
                    let dist = str.split(' ')[1];
                    if(dist && !isNaN(dist)) {
                        let dist2 = mi2km(dist);
                        msg.channel.send(`**${Math.round(dist)}mi** is about **${dist2}km**`);
                    }
                    return;
                }

                if(str.toLowerCase().startsWith('in2cm')) {
                    let dist = str.split(' ')[1];
                    if(dist && !isNaN(dist)) {
                        let dist2 = in2cm(dist);
                        msg.channel.send(`**${Math.round(dist)}in** is about **${dist2}cm**`);
                    }
                    return;
                }

                if(str.toLowerCase().startsWith('cm2in')) {
                    let dist = str.split(' ')[1];
                    if(dist && !isNaN(dist)) {
                        let dist2 = cm2in(dist);
                        msg.channel.send(`**${Math.round(dist)}cm** is about **${dist2}in**`);
                    }
                    return;
                }

                if(str.toLowerCase().startsWith('ft2m')) {
                    let dist = str.split(' ')[1];
                    if(dist && !isNaN(dist)) {
                        let dist2 = ft2m(dist);
                        msg.channel.send(`**${Math.round(dist)}ft** is about **${dist2}m**`);
                    }
                    return;
                }

                if(str.toLowerCase().startsWith('m2ft')) {
                    let dist = str.split(' ')[1];
                    if(dist && !isNaN(dist)) {
                        let dist2 = m2ft(dist);
                        msg.channel.send(`**${Math.round(dist)}m** is about **${dist2}ft**`);
                    }
                    return;
                }

                if(str.toLowerCase().startsWith('kg2lb')) {
                    let weight = str.split(' ')[1];
                    if(weight && !isNaN(weight)) {
                        let weight2 = kg2lb(weight);
                        msg.channel.send(`**${Math.round(weight)}kg** is about **${weight2}lbs**`);
                    }
                    return;
                }

                if(str.toLowerCase().startsWith('lb2kg')) {
                    let weight = str.split(' ')[1];
                    if(weight && !isNaN(weight)) {
                        let weight2 = lb2kg(weight);
                        msg.channel.send(`**${Math.round(weight)}lbs** is about **${weight2}kg**`);
                    }
                    return;
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
                    if (max > Number.MAX_SAFE_INTEGER || isNaN(max)) max = Number.MAX_SAFE_INTEGER;
                    let quant = str.split(' ')?.[2] || 1;
                    if (quant > 20) quant = 20;
                    else if (isNaN(quant)) quant = 1;
                    for(let i = 0; i < quant; i++) {
                        aNumber += `${Math.floor(Math.random() * max)} `;
                    }
                    try {
                        msg.channel.send(aNumber);
                    } catch (e) { logger.error('message too lawnnng'); }
                }

                if(str.toLowerCase().startsWith('maketeams') || str.toLowerCase().startsWith('mt')) {
                    const names = str.split(' ').splice(1).join(' ').split(',');
                    const [teamA, teamB] = createTeams(names);
                    msg.channel.send(`Team A: \`${teamA}\`\nTeam B: \`${teamB}\``)
                }
                
                if(str.toLowerCase().startsWith('daily')) {
                    msg.channel.send(honbuxHelper.daily(msg));
                }
                
                if(str.toLowerCase().startsWith('bail')) {
                    if (msg.author.id === '167138850995437568') {
                        const recipients = msg.mentions.users;
                        const param = str.split(' ')[1];
                        if (param.toLowerCase() === 'all') {
                            honbuxHelper.bailOutAll();
                            msg.react('✅');
                        } else {
                            if(recipients.size > 0) {
                                recipients.forEach((recipient) => {
                                    const balance = honbuxHelper.getUserData(recipient).honbalance;
                                    if (balance < 100) {
                                        honbuxHelper.bailOut(recipient);
                                        msg.react('✅');
                                    }
                                    else msg.react('❌');
                                });
                            } else {
                                msg.channel.send('Message needs to be formatted as follows: h.bailout @user(s)');
                            }
                        }
                    }
                }
                
                if(str.toLowerCase().startsWith('addbux')) {
                    if (msg.author.id === '167138850995437568') {
                        const recipients = msg.mentions.users;
                        let amount = str.split(' ')[1];
                        if(recipients.size > 0 && amount && !isNaN(amount)) {
                            recipients.forEach((recipient) => {
                                const balance = honbuxHelper.modifyBux(recipient, Number(amount), 'AddBux');
                                msg.channel.send(`Gave \`${recipient.username}\` \`${amount}\` Honbux. Balance is now \`${balance}\``);
                            });
                        } else {
                            msg.channel.send('Message needs to be formatted as follows: h.addbux `amount` @ user(s)');
                        }
                    }
                }

                if(str.toLowerCase().startsWith('wheel')) {
                    let bet = Math.floor(Number(str.split(' ')[1]));
                    const choice = str.split(' ')[2]?.toLowerCase();
                    const wheelMessage = honbuxHelper.spinWheel(msg.author, bet, choice);
                    msg.channel.send(wheelMessage);
                }
                
                if(str.toLowerCase().startsWith('cfbux')) {
                    const bet = Math.floor(Number(str.split(' ')[1]));
                    const choice = str.split(' ')[2]?.toLowerCase();
                    const cfbuxMessage = honbuxHelper.coinflip(msg.author, bet, choice);
                    msg.channel.send(cfbuxMessage);
                }

                if(str.toLowerCase().startsWith('honbalance') || str.toLowerCase().startsWith('honba')) {
                    msg.channel.send(`You have <:honbux:966533492030730340>**${honbuxHelper.getUserData(msg.author).honbalance}**`);
                }

                if(str.toLowerCase().startsWith('top')) {
                    if (randomProc(4, 10)) {
                        msg.channel.send({files: [new AttachmentBuilder('./media/top.gif')]});
                    } else {
                        const topGuy = honbuxHelper.getTopHonbux();
                        msg.channel.send(`The richest guy is **${topGuy.username}** with <:honbux:966533492030730340>**${topGuy.honbalance}**`);
                    }
                }

                if(str.toLowerCase().startsWith('ranking')) {
                    msg.channel.send(`\`\`\`Honbux Rankings:\n\n${honbuxHelper.getRankings()}\`\`\``);
                }

                if(str.toLowerCase().startsWith('metrics')) {
                    msg.channel.send(`\`\`\`${honbuxHelper.getMetrics(msg.author)}\`\`\``);
                }

                if(str.toLowerCase().startsWith('gmetrics') || str.toLowerCase().startsWith('gamemetrics')) {
                    msg.channel.send(`\`\`\`${honbuxHelper.getGameMetrics()}\`\`\``);
                }

                if(str.toLowerCase().startsWith('pitbull')) {
                    msg.channel.send(`${makeSongMessage()}`);
                }

                if(str.toLowerCase().startsWith('letter')) {
                    const startingLetter = str.split(' ')?.[1];
                    const endingLetter = str.split(' ')?.[2];
                    msg.channel.send(new Letter().getRandomLetter(startingLetter, endingLetter));
                }

                if(str.toLowerCase().startsWith('hoagie')) {
                    const hoagie = getHoagie();
                    msg.channel.send({content: `This hoagie is called: \`${hoagie.hoagieName}\``, files: [new AttachmentBuilder(`./hoagies/${hoagie.fileName}`)]});
                }

                if(str.toLowerCase().startsWith('hoahie')) {
                    msg.reply('"h.hoahie" 🤓');
                }

                if(str.toLowerCase().startsWith('yugi')) {
                    const card = getCard();
                    msg.channel.send({files: [new AttachmentBuilder(`./media/cards/${card}`)]});
                }

                if(str.toLowerCase().startsWith('logdump') && msg.author.id === '167138850995437568') {
                    msg.channel.send({files: [new AttachmentBuilder(`./HonLogs/combined.log`)]});
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

                if(msg.embeds && msg.embeds.some(element => element?.provider?.name === 'Humble Bundle' || (element?.provider?.name === 'Steam' && randomProc(8, 10))))
                    msg.reply(`do you get paid for these links?`);
            }
        }
    }
    //TESTING CODE ZONE
    else {
        if(msg.author.id != '266744954922074112') {
            if(str.toLowerCase().startsWith(prefix)) {
                str = str.substring(prefix.length);
                switch(str) {
                    case 'test':
                        msg.reply(`ID: ${msg.author.id}\nUsername: ${msg.author.username}\n...author?: ${msg.author.toString()}`);
                        break;
                }
            }
        }
    }
});

function now() {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}-${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
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
            const drinkName = food.food[foodNum].singular;
            outString += (`__${containerName.singular}__ ***${drinkName}***. *"${honbarMessage}"*`);
        }
        else {
            const quantityName = drinks.groupQuantities[Math.floor(Math.random() * drinks.groupQuantities.length)];
            const drinkName = food.food[foodNum].plural;
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
    logger.info(`${user} @ ${now()} -- ${title} | ${content}`);
    fs.writeFileSync('./suggestions.json', JSON.stringify(temp,null,2));
}

function emailSuggestions() {
    let suggestionsList = JSON.parse(fs.readFileSync('./suggestions.json'));
    suggestionsList = suggestionsList.suggestions;
    suggestionsList.forEach((suggestion, index) => {
        let params = suggestion;
        params.date = now();
        params.sugnum = index + 1;
        axios.post('https://api.emailjs.com/api/v1.0/email/send', {service_id: envVars.serviceid, template_id: envVars.templateid, template_params: params, user_id: envVars.userid})
        .then(res => {
            logger.info(`${now()} Email ${index + 1} status: ${res.data}`);
            resetSugg();
        })
        .catch(e => {
            logger.error(`${now()} Email ${index + 1} status: ${e.data}`);
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
    return msg.member.permissions.has(PermissionsBitField.Flags.Administrator);
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

client.on('messageReactionAdd', async (reaction, user) => {
    try {
        // Fetch the reaction if it's partial (needed for uncached messages)
        if (reaction.partial) {
            await reaction.fetch();
        }

        const ID_TO_DESTROY = '177401030739361792';

         // Check if the reaction is from the specific user
         if (user.id === ID_TO_DESTROY) {
            setTimeout(async () => await reaction.users.remove(user), 1000 * 60 * 3);
            const messageLink = `https://discord.com/channels/${reaction.message.guildId}/${reaction.message.channelId}/${reaction.message.id}`;
            logger.info(`${now()}: Hiro reaction queued for deletion in 3 minutes. Link to reacted message: ${messageLink}.`);
        }
    } catch (error) {
        console.error('Error removing reaction:', error);
    }
})

client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}!`);
    client.user.setStatus('available');
    client.user.setPresence({
        game: {
            name: 'Use h. as the default prefix! You can\'t change it!',
        }
    });

    if(suggestionsReady()) {
        emailSuggestions()
    }
    honbuxHelper.bailOutAll();
});

client.login(auth.token);