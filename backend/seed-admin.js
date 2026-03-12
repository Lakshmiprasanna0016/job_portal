/**
 * Run once to create the admin account:
 *   node seed-admin.js
 *
 * Uses SHA256 (built-in Node.js) so works even before npm install.
 * Once you run npm install, passwords will automatically upgrade to bcrypt.
 */
require('dotenv').config();
const crypto = require('crypto');
const db = require('./config/db');

let bcrypt = null;
try { bcrypt = require('bcryptjs'); } catch (e) {}

async function seed() {
  const name  = 'Unizoy Admin';
  const email = process.env.ADMIN_EMAIL    || 'admin@unizoy.com';
  const plain = process.env.ADMIN_PASSWORD || 'Admin@123';

  let hashed;
  if (bcrypt) {
    hashed = await bcrypt.hash(plain, 10);
    console.log('🔐 Using bcrypt hashing');
  } else {
    hashed = crypto.createHash('sha256').update(plain).digest('hex');
    console.log('🔐 Using SHA256 hashing (run npm install to upgrade to bcrypt)');
  }

  try {
    await db.execute(
      `INSERT INTO admins (name, email, password) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password), name = VALUES(name)`,
      [name, email, hashed]
    );
    console.log(`\n✅ Admin created!`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${plain}`);
    console.log(`   Login at: http://localhost:3000/admin/login\n`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    process.exit(0);
  }
}

seed();
