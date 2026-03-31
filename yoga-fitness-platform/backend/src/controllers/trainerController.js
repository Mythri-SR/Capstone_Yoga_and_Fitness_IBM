import { query, queryOne } from '../config/db.js';

export async function listTrainers(req, res, next) {
  try {
    const { minRating, maxPrice, goal, workoutType, availableFrom, availableTo } = req.query;
    let sql = `
      SELECT u.id, u.full_name AS fullName, u.email, tp.bio, tp.experience_years AS experienceYears,
        tp.rating_average AS ratingAverage, tp.rating_count AS ratingCount, tp.hourly_rate AS hourlyRate,
        tp.certifications, tp.avatar_url AS avatarUrl
      FROM users u
      INNER JOIN trainer_profiles tp ON tp.user_id = u.id
      WHERE u.role = 'trainer'
    `;
    const params = [];
    if (minRating != null && minRating !== '') {
      sql += ` AND tp.rating_average >= ?`;
      params.push(Number(minRating));
    }
    if (maxPrice != null && maxPrice !== '') {
      sql += ` AND tp.hourly_rate <= ?`;
      params.push(Number(maxPrice));
    }
    if (goal) {
      sql += ` AND EXISTS (
        SELECT 1 FROM fitness_programs p WHERE p.trainer_id = u.id AND p.goal_tag = ? AND p.is_active = 1
      )`;
      params.push(goal);
    }
    if (workoutType) {
      sql += ` AND EXISTS (
        SELECT 1 FROM fitness_programs p WHERE p.trainer_id = u.id AND p.workout_type = ? AND p.is_active = 1
      )`;
      params.push(workoutType);
    }
    if (availableFrom && availableTo) {
      sql += ` AND EXISTS (
        SELECT 1 FROM availability_slots s
        WHERE s.trainer_id = u.id AND s.is_booked = 0
          AND s.slot_start >= ? AND s.slot_start <= ?
      )`;
      params.push(availableFrom, availableTo);
    }
    sql += ` ORDER BY tp.rating_average DESC`;
    const rows = await query(sql, params);
    const parsed = rows.map((r) => {
      let certs = r.certifications;
      if (typeof certs === 'string') {
        try {
          certs = JSON.parse(certs || '[]');
        } catch {
          certs = [];
        }
      }
      return { ...r, certifications: certs || [] };
    });
    res.json({ ok: true, trainers: parsed });
  } catch (e) {
    next(e);
  }
}

export async function getTrainer(req, res, next) {
  try {
    const id = Number(req.params.id);
    const row = await queryOne(
      `
      SELECT u.id, u.full_name AS fullName, u.email, tp.bio, tp.experience_years AS experienceYears,
        tp.rating_average AS ratingAverage, tp.rating_count AS ratingCount, tp.hourly_rate AS hourlyRate,
        tp.certifications, tp.avatar_url AS avatarUrl
      FROM users u
      INNER JOIN trainer_profiles tp ON tp.user_id = u.id
      WHERE u.id = ? AND u.role = 'trainer'
      `,
      [id]
    );
    if (!row) return res.status(404).json({ ok: false, error: 'Trainer not found' });
    try {
      row.certifications =
        typeof row.certifications === 'string' ? JSON.parse(row.certifications || '[]') : row.certifications || [];
    } catch {
      row.certifications = [];
    }
    const programs = await query(
      `SELECT id, title, workout_type AS workoutType, goal_tag AS goalTag, description, duration_minutes AS durationMinutes, price
       FROM fitness_programs WHERE trainer_id = ? AND is_active = 1`,
      [id]
    );
    res.json({ ok: true, trainer: row, programs });
  } catch (e) {
    next(e);
  }
}
