-- Update products table with SKU and status
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(50) AFTER name;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status ENUM('In Stock', 'Low Stock', 'Out of Stock') DEFAULT 'In Stock' AFTER stock_quantity;
