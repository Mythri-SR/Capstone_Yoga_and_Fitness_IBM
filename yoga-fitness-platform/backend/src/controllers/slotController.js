import { query } from '../config/db.js';

export async function listSlots(req, res, next) {
  try {
    const { trainerId, from, booked } = req.query;
    let sql = `
      SELECT s.id, s.trainer_id AS trainerId, s.program_id AS programId, s.slot_start AS slotStart,
        s.slot_end AS slotEnd, s.session_type AS sessionType, s.is_booked AS isBooked,
        p.title AS programTitle
      FROM availability_slots s
      LEFT JOIN fitness_programs p ON p.id = s.program_id
      WHERE 1=1
    `;
    const params = [];
    if (trainerId) {
      sql += ` AND s.trainer_id = ?`;
      params.push(Number(trainerId));
    }
    if (from) {
      sql += ` AND s.slot_start >= ?`;
      params.push(from);
    }
    if (booked === '0' || booked === 'false') {
      sql += ` AND s.is_booked = 0`;
    }
    if (booked === '1' || booked === 'true') {
      sql += ` AND s.is_booked = 1`;
    }
    sql += ` ORDER BY s.slot_start`;
    const slots = await query(sql, params);
    res.json({ ok: true, slots });
  } catch (e) {
    next(e);
  }
}
