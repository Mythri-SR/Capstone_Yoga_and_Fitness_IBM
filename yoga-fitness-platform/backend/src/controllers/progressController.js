import { query, queryOne } from '../config/db.js';

export async function getProgress(req, res, next) {
  try {
    const userId = req.user.sub;
    let row = await queryOne(`SELECT * FROM progress_tracking WHERE user_id = ?`, [userId]);
    if (!row) {
      await query(`INSERT IGNORE INTO progress_tracking (user_id) VALUES (?)`, [userId]);
      row = await queryOne(`SELECT * FROM progress_tracking WHERE user_id = ?`, [userId]);
    }
    res.json({
      ok: true,
      progress: {
        userId: row.user_id,
        totalWorkouts: row.total_workouts,
        totalCalories: row.total_calories,
        attendanceSessions: row.attendance_sessions,
        currentStreakDays: row.current_streak_days,
        lastActivityDate: row.last_activity_date,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function logProgress(req, res, next) {
  try {
    const userId = req.user.sub;
    const { caloriesBurned = 0, workoutDelta = 0, markAttendance } = req.body;
    await query(`INSERT IGNORE INTO progress_tracking (user_id) VALUES (?)`, [userId]);
    const att = markAttendance ? 1 : 0;
    const streakBump = Number(workoutDelta) > 0 ? 1 : 0;
    await query(
      `UPDATE progress_tracking SET
        total_workouts = total_workouts + ?,
        total_calories = total_calories + ?,
        attendance_sessions = attendance_sessions + ?,
        current_streak_days = current_streak_days + ?,
        last_activity_date = CURDATE()
      WHERE user_id = ?`,
      [Number(workoutDelta) || 0, Number(caloriesBurned) || 0, att, streakBump, userId]
    );
    const row = await queryOne(`SELECT * FROM progress_tracking WHERE user_id = ?`, [userId]);
    res.json({
      ok: true,
      progress: {
        userId: row.user_id,
        totalWorkouts: row.total_workouts,
        totalCalories: row.total_calories,
        attendanceSessions: row.attendance_sessions,
        currentStreakDays: row.current_streak_days,
        lastActivityDate: row.last_activity_date,
      },
    });
  } catch (e) {
    next(e);
  }
}
