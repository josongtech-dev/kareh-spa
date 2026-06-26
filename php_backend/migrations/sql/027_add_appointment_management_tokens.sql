ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS cancel_reason TEXT NULL AFTER notes;

CREATE TABLE IF NOT EXISTS appointment_manage_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    token_expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_appointment_manage_tokens_appointment (appointment_id),
    CONSTRAINT fk_appointment_manage_tokens_appointment
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
