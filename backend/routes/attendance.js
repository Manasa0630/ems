const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// Mark participant present (admin only)
router.post('/:registrationId', requireAdmin, async (req, res) => {
  try {
    const [[reg]] = await pool.query(
      `SELECT r.registration_id, r.user_id, r.event_id, r.status, e.title AS event_title
       FROM Registration r
       JOIN Event e ON r.event_id = e.event_id
       WHERE r.registration_id = ?`,
      [req.params.registrationId]
    );
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    if (reg.status !== 'confirmed') {
      return res.status(400).json({ error: 'Only confirmed registrations can be marked present' });
    }

    await pool.query(
      'INSERT INTO Attendance (registration_id) VALUES (?)',
      [req.params.registrationId]
    );

    // Optional notification to participant that attendance is recorded and feedback is open
    await pool.query(
      `INSERT INTO Notification (user_id, event_id, message, type) VALUES (?, ?, ?, 'registration_confirmed')`,
      [reg.user_id, reg.event_id, `Attendance confirmed for "${reg.event_title}". You can now submit your feedback!`]
    );

    res.status(201).json({ message: 'Attendance marked as present' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Attendance already recorded for this registration' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Get participants for an event with attendance status (Slide 10)
// Supports ?noShowsOnly=true to filter no-shows
router.get('/event/:eventId', requireAdmin, async (req, res) => {
  try {
    const { noShowsOnly } = req.query;
    let query = `
      SELECT r.registration_id, r.user_id, u.name, u.email, r.status, r.registered_at,
             (a.attendance_id IS NOT NULL) AS is_present,
             a.checked_in_at,
             CASE
               WHEN a.attendance_id IS NOT NULL THEN 'Present'
               WHEN r.status = 'confirmed' THEN 'No-show'
               ELSE '-'
             END AS attendance_status
      FROM Registration r
      JOIN User u ON r.user_id = u.user_id
      LEFT JOIN Attendance a ON a.registration_id = r.registration_id
      WHERE r.event_id = ?
    `;

    if (noShowsOnly === 'true') {
      query += ` AND r.status = 'confirmed' AND a.attendance_id IS NULL`;
    }

    query += ` ORDER BY r.registered_at ASC`;

    const [rows] = await pool.query(query, [req.params.eventId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Specifically get no-shows
router.get('/event/:eventId/no-shows', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.registration_id, r.user_id, u.name, u.email, r.status, r.registered_at
       FROM Registration r
       JOIN User u ON r.user_id = u.user_id
       LEFT JOIN Attendance a ON a.registration_id = r.registration_id
       WHERE r.event_id = ? AND r.status = 'confirmed' AND a.attendance_id IS NULL
       ORDER BY r.registered_at ASC`,
      [req.params.eventId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
