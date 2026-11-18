const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

router.post('/register-first-admin', async (req, res) => {
  try {
    const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM Admin');
    if (count > 0) return res.status(403).json({ error: 'Admin already exists' });
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO Admin (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );
    res.status(201).json({ admin_id: result.insertId, name, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const [rows] = await pool.query('SELECT * FROM Admin WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({
      admin_id: admin.admin_id,
      name: admin.name,
      email: admin.email,
      actor_type: 'admin',
      token: `admin_${admin.admin_id}_${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
