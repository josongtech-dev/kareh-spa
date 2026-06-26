-- Add username and enforce uniqueness on key fields
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS username VARCHAR(50) AFTER name;

-- Add unique constraints
SET @u1_exists := (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staffs' AND INDEX_NAME = 'uq_staffs_username'
);
SET @u1_sql := IF(@u1_exists = 0, 'ALTER TABLE staffs ADD CONSTRAINT uq_staffs_username UNIQUE (username)', 'SELECT 1');
PREPARE stmt_u1 FROM @u1_sql;
EXECUTE stmt_u1;
DEALLOCATE PREPARE stmt_u1;

SET @u2_exists := (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staffs' AND INDEX_NAME = 'uq_staffs_phone'
);
SET @u2_sql := IF(@u2_exists = 0, 'ALTER TABLE staffs ADD CONSTRAINT uq_staffs_phone UNIQUE (phone)', 'SELECT 1');
PREPARE stmt_u2 FROM @u2_sql;
EXECUTE stmt_u2;
DEALLOCATE PREPARE stmt_u2;

SET @u3_exists := (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staffs' AND INDEX_NAME = 'uq_staffs_id_number'
);
SET @u3_sql := IF(@u3_exists = 0, 'ALTER TABLE staffs ADD CONSTRAINT uq_staffs_id_number UNIQUE (id_number)', 'SELECT 1');
PREPARE stmt_u3 FROM @u3_sql;
EXECUTE stmt_u3;
DEALLOCATE PREPARE stmt_u3;
-- email already has a unique constraint from previous migration, but let's ensure it just in case
-- ALTER TABLE staffs ADD UNIQUE (email); 
