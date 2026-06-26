ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS billing_status ENUM('unbilled','payment_requested','paid') NOT NULL DEFAULT 'unbilled' AFTER status,
ADD COLUMN IF NOT EXISTS billing_subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER total_amount,
ADD COLUMN IF NOT EXISTS discount_type ENUM('amount','percent') NOT NULL DEFAULT 'amount' AFTER billing_subtotal,
ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER discount_type,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER discount_value,
ADD COLUMN IF NOT EXISTS payment_requested_at DATETIME NULL AFTER discount_amount,
ADD COLUMN IF NOT EXISTS paid_at DATETIME NULL AFTER payment_requested_at,
ADD COLUMN IF NOT EXISTS payment_transaction_code VARCHAR(120) NULL AFTER paid_at;

UPDATE sessions
SET billing_subtotal = CASE
    WHEN billing_subtotal IS NULL OR billing_subtotal <= 0 THEN total_amount
    ELSE billing_subtotal
END,
billing_status = CASE
    WHEN billing_status IS NULL OR billing_status = '' THEN 'unbilled'
    ELSE billing_status
END,
discount_type = CASE
    WHEN discount_type IS NULL OR discount_type = '' THEN 'amount'
    ELSE discount_type
END,
discount_value = COALESCE(discount_value, 0),
discount_amount = COALESCE(discount_amount, 0);

SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sessions'
    AND INDEX_NAME = 'idx_sessions_billing_status'
);
SET @idx_sql := IF(
  @idx_exists = 0,
  'CREATE INDEX idx_sessions_billing_status ON sessions(billing_status)',
  'SELECT 1'
);
PREPARE stmt_idx FROM @idx_sql;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;
