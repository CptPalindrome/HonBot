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
        const infile = imagePath.match(/[^\\/]+$/)[0];
        await sharp(imagePath).resize({ width: shrinkWidth }).toFile(`./image-manip/${infile}-outfile.png`);
        await sharp(`./image-manip/${infile}-outfile.png`).resize({ width: 2000 }).toFile(`./image-manip/${infile}-tempoutfile.png`);
        await sharp(`./image-manip/${infile}-tempoutfile.png`).resize({ width: shrinkWidth }).toFile(`./image-manip/${infile}-outfile.png`);
        await sharp(`./image-manip/${infile}-outfile.png`).resize({ width: 2000 }).toFile(`./image-manip/${infile}-tempoutfile.png`);
        await sharp(`./image-manip/${infile}-tempoutfile.png`).resize({ width: dimensions.width }).toFile(`./image-manip/${infile}-outfile.png`);
        const attachment = new AttachmentBuilder(`./image-manip/${infile}-outfile.png`);
        await channel.send({ files: [attachment] });
        try {
            fs.unlinkSync(`./image-manip/${infile}-outfile.png`);
            fs.unlinkSync(`./image-manip/${infile}-tempoutfile.png`);
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
        const infile = imagePath.match(/[^\\/]+$/)[0];
        const sideBuffer = Math.floor((dimensions.width * 0.25));
        const topBuffer = Math.floor((dimensions.height * 0.25));
        try {
            await sharp(imagePath)
                .extract({ left: sideBuffer, top: topBuffer, width: dimensions.width - sideBuffer * 2, height: dimensions.height - topBuffer * 2})
                .resize(dimensions.width, dimensions.height)
                .toFile(`./image-manip/${infile}-outfile.png`);
        } catch (e) {
            console.log(e);
        }
    
        const attachment = new AttachmentBuilder(`./image-manip/${infile}-outfile.png`);
        await channel.send({ files: [attachment] });
        try {
            fs.unlinkSync(`./image-manip/${infile}-outfile.png`);
            fs.unlinkSync(imagePath);
        } catch (e) {
            console.log(`Error during file deletion ${e}`);
        }
    }

    async stretch(imageUrl, channel, dimensions, mult = 1, vertical = false) {
        if(!this.legalAttachment(imageUrl)) {
            channel.send('Invalid file type');
            return;
        }
        const imagePath = await this.getImage(imageUrl);
        const infile = imagePath.match(/[^\\/]+$/)[0];
        try {
            const stretchWidth = Math.round(dimensions.width * mult);
            const stretchHeight = Math.round(dimensions.height * mult);
            if(vertical) {
                await sharp(imagePath).resize({ height: stretchHeight, fit: sharp.fit.fill }).toFile(`./image-manip/${infile}-outfile.png`);
            }
            else {
                await sharp(imagePath).resize({ width: stretchWidth, fit: sharp.fit.fill }).toFile(`./image-manip/${infile}-outfile.png`);
            }
            const attachment = new AttachmentBuilder(`./image-manip/${infile}-outfile.png`);
            await channel.send({ files: [attachment] });
        } catch (e) {
            logger.error(e);
            channel.send(`An error occurred. Try again if you want.`);
        }
        try {
            fs.unlinkSync(`./image-manip/${infile}-outfile.png`);
            fs.unlinkSync(imagePath);
        } catch (e) {
            console.log(`Error during file deletion ${e}`);
        }
    }

    legalAttachment(imageUrl) {
        const legalExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
        return legalExts.some((ext) => imageUrl.includes(ext));
    }
}
    
module.exports = ImageManipluator;