const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/', async (req, res) => {
  try {
    const { registration_id, rating, comment } = req.body;
    if (!registration_id || !rating) {
      return res.status(400).json({ error: 'registration_id and rating are required' });
    }
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Gated on Attendance: Only attendees marked present can submit feedback!
    const [[attendance]] = await pool.query(
      'SELECT attendance_id FROM Attendance WHERE registration_id = ?',
      [registration_id]
    );
    if (!attendance) {
      return res.status(403).json({ error: 'Feedback can only be submitted after attendance is recorded by the admin.' });
    }

    const [result] = await pool.query(
      'INSERT INTO Feedback (registration_id, rating, comment) VALUES (?, ?, ?)',
      [registration_id, numRating, comment || '']
    );
    res.status(201).json({
      feedback_id: result.insertId,
      registration_id,
      rating: numRating,
      comment
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Feedback has already been submitted for this registration' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.get('/event/:eventId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.feedback_id, f.rating, f.comment, f.submitted_at, u.name AS user_name
       FROM Feedback f
       JOIN Registration r ON f.registration_id = r.registration_id
       JOIN User u ON r.user_id = u.user_id
       WHERE r.event_id = ?
       ORDER BY f.submitted_at DESC`,
      [req.params.eventId]
    );
    const [[{ avg_rating }]] = await pool.query(
      `SELECT AVG(f.rating) AS avg_rating
       FROM Feedback f JOIN Registration r ON f.registration_id = r.registration_id
       WHERE r.event_id = ?`,
      [req.params.eventId]
    );
    res.json({
      average_rating: avg_rating ? Number(Number(avg_rating).toFixed(1)) : null,
      count: rows.length,
      feedback: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/registration/:registrationId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM Feedback WHERE registration_id = ?`,
      [req.params.registrationId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Feedback not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
