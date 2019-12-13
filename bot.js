const { Client, Attachment, Message } = require('discord.js');
const client = new Client();
const auth = require('./auth.json');

let prefix = 'h.';
let typeWatcher = false;
let bannedWords = ["chink", "daygo", "dego", "douchebag", "dyke", "gook", "homo", "kike", "negro", "nigga", "nigger", "nigguh", "spic"];
let quotes = [
    'whenever an Indian dies or the white man, or his mother, or himself, learns of the aspirations of the Indian, the Indian reveals the darkness and acts, because the Indian alone knows what is inside his heart and within his soul.', 
    'If I am forced to choose between people who are rich and happy or people who are poor and miserable, I will choose the rich and happy.',
    'If someone puts his foot on your neck, your life is over and he is a serious serious threat to your safety',
    'Even if you are rich or poor, you cannot hang out with Gandhi.',
    'Nobody says he hates homosexuals. The honourable individuals may be gay, but the real sick souls are those who want to take care of them',
    'The only thing I will never give up is standing up and screaming in a room',
    'Should the world end on December 21st, we will see a world free of gender bias. Even if gender bias remains in various parts of the world, I can promise that by then the world will be pretty nice to both men and women.',
    'I\'m a mestalla ke vo na na madaliye',
    'fear of dying is like a shell-fish: just submerge it in water, but it cannot be fished out',
    'how many crops have grown into rich or poor, but not a single windmill',
    'there are only three types of good citizens.',
    'From an atheistic standpoint, if we can get away with executing those who are not believers in God, then maybe we can get away with one\'s own beliefs about God.',
    'The greatest ideas are those which are advocated with sincerity by the self-deceiving, the self-seeking and the self-meddling.',
    'A single drink of alcohol can take the person back to a painful past',
    'There are more things in heaven and earth, Horatio, than are dreamt of in your philosophy.',
    'I believe it is my right as a human being to show compassion to all beings. If I let my compassion be used as an instrument for world peace, it will be a cowardly act.',
    'Only we can prevent it when it starts to happen, before it kills us – eventually it will break.',
    'Making these profound statements is exactly how it is with human beings. In a world of change, everything is relative. Not to forget that this is the main reason why corporations want India to be a corporatist nation.',
    'Don\'t blame the dead.',
    'Kids are dirty and we are good',
    'They may even love you even though you are dirty and have probably not worked hard in years.',
    'Come to know your friends, that you may avoid their misfortune.',
    'When you practice one of these deeds, you will have the Buddha.',
    'For a golden cow, it is glorious to fly.',
    '[About Pope Francis] "With no pope to fight the war for us, we have the best chance." But this pope isn\'t the best of our best.',
    'Sharma tukaram for ever and ever and ever',
    'That is the true doctrine of God. (xiv) tupa nāmī saṃsādhyāga śupacchedati rādupāda — (149) bhāṭya nāma saṃsāda tārā kāryākāraśyī — (150) Āṇa ca palakā śūkhā pranigākhūsameti indriy',
    'I felt like I didn\'t exist, and couldn\'t find out what happened to my life. That\'s when I started taking ayahuasca.',
    'A huge thanks to Shravan Tata, Bhagwat Chandra Sanyal, Nandini Krishnan, Neeraj Mitra, Varun Gandhi and Mr. Garg. All these people played a significant role in my life, keeping me away from drugs.',
    'You\'ll get to know a leader but you can never fully know the leader." In India, the only quote I find a bit more ominous than the others is from former Pakistani Prime Minister Yousuf Raza Gilani\'s insistence, during a 2005 speech at the National Congress in Karachi, that politicians in the west should be prepared to "re-accept" and, in some unspecified way, "a reconciliation with the Punjabis". All of this, of course, is a coincidence.',
    'India is a rich land. India is a rich land.',
    'Anybody\'s killer is like an enemy mine.',
    'In the GPR there are 16,000 government police patrolling the street; the National Investigation Agency is following all sorts of suspects.',
    'If you get a knee jerk reaction it is better to throw a brick than spend money on a hospital that would have done more harm than good.',
    'In every mission you will get a small reward (1b,1c,2,2b,3,4b,5,5b,6b,7,7b) that will raise your Little Chief rank. A minimum of 13 Little Chief may be carried during some missions. You can also carry up to 16 of each type during others. See Little Chief System Requirements',
    'The day will come when everyone will see that "For a day, it took two centuries, but finally a meeting has been arranged between the people."',
    'I saw the youths of the village who had never even seen cow poop before',
    'Why fight a people who speak no English and can\'t read?',
    'And I\'d like you to stand up. I want you to stand up.',
    'That which costs a hundred thousand francs and brings in the same amount of time, will cost a hundred thousand francs and bring in the same amount of time.',
    'The idea of the ballot box in this country is in its historical infancy. But it\'s becoming a reality.',
    'You go out of the church and into the graveyard, but you will find an old graveyard.',
    'Man is much more than an animal.',
    'The man is without any values, and the party without any values.',
    'There are two kinds of people in this world. The people who hide their faces, and the people who shoot the faces.',
    'For all the latest India News, download Indian',
    'That which a man wins, he will want more of; that which a man loses, he will hate more. However, judging by the search results from a search through Google for \'cocaine religious pilgrimage,\' it seems like this dislike doesn\'t extend to U.S. officials who may have been part of the crackdowns.',
    'The heart of the American people is a lot different from the heart of the European people. They will see that \'cheese\' is not the sweet cheese. Americans eat: "I will eat pizza for dinner"',
    'I\'ve been wrong on moral, on practical, on electoral points. I\'ve been wrong on balance, on the economy, on poverty, on education. Instead, I think Obama now has the chance to get it right.',
    'He tried his best, too bad his best sucks.',
    'Happy birthday, Mohan',
    'Peace was never an option',
    'I can’t, I CAN’T. PLEASE.'
];

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
                    msg.channel.send(`\`\`\`${quotes[Math.floor(Math.random() * quotes.length)]} \n\n--Gandhi\`\`\``);
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
                    msg.channel.send(`Honbar would be happy to assist. My commands are hi, face, say, watch, and gandhi. If you include the text 'Honbar, delete this' in any message, I will delete it for you.`);
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
