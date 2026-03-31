-- Sample data — login password for all seeded accounts: password
-- bcrypt ($2b$10$...) matches plaintext "password" (bcryptjs-compatible)
SET NAMES utf8mb4;

INSERT INTO users (id, email, password_hash, role, full_name, phone) VALUES
(1, 'admin@yoga.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin User', '555-0001'),
(2, 'trainer1@yoga.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'trainer', 'Maya Chen', '555-0101'),
(3, 'trainer2@yoga.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'trainer', 'Jordan Rivers', '555-0102'),
(4, 'user1@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Alex Member', '555-0201'),
(5, 'user2@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Sam Client', '555-0202');

INSERT INTO trainer_profiles (user_id, bio, certifications, experience_years, rating_average, rating_count, hourly_rate) VALUES
(2, 'RYT-500 yoga instructor specializing in flexibility and mindfulness.', '["RYT-500","CPR"]', 8, 4.80, 24, 75.00),
(3, 'Strength & HIIT coach, former competitive athlete.', '["NASM-CPT"]', 5, 4.65, 18, 65.00);

INSERT INTO fitness_programs (id, trainer_id, title, workout_type, goal_tag, description, duration_minutes, price, is_active) VALUES
(1, 2, 'Sunrise Vinyasa Flow', 'yoga', 'flexibility', 'Energetic morning flow.', 60, 45.00, 1),
(2, 2, 'Deep Stretch & Meditation', 'meditation', 'flexibility', 'Calm evening recovery.', 45, 35.00, 1),
(3, 3, 'HIIT Fat Burn', 'hiit', 'weight_loss', 'High intensity intervals.', 40, 40.00, 1),
(4, 3, 'Power Lifting Basics', 'gym', 'muscle_gain', 'Compound lifts introduction.', 55, 50.00, 1);

-- Slots: future dates relative to seed - use fixed dates in 2026 for demos
INSERT INTO availability_slots (id, trainer_id, program_id, slot_start, slot_end, session_type, is_booked) VALUES
(1, 2, 1, '2026-04-10 09:00:00', '2026-04-10 10:00:00', 'live', 0),
(2, 2, 1, '2026-04-12 09:00:00', '2026-04-12 10:00:00', 'live', 0),
(3, 2, 2, '2026-04-11 18:00:00', '2026-04-11 18:45:00', 'live', 0),
(4, 3, 3, '2026-04-10 17:00:00', '2026-04-10 17:40:00', 'personal', 0),
(5, 3, 4, '2026-04-13 12:00:00', '2026-04-13 13:00:00', 'live', 0),
(6, 2, 1, '2026-04-15 09:00:00', '2026-04-15 10:00:00', 'recorded', 0),
(7, 2, 1, '2026-05-02 09:00:00', '2026-05-02 10:00:00', 'live', 0),
(8, 2, 1, '2026-05-03 09:00:00', '2026-05-03 10:00:00', 'live', 0),
(9, 2, 2, '2026-05-04 18:00:00', '2026-05-04 18:45:00', 'live', 0),
(10, 3, 3, '2026-05-05 17:00:00', '2026-05-05 17:40:00', 'live', 0),
(11, 3, 4, '2026-05-06 12:00:00', '2026-05-06 13:00:00', 'live', 0),
(12, 2, NULL, '2026-05-07 10:00:00', '2026-05-07 11:00:00', 'live', 0),
(13, 2, 1, '2026-05-08 09:00:00', '2026-05-08 10:00:00', 'recorded', 0),
(14, 3, 3, '2026-05-09 17:00:00', '2026-05-09 17:40:00', 'personal', 0),
(15, 3, 4, '2026-05-10 12:00:00', '2026-05-10 13:00:00', 'live', 0);

INSERT INTO progress_tracking (user_id, total_workouts, total_calories, attendance_sessions, current_streak_days, last_activity_date) VALUES
(4, 12, 4200, 10, 3, '2026-03-28'),
(5, 5, 1800, 5, 1, '2026-03-27');

ALTER TABLE users AUTO_INCREMENT = 6;
ALTER TABLE fitness_programs AUTO_INCREMENT = 5;
ALTER TABLE availability_slots AUTO_INCREMENT = 16;
