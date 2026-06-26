-- Track every restock and consumption movement for products
CREATE TABLE IF NOT EXISTS product_stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    movement_type ENUM('restock', 'consumption', 'adjustment') NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(12,4) DEFAULT 0,
    total_cost DECIMAL(12,2) DEFAULT 0,
    previous_quantity DECIMAL(10,2) DEFAULT 0,
    new_quantity DECIMAL(10,2) DEFAULT 0,
    price_vs_initial_amount DECIMAL(12,4) DEFAULT 0,
    price_vs_initial_pct DECIMAL(8,4) DEFAULT 0,
    notes VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_created (product_id, created_at),
    CONSTRAINT fk_product_stock_movements_product
      FOREIGN KEY (product_id) REFERENCES products(id)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
