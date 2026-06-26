ALTER TABLE sessions
    MODIFY COLUMN billing_status ENUM('unbilled', 'payment_requested', 'paid', 'failed', 'cancelled') NOT NULL DEFAULT 'unbilled';

ALTER TABLE sessions
    ADD COLUMN pesapal_initiated_amount DECIMAL(10, 2) NULL AFTER pesapal_payment_method;
