INSERT INTO system_settings (setting_key, setting_value, value_type)
VALUES
    ('discount_deduction_rate', '0', 'number'),
    ('other_deductions_rate', '0', 'number'),
    ('profit_remaining_rate', '60', 'number')
ON DUPLICATE KEY UPDATE
    setting_value = VALUES(setting_value),
    value_type = VALUES(value_type);
