-- Ensure services.commission_rule_id exists (hosts that baselined migrations before 029/031).

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
