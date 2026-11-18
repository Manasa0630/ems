const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO User (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    res.status(201).json({
      user_id: result.insertId,
      name,
      email,
      actor_type: 'user',
      token: `user_${result.insertId}_${Date.now()}`
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const [rows] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      actor_type: 'user',
      token: `user_${user.user_id}_${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, name, email, created_at FROM User ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, name, email, created_at FROM User WHERE user_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User's registered events with full status (registration, payment, attendance, feedback)
router.get('/:id/events', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.registration_id, e.event_id, e.title, e.description, e.event_date, e.event_time, e.fee,
              c.name AS category_name, v.name AS venue_name, v.location AS venue_location,
              r.status, r.registered_at,
              p.payment_status, p.payment_id, p.transaction_ref, p.amount AS paid_amount,
              (a.attendance_id IS NOT NULL) AS attended,
              (f.feedback_id IS NOT NULL) AS has_feedback,
              f.rating AS feedback_rating, f.comment AS feedback_comment
       FROM Registration r
       JOIN Event e ON r.event_id = e.event_id
       LEFT JOIN Category c ON e.category_id = c.category_id
       LEFT JOIN Venue v ON e.venue_id = v.venue_id
       LEFT JOIN Payment p ON p.registration_id = r.registration_id
       LEFT JOIN Attendance a ON a.registration_id = r.registration_id
       LEFT JOIN Feedback f ON f.registration_id = r.registration_id
       WHERE r.user_id = ?
       ORDER BY e.event_date ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    await pool.query('UPDATE User SET name = ?, email = ? WHERE user_id = ?', [
      name, email, req.params.id
    ]);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM User WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
