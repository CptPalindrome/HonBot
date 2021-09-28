const fs = require('fs');
const corejs = require('core-js');

//takes text with endline chars and puts it to one line.
//requires root directory file 'transcriptIn.txt' to exist.
let text = fs.readFileSync('./transcriptIn.txt').toString().split('\r\n').join(' ');

fs.writeFileSync('./transcriptOut.txt', text);