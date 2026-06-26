ALTER TABLE session_services
    ADD COLUMN is_from_appointment TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Marks services carried over from the original appointment' AFTER assigned_staff_id;
