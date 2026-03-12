const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// Try to load bcryptjs - works after npm install
let bcrypt = null;
try { bcrypt = require('bcryptjs'); } catch (e) {}

const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex');

const hashPassword = async (plain) => {
  if (bcrypt) return bcrypt.hash(plain, 10);
  return sha256(plain);
};

// Auto-detects bcrypt vs SHA256 hash
const comparePassword = async (plain, stored) => {
  if (stored && (stored.startsWith('$2a$') || stored.startsWith('$2b$'))) {
    if (!bcrypt) return false;
    return bcrypt.compare(plain, stored);
  }
  return sha256(plain) === stored;
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  try {
    const [rows] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const admin = rows[0];
    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET || 'unizoy_secret',
      { expiresIn: '24h' }
    );
    res.json({ success: true, message: 'Login successful', token,
      admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name, email, created_at FROM admins WHERE id = ?', [req.admin.id]);
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    res.json({ success: true, admin: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/auth/register (admin only)
router.post('/register', authMiddleware, async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  try {
    const [existing] = await db.execute('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    const hashed = await hashPassword(password);
    const [result] = await db.execute(
      'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
    res.status(201).json({ success: true, message: 'Admin registered successfully.', id: result.insertId });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;

// GET /api/auth/admins - List all admins (admin only)
router.get('/admins', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, created_at FROM admins ORDER BY created_at ASC'
    );
    res.json({ success: true, admins: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/auth/admins/:id - Delete an admin (admin only, can't delete self)
router.delete('/admins/:id', authMiddleware, async (req, res) => {
  const targetId = parseInt(req.params.id);
  if (targetId === req.admin.id)
    return res.status(400).json({ success: false, message: "You can't delete your own account." });
  try {
    const [existing] = await db.execute('SELECT id, name FROM admins WHERE id = ?', [targetId]);
    if (existing.length === 0)
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    await db.execute('DELETE FROM admins WHERE id = ?', [targetId]);
    res.json({ success: true, message: `Admin "${existing[0].name}" removed successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});
