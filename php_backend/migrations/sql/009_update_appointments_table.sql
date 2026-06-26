-- Update appointments table with code and correct FKs
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_code VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20) NOT NULL,
    service_id INT,
    staff_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_code VARCHAR(20) NULL UNIQUE AFTER id;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Backfill missing appointment codes for legacy rows.
UPDATE appointments
SET appointment_code = CONCAT('APT-', LPAD(id, 3, '0'))
WHERE appointment_code IS NULL OR appointment_code = '';
