-- Expand commissions table for per-service split tracking
ALTER TABLE commissions
  ADD COLUMN IF NOT EXISTS service_id INT NULL AFTER session_id,
  ADD COLUMN IF NOT EXISTS source_type ENUM('primary', 'addon') DEFAULT 'primary' AFTER service_id,
  ADD COLUMN IF NOT EXISTS gross_amount DECIMAL(10,2) DEFAULT 0 AFTER amount,
  ADD COLUMN IF NOT EXISTS commission_pool_amount DECIMAL(10,2) DEFAULT 0 AFTER gross_amount,
  ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0 AFTER commission_pool_amount,
  ADD COLUMN IF NOT EXISTS staff_amount DECIMAL(10,2) DEFAULT 0 AFTER tax_amount,
  ADD COLUMN IF NOT EXISTS service_profit_amount DECIMAL(10,2) DEFAULT 0 AFTER staff_amount;

-- Add indexes and relationship safeguards
SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'commissions' AND INDEX_NAME = 'idx_commissions_session_staff_service_source'
);
SET @idx_sql := IF(
  @idx_exists = 0,
  'CREATE UNIQUE INDEX idx_commissions_session_staff_service_source ON commissions(session_id, staff_id, service_id, source_type)',
  'SELECT 1'
);
PREPARE stmt_idx_comm FROM @idx_sql;
EXECUTE stmt_idx_comm;
DEALLOCATE PREPARE stmt_idx_comm;

SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'commissions'
    AND CONSTRAINT_NAME = 'fk_commissions_service'
);
SET @fk_sql := IF(
  @fk_exists = 0,
  'ALTER TABLE commissions ADD CONSTRAINT fk_commissions_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt_fk_comm FROM @fk_sql;
EXECUTE stmt_fk_comm;
DEALLOCATE PREPARE stmt_fk_comm;
