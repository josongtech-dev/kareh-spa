CREATE TABLE IF NOT EXISTS staffs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    skill VARCHAR(100),
    additional_info TEXT,
    image_path VARCHAR(255),
    status ENUM('Active', 'On Leave', 'Suspended', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Backfill from legacy `staff` table if it exists and `staffs` is currently empty.
SET @staff_table_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staff'
);
SET @staffs_empty := (
    SELECT CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END
    FROM staffs
);

SET @backfill_sql := IF(
    @staff_table_exists = 1 AND @staffs_empty = 1,
    'INSERT INTO staffs (name, email, phone, id_number, role, skill, additional_info, image_path, status, created_at, updated_at)
     SELECT
       IFNULL(name, CONCAT(\"Staff \", id)),
       IFNULL(NULLIF(email, \"\"), CONCAT(\"staff\", id, \"@local.invalid\")),
       IFNULL(NULLIF(phone, \"\"), CONCAT(\"N/A-\", id)),
       CONCAT(\"LEGACY-\", id),
       \"Staff\",
       specialization,
       bio,
       image_path,
       CASE WHEN IFNULL(is_active, 1) = 1 THEN \"Active\" ELSE \"Inactive\" END,
       created_at,
       CURRENT_TIMESTAMP
     FROM staff',
    'SELECT 1'
);

PREPARE stmt_staff_backfill FROM @backfill_sql;
EXECUTE stmt_staff_backfill;
DEALLOCATE PREPARE stmt_staff_backfill;
