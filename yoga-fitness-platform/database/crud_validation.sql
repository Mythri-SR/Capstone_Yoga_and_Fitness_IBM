-- UI vs DB validation helpers (run after exercising the app)
-- Replace :booking_id / :user_email with real values from your session.

-- CREATE / READ — users
SELECT id, email, role, full_name FROM users WHERE email = 'user1@test.com';

-- CREATE — bookings for a member
SELECT b.id, b.status, b.session_type, s.slot_start, p.title
FROM bookings b
JOIN availability_slots s ON s.id = b.slot_id
JOIN fitness_programs p ON p.id = b.program_id
JOIN users u ON u.id = b.user_id
WHERE u.email = 'user1@test.com'
ORDER BY b.id DESC
LIMIT 5;

-- UPDATE — payments mock status
SELECT pay.id, pay.status, pay.amount, pay.mock_transaction_id, b.id AS booking_id
FROM payments pay
JOIN bookings b ON b.id = pay.booking_id
WHERE b.id = 1; -- example

-- DELETE / cancel semantics (soft via status)
SELECT status, updated_at FROM bookings WHERE id = 1;

-- JOIN — trainer dashboard overview
SELECT u.full_name AS trainer, COUNT(b.id) AS sessions
FROM users u
LEFT JOIN bookings b ON b.trainer_id = u.id AND b.status <> 'cancelled'
WHERE u.role = 'trainer'
GROUP BY u.id;

-- Progress parity check
SELECT u.email, pt.total_workouts, pt.total_calories, pt.current_streak_days
FROM progress_tracking pt
JOIN users u ON u.id = pt.user_id
WHERE u.email = 'user2@test.com';

-- Reviews aggregate vs profile rating
SELECT tp.user_id, tp.rating_average, tp.rating_count,
       AVG(r.rating) AS live_avg, COUNT(r.id) AS live_cnt
FROM trainer_profiles tp
LEFT JOIN reviews r ON r.trainer_id = tp.user_id
WHERE tp.user_id = 3
GROUP BY tp.user_id, tp.rating_average, tp.rating_count;
