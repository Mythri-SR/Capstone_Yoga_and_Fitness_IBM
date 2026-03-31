import { query, queryOne } from '../config/db.js';

async function refreshTrainerRating(trainerId) {
  const agg = await queryOne(
    `SELECT AVG(rating) AS avgR, COUNT(*) AS cnt FROM reviews WHERE trainer_id = ?`,
    [trainerId]
  );
  await query(`UPDATE trainer_profiles SET rating_average = ?, rating_count = ? WHERE user_id = ?`, [
    Number(agg.avgR || 0).toFixed(2),
    agg.cnt || 0,
    trainerId,
  ]);
}

export async function createReview(req, res, next) {
  try {
    const userId = req.user.sub;
    const { trainerId, programId, rating, comment, bookingId } = req.body;
    const trainer = await queryOne(`SELECT id FROM users WHERE id = ? AND role = 'trainer'`, [trainerId]);
    if (!trainer) return res.status(404).json({ ok: false, error: 'Trainer not found' });
    if (programId) {
      const prog = await queryOne(`SELECT id FROM fitness_programs WHERE id = ? AND trainer_id = ?`, [
        programId,
        trainerId,
      ]);
      if (!prog) return res.status(400).json({ ok: false, error: 'Program does not match trainer' });
    }
    const ins = await query(
      `INSERT INTO reviews (user_id, trainer_id, program_id, booking_id, rating, comment) VALUES (?,?,?,?,?,?)`,
      [userId, trainerId, programId || null, bookingId || null, rating, comment || null]
    );
    await refreshTrainerRating(trainerId);
    const review = await queryOne(`SELECT * FROM reviews WHERE id = ?`, [+ins.insertId]);
    res.status(201).json({ ok: true, review });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, error: 'You already reviewed this trainer for this program' });
    }
    next(e);
  }
}

export async function listReviews(req, res, next) {
  try {
    const trainerId = req.query.trainerId ? Number(req.query.trainerId) : null;
    let sql = `
      SELECT r.id, r.user_id AS userId, r.trainer_id AS trainerId, r.program_id AS programId,
        r.rating, r.comment, r.created_at AS createdAt, u.full_name AS userName
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE 1=1
    `;
    const params = [];
    if (trainerId) {
      sql += ` AND r.trainer_id = ?`;
      params.push(trainerId);
    }
    sql += ` ORDER BY r.created_at DESC`;
    const reviews = await query(sql, params);
    res.json({ ok: true, reviews });
  } catch (e) {
    next(e);
  }
}
