const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const users = await mongoose.connection.db
    .collection('users')
    .find({}, { projection: { email: 1, name: 1, password: 1 } })
    .toArray();

  console.log('\n=== USERS IN DATABASE ===');
  console.log('Total users:', users.length);
  for (const u of users) {
    const isHashed = u.password && u.password.startsWith('$2');
    console.log(`  - ${u.email} | ${u.name} | password hashed: ${isHashed}`);
  }

  // Test bcrypt comparison for common passwords
  console.log('\n=== PASSWORD HASH TEST ===');
  for (const u of users) {
    const testPasswords = ['password123', 'password', '123456', 'test', 'admin123'];
    for (const p of testPasswords) {
      try {
        const match = await bcrypt.compare(p, u.password);
        if (match) {
          console.log(`  MATCH FOUND for ${u.email}: password="${p}"`);
        }
      } catch (e) {}
    }
  }
  console.log('Done.');
  await mongoose.disconnect();
}

main().catch(console.error);
