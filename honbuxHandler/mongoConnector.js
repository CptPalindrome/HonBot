const { MongoClient } = require('mongodb');

const uri = `mongodb://${process.env.MONGODB_USR}:${process.env.MONGODB_PWD}@localhost:27017`;
const client = new MongoClient(uri);

const db = client.db('honbotdb');
const collections = {
    users: db.collection('users'),
    gameMetrics: db.collection('gameMetrics'),
    store: db.collection('store'),
    awards: db.collection('awards'),
    stonks: db.collection('stonks')
}
module.exports = { collections };