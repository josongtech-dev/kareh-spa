-- Add missing columns to sessions table
ALTER TABLE sessions
  ADD COLUMN staff_id INT NULL AFTER client_email,
  ADD COLUMN service_id INT NULL AFTER staff_id,
  ADD COLUMN status ENUM('In Progress','Finalizing','Completed','Voided') DEFAULT 'In Progress' AFTER service_id,
  ADD COLUMN billing_subtotal DECIMAL(10,2) DEFAULT 0.00 AFTER total_amount,
  ADD COLUMN discount_type ENUM('amount','percent') DEFAULT 'amount' AFTER billing_subtotal,
  ADD COLUMN discount_value DECIMAL(10,2) DEFAULT 0.00 AFTER discount_type,
  ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00 AFTER discount_value,
  ADD COLUMN start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER discount_amount,
  ADD COLUMN end_time TIMESTAMP NULL AFTER start_time,
  ADD COLUMN payment_requested_at DATETIME NULL AFTER end_time;

-- Add missing columns to session_services table
ALTER TABLE session_services
  ADD COLUMN status ENUM('pending','in_progress','completed','voided') DEFAULT 'pending' AFTER assigned_staff_id,
  ADD COLUMN start_time DATETIME NULL AFTER status,
  ADD COLUMN end_time DATETIME NULL AFTER start_time,
  ADD COLUMN notes TEXT NULL AFTER end_time;

-- Add foreign keys for sessions
ALTER TABLE sessions
  ADD FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE SET NULL,
  ADD FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;
