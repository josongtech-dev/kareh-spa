ALTER TABLE sessions
    ADD COLUMN pesapal_merchant_reference VARCHAR(80) NULL AFTER payment_transaction_code,
    ADD COLUMN pesapal_order_tracking_id VARCHAR(64) NULL AFTER pesapal_merchant_reference,
    ADD COLUMN pesapal_redirect_url TEXT NULL AFTER pesapal_order_tracking_id,
    ADD COLUMN pesapal_payment_method VARCHAR(20) NULL AFTER pesapal_redirect_url,
    MODIFY COLUMN billing_status ENUM('unbilled', 'payment_requested', 'paid') NOT NULL DEFAULT 'unbilled';
