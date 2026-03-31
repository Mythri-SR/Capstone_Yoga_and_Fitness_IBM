import { query, queryOne } from '../config/db.js';

export async function listPrograms(req, res, next) {
  try {
    const { goal, workoutType, minPrice, maxPrice, trainerId, search } = req.query;
    let sql = `
      SELECT p.id, p.trainer_id AS trainerId, p.title, p.workout_type AS workoutType, p.goal_tag AS goalTag,
        p.description, p.duration_minutes AS durationMinutes, p.price, p.is_active AS isActive,
        u.full_name AS trainerName, tp.rating_average AS trainerRating
      FROM fitness_programs p
      INNER JOIN users u ON u.id = p.trainer_id
      INNER JOIN trainer_profiles tp ON tp.user_id = p.trainer_id
      WHERE p.is_active = 1
    `;
    const params = [];
    if (goal) {
      sql += ` AND p.goal_tag = ?`;
      params.push(goal);
    }
    if (workoutType) {
      sql += ` AND p.workout_type = ?`;
      params.push(workoutType);
    }
    if (minPrice != null && minPrice !== '') {
      sql += ` AND p.price >= ?`;
      params.push(Number(minPrice));
    }
    if (maxPrice != null && maxPrice !== '') {
      sql += ` AND p.price <= ?`;
      params.push(Number(maxPrice));
    }
    if (trainerId) {
      sql += ` AND p.trainer_id = ?`;
      params.push(Number(trainerId));
    }
    if (search) {
      sql += ` AND (p.title LIKE ? OR p.description LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term);
    }
    sql += ` ORDER BY tp.rating_average DESC, p.title`;
    const programs = await query(sql, params);
    res.json({ ok: true, programs });
  } catch (e) {
    next(e);
  }
}

export async function getProgram(req, res, next) {
  try {
    const id = Number(req.params.id);
    const program = await queryOne(
      `
      SELECT p.id, p.trainer_id AS trainerId, p.title, p.workout_type AS workoutType, p.goal_tag AS goalTag,
        p.description, p.duration_minutes AS durationMinutes, p.price,
        u.full_name AS trainerName, tp.rating_average AS trainerRating
      FROM fitness_programs p
      INNER JOIN users u ON u.id = p.trainer_id
      INNER JOIN trainer_profiles tp ON tp.user_id = p.trainer_id
      WHERE p.id = ? AND p.is_active = 1
      `,
      [id]
    );
    if (!program) return res.status(404).json({ ok: false, error: 'Program not found' });
    res.json({ ok: true, program });
  } catch (e) {
    next(e);
  }
}
