const sharp = require('sharp');
const logger = require('../logger');
const fs = require('fs');
const { AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const path = require('path');

class ImageManipluator {
    
    constructor() {
        sharp.cache(false);
    }

    async getImage (url) {
        let imagePath;
        const ext = path.extname(url).split('?')[0].toLowerCase();
        const res = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });
        return new Promise((resolve, reject) => {
            res.data.pipe(fs.createWriteStream(`./image-manip/image.${ext}`).on('error', reject).once('close', () => {
                imagePath = `./image.${ext}`;
                resolve(`./image-manip/image.${ext}`)}));
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
        const ext = path.extname(infile).toLowerCase();
        console.log(`Extension: ${ext}`);
        let isAnimated = ext === '.gif';
        await sharp(imagePath, { animated: isAnimated }).resize({ width: shrinkWidth }).toFile(`./image-manip/${infile}-outfile${ext}`, { animated: isAnimated });
        await sharp(`./image-manip/${infile}-outfile${ext}`, { animated: isAnimated }).resize({ width: 2000 }).toFile(`./image-manip/${infile}-tempoutfile${ext}`, { animated: isAnimated });
        await sharp(`./image-manip/${infile}-tempoutfile${ext}`, { animated: isAnimated }).resize({ width: dimensions.width }).toFile(`./image-manip/${infile}-outfile${ext}`, { animated: isAnimated });
        const attachment = new AttachmentBuilder(`./image-manip/${infile}-outfile${ext}`);
        await channel.send({ files: [attachment] });
        try {
            fs.unlinkSync(`./image-manip/${infile}-outfile${ext}`);
            fs.unlinkSync(`./image-manip/${infile}-tempoutfile${ext}`);
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

    async stretch(imageUrl, channel, dimensions, mult = 3, vertical = false) {
        if(!this.legalAttachment(imageUrl)) {
            channel.send('Invalid file type');
            return;
        }
        const imagePath = await this.getImage(imageUrl);
        const infile = imagePath.match(/[^\\/]+$/)[0];
        const ext = path.extname(infile).toLowerCase();
        // console.log(`Extension: ${ext}`);
        const isAnimated = ext === '.gif';
        
        // console.log(`Is animated: ${isAnimated}`);
        try {
            const stretchWidth = Math.round(dimensions.width * mult);
            const stretchHeight = Math.round(dimensions.height * mult);
            logger.info(`Stretching image to width: ${stretchWidth}, height: ${stretchHeight}`);
            if(vertical) {
                if (ext === '.gif') {
                    await sharp(imagePath, { animated: isAnimated }).resize({ height: stretchHeight, fit: sharp.fit.fill }).webp({ effort: 6, quality: 80 }).toFile(`./image-manip/${infile}-outfile.webp`, { animated: isAnimated });
                } else await sharp(imagePath, { animated: isAnimated }).resize({ height: stretchHeight, fit: sharp.fit.fill }).toFile(`./image-manip/${infile}-outfile${ext}`, { animated: isAnimated });
            }
            else {
                if (ext === '.gif') {
                    await sharp(imagePath, { animated: isAnimated }).resize({ width: stretchWidth, fit: sharp.fit.fill }).webp({ effort: 6, quality: 80 }).toFile(`./image-manip/${infile}-outfile.webp`, { animated: isAnimated});
                }
                await sharp(imagePath, { animated: isAnimated }).resize({ width: stretchWidth, fit: sharp.fit.fill }).toFile(`./image-manip/${infile}-outfile${ext}`, { animated: isAnimated});
            }
            const attachment = new AttachmentBuilder(`./image-manip/${infile}-outfile${ext === '.gif' ? '.webp' : ext}`);
            await channel.send({ files: [attachment] });
        } catch (e) {
            logger.error(e);
            channel.send(`An error occurred. Try again if you want. ${e}`);
        }
        try {
            fs.unlinkSync(`./image-manip/${infile}-outfile${ext === '.gif' ? '.webp' : ext}`);
            fs.unlinkSync(imagePath);
        } catch (e) {
            logger.error(`Error during file deletion `);
        }
    }

    legalAttachment(imageUrl) {
        const legalExts = ['.png', '.jpg', '.gif', '.jpeg', '.webp'];
        return legalExts.some((ext) => imageUrl.includes(ext));
    }

    cleanImgDir() {
        const files = fs.readdirSync('./image-manip/');
        for (const file of files) {
            if (file === 'index.js') continue;
            const fullPath = path.join('./image-manip/', file);
            try {
                const stat = fs.lstatSync(fullPath);
                if (stat.isDirectory()) {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(fullPath);
                }
            } catch (e) {
                logger.error(`Error deleting ${fullPath}: ${e}`);
            }
        }
    }
}
    
module.exports = ImageManipluator;