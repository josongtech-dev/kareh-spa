-- =============================================================================
-- Diagnostic: find tables missing AUTO_INCREMENT
-- Run against production:  USE kareh_spa;  SOURCE diagnose_duplicate_entry.sql;
-- =============================================================================
SELECT t.TABLE_NAME, c.COLUMN_NAME, c.DATA_TYPE, c.EXTRA,
  IF(c.EXTRA LIKE '%auto_increment%', 'OK', 'MISSING AUTO_INCREMENT') AS status
FROM information_schema.TABLES t
JOIN information_schema.COLUMNS c ON c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = t.TABLE_NAME AND c.COLUMN_KEY = 'PRI'
WHERE t.TABLE_SCHEMA = DATABASE()
  AND t.TABLE_TYPE = 'BASE TABLE'
ORDER BY t.TABLE_NAME;

-- =============================================================================
-- Fix: Force AUTO_INCREMENT on all tables that should have it
-- =============================================================================
SELECT '--- Fixing missing AUTO_INCREMENT ---' AS '';

SET @tables_with_ai := 'payment_audit_log,activity_log,session_addons,addons,sessions,session_services,commissions,commission_settlement_batches,activity_log,appointments,appointment_manage_tokens,services,service_categories,staffs,users,products,product_stock_movements,expenses,offers,service_offer_services,system_settings,token_blacklist,password_resets,feedback_notifications,schema_migrations,commission_rules';

-- Check each table
SET @i := 1;
SET @table_name := '';

WHILE @i > 0 DO
  SET @table_name := TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@tables_with_ai, ',', @i), ',', -1));
  IF @table_name = SUBSTRING_INDEX(SUBSTRING_INDEX(@tables_with_ai, ',', @i), ',', -1) THEN
    SET @ai_check := CONCAT(
      'SELECT IF(COUNT(*) = 0, ''NEEDS FIX: ', @table_name, ''', ''OK: ', @table_name, ''') AS status FROM information_schema.COLUMNS ',
      'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ''', @table_name, ''' AND COLUMN_KEY = ''PRI'' AND EXTRA NOT LIKE ''%auto_increment%'''
    );
    PREPARE st FROM @ai_check;
    EXECUTE st;
    DEALLOCATE PREPARE st;
    SET @i := @i + 1;
  ELSE
    SET @i := 0;
  END IF;
END WHILE;
