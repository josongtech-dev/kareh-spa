CREATE TABLE IF NOT EXISTS token_blacklist (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    token_jti VARCHAR(64) NOT NULL,
    token_type ENUM('customer', 'owner', 'manager', 'receptionist', 'attendant', 'staff', 'force_reset') NOT NULL DEFAULT 'customer',
    user_id INT UNSIGNED NOT NULL,
    expires_at INT UNSIGNED NOT NULL,
    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token_jti (token_jti),
    INDEX idx_token_expires (expires_at),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
