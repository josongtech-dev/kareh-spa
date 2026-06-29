<?php
require_once __DIR__ . '/../config/db.php';

$tableCheck = $conn->query("SHOW TABLES LIKE 'service_products'");
if ($tableCheck && $tableCheck->num_rows === 0) {
    $sql = "CREATE TABLE service_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_service_product (service_id, product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    if ($conn->query($sql)) {
        echo "Table service_products created successfully.\n";
    } else {
        echo "Error creating table: " . $conn->error . "\n";
    }
} else {
    echo "Table service_products already exists.\n";
}
