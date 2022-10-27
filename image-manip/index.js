const sharp = require('sharp');
const fs = require('fs');
const { MessageAttachment } = require('discord.js');
const axios = require('axios');

async function getImage(url) {
    let imagePath;
    const res = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        res.data.pipe(fs.createWriteStream(`./image-manip/image.${url.slice(url.length - 3)}`).on('error', reject).once('close', () => {
            imagePath = `./image.${url.slice(url.length - 3)}`;
            resolve(`./image-manip/image.${url.slice(url.length - 3)}`)}));
    });
}
    
async function obliterate(imageUrl, channel, dimensions) {
    if(!legalAttachment(imageUrl)) {
        channel.send('Invalid file type');
        return;
    }
    const imagePath = await getImage(imageUrl);
    await sharp(imagePath).resize({ width: 10000 }).toFile('./image-manip/outfile.jpg');
    await sharp('./image-manip/outfile.jpg').resize({ width: 50 }).toFile('./image-manip/tempoutfile.jpg');
    await sharp('./image-manip/tempoutfile.jpg').resize({ width: 10000 }).toFile('./image-manip/outfile.jpg');
    await sharp('./image-manip/outfile.jpg').resize({ width: 50 }).toFile('./image-manip/tempoutfile.jpg');
    await sharp('./image-manip/tempoutfile.jpg').resize({ width: 10000 }).toFile('./image-manip/outfile.jpg');
    await sharp('./image-manip/outfile.jpg').resize({ width: 50 }).toFile('./image-manip/tempoutfile.jpg');
    await sharp('./image-manip/tempoutfile.jpg').resize({ width: 10000 }).toFile('./image-manip/outfile.jpg');
    await sharp('./image-manip/outfile.jpg').resize({ width: 50 }).toFile('./image-manip/tempoutfile.jpg');
    await sharp('./image-manip/tempoutfile.jpg').resize({ width: 10000 }).toFile('./image-manip/outfile.jpg');
    await sharp('./image-manip/outfile.jpg').resize({ width: 50 }).toFile('./image-manip/tempoutfile.jpg');
    await sharp('./image-manip/tempoutfile.jpg').resize({ width: 10000 }).toFile('./image-manip/outfile.jpg');
    await sharp('./image-manip/outfile.jpg').resize({ width: 50 }).toFile('./image-manip/tempoutfile.jpg');
    await sharp('./image-manip/tempoutfile.jpg').resize({ width: 10000 }).toFile('./image-manip/outfile.jpg');
    await sharp('./image-manip/outfile.jpg').resize({ width: 50 }).toFile('./image-manip/tempoutfile.jpg');
    await sharp('./image-manip/tempoutfile.jpg').resize({ width: dimensions.width }).toFile('./image-manip/outfile.jpg');
    const attachment = new MessageAttachment('./image-manip/outfile.jpg');
    await channel.send(attachment);
    try {
        fs.unlinkSync('./image-manip/outfile.jpg');
        fs.unlinkSync('./image-manip/tempoutfile.jpg');
        fs.unlinkSync(imagePath);
    } catch (e) {
        console.log(`Error during file deletion ${e}`);
    }
}
    
async function zoomCurrentHance(imageUrl, channel, dimensions) {
    if(!legalAttachment(imageUrl)) {
        channel.send('Invalid file type');
        return;
    }
    const imagePath = await getImage(imageUrl);
    const sideBuffer = Math.floor((dimensions.width * 0.25));
    const topBuffer = Math.floor((dimensions.height * 0.25));
    try {
        await sharp(imagePath)
            .extract({ left: sideBuffer, top: topBuffer, width: dimensions.width - sideBuffer * 2, height: dimensions.height - topBuffer * 2})
            .resize(dimensions.width, dimensions.height)
            .toFile('./image-manip/outfile.jpg');
    } catch (e) {
        console.log(e);
    }

    let attachment = new MessageAttachment('./image-manip/outfile.jpg');
    channel.send(attachment).then(() => {
        attachment = null;
        fs.unlink('./image-manip/outfile.jpg', (e) => { if(e) console.log(e); });
        fs.unlink(`${imagePath}.jpg`, (e) => { if(e) console.log(e); });
    });
}

function legalAttachment(imageUrl) {
    const legalExts = ['.png', '.jpg', '.jpeg'];
    return legalExts.some((ext) => imageUrl.endsWith(ext));
}
    
module.exports = { obliterate, zoomCurrentHance, getImage }