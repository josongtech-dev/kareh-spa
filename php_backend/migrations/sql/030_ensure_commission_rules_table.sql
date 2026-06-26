-- Idempotent: safe if 029 was skipped due to baseline mode or failed ordering.
-- Creates commission_rules and seeds a default row when empty.

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

INSERT INTO commission_rules (name, commission_pool_rate, tax_rate, sort_order, is_default)
SELECT 'Default', 40, 12, 0, 1
FROM (SELECT 1 AS _) AS _seed
WHERE NOT EXISTS (SELECT 1 FROM commission_rules LIMIT 1);
