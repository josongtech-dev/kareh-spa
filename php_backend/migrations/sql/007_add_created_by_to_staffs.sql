-- Add created_by field to staffs table
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS created_by INT AFTER updated_at;
