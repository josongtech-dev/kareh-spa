-- Store initial and remaining inventory valuation
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS initial_cost DECIMAL(12,2) DEFAULT 0 AFTER cost_price,
  ADD COLUMN IF NOT EXISTS remaining_value DECIMAL(12,2) DEFAULT 0 AFTER initial_cost;
