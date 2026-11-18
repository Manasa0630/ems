const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Venue ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, location, capacity } = req.body;
    if (!name || !capacity) return res.status(400).json({ error: 'name and capacity are required' });
    const [result] = await pool.query(
      'INSERT INTO Venue (name, location, capacity) VALUES (?, ?, ?)',
      [name, location || '', Number(capacity)]
    );
    res.status(201).json({ venue_id: result.insertId, name, location, capacity: Number(capacity) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, location, capacity } = req.body;
    await pool.query('UPDATE Venue SET name = ?, location = ?, capacity = ? WHERE venue_id = ?', [
      name, location || '', Number(capacity), req.params.id
    ]);
    res.json({ message: 'Venue updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM Venue WHERE venue_id = ?', [req.params.id]);
    res.json({ message: 'Venue deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
