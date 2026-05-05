const { MongoClient } = require('mongodb');

const uri = `mongodb://${process.env.MONGODB_USR}:${process.env.MONGODB_PWD}@localhost:27017`;
const client = new MongoClient(uri);

const db = client.db('honbotdb');
const users = db.collection('users');
const gameMetrics = db.collection('gameMetrics');
const store = db.collection('store');
const awards = db.collection('awards');
module.exports = { users, gameMetrics, store, awards };