SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS session_services;
DROP TABLE IF EXISTS sessions;

CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_code VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    client_phone VARCHAR(20) NULL,
    client_email VARCHAR(100) NULL,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    billing_status ENUM('unbilled', 'paid') NOT NULL DEFAULT 'unbilled',
    paid_at DATETIME NULL,
    payment_transaction_code VARCHAR(120) NULL,
    notes TEXT,
    appointment_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE session_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    service_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    assigned_staff_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_staff_id) REFERENCES staffs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
