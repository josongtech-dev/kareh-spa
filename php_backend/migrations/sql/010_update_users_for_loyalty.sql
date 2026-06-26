-- Add loyalty and contact fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER email;
ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0 AFTER role;
ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_tier ENUM('Bronze', 'Silver', 'Gold') DEFAULT 'Bronze' AFTER loyalty_points;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active' AFTER loyalty_tier;
