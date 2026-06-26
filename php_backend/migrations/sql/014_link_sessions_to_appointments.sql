ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS appointment_id INT NULL AFTER notes;

SET @fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'sessions'
      AND CONSTRAINT_NAME = 'fk_sessions_appointment'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @fk_sql := IF(
    @fk_exists = 0,
    'ALTER TABLE sessions ADD CONSTRAINT fk_sessions_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL',
    'SELECT 1'
);

PREPARE stmt_fk FROM @fk_sql;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;
