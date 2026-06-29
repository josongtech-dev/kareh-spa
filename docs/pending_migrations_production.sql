-- =============================================================================
-- Pending migrations for production (complete: 014 → 048 + production_alter)
-- Handles baselined DB where migrations 014-041 were never actually applied.
-- Run against your production database:
--   USE kareh_spa;
--   SOURCE path/to/pending_migrations_production.sql;
-- Safe to run more than once (idempotent via information_schema column checks).
-- NO AFTER clauses — avoids silent failures when parent columns are missing.
-- =============================================================================

-- ============================================================
-- SESSIONS table: add columns baselined in 014, 025, 040
-- ============================================================

-- appointment_id (migration 014)
SET @v := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'appointment_id');
SET @s := IF(@v = 0, 'ALTER TABLE sessions ADD COLUMN appointment_id INT NULL', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- client_phone (migration 025)
SET @v := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'client_phone');
SET @s := IF(@v = 0, 'ALTER TABLE sessions ADD COLUMN client_phone VARCHAR(20) NULL', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- client_email (migration 025)
SET @v := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'client_email');
SET @s := IF(@v = 0, 'ALTER TABLE sessions ADD COLUMN client_email VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- billing_status (migration 040)
SET @v := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'billing_status');
SET @s := IF(@v = 0,
  'ALTER TABLE sessions ADD COLUMN billing_status ENUM(''unbilled'', ''payment_requested'', ''paid'', ''failed'', ''cancelled'') NOT NULL DEFAULT ''unbilled''',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- paid_at (migration 040)
SET @v := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'paid_at');
SET @s := IF(@v = 0, 'ALTER TABLE sessions ADD COLUMN paid_at DATETIME NULL', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- payment_transaction_code (migration 040)
SET @v := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'payment_transaction_code');
SET @s := IF(@v = 0, 'ALTER TABLE sessions ADD COLUMN payment_transaction_code VARCHAR(120) NULL', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- created_by (migration 042)
SET @v := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'created_by');
SET @s := IF(@v = 0, 'ALTER TABLE sessions ADD COLUMN created_by INT NULL', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- pesapal_merchant_reference, pesapal_order_tracking_id, pesapal_redirect_url, pesapal_payment_method (migration 043)
SET @v := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'pesapal_merchant_reference');
SET @s := IF(@v = 0,
  'ALTER TABLE sessions
     ADD COLUMN pesapal_merchant_reference VARCHAR(80) NULL,
     ADD COLUMN pesapal_order_tracking_id VARCHAR(64) NULL,
     ADD COLUMN pesapal_redirect_url TEXT NULL,
     ADD COLUMN pesapal_payment_method VARCHAR(20) NULL',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Expand billing_status to include failed/cancelled (if column just added above,
-- it already has the full ENUM; if it existed before, widen it)
SET @v := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'billing_status'
    AND COLUMN_TYPE LIKE '%failed%');
