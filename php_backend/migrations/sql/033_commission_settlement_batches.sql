-- Payout batches: each settlement action is one row; commission lines reference a batch so
-- the aggregated UI can show multiple paid rows per staff (each with its own transaction code).

CREATE TABLE IF NOT EXISTS commission_settlement_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    period_month VARCHAR(7) NULL COMMENT 'Service month (YYYY-MM) used when bulk-settling',
    payment_method VARCHAR(32) NULL,
    transaction_id VARCHAR(100) NULL,
    settled_at DATETIME NULL,
    settlement_notes TEXT NULL,
    handed_over_by VARCHAR(120) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE commissions
ADD COLUMN IF NOT EXISTS settlement_batch_id INT NULL AFTER handed_over_by;

SET @comm_batch_fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'commissions'
    AND CONSTRAINT_NAME = 'fk_commissions_settlement_batch'
);
SET @comm_batch_fk_sql := IF(
  @comm_batch_fk_exists = 0,
  'ALTER TABLE commissions ADD CONSTRAINT fk_commissions_settlement_batch FOREIGN KEY (settlement_batch_id) REFERENCES commission_settlement_batches(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt_comm_batch_fk FROM @comm_batch_fk_sql;
EXECUTE stmt_comm_batch_fk;
DEALLOCATE PREPARE stmt_comm_batch_fk;

SET @comm_batch_idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'commissions'
    AND INDEX_NAME = 'idx_commissions_settlement_batch'
);
SET @comm_batch_idx_sql := IF(
  @comm_batch_idx_exists = 0,
  'CREATE INDEX idx_commissions_settlement_batch ON commissions(settlement_batch_id)',
  'SELECT 1'
);
PREPARE stmt_comm_batch_idx FROM @comm_batch_idx_sql;
EXECUTE stmt_comm_batch_idx;
DEALLOCATE PREPARE stmt_comm_batch_idx;

-- Backfill batches from existing paid commission lines (one batch per distinct settlement fingerprint).
INSERT INTO commission_settlement_batches (staff_id, period_month, payment_method, transaction_id, settled_at, settlement_notes, handed_over_by)
SELECT
  c.staff_id,
  DATE_FORMAT(COALESCE(ses.end_time, ses.start_time, ses.created_at, c.created_at), '%Y-%m') AS period_month,
  c.payment_method,
  c.transaction_id,
  c.settled_at,
  MIN(c.settlement_notes) AS settlement_notes,
  MIN(c.handed_over_by) AS handed_over_by
FROM commissions c
LEFT JOIN sessions ses ON c.session_id = ses.id
WHERE c.payment_status = 'Paid'
  AND c.settlement_batch_id IS NULL
GROUP BY
  c.staff_id,
  DATE_FORMAT(COALESCE(ses.end_time, ses.start_time, ses.created_at, c.created_at), '%Y-%m'),
  IFNULL(c.payment_method, ''),
  IFNULL(c.transaction_id, ''),
  c.settled_at,
  IFNULL(c.handed_over_by, ''),
  IFNULL(c.settlement_notes, '');

UPDATE commissions c
LEFT JOIN sessions ses ON c.session_id = ses.id
INNER JOIN commission_settlement_batches b ON
  b.staff_id = c.staff_id
  AND b.period_month = DATE_FORMAT(COALESCE(ses.end_time, ses.start_time, ses.created_at, c.created_at), '%Y-%m')
  AND IFNULL(b.payment_method, '') = IFNULL(c.payment_method, '')
  AND IFNULL(b.transaction_id, '') = IFNULL(c.transaction_id, '')
  AND b.settled_at <=> c.settled_at
  AND IFNULL(b.handed_over_by, '') = IFNULL(c.handed_over_by, '')
  AND IFNULL(b.settlement_notes, '') = IFNULL(c.settlement_notes, '')
SET c.settlement_batch_id = b.id
WHERE c.payment_status = 'Paid'
  AND c.settlement_batch_id IS NULL;
