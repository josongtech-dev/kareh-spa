-- Migration to create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_code VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    staff_id INT,
    service_id INT,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('In Progress', 'Finalizing', 'Completed', 'Voided') DEFAULT 'In Progress',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
