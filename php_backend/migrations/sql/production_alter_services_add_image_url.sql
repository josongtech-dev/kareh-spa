-- =============================================================================
-- Production: services.image_url
-- =============================================================================
-- Adds `image_url` if missing, or widens it to VARCHAR(512) if it already
-- exists (e.g. older VARCHAR(255) from early schema).
--
-- Run against your production database after selecting the correct schema:
--   USE your_database_name;
--   SOURCE path/to/this/file.sql;
--
-- Or paste into phpMyAdmin / MySQL client as a single script.
-- Safe to run more than once.
-- =============================================================================

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'services'
    AND COLUMN_NAME = 'image_url'
);

SET @col_sql := IF(
  @col_exists = 0,
  'ALTER TABLE services ADD COLUMN image_url VARCHAR(512) NULL',
  'ALTER TABLE services MODIFY COLUMN image_url VARCHAR(512) NULL'
);

PREPARE stmt_col FROM @col_sql;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

-- -----------------------------------------------------------------------------
-- Manual one-liner (only if you are sure the column does NOT exist yet):
-- ALTER TABLE services ADD COLUMN image_url VARCHAR(512) NULL;
-- -----------------------------------------------------------------------------
