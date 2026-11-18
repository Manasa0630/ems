const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// List events with joined category/venue, confirmed registration counts, and filters
router.get('/', async (req, res) => {
  try {
    const { category, venue, search, availability, from, to } = req.query;
    const conditions = [];
    const params = [];

    if (category && category !== 'all') {
      conditions.push('e.category_id = ?');
      params.push(category);
    }
    if (venue && venue !== 'all') {
      conditions.push('e.venue_id = ?');
      params.push(venue);
    }
    if (search && search.trim() !== '') {
      conditions.push('e.title LIKE ?');
      params.push(`%${search.trim()}%`);
    }
    if (from) {
      conditions.push('e.event_date >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('e.event_date <= ?');
      params.push(to);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT e.*, c.name AS category_name, v.name AS venue_name, v.location AS venue_location,
              COUNT(CASE WHEN r.status = 'confirmed' THEN 1 END) AS confirmed_count,
              COUNT(CASE WHEN r.status = 'waitlisted' THEN 1 END) AS waitlisted_count
       FROM Event e
       LEFT JOIN Category c ON e.category_id = c.category_id
       LEFT JOIN Venue v ON e.venue_id = v.venue_id
       LEFT JOIN Registration r ON e.event_id = r.event_id
       ${whereClause}
       GROUP BY e.event_id
       ORDER BY e.event_date ASC`,
      params
    );

    // Apply availability filter if specified
    let filtered = rows.map((ev) => {
      const confirmed = Number(ev.confirmed_count) || 0;
      const capacity = Number(ev.capacity) || 0;
      const availableSeats = Math.max(0, capacity - confirmed);
      const isFull = confirmed >= capacity;
      return {
        ...ev,
        confirmed_count: confirmed,
        available_seats: availableSeats,
        is_full: isFull
      };
    });

    if (availability === 'available') {
      filtered = filtered.filter((ev) => !ev.is_full);
    } else if (availability === 'waitlist') {
      filtered = filtered.filter((ev) => ev.is_full);
    }

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single event details
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, c.name AS category_name, v.name AS venue_name, v.location AS venue_location,
              COUNT(CASE WHEN r.status = 'confirmed' THEN 1 END) AS confirmed_count,
              COUNT(CASE WHEN r.status = 'waitlisted' THEN 1 END) AS waitlisted_count
       FROM Event e
       LEFT JOIN Category c ON e.category_id = c.category_id
       LEFT JOIN Venue v ON e.venue_id = v.venue_id
       LEFT JOIN Registration r ON e.event_id = r.event_id
       WHERE e.event_id = ?
       GROUP BY e.event_id`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    const ev = rows[0];
    const confirmed = Number(ev.confirmed_count) || 0;
    const capacity = Number(ev.capacity) || 0;
    res.json({
      ...ev,
      confirmed_count: confirmed,
      available_seats: Math.max(0, capacity - confirmed),
      is_full: confirmed >= capacity
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create event (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, description, event_date, event_time, category_id, venue_id, fee, capacity } = req.body;
    if (!title || !event_date || !capacity) {
      return res.status(400).json({ error: 'title, event_date, and capacity are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO Event (title, description, event_date, event_time, category_id, venue_id, fee, capacity, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || '',
        event_date,
        event_time || '09:00:00',
        category_id ? Number(category_id) : null,
        venue_id ? Number(venue_id) : null,
        fee ? Number(fee) : 0.0,
        Number(capacity),
        req.actor.id
      ]
    );
    res.status(201).json({ event_id: result.insertId, title, event_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Event registrations with attendance status (admin only)
router.get('/:id/registrations', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.registration_id, r.user_id, u.name, u.email, r.status, r.registered_at,
              (a.attendance_id IS NOT NULL) AS is_present,
              a.checked_in_at,
              p.payment_status, p.amount AS paid_amount
       FROM Registration r
       JOIN User u ON r.user_id = u.user_id
       LEFT JOIN Attendance a ON a.registration_id = r.registration_id
       LEFT JOIN Payment p ON p.registration_id = r.registration_id
       WHERE r.event_id = ?
       ORDER BY r.registered_at ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update event (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, description, event_date, event_time, category_id, venue_id, fee, capacity } = req.body;
    await pool.query(
      `UPDATE Event SET title = ?, description = ?, event_date = ?, event_time = ?, category_id = ?,
       venue_id = ?, fee = ?, capacity = ? WHERE event_id = ?`,
      [
        title,
        description || '',
        event_date,
        event_time || '09:00:00',
        category_id ? Number(category_id) : null,
        venue_id ? Number(venue_id) : null,
        fee ? Number(fee) : 0.0,
        Number(capacity),
        req.params.id
      ]
    );

    const [registrants] = await pool.query(
      `SELECT user_id FROM Registration WHERE event_id = ? AND status = 'confirmed'`,
      [req.params.id]
    );
    for (const r of registrants) {
      await pool.query(
        `INSERT INTO Notification (user_id, event_id, message, type) VALUES (?, ?, ?, 'event_updated')`,
        [r.user_id, req.params.id, `The event "${title}" has been updated. Please check the latest details.`]
      );
    }

    res.json({ message: 'Event updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete event (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[event]] = await conn.query('SELECT title FROM Event WHERE event_id = ?', [req.params.id]);
    if (!event) {
      await conn.rollback();
      return res.status(404).json({ error: 'Event not found' });
    }

    const [registrants] = await conn.query(
      `SELECT user_id FROM Registration WHERE event_id = ? AND status IN ('confirmed','waitlisted')`,
      [req.params.id]
    );
    for (const r of registrants) {
      await conn.query(
        `INSERT INTO Notification (user_id, event_id, message, type) VALUES (?, ?, ?, 'event_cancelled')`,
        [r.user_id, req.params.id, `"${event.title}" has been cancelled.`]
      );
    }

    await conn.query('DELETE FROM Event WHERE event_id = ?', [req.params.id]);
    await conn.commit();
    res.json({ message: 'Event deleted and registrants notified' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
