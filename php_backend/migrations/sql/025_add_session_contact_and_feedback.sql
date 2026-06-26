ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20) NULL AFTER customer_name,
ADD COLUMN IF NOT EXISTS client_email VARCHAR(100) NULL AFTER client_phone;

CREATE TABLE IF NOT EXISTS session_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    token_expires_at DATETIME NOT NULL,
    submitted_at DATETIME NULL,
    service_rating TINYINT UNSIGNED NULL,
    billing_rating TINYINT UNSIGNED NULL,
    feedback_text TEXT NULL,
    client_name_snapshot VARCHAR(100) NULL,
    client_email_snapshot VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_session_feedback_session (session_id),
    CONSTRAINT fk_session_feedback_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
