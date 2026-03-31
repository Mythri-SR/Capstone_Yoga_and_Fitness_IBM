import { query, queryOne } from '../config/db.js';

function mockTxId() {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function payBooking(req, res, next) {
  try {
    const userId = req.user.sub;
    const { bookingId } = req.body;
    const booking = await queryOne(
      `SELECT b.*, p.price FROM bookings b JOIN fitness_programs p ON p.id = b.program_id WHERE b.id = ?`,
      [bookingId]
    );
    if (!booking) return res.status(404).json({ ok: false, error: 'Booking not found' });
    if (Number(booking.user_id) !== userId) {
      return res.status(403).json({ ok: false, error: 'Not your booking' });
    }
    if (!['pending', 'confirmed'].includes(booking.status) && booking.status !== 'reschedule_pending') {
      return res.status(400).json({ ok: false, error: 'Cannot pay for this booking state' });
    }
    const existing = await queryOne(`SELECT id, status FROM payments WHERE booking_id = ?`, [bookingId]);
    if (existing && existing.status === 'paid') {
      return res.status(400).json({ ok: false, error: 'Already paid' });
    }
    const amount = Number(booking.price);
    const tx = mockTxId();
    if (existing) {
      await query(`UPDATE payments SET status = 'paid', mock_transaction_id = ?, amount = ? WHERE id = ?`, [
        tx,
        amount,
        existing.id,
      ]);
    } else {
      await query(
        `INSERT INTO payments (booking_id, amount, status, mock_transaction_id) VALUES (?,?, 'paid', ?)`,
        [bookingId, amount, tx]
      );
    }
    await query(`UPDATE bookings SET status = 'confirmed' WHERE id = ? AND status = 'pending'`, [bookingId]);
    res.json({ ok: true, payment: { bookingId, amount, status: 'paid', mockTransactionId: tx } });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, error: 'Payment already exists' });
    }
    next(e);
  }
}

export async function getPaymentByBooking(req, res, next) {
  try {
    const userId = req.user.sub;
    const bookingId = Number(req.params.bookingId);
    const row = await queryOne(
      `
      SELECT pay.id, pay.booking_id AS bookingId, pay.amount, pay.status, pay.mock_transaction_id AS mockTransactionId
      FROM payments pay
      JOIN bookings b ON b.id = pay.booking_id
      WHERE pay.booking_id = ? AND (b.user_id = ? OR b.trainer_id = ? OR ? = 'admin')
      `,
      [bookingId, userId, userId, String(req.user.role)]
    );
    if (!row) return res.status(404).json({ ok: false, error: 'Payment not found' });
    res.json({ ok: true, payment: row });
  } catch (e) {
    next(e);
  }
}
