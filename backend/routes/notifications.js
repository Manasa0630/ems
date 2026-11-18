const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all notifications for user
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT n.*, e.title AS event_title
       FROM Notification n
       LEFT JOIN Event e ON n.event_id = e.event_id
       WHERE n.user_id = ?
       ORDER BY n.sent_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count
router.get('/:userId/unread-count', async (req, res) => {
  try {
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM Notification WHERE user_id = ? AND is_read = FALSE',
      [req.params.userId]
    );
    res.json({ unread_count: Number(count) || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark single notification as read
router.put('/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE Notification SET is_read = TRUE WHERE notification_id = ?', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read for user
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    await pool.query('UPDATE Notification SET is_read = TRUE WHERE user_id = ?', [req.params.userId]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
