-- Add settlement metadata for payout audit trail
ALTER TABLE commissions
  ADD COLUMN IF NOT EXISTS payment_method ENUM('Bank', 'Mobile Money', 'Cash') NULL AFTER payment_status,
  ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100) NULL AFTER payment_method,
  ADD COLUMN IF NOT EXISTS settled_at DATETIME NULL AFTER transaction_id,
  ADD COLUMN IF NOT EXISTS settlement_notes TEXT NULL AFTER settled_at,
  ADD COLUMN IF NOT EXISTS handed_over_by VARCHAR(120) NULL AFTER settlement_notes;
