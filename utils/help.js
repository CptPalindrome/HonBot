function help(command) {   
    //these will be in order of addition as of Mar. 8, 2022
    switch(command) {    
        case 'gandhi':
            return `Using 'h.gandhi' will dispense one of Gandhi's glorious and enlightened quotes. You can add a number afterwards to select a specific quote. Using 'h.ngandhi' will send from the newest 40% of quotes added. Quote count always rising!* \n\n*Quote count not actually always rising`;
            
        case 'help wyd':
            return `You can use numbers or *super secret phrases* to select specific sentence templates. Format as {#}`;
            
        case 'blackjack':
            return `\`\`\`Blackjack Commands: \n h.bljk -- starts a new game\n h.join -- join a game in progress\n h.leave -- leave a game you've joined\n h.hit/h.stand -- gameplay functions\n h.afk -- will end a round if people are afk and remove them\n h.stop -- stops a game in progress\n h.nh -- starts a new hand with the same players\`\`\``;
            
        case 'bljk':
            return `\`\`\`Blackjack Commands: \n h.bljk -- starts a new game\n h.join -- join a game in progress\n h.leave -- leave a game you've joined\n h.hit/h.stand -- gameplay functions\n h.afk -- will end a round if people are afk and remove them\n h.stop -- stops a game in progress\n h.nh -- starts a new hand with the same players\`\`\``;
            
        case 'food':
            return `You can use \`h.food\` to get a random food order that will be 100% super tasty. You can put \`"plain"\` and/or \`"group"\`/\`"round"\` after to get some other results!`;
            
        case 'drink':
            return `You can use \`h.drink\` to get a delicious drink that will satiate your thirst guaranteed. You can put \`"mystery"\` and/or \`"group"\`/\`"round"\` after to get some other results!`;
            
        case 'acro':
            return `Enter a message that has the same number of words that start with the letters provided. Make sure not to use too many spaces! It'll not work!`;
            
        case 'madlibs':
            return `Madlibs is triggered by using the command \`h.mad\`. Join with \`h.j\` to get started, then simply type a message for your submission whenever it's your turn. \nYou can enter the name of a story after \`h.mad\` to do a specific template. \nUse \`h.help madlibs+\` and \`h.help madlibs++\` for extra info and commands.`;
            
        case 'mad':
            return `Madlibs is triggered by using the command \`h.mad\`. Join with \`h.j\` to get started, then simply type a message for your submission whenever it's your turn. \nYou can enter the name of a story after \`h.mad\` to do a specific template. \nUse \`h.help madlibs+\` and \`h.help madlibs++\` for extra info and commands.`;
            
        case 'madlibs+':
            return `Calling other honbot commands will not *be* your turn, so feel free to use the new example word commands during your turn (\`h.help words\` for more info). \`h.pass\` if you want to skip your turn, giving the next player a new random prompt from the story. \`h.votekick\` gives the current player 20s to submit or be kicked. \`h.stopmad\` will stop the current game and reset so that it isn't locked out. \`h.help madlibs++\` for a few more.`;
            
        case 'madlibs++':
            return `The stories are chosen without replacement, meaning as you play more, the stories will be removed from the pool of possible stories. Use \`h.remaining\` to view which stories are left, and also to get the names of them. To reset them, either play until all are used or use the \`h.resetstories\` command.`;
            
        case 'words':
            return `There are several commands for the word example functions. \`h.noun\` for example will output a few nouns from the \`h.wyd\` noun pool. The other commands are as follows:\n \`h.noun\`, \`h.verb\`, \`h.iverb\`, \`h.adjective\`, \`h.adverb\`, \`h.people\`, \`h.location\`, and \`h.preposition\``;
            
        case 'sugg':
            return `Type in a suggestion afterwards, in the format of TITLE | SUGGESTION TEXT. The title is optional, but recommended for clarity. (the | character separates title/suggestion)`;
            
        case 'suggest':
            return `Type in a suggestion afterwards, in the format of TITLE | SUGGESTION TEXT. The title is optional, but recommended for clarity. (the | character separates title/suggestion)`;
            
        case 'banish': 
            return `(ADMIN) Just as the name implies, this command allows you to ban(ish) users from Honbot commands. Undo with unbanish. This exists for a reason. You know who you are.`;
        
        case 'conversions':
        case 'conversion':
            return `There are conversions for metric units to freedom units. Currently supported: Celcius, Km, Kg and CAD to their American counterparts. Also chirps. Functions are noted by (abbreviated unit)2(abbreviated unit). **Ex: f2c 90 or km2mi 45**`

        case 'obl':
            return `Absolutely destroy the quality of any png/jpg image send as an attachment. (Might take a second to process)`
        case 'obliterate':
            return `Absolutely destroy the quality of any png/jpg image send as an attachment. (Might take a second to process)`

        case 'zamch':
            return `Zoom in and maintain the current hance.`
        case 'zoomandmaintaincurrenthance':
            return `Zoom in and maintain the current hance.`

        case 'number':
            return `Get a random number generated between 0 and the max safe int (like 9 quadrillion). **Customize the maximum** by typing a number after the command. Type yet another number after that to specify how many you'd like to generate. **Ex: h.number 100 5** -Generates 5 numbers between 0 and 100`;

        case 'maketeams':
            return `Create two even teams from a list names separated by commas`
        case 'mt':
            return `Create two even teams from a list names separated by commas`

        case 'gtn':
            return `Generate a random team name made of a color and an animal.`
        
        case 'gtna':
            return `Generate a random team name made of a color and an animal, but it will use alliteration (same letter starts both).`

        case 'tags':
            return `Get a list of all the h.wyd tags you can use for different templates (it won't tell you what it's for, just the tags themselves).`

        case 'honbux':
            return `**h.daily** to daily Honbux | **h.cfbux** to bet honbux on a coin flip! Type a number to bet and then 'tails' or 'heads' to bet on the result. | **h.honbalance** to check your balance. | **h.top** to see whose top dawg in the server. | **h.wheel** to spin the wheel of gambling.`

        case 'wheel':
            return `**h.wheel <bet number> <risk value>** | The risk values are **lowest** | **low** | **medium** | **high** | **extreme**.\nThe higher the risk, the less likely you are to win, but a much higher payout if you do win. Payout is 1.25x to 8x (lowest >> extreme).\nMinimum bet is 500, maximum is 5000, with a 10h cooldown.`
        
        default:
            return `The prefix is \`h.\`. The full list of commands is viewable using \`h.commands\`. More info on the readme on github or by typing \`h.help <command name>\` for applicable commands. \nIf you were trying to get help for a command and got this instead, check your spelling.`;
    }
}

module.exports = { help };