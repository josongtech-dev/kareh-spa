-- Add activation_password to staffs table
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS activation_password VARCHAR(255) AFTER additional_info;
