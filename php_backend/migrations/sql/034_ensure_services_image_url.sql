-- Ensure services.image_url exists and is wide enough for uploads/services/... paths.
-- Safe to run on hosts that already have image_url from the initial schema.

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'services'
    AND COLUMN_NAME = 'image_url'
);

SET @col_sql := IF(
  @col_exists = 0,
  'ALTER TABLE services ADD COLUMN image_url VARCHAR(512) NULL AFTER description',
  'ALTER TABLE services MODIFY COLUMN image_url VARCHAR(512) NULL'
);
PREPARE stmt_col FROM @col_sql;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;
