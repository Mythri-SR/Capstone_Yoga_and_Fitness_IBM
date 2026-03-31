import { query, queryOne } from '../config/db.js';
import { assertSlotBookable, markSlotBooked } from '../services/bookingService.js';

export async function createBooking(req, res, next) {
  try {
    const userId = req.user.sub;
    const { slotId, programId, sessionType } = req.body;
    const program = await queryOne(
      `SELECT id, trainer_id AS trainerId, price FROM fitness_programs WHERE id = ? AND is_active = 1`,
      [programId]
    );
    if (!program) {
      return res.status(404).json({ ok: false, error: 'Program not found' });
    }
    const trainerId = program.trainerId;
    const slot = await assertSlotBookable(slotId, trainerId);
    if (slot.program_id && Number(slot.program_id) !== Number(programId)) {
      return res.status(400).json({ ok: false, error: 'Selected slot is reserved for a different program' });
    }
    if (slot.session_type && slot.session_type !== sessionType) {
      return res.status(400).json({ ok: false, error: 'Session type does not match this slot' });
    }
    const ins = await query(
      `INSERT INTO bookings (user_id, trainer_id, slot_id, program_id, session_type, status)
       VALUES (?,?,?,?,?,'pending')`,
      [userId, trainerId, slotId, programId, sessionType]
    );
    await markSlotBooked(slotId, true);
    const booking = await queryOne(
      `
      SELECT b.id, b.user_id AS userId, b.trainer_id AS trainerId, b.slot_id AS slotId, b.program_id AS programId,
        b.session_type AS sessionType, b.status, b.created_at AS createdAt,
        s.slot_start AS slotStart, s.slot_end AS slotEnd, p.title AS programTitle, p.price AS programPrice
      FROM bookings b
      JOIN availability_slots s ON s.id = b.slot_id
      JOIN fitness_programs p ON p.id = b.program_id
      WHERE b.id = ?
      `,
      [Number(ins.insertId)]
    );
    res.status(201).json({ ok: true, booking });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, error: 'Slot already booked' });
    }
    next(e);
  }
}

export async function listMyBookings(req, res, next) {
  try {
    const userId = req.user.sub;
    const role = req.user.role;
    let sql = `
      SELECT b.id, b.user_id AS userId, b.trainer_id AS trainerId, b.slot_id AS slotId, b.program_id AS programId,
        b.session_type AS sessionType, b.status, b.created_at AS createdAt,
        s.slot_start AS slotStart, s.slot_end AS slotEnd, p.title AS programTitle, p.price AS programPrice
      FROM bookings b
      JOIN availability_slots s ON s.id = b.slot_id
      JOIN fitness_programs p ON p.id = b.program_id
      WHERE 1=1
    `;
    const params = [];
    if (role === 'trainer') {
      sql += ` AND b.trainer_id = ?`;
      params.push(userId);
    } else {
      sql += ` AND b.user_id = ?`;
      params.push(userId);
    }
    sql += ` ORDER BY s.slot_start DESC`;
    const bookings = await query(sql, params);
    res.json({ ok: true, bookings });
  } catch (e) {
    next(e);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const userId = req.user.sub;
    const bookingId = Number(req.params.id);
    const booking = await queryOne(`SELECT * FROM bookings WHERE id = ?`, [bookingId]);
    if (!booking) return res.status(404).json({ ok: false, error: 'Booking not found' });
    if (Number(booking.user_id) !== userId && Number(booking.trainer_id) !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Not allowed' });
    }
    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({ ok: false, error: 'Booking cannot be cancelled' });
    }
    await query(`UPDATE bookings SET status = 'cancelled' WHERE id = ?`, [bookingId]);
    await markSlotBooked(booking.slot_id, false);
    res.json({ ok: true, message: 'Cancelled' });
  } catch (e) {
    next(e);
  }
}

