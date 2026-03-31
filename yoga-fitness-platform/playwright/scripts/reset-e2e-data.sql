-- Reset mutable E2E state while keeping seeded users/programs/slots.
SET FOREIGN_KEY_CHECKS = 0;
-- Align with database/schema.sql if DB was seeded before payments existed.
CREATE TABLE IF NOT EXISTS payments (
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
DELETE FROM payments;
DELETE FROM bookings;
DELETE FROM reviews;
UPDATE availability_slots SET is_booked = 0;
UPDATE trainer_profiles SET rating_average = 4.80, rating_count = 24 WHERE user_id = 2;
UPDATE trainer_profiles SET rating_average = 4.65, rating_count = 18 WHERE user_id = 3;
SET FOREIGN_KEY_CHECKS = 1;
