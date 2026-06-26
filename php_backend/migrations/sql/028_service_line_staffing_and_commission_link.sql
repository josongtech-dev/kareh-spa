ALTER TABLE session_services
ADD COLUMN IF NOT EXISTS assigned_staff_id INT NULL AFTER service_id,
ADD COLUMN IF NOT EXISTS status ENUM('pending','in_progress','completed','voided') NOT NULL DEFAULT 'pending' AFTER price,
ADD COLUMN IF NOT EXISTS start_time DATETIME NULL AFTER status,
ADD COLUMN IF NOT EXISTS end_time DATETIME NULL AFTER start_time,
ADD COLUMN IF NOT EXISTS notes TEXT NULL AFTER end_time;

SET @ss_idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'session_services'
    AND INDEX_NAME = 'idx_session_services_session_status'
);
SET @ss_idx_sql := IF(
  @ss_idx_exists = 0,
  'CREATE INDEX idx_session_services_session_status ON session_services(session_id, status)',
  'SELECT 1'
);
PREPARE stmt_ss_idx FROM @ss_idx_sql;
EXECUTE stmt_ss_idx;
DEALLOCATE PREPARE stmt_ss_idx;

SET @ss_staff_idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'session_services'
    AND INDEX_NAME = 'idx_session_services_assigned_staff'
);
SET @ss_staff_idx_sql := IF(
  @ss_staff_idx_exists = 0,
  'CREATE INDEX idx_session_services_assigned_staff ON session_services(assigned_staff_id)',
  'SELECT 1'
);
PREPARE stmt_ss_staff_idx FROM @ss_staff_idx_sql;
EXECUTE stmt_ss_staff_idx;
DEALLOCATE PREPARE stmt_ss_staff_idx;

SET @ss_staff_fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'session_services'
    AND CONSTRAINT_NAME = 'fk_session_services_assigned_staff'
);
SET @ss_staff_fk_sql := IF(
  @ss_staff_fk_exists = 0,
  'ALTER TABLE session_services ADD CONSTRAINT fk_session_services_assigned_staff FOREIGN KEY (assigned_staff_id) REFERENCES staffs(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt_ss_staff_fk FROM @ss_staff_fk_sql;
EXECUTE stmt_ss_staff_fk;
DEALLOCATE PREPARE stmt_ss_staff_fk;

ALTER TABLE commissions
ADD COLUMN IF NOT EXISTS session_service_id INT NULL AFTER session_id;

SET @comm_line_idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'commissions'
    AND INDEX_NAME = 'idx_commissions_session_service'
);
SET @comm_line_idx_sql := IF(
  @comm_line_idx_exists = 0,
  'CREATE UNIQUE INDEX idx_commissions_session_service ON commissions(session_service_id)',
  'SELECT 1'
);
PREPARE stmt_comm_line_idx FROM @comm_line_idx_sql;
EXECUTE stmt_comm_line_idx;
DEALLOCATE PREPARE stmt_comm_line_idx;

SET @comm_line_fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'commissions'
    AND CONSTRAINT_NAME = 'fk_commissions_session_service'
);
SET @comm_line_fk_sql := IF(
  @comm_line_fk_exists = 0,
  'ALTER TABLE commissions ADD CONSTRAINT fk_commissions_session_service FOREIGN KEY (session_service_id) REFERENCES session_services(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt_comm_line_fk FROM @comm_line_fk_sql;
EXECUTE stmt_comm_line_fk;
DEALLOCATE PREPARE stmt_comm_line_fk;

UPDATE session_services ss
INNER JOIN sessions s ON s.id = ss.session_id
SET ss.assigned_staff_id = COALESCE(ss.assigned_staff_id, s.staff_id),
    ss.status = CASE
      WHEN s.status = 'Completed' THEN 'completed'
      WHEN s.status = 'Voided' THEN 'voided'
      WHEN s.status IN ('In Progress', 'Finalizing') THEN 'in_progress'
      ELSE ss.status
    END,
    ss.start_time = COALESCE(ss.start_time, s.start_time),
    ss.end_time = CASE
      WHEN s.status = 'Completed' THEN COALESCE(ss.end_time, s.end_time, NOW())
      WHEN s.status = 'Voided' THEN COALESCE(ss.end_time, s.end_time)
      ELSE ss.end_time
    END
WHERE ss.assigned_staff_id IS NULL
   OR ss.start_time IS NULL
   OR ss.status = 'pending';
