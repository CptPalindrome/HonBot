const fs = require('fs');

const getCard = () => {
    const cardList = fs.readdirSync('./media/cards');
    return cardList[Math.floor(Math.random() * cardList.length)];;
}

module.exports = getCard;