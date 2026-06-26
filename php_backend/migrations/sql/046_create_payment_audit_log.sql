CREATE TABLE IF NOT EXISTS payment_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    event_type VARCHAR(40) NOT NULL COMMENT 'initiated, ipn_received, callback_received, status_checked, confirmed, failed, cancelled, amount_mismatch',
    event_data JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    pesapal_order_tracking_id VARCHAR(64) NULL,
    pesapal_merchant_reference VARCHAR(80) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at),
    INDEX idx_tracking_id (pesapal_order_tracking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
