-- Standalone commission rules schema (no dependency on system_settings).
-- Safe to run repeatedly across environments.

CREATE TABLE IF NOT EXISTS commission_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    commission_pool_rate DECIMAL(5,2) NOT NULL COMMENT 'Percent of gross allocated to commission pool',
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'Percent of gross withheld as tax',
    sort_order INT NOT NULL DEFAULT 0,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO commission_rules (name, commission_pool_rate, tax_rate, sort_order, is_default)
SELECT 'Default', 40, 12, 0, 1
FROM (SELECT 1 AS _) AS seed
WHERE NOT EXISTS (SELECT 1 FROM commission_rules LIMIT 1);

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'services'
    AND COLUMN_NAME = 'commission_rule_id'
);
SET @col_sql := IF(
  @col_exists = 0,
  'ALTER TABLE services ADD COLUMN commission_rule_id INT NULL AFTER status',
  'SELECT 1'
);
PREPARE stmt_col FROM @col_sql;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'services'
    AND CONSTRAINT_NAME = 'fk_services_commission_rule'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @fk_sql := IF(
  @fk_exists = 0,
  'ALTER TABLE services ADD CONSTRAINT fk_services_commission_rule FOREIGN KEY (commission_rule_id) REFERENCES commission_rules(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt_fk FROM @fk_sql;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;
