const fs = require('fs');

function parseSuffix(prefix, suffix) {
    if (prefix === 'n') {
        if (suffix === 'pl') {
            return 'plural';
        } else {
            return 'singular';
        }
    }
    else if (prefix === 'v' || prefix === 'iv') {
        if (suffix === 'p' || suffix === 'ed') {
            return 'past';
        } else if (suffix === 'ing') {
            return 'ing';
        } else {
            return 'present';
        }
    }
    else if (prefix === 'a') {
        if (suffix === 'er') {
            return 'er';
        } else if (suffix === 'est') {
            return 'est';
        } else {
            return 'regular';
        }
    }
    if (prefix === 'adv' || prefix === 'p' || prefix === 'l' || prefix === 'prep') {
        return 'INDEXONLY';
    }
}

function wyd(number = -1) {
    const madComps = JSON.parse(fs.readFileSync('./madlibComponents.json'));

    let sentence = madComps.sentences[number != -1 ? number : Math.floor(Math.random * madComps.sentences.length)].s;

    const map = {
        n: "nouns",
        p: "people",
        l: "locations",
        v: "verbs",
        iv: "verbsIntransitive",
        a: "adjectives",
        adv: "adverbs",
        prep: "prepositions",
        
    }
        
    const templateRegex = /{[a-z]*\d+[a-z]*}/g;
    
    while (templateRegex.test(sentence)) {
        const match = sentence.match(templateRegex);
        const tag = match[0].slice(1, -1); // Remove the curly braces
        const prefix = tag.split(/\d/)[0];
        const number = tag.match(/\d+/);
        console.log('NUMBER:', number);
        const category = madComps[map[prefix]];
        
        let categoryIndex = Math.floor(Math.random() * category.length);
        
        const filloutMatcher = new RegExp(`{${prefix}${number}[a-z]*}`, 'g');
        
        // console.log(filloutMatcher);
        while(filloutMatcher.test(sentence)) {
            const match2 = sentence.match(filloutMatcher);
            const tag2 = match2[0].slice(1, -1); // Remove the curly braces;
            const suffix = tag2.split(/\d+/)[1];
            console.log('SUFFIX:', suffix);
            const parsedSuffix = parseSuffix(prefix, suffix);
            
            
            sentence = parsedSuffix === 'INDEXONLY' ?
            sentence = sentence.replaceAll(`{${tag2}}`, category[categoryIndex]) :
            sentence = sentence.replaceAll(`{${tag2}}`, category[categoryIndex][parsedSuffix]);
            
            category.splice(categoryIndex, 1);
        }
        
    }
    return sentence;
}

module.exports = { wyd };
