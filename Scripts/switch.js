const fs = require('fs');

//switches envVar for testing mode

let env = JSON.parse(fs.readFileSync('./envVars.json'));

env.TEST_MODE = !env.TEST_MODE;

fs.writeFileSync('./envVars.json', JSON.stringify(env, null, 2));
console.log(`Test mode: ${env.TEST_MODE}`);
