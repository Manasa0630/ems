const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// Register for an event (capacity check, transaction with FOR UPDATE locking, waitlist)
router.post('/', async (req, res) => {
  const { user_id, event_id } = req.body;
  if (!user_id || !event_id) {
    return res.status(400).json({ error: 'user_id and event_id are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock event row
    const [[event]] = await conn.query(
      'SELECT title, capacity, fee, event_date, event_time FROM Event WHERE event_id = ? FOR UPDATE',
      [event_id]
    );
    if (!event) {
      await conn.rollback();
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check registration closing deadline
    // Event date is typically YYYY-MM-DD
    const dateFormatted = event.event_date instanceof Date
      ? event.event_date.toISOString().split('T')[0]
      : String(event.event_date).split('T')[0];
    const timeStr = String(event.event_time || '23:59:59').slice(0, 8);
    const deadline = new Date(`${dateFormatted}T${timeStr}`);

    if (!isNaN(deadline.getTime()) && deadline <= new Date()) {
      await conn.rollback();
      return res.status(400).json({ error: 'Registration has closed for this event.' });
    }

    // Check current confirmed registrations count
    const [[{ confirmed_count }]] = await conn.query(
      `SELECT COUNT(*) AS confirmed_count FROM Registration WHERE event_id = ? AND status = 'confirmed'`,
      [event_id]
    );

    const status = confirmed_count < event.capacity ? 'confirmed' : 'waitlisted';

    // Prevent active duplicate registration
    const [[existing]] = await conn.query(
      'SELECT registration_id, status FROM Registration WHERE user_id = ? AND event_id = ? FOR UPDATE',
      [user_id, event_id]
    );

    let registrationId;
    if (existing) {
      if (existing.status !== 'cancelled') {
        await conn.rollback();
        return res.status(409).json({ error: 'You are already registered for this event' });
      }
      // Re-activate previously cancelled registration
      await conn.query(
        'UPDATE Registration SET status = ?, registered_at = NOW() WHERE registration_id = ?',
        [status, existing.registration_id]
      );
      registrationId = existing.registration_id;
    } else {
      const [result] = await conn.query(
        'INSERT INTO Registration (user_id, event_id, status) VALUES (?, ?, ?)',
        [user_id, event_id, status]
      );
      registrationId = result.insertId;
    }

    // Create payment entry if event has fee
    if (Number(event.fee) > 0) {
      await conn.query(
        `INSERT INTO Payment (registration_id, amount, payment_status) VALUES (?, ?, 'pending')
         ON DUPLICATE KEY UPDATE amount = IF(payment_status = 'pending', VALUES(amount), amount)`,
        [registrationId, event.fee]
      );
    }

    // In-app Notification
    const notifMessage = status === 'confirmed'
      ? `Registration confirmed for "${event.title}"!`
      : `You have been added to the waitlist for "${event.title}".`;
    const notifType = status === 'confirmed' ? 'registration_confirmed' : 'waitlisted';

    await conn.query(
      'INSERT INTO Notification (user_id, event_id, message, type) VALUES (?, ?, ?, ?)',
      [user_id, event_id, notifMessage, notifType]
    );

    await conn.commit();
    res.status(201).json({
      registration_id: registrationId,
      user_id,
      event_id,
      status,
      fee: event.fee,
      needs_payment: Number(event.fee) > 0 && status === 'confirmed'
    });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You are already registered for this event' });
    }
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Cancel registration & auto-promote next waitlisted participant
router.delete('/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[reg]] = await conn.query(
      'SELECT registration_id, user_id, event_id, status FROM Registration WHERE registration_id = ? FOR UPDATE',
      [req.params.id]
    );
    if (!reg) {
      await conn.rollback();
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (reg.status === 'cancelled') {
      await conn.rollback();
      return res.status(400).json({ error: 'Registration is already cancelled' });
    }

    // Mark current registration as cancelled
    await conn.query(
      `UPDATE Registration SET status = 'cancelled' WHERE registration_id = ?`,
      [req.params.id]
    );

    const [[event]] = await conn.query('SELECT title, fee FROM Event WHERE event_id = ?', [reg.event_id]);

    // Send cancellation notification
    await conn.query(
      `INSERT INTO Notification (user_id, event_id, message, type) VALUES (?, ?, ?, 'event_cancelled')`,
      [reg.user_id, reg.event_id, `Your registration for "${event.title}" has been cancelled.`]
    );

    // If a confirmed user cancelled, automatically promote the oldest waitlisted user!
    let promotedUser = null;
    if (reg.status === 'confirmed') {
      const [[nextInLine]] = await conn.query(
        `SELECT registration_id, user_id FROM Registration
         WHERE event_id = ? AND status = 'waitlisted'
         ORDER BY registered_at ASC LIMIT 1 FOR UPDATE`,
        [reg.event_id]
      );

      if (nextInLine) {
        await conn.query(
          `UPDATE Registration SET status = 'confirmed' WHERE registration_id = ?`,
          [nextInLine.registration_id]
        );

        // Ensure payment row exists if paid
        if (Number(event.fee) > 0) {
          await conn.query(
            `INSERT INTO Payment (registration_id, amount, payment_status) VALUES (?, ?, 'pending')
             ON DUPLICATE KEY UPDATE amount = amount`,
            [nextInLine.registration_id, event.fee]
          );
        }

        // Notify promoted participant
        await conn.query(
          `INSERT INTO Notification (user_id, event_id, message, type) VALUES (?, ?, ?, 'waitlist_promoted')`,
          [
            nextInLine.user_id,
            reg.event_id,
            `A seat opened up! You have been automatically promoted to confirmed for "${event.title}".`
          ]
        );

        promotedUser = nextInLine.user_id;
      }
    }

    await conn.commit();
    res.json({
      message: 'Registration cancelled successfully',
      promoted_user_id: promotedUser
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Admin view all registrations
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.registration_id, r.user_id, u.name AS user_name, u.email AS user_email,
              e.event_id, e.title AS event_title, e.event_date,
              r.status, r.registered_at,
              (a.attendance_id IS NOT NULL) AS is_present,
              p.payment_status, p.amount AS paid_amount
       FROM Registration r
       JOIN User u ON r.user_id = u.user_id
       JOIN Event e ON r.event_id = e.event_id
       LEFT JOIN Attendance a ON a.registration_id = r.registration_id
       LEFT JOIN Payment p ON p.registration_id = r.registration_id
       ORDER BY r.registered_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
