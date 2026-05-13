const { collections } = require('./mongoConnector.js');
const fs = require('fs');

class HonbuxHelper {
    constructor() {
        // this.utils = new Utils();
        // this.coinflipper = new Coinflipper();
        // this.wheelHelper = new WheelHelper();
        this.init();
    }

    init() {
        this.loadDB();
        const d = new Date();
        d.setHours(2);
        this.dailyResetTime = d.valueOf();
    }

    async loadDB() {
        const rawStoreData = fs.readFileSync('./honbuxHandler/honStore.json');
        const rawAwardsData = fs.readFileSync('./honbuxHandler/awards.json');
        const storeData = JSON.parse(rawStoreData);
        const awardsData = JSON.parse(rawAwardsData);
        storeData.upgrades.map(async (item) => {
            await collections.store.updateOne({ upgradeId: item.itemId }, { $set: item }, { upsert: true });
        });
        storeData.stocks.map(async (item) => {
            await collections.stonks.updateOne({ stonkId: item.itemId }, { $set: item }, { upsert: true });
        });
        awardsData.awards.map(async (award) => {
            await collections.awards.updateOne({ awardId: award.awardId }, { $set: award }, { upsert: true });
        });
    }

    async modifyData(author, dataToUpsert) {
        await collections.users.updateOne({ id: author.id, username: author.username }, dataToUpsert, { upsert: true });
        const result = await this.checkAwards(author);
        return result;
    }

    async modifyBux(author, amount, source, hasCooldown = false) {
        if (isNaN(amount)) return;
        let gainlost = amount >= 0 ? 'gained' : 'lost';
        if (source === 'UpgradePurchase') {
           gainlost = 'spent'; 
        }
        const update = { 
            $inc: 
            {
                honbalance: amount, 
                [`metrics.${source}.${gainlost}`]: amount, 
                [`metrics.${source}.timesUsed`]: 1, 
                [`metrics.${source}.net`]: amount,
                [`metrics.lifetimeHonbux${gainlost[0].toUpperCase() + gainlost.slice(1)}`]: amount
            }, 
        };
        if (hasCooldown) {
            update.$set = { [`cooldowns.${source}`]: Date.now() };
        }
        await collections.gameMetrics.updateOne(
            { id: `${source}.${gainlost}`}, 
            { $inc: { [`${source}.timesUsed`]: 1, [`${source}.${gainlost}`]: amount, [`${source}.net`]: amount } },
            { upsert: true }
        );
        return await this.modifyData(author, update);
    }

    async getUser(author) {
        let res = await collections.users.findOne({ id: author.id });
        if (!res) {
            await this.modifyData(author, { $setOnInsert: { items: [], cooldowns: {}, metrics: {} } }, { upsert: true });
            res = await collections.users.findOne({ id: author.id });
        }
        return res;
    }

    async addBux(author, amount) {
        return await this.modifyBux(author, amount, 'AddBux');
    }

    async daily(author) {
        const source = 'Daily';
        const userdata = await this.getUser(author);
        const upgrades = this.getUpgrades(userdata);
        if (userdata?.cooldowns[source] && userdata?.cooldowns[source] > this.dailyResetTime) {
            return 'Daily cooldown active';
        } else {
            const dailyBoni = upgrades.filter((upgrade) => upgrade.effect?.source === source)
                .map((upgrade) => upgrade.effect.value * upgrade.level)
                .reduce((acc, curr) => acc * (curr + 1), 1);
            const dailyReward = 500 * (dailyBoni);
            const modifyBuxResult = await this.modifyBux(author, dailyReward, source, false); // TODO: CHANGE BACK TO TRUE SO THAT IT HAS A COOLDOWN, TESTING PURPOSES ONLY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            const updatedUser = await this.getUser(author); // to trigger user creation if not exists
            return `You received ${dailyReward} honbux from your daily! You're now at ${updatedUser.honbalance}.\n\n${modifyBuxResult ? modifyBuxResult : ''}`;
        }
    }

    async store(author) {
        // TODO: add stock fee when buying, idk like 3-5% or something?
        const shopList = await this.getShopList(author);
        return shopList;
    }

    getCost(baseCost, n) {
        return Math.round(baseCost * (1 + 0.75 * n) * Math.pow(1.15, n));
    }

