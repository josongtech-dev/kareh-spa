-- Track original quantity for derived per-unit cost calculations
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS initial_quantity DECIMAL(10,2) DEFAULT 0 AFTER quantity_remaining;
