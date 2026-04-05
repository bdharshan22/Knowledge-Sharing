/**
 * setupDb.js — Run once with: node setupDb.js
 * Creates the KS database and all required collections in local MongoDB.
 */
const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'KS';

const COLLECTIONS = [
  'users',
  'posts',
  'learningpaths',
  'polls',
  'rooms',
  'projects',
];

async function setup() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);

    for (const name of COLLECTIONS) {
      const existing = await db.listCollections({ name }).toArray();
      if (existing.length === 0) {
        await db.createCollection(name);
        console.log(`  📦 Created collection: ${name}`);
      } else {
        console.log(`  ✔  Collection already exists: ${name}`);
      }
    }

    // Seed a placeholder document so Compass shows the DB immediately
    const usersCol = db.collection('users');
    const count = await usersCol.countDocuments();
    if (count === 0) {
      await usersCol.insertOne({
        name: 'Admin',
        email: 'admin@ks.local',
        role: 'admin',
        createdAt: new Date(),
        _placeholder: true,
      });
      console.log('  🌱 Seeded admin placeholder in users');
    }

    console.log(`\n🎉 Database "${DB_NAME}" is ready! Open MongoDB Compass and connect to ${MONGO_URI}`);
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
  } finally {
    await client.close();
  }
}

setup();
