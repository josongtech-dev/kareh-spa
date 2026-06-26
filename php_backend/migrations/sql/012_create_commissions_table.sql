-- Create commissions table to track staff earnings
CREATE TABLE IF NOT EXISTS commissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    session_id INT DEFAULT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL COMMENT 'Percentage rate at the time of session',
    payment_status ENUM('Pending', 'Paid') DEFAULT 'Pending',
    payout_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
