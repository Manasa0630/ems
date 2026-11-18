const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/:registrationId/pay', async (req, res) => {
  try {
    const { payment_method } = req.body;
    const [[payment]] = await pool.query(
      'SELECT * FROM Payment WHERE registration_id = ?',
      [req.params.registrationId]
    );
    if (!payment) {
      return res.status(404).json({ error: 'No payment record found for this registration' });
    }
    if (payment.payment_status === 'success') {
      return res.status(409).json({ error: 'Payment is already completed for this registration' });
    }

    const transactionRef = 'TXN' + Date.now().toString().slice(-6) + Math.floor(1000 + Math.random() * 9000);

    await pool.query(
      `UPDATE Payment SET payment_status = 'success', payment_method = ?,
       transaction_ref = ?, paid_at = NOW() WHERE registration_id = ?`,
      [payment_method || 'Simulated Payment', transactionRef, req.params.registrationId]
    );

    const [[reg]] = await pool.query(
      'SELECT user_id, event_id FROM Registration WHERE registration_id = ?',
      [req.params.registrationId]
    );
    const [[event]] = await pool.query('SELECT title FROM Event WHERE event_id = ?', [reg.event_id]);

    await pool.query(
      `INSERT INTO Notification (user_id, event_id, message, type) VALUES (?, ?, ?, 'payment_confirmed')`,
      [reg.user_id, reg.event_id, `Payment received for "${event.title}" (ref: ${transactionRef})`]
    );

    res.json({
      message: 'Payment simulated successfully',
      transaction_ref: transactionRef,
      paid_at: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:registrationId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Payment WHERE registration_id = ?',
      [req.params.registrationId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'No payment record found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