    async getShopList(author) {
        const userData = await this.getUser(author);
        const result = await collections.store.find().sort({ itemId: 1 }).toArray().then((res) => {
            // Get the store items
            return res.map((item) => {
                return {
                    itemId: item.itemId,
                    name: item.name,
                    description: item.description,
                    maxLevel: item.maxLevel,
                    cost: item.basePrice,
                    effect: item.effect,
                    type: item.type,
                    prerequisites: item.prerequisites,
                }
            });
        });
        // Filter items for prerequisites or max level items and calculate cost based on level
        const filteredResult = result.map((item) => {
            let prereqMet = false;
            if (item.prerequisites?.length > 0) {
                item?.prerequisites?.map((prereq) => {
                    if (userData?.items?.find((item) => item?.name === prereq?.item && item?.level >= prereq.level)) {
                        prereqMet = true;
                    } else {
                        prereqMet = false;  
                    } 
                });
            } else prereqMet = true;
            // Filter out max level items
            // console.log(this.getItemLevel(userData, item), item.maxLevel);
            if ((item.maxLevel && this.getItemLevel(userData, item) <= item.maxLevel) && prereqMet) {
                return item;
            }
            return null;
        }).filter(item => item !== null && item !== undefined)
        .map((item, index) => {
            const tempItem = item;
            tempItem.shopIndex = index + 1;
            const itemLevel = this.getItemLevel(userData, item);
            tempItem.itemLevel = itemLevel;
            tempItem.cost = this.getCost(item.cost, itemLevel);
            return tempItem;
        });
        return filteredResult;
    }

    async buyItem(author, itemId) {
        const userData = await this.getUser(author);
        const shopList = await this.getShopList(author);
        const itemToBuy = shopList.find((item) => item.shopIndex === parseInt(itemId));
        if (!itemToBuy) {
            return 'Item not found in shop.';
        }
        if (userData.honbalance < itemToBuy.cost) {
            return 'Not enough honbux to purchase this item.';
        }
        const modifyBuxResult = await this.modifyBux(author, -itemToBuy.cost, 'UpgradePurchase');
        const levelUpResult = await collections.users.updateOne({ id: author.id, "items.name": itemToBuy.name }, { $inc: { "items.$.level": 1 } });
        if (levelUpResult.matchedCount === 0) {
            await collections.users.updateOne({ id: author.id }, { $push: { items: { name: itemToBuy.name, description: itemToBuy.description, effect: itemToBuy.effect, type: itemToBuy.type, maxLevel: itemToBuy.maxLevel, level: 1 } } });
        }
        return 'You purchased ' + itemToBuy.name + ' for ' + itemToBuy.cost + ' honbux! Your new balance is ' + (userData.honbalance - itemToBuy.cost) + ' honbux.\n\n' + (modifyBuxResult ? modifyBuxResult : '');
    }

    async resetDaily(author) {
        await collections.users.updateOne({ id: author.id }, { $unset: { "cooldowns.Daily": "" } });
    }

    getItemLevel(userData, shopItem) {
        const itemLevel = userData?.items?.find((item) => item?.name === shopItem.name) ?? 0;
        return itemLevel?.level || 0;
    }

    getUpgrades(userData) {
        const upgrades = userData?.items?.filter((item) => item.type === 'upgrade') || [];
        return upgrades;
    }

    async checkAwards(author, msg) {
        const userData = await this.getUser(author);
        const awards = await collections.awards.find().sort({ awardId: 1 }).toArray();
        const userAwards = awards?.filter((item) => {
            const prereq = item?.requirement?.type;
            const value = item?.requirement?.value;
            const prereqValue = prereq.split('.').reduce((obj, key) => obj?.[key], userData);
            if (prereqValue && prereqValue >= value) {
                if (!userData?.awards?.find((award) => award?.awardId === item.awardId)) {
                    collections.users.updateOne({ id: author.id }, { $push: { awards: { awardId: item.awardId, name: item.name, description: item.description, categoryNum: item.categoryNum } } });
                    return true;
                }
            }
            return false;
        }) || [];
        if (userAwards.length > 0) {
            let awardsStr = '';
            userAwards.forEach((award) => {
                awardsStr += `${award.name} - ${award.description}\n`;
            });
            return `__You've just earned the following award(s)__\n**${awardsStr}**`;
        }
    }

    async getAwards(author) {
        const userData = await this.getUser(author);
        return userData.awards.sort((a, b) => a.categoryNum - b.categoryNum) || [];
    }

    bailOutAll() {
        // do nothing, just don't crash lmao
    }
}

module.exports = HonbuxHelper;