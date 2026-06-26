-- Update services table to accommodate status and string duration
ALTER TABLE services ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active' AFTER category;
ALTER TABLE services MODIFY COLUMN duration VARCHAR(50) NOT NULL;