export async function requestReschedule(req, res, next) {
  try {
    const userId = req.user.sub;
    const bookingId = Number(req.params.id);
    const { newSlotId } = req.body;
    const booking = await queryOne(`SELECT * FROM bookings WHERE id = ?`, [bookingId]);
    if (!booking) return res.status(404).json({ ok: false, error: 'Booking not found' });
    if (Number(booking.user_id) !== userId) {
      return res.status(403).json({ ok: false, error: 'Only the member can request reschedule' });
    }
    if (!['confirmed', 'pending'].includes(booking.status)) {
      return res.status(400).json({ ok: false, error: 'Cannot reschedule this booking' });
    }
    await assertSlotBookable(newSlotId, booking.trainer_id);
    await query(
      `INSERT INTO reschedule_requests (booking_id, requested_by_user_id, old_slot_id, new_slot_id, trainer_id, status)
       VALUES (?,?,?,?,?,'pending')`,
      [bookingId, userId, booking.slot_id, newSlotId, booking.trainer_id]
    );
    await query(`UPDATE bookings SET status = 'reschedule_pending' WHERE id = ?`, [bookingId]);
    res.json({ ok: true, message: 'Reschedule requested' });
  } catch (e) {
    next(e);
  }
}

export async function approveReschedule(req, res, next) {
  try {
    const userId = req.user.sub;
    const bookingId = Number(req.params.id);
    const booking = await queryOne(`SELECT * FROM bookings WHERE id = ?`, [bookingId]);
    if (!booking) return res.status(404).json({ ok: false, error: 'Booking not found' });
    if (Number(booking.trainer_id) !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Trainer must approve' });
    }
    const reqRow = await queryOne(
      `SELECT * FROM reschedule_requests WHERE booking_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1`,
      [bookingId]
    );
    if (!reqRow) return res.status(400).json({ ok: false, error: 'No pending reschedule' });
    await assertSlotBookable(reqRow.new_slot_id, booking.trainer_id, bookingId);
    await markSlotBooked(booking.slot_id, false);
    await query(`UPDATE bookings SET slot_id = ?, status = 'confirmed' WHERE id = ?`, [
      reqRow.new_slot_id,
      bookingId,
    ]);
    await markSlotBooked(reqRow.new_slot_id, true);
    await query(`UPDATE reschedule_requests SET status = 'approved' WHERE id = ?`, [reqRow.id]);
    res.json({ ok: true, message: 'Reschedule approved' });
  } catch (e) {
    next(e);
  }
}

export async function rejectReschedule(req, res, next) {
  try {
    const userId = req.user.sub;
    const bookingId = Number(req.params.id);
    const booking = await queryOne(`SELECT * FROM bookings WHERE id = ?`, [bookingId]);
    if (!booking) return res.status(404).json({ ok: false, error: 'Booking not found' });
    if (Number(booking.trainer_id) !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Trainer must reject' });
    }
    const reqRow = await queryOne(
      `SELECT * FROM reschedule_requests WHERE booking_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1`,
      [bookingId]
    );
    if (!reqRow) return res.status(400).json({ ok: false, error: 'No pending reschedule' });
    await query(`UPDATE reschedule_requests SET status = 'rejected' WHERE id = ?`, [reqRow.id]);
    await query(`UPDATE bookings SET status = 'confirmed' WHERE id = ?`, [bookingId]);
    res.json({ ok: true, message: 'Reschedule rejected' });
  } catch (e) {
    next(e);
  }
}

export async function completeBooking(req, res, next) {
  try {
    const userId = req.user.sub;
    const bookingId = Number(req.params.id);
    const booking = await queryOne(`SELECT * FROM bookings WHERE id = ?`, [bookingId]);
    if (!booking) return res.status(404).json({ ok: false, error: 'Booking not found' });
    if (Number(booking.trainer_id) !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Trainer marks complete' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ ok: false, error: 'Only confirmed sessions can be completed' });
    }
    await query(`UPDATE bookings SET status = 'completed' WHERE id = ?`, [bookingId]);
    const cal = 150 + Math.floor(Math.random() * 200);
    await query(
      `
      UPDATE progress_tracking SET
        total_workouts = total_workouts + 1,
        total_calories = total_calories + ?,
        attendance_sessions = attendance_sessions + 1,
        current_streak_days = current_streak_days + 1,
        last_activity_date = CURDATE()
      WHERE user_id = ?
      `,
      [cal, booking.user_id]
    );
    res.json({ ok: true, message: 'Completed', caloriesLogged: cal });
  } catch (e) {
    next(e);
  }
}