SET @s := IF(@v = 0,
  'ALTER TABLE sessions
     MODIFY COLUMN billing_status ENUM(''unbilled'', ''payment_requested'', ''paid'', ''failed'', ''cancelled'') NOT NULL DEFAULT ''unbilled''',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- pesapal_initiated_amount (migration 044)
SET @v := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'pesapal_initiated_amount');
SET @s := IF(@v = 0,
  'ALTER TABLE sessions ADD COLUMN pesapal_initiated_amount DECIMAL(10, 2) NULL',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================================
-- SESSION_SERVICES table: add assigned_staff_id (migration 028)
-- ============================================================
SET @v := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'session_services' AND COLUMN_NAME = 'assigned_staff_id');
SET @s := IF(@v = 0,
  'ALTER TABLE session_services ADD COLUMN assigned_staff_id INT NULL',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- is_from_appointment (migration 047)
SET @v := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'session_services' AND COLUMN_NAME = 'is_from_appointment');
SET @s := IF(@v = 0,
  'ALTER TABLE session_services ADD COLUMN is_from_appointment TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================================
-- Create new tables (045, 046, 048)
-- ============================================================
CREATE TABLE IF NOT EXISTS addons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    material_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    labour_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    bulk_after INT DEFAULT NULL,
    bulk_labour_price DECIMAL(10, 2) DEFAULT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS session_addons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    addon_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    material_price DECIMAL(10, 2) NOT NULL,
    labour_price DECIMAL(10, 2) NOT NULL,
    bulk_labour_price DECIMAL(10, 2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (addon_id) REFERENCES addons(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payment_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    event_data JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    pesapal_order_tracking_id VARCHAR(64) NULL,
    pesapal_merchant_reference VARCHAR(80) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at),
    INDEX idx_tracking_id (pesapal_order_tracking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actor_type VARCHAR(20) NOT NULL DEFAULT 'staff',
    actor_id INT DEFAULT NULL,
    actor_name VARCHAR(255) DEFAULT NULL,
    category VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    entity_type VARCHAR(50) DEFAULT NULL,
    entity_id INT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_category (category),
    INDEX idx_activity_actor (actor_type, actor_id),
    INDEX idx_activity_created_at (created_at),
    INDEX idx_activity_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Fix missing AUTO_INCREMENT (if tables were created without it
-- by a prior flawed migration run)
-- ============================================================
SET @ai := (SELECT EXTRA FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_audit_log' AND COLUMN_NAME = 'id');
SET @s := IF(IFNULL(@ai, '') NOT LIKE '%auto_increment%',
  'ALTER TABLE payment_audit_log MODIFY COLUMN id BIGINT AUTO_INCREMENT',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ai := (SELECT EXTRA FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'activity_log' AND COLUMN_NAME = 'id');
SET @s := IF(IFNULL(@ai, '') NOT LIKE '%auto_increment%',
  'ALTER TABLE activity_log MODIFY COLUMN id INT AUTO_INCREMENT',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ai := (SELECT EXTRA FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'session_addons' AND COLUMN_NAME = 'id');
SET @s := IF(IFNULL(@ai, '') NOT LIKE '%auto_increment%',
  'ALTER TABLE session_addons MODIFY COLUMN id INT AUTO_INCREMENT',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Renumber id=0 rows (created before AUTO_INCREMENT was applied)
SET @next := (SELECT COALESCE(MAX(id), 0) FROM addons);
UPDATE addons SET id = (@next := @next + 1) WHERE id = 0;

SET @next := (SELECT COALESCE(MAX(id), 0) FROM expenses);
UPDATE expenses SET id = (@next := @next + 1) WHERE id = 0;

SET @pk := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'expenses'
    AND CONSTRAINT_TYPE = 'PRIMARY KEY'
);
SET @s := IF(@pk = 0, 'ALTER TABLE expenses ADD PRIMARY KEY (id)', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ai := (SELECT EXTRA FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'addons' AND COLUMN_NAME = 'id');
SET @s := IF(IFNULL(@ai, '') NOT LIKE '%auto_increment%',
  'ALTER TABLE addons MODIFY COLUMN id INT AUTO_INCREMENT',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ai := (SELECT EXTRA FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'expenses' AND COLUMN_NAME = 'id');
SET @s := IF(IFNULL(@ai, '') NOT LIKE '%auto_increment%',
  'ALTER TABLE expenses MODIFY COLUMN id INT AUTO_INCREMENT',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================================
-- production_alter: services.image_url
-- ============================================================
SET @col_prod := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'services' AND COLUMN_NAME = 'image_url');
SET @sql_prod := IF(
  @col_prod = 0,
  'ALTER TABLE services ADD COLUMN image_url VARCHAR(512) NULL',
  'ALTER TABLE services MODIFY COLUMN image_url VARCHAR(512) NULL'
);
PREPARE stmt FROM @sql_prod;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
