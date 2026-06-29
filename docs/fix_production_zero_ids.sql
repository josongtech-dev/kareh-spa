-- =============================================================================
-- Fix production tables with id=0 and missing AUTO_INCREMENT
-- Run once on production:  USE kareh_spa;  SOURCE fix_production_zero_ids.sql;
-- Safe to re-run (idempotent checks via information_schema).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Renumber any rows stuck at id=0 before adding AUTO_INCREMENT
-- ---------------------------------------------------------------------------
SET @next := (SELECT COALESCE(MAX(id), 0) FROM addons);
UPDATE addons SET id = (@next := @next + 1) WHERE id = 0;

SET @next := (SELECT COALESCE(MAX(id), 0) FROM expenses);
UPDATE expenses SET id = (@next := @next + 1) WHERE id = 0;

SET @next := (SELECT COALESCE(MAX(id), 0) FROM session_addons);
UPDATE session_addons SET id = (@next := @next + 1) WHERE id = 0;

-- ---------------------------------------------------------------------------
-- 2. expenses: ensure PRIMARY KEY exists (production dump was missing it)
-- ---------------------------------------------------------------------------
SET @pk := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'expenses'
    AND CONSTRAINT_TYPE = 'PRIMARY KEY'
);
SET @s := IF(@pk = 0, 'ALTER TABLE expenses ADD PRIMARY KEY (id)', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- 3. Force AUTO_INCREMENT on affected tables
-- ---------------------------------------------------------------------------
SET @ai := (SELECT EXTRA FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'addons' AND COLUMN_NAME = 'id');
SET @s := IF(IFNULL(@ai, '') NOT LIKE '%auto_increment%',
  'ALTER TABLE addons MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ai := (SELECT EXTRA FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'expenses' AND COLUMN_NAME = 'id');
SET @s := IF(IFNULL(@ai, '') NOT LIKE '%auto_increment%',
  'ALTER TABLE expenses MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ai := (SELECT EXTRA FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'session_addons' AND COLUMN_NAME = 'id');
SET @s := IF(IFNULL(@ai, '') NOT LIKE '%auto_increment%',
  'ALTER TABLE session_addons MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT',
  'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- 4. Bump AUTO_INCREMENT counters past current max ids
-- ---------------------------------------------------------------------------
SET @max_id := (SELECT COALESCE(MAX(id), 0) + 1 FROM addons);
SET @s := CONCAT('ALTER TABLE addons AUTO_INCREMENT = ', @max_id);
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @max_id := (SELECT COALESCE(MAX(id), 0) + 1 FROM expenses);
SET @s := CONCAT('ALTER TABLE expenses AUTO_INCREMENT = ', @max_id);
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @max_id := (SELECT COALESCE(MAX(id), 0) + 1 FROM session_addons);
SET @s := CONCAT('ALTER TABLE session_addons AUTO_INCREMENT = ', @max_id);
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- 5. Verify (should show OK for all three tables)
-- ---------------------------------------------------------------------------
SELECT t.TABLE_NAME, c.COLUMN_NAME, c.EXTRA,
  IF(c.EXTRA LIKE '%auto_increment%', 'OK', 'MISSING AUTO_INCREMENT') AS status
FROM information_schema.TABLES t
JOIN information_schema.COLUMNS c
  ON c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = t.TABLE_NAME AND c.COLUMN_KEY = 'PRI'
WHERE t.TABLE_SCHEMA = DATABASE()
  AND t.TABLE_NAME IN ('addons', 'expenses', 'session_addons')
ORDER BY t.TABLE_NAME;
