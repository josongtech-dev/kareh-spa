-- Commission rule presets: pool % of gross, tax % of gross; staff net % = pool - tax.
-- Replaces system_settings keys commission_pool_rate, commission_tax_rate, commission_staff_rate.
-- The `commissions` ledger table is unchanged (staff earnings records).

CREATE TABLE IF NOT EXISTS commission_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    commission_pool_rate DECIMAL(5,2) NOT NULL COMMENT 'Percent of gross allocated to commission pool',
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'Percent of gross withheld as tax (deducted from pool for net staff pay)',
    sort_order INT NOT NULL DEFAULT 0,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default rule if none exist (legacy settings removed below)
INSERT INTO commission_rules (name, commission_pool_rate, tax_rate, sort_order, is_default)
SELECT 'Default', 40, 12, 0, 1
FROM (SELECT 1 AS _) AS _seed
WHERE NOT EXISTS (SELECT 1 FROM commission_rules LIMIT 1);

DELETE FROM system_settings
WHERE setting_key IN ('commission_pool_rate', 'commission_tax_rate', 'commission_staff_rate');

ALTER TABLE services
    ADD COLUMN commission_rule_id INT NULL AFTER status;

ALTER TABLE services
    ADD CONSTRAINT fk_services_commission_rule
    FOREIGN KEY (commission_rule_id) REFERENCES commission_rules(id) ON DELETE SET NULL;
