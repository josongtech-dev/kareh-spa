-- Expand products model for retail + internal inventory tracking
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type ENUM('Saleable', 'Internal Use') DEFAULT 'Saleable' AFTER category,
  ADD COLUMN IF NOT EXISTS tracking_mode ENUM('Units', 'Level') DEFAULT 'Units' AFTER product_type,
  ADD COLUMN IF NOT EXISTS quantity_remaining DECIMAL(10,2) NULL AFTER stock_quantity,
  ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(20) DEFAULT 'units' AFTER quantity_remaining,
  ADD COLUMN IF NOT EXISTS reorder_level DECIMAL(10,2) DEFAULT 0 AFTER quantity_unit,
  ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0 AFTER price;
