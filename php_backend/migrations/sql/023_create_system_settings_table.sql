CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(120) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    value_type ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO system_settings (setting_key, setting_value, value_type)
VALUES
    ('commission_pool_rate', '40', 'number'),
    ('commission_tax_rate', '12', 'number'),
    ('commission_staff_rate', '10', 'number'),
    ('offers_enabled', 'true', 'boolean'),
    ('offers_list', '["10% off manicure every Tuesday.","Free beard touch-up after 4 completed visits.","Members get priority weekend slots.","Birthday month facial discount."]', 'json'),
    ('staff_leaves_enabled', 'true', 'boolean'),
    ('staff_leave_default_days', '21', 'number'),
    ('staff_leave_requires_approval', 'true', 'boolean')
ON DUPLICATE KEY UPDATE
    setting_value = VALUES(setting_value),
    value_type = VALUES(value_type);
