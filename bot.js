const { Client, Attachment, Message } = require('discord.js');
const client = new Client();
const auth = require('./auth.json');

let prefix = 'h.';
let typeWatcher = false;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    let str = msg.content;
    if(str.startsWith(prefix)) {
        str = str.substr(prefix.length);
        switch(str) {
            case 'hi':
                msg.channel.send(`Honbar says hello to you, ${msg.author.username}`);
                break;
            
            case 'h':
                msg.channel.send('Honbar says help!');
                break;
                
            case 'where':
                msg.channel.send(`This channel is ${msg.channel}`);
                break;
    
            case 'img':
                att = new Attachment('./test.png');
                msg.channel.send(`Honbar wants to send you an image!`, att);
                break;

            case 'face':
                msg.channel.send(`:eyes:`);
                msg.channel.send(`:nose:`);
                msg.channel.send(`:lips:`);
                break;

            case 'watch':
                typeWatcher = !typeWatcher;
                if(typeWatcher) {
                    msg.channel.send(`Type watching is now on :eyes:`);
                }
                else {
                    msg.channel.send(`Type watching is now off :sleepy:`);
                }
                break;
            
            case 'help':
                msg.channel.send(`Honbar would be happy to assist. My commands are hi, img, face, say, and watch. If you include the text 'Honbar, delete this' in any message, I will delete it for you.`);
                break;
            
        }
    }

    if(str.startsWith('say')) {
        str = str.substr(4);
            msg.channel.send(str);
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
            
});

client.on('channelCreate', channel => {
    channel.send(`Honbar notices your new channel :eyes:`);
    channel.send(`Honbar steals the first message :sunglasses:`)
});

client.on('typingStart', (channel, user) => {
    if(typeWatcher)
    channel.send(`Type, ${user.username}, type...`);
});

client.on('ready', () => {
    client.user.setStatus('available');
    client.user.setPresence({
        game: {
            name: 'Use h. as the default prefix! You can\'t change it!'
        }
    });
});

client.login(auth.token);
