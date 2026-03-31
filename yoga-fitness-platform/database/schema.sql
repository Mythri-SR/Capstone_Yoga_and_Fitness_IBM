-- Yoga & Fitness Platform - MySQL Schema
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reschedule_requests;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS availability_slots;
DROP TABLE IF EXISTS fitness_programs;
DROP TABLE IF EXISTS trainer_profiles;
DROP TABLE IF EXISTS progress_tracking;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'trainer', 'admin') NOT NULL DEFAULT 'user',
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE trainer_profiles (
  user_id INT UNSIGNED PRIMARY KEY,
  bio TEXT NULL,
  certifications JSON NULL,
  experience_years INT UNSIGNED NOT NULL DEFAULT 0,
  rating_average DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  rating_count INT UNSIGNED NOT NULL DEFAULT 0,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  avatar_url VARCHAR(500) NULL,
  CONSTRAINT fk_trainer_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE fitness_programs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trainer_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  workout_type ENUM('yoga', 'hiit', 'gym', 'meditation') NOT NULL,
  goal_tag ENUM('weight_loss', 'flexibility', 'muscle_gain', 'general') NOT NULL DEFAULT 'general',
  description TEXT NULL,
  duration_minutes INT UNSIGNED NOT NULL DEFAULT 60,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_program_trainer FOREIGN KEY (trainer_id) REFERENCES users (id) ON DELETE CASCADE,
  KEY idx_program_goal (goal_tag),
  KEY idx_program_type (workout_type)
) ENGINE=InnoDB;

CREATE TABLE availability_slots (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trainer_id INT UNSIGNED NOT NULL,
  program_id INT UNSIGNED NULL,
  slot_start DATETIME NOT NULL,
  slot_end DATETIME NOT NULL,
  session_type ENUM('live', 'recorded', 'personal') NOT NULL DEFAULT 'live',
  is_booked TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_slot_trainer FOREIGN KEY (trainer_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_slot_program FOREIGN KEY (program_id) REFERENCES fitness_programs (id) ON DELETE SET NULL,
  KEY idx_slot_trainer_time (trainer_id, slot_start),
  CONSTRAINT chk_slot_time CHECK (slot_end > slot_start)
) ENGINE=InnoDB;

CREATE TABLE bookings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  trainer_id INT UNSIGNED NOT NULL,
  slot_id INT UNSIGNED NOT NULL,
  program_id INT UNSIGNED NOT NULL,
  session_type ENUM('live', 'recorded', 'personal') NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'reschedule_pending') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_trainer FOREIGN KEY (trainer_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_slot FOREIGN KEY (slot_id) REFERENCES availability_slots (id) ON DELETE RESTRICT,
  CONSTRAINT fk_booking_program FOREIGN KEY (program_id) REFERENCES fitness_programs (id) ON DELETE RESTRICT,
  UNIQUE KEY uq_booking_slot (slot_id)
) ENGINE=InnoDB;

CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id INT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  mock_transaction_id VARCHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
  UNIQUE KEY uq_payment_booking (booking_id)
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  trainer_id INT UNSIGNED NOT NULL,
  program_id INT UNSIGNED NULL,
  booking_id INT UNSIGNED NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_review_trainer FOREIGN KEY (trainer_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_review_program FOREIGN KEY (program_id) REFERENCES fitness_programs (id) ON DELETE SET NULL,
  CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE SET NULL,
  CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5),
  UNIQUE KEY uq_review_user_trainer_program (user_id, trainer_id, program_id)
) ENGINE=InnoDB;

CREATE TABLE reschedule_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id INT UNSIGNED NOT NULL,
  requested_by_user_id INT UNSIGNED NOT NULL,
  old_slot_id INT UNSIGNED NOT NULL,
  new_slot_id INT UNSIGNED NOT NULL,
  trainer_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reschedule_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
  CONSTRAINT fk_reschedule_user FOREIGN KEY (requested_by_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_reschedule_old_slot FOREIGN KEY (old_slot_id) REFERENCES availability_slots (id) ON DELETE RESTRICT,
  CONSTRAINT fk_reschedule_new_slot FOREIGN KEY (new_slot_id) REFERENCES availability_slots (id) ON DELETE RESTRICT,
  CONSTRAINT fk_reschedule_trainer FOREIGN KEY (trainer_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE progress_tracking (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  total_workouts INT UNSIGNED NOT NULL DEFAULT 0,
  total_calories INT UNSIGNED NOT NULL DEFAULT 0,
  attendance_sessions INT UNSIGNED NOT NULL DEFAULT 0,
  current_streak_days INT UNSIGNED NOT NULL DEFAULT 0,
  last_activity_date DATE NULL,
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE KEY uq_progress_user (user_id)
) ENGINE=InnoDB;
