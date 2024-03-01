const fs = require('fs');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let dir = '';
let beforeChar = '.'

// get user input for full path of files to combine
readline.question('Input full target directory\n>', directory => {
    dir = directory;
    // get user input for full path of files to combine
    readline.question('Input breaking char (what to group filenames by)\n>', char => {
        beforeChar = char;
        readline.close();
        getAllMatchingFiles(dir, beforeChar);
    });
});





function getText(dir) {
    // use absolute dir pls :3
    return fs.readFileSync(dir).toString();
}

function getAllMatchingFiles(dir, beforeChar) {
    // use absolute dir pls :D
    if (!fs.existsSync(dir)) {
        console.log('Invalid directory');
        return;
    }
    const fileList = fs.readdirSync(dir) || []
    const uniqueNamesList = [...new Set(fileList.map((filename) => filename.split(beforeChar)[0]))]
    console.log('Filenames that will be grouped ', uniqueNamesList)
    const fileNamesPerName = uniqueNamesList.map((name) => {
        return { name, filenames: fileList.filter((filename) => filename.startsWith(name)) }
    })
    // now have filenames of logs pertaining to an individual user under their name for ez naming at the end

    fileNamesPerName.forEach((obj) => {
        const textArr = []
        obj.filenames.forEach((filename) => {
            textArr.push(getText(`${dir}/${filename}`))
        })
        try {
            fs.mkdirSync('./fileCombinerOut/')
        }
        catch (e) { console.log('Dir exists') }
        try {
            fs.writeFileSync(`./fileCombinerOut/${obj.name}.txt`, textArr.join('\n\n-----------------\n\n\n'))
            console.log('Completed Successfully');
        } catch (e) {
            console.log('Failed to combine files');
        }
    })
}

