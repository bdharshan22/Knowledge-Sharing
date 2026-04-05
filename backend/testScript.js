const { MongoClient } = require('mongodb');

async function checkDb() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db('KS');
  const user = await db.collection('users').findOne({ email: 'kavisurya13@gmail.com' });
  console.log('User from DB:', user);
  await client.close();
}

checkDb().catch(console.error);
