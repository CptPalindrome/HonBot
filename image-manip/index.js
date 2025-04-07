const sharp = require('sharp');
const fs = require('fs');
const { AttachmentBuilder } = require('discord.js');
const axios = require('axios');

class ImageManipluator {
    
    constructor() {
        sharp.cache(false);
    }

    async getImage (url) {
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
        
    async obliterate (imageUrl, channel, dimensions, ratio = 1) {
        if(!this.legalAttachment(imageUrl)) {
            channel.send('Invalid file type');
            return;
        }
        // ratio affects the intensity of the obliteration. > 1 is more intense, < 1 is less intense
        // if ratio < 0.1 it sets to 0.1 to avoid the intention of reducing obliteration ending up obliterating more at extreme values
        const cleanedRatio = ratio < 0.1 ? 0.1 : ratio;
        const shrinkWidth = Math.round(50 / cleanedRatio) < 1 ? 1 : Math.round(50 / cleanedRatio);
        const imagePath = await this.getImage(imageUrl);
        await sharp(imagePath).resize({ width: shrinkWidth }).toFile('./image-manip/outfile.jpg');
        await sharp('./image-manip/outfile.jpg').resize({ width: 2000 }).toFile('./image-manip/tempoutfile.jpg');
        await sharp('./image-manip/tempoutfile.jpg').resize({ width: shrinkWidth }).toFile('./image-manip/outfile.jpg');
        await sharp('./image-manip/outfile.jpg').resize({ width: 2000 }).toFile('./image-manip/tempoutfile.jpg');
        await sharp('./image-manip/tempoutfile.jpg').resize({ width: dimensions.width }).toFile('./image-manip/outfile.jpg');
        const attachment = new AttachmentBuilder('./image-manip/outfile.jpg');
        await channel.send({ files: [attachment] });
        try {
            fs.unlinkSync('./image-manip/outfile.jpg');
            fs.unlinkSync('./image-manip/tempoutfile.jpg');
            fs.unlinkSync(imagePath);
        } catch (e) {
            console.log(`Error during file deletion ${e}`);
        }
    }
        
    async zoomCurrentHance (imageUrl, channel, dimensions) {
        if(!this.legalAttachment(imageUrl)) {
            channel.send('Invalid file type');
            return;
        }
        const imagePath = await this.getImage(imageUrl);
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
    
        const attachment = new AttachmentBuilder('./image-manip/outfile.jpg');
        await channel.send({ files: [attachment] });
        try {
            fs.unlinkSync('./image-manip/outfile.jpg');
            fs.unlinkSync(imagePath);
        } catch (e) {
            console.log(`Error during file deletion ${e}`);
        }
    }
    
    legalAttachment(imageUrl) {
        const legalExts = ['.png', '.jpg', '.jpeg', '.gif'];
        return legalExts.some((ext) => imageUrl.includes(ext));
    }
}
    
module.exports = ImageManipluator;