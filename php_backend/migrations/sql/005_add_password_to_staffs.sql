-- Add password field to staffs table
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS password VARCHAR(255) AFTER activation_password;
