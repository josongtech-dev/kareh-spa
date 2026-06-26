-- Run this file directly in phpMyAdmin / MySQL client on localhost (no migrate runner).
-- Creates the expenses table on your local database (e.g. kareh_spa).

CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    expense_date DATE NOT NULL,
    purpose TEXT NOT NULL,
    transaction_code VARCHAR(120) NOT NULL DEFAULT '',
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'confirmed') NOT NULL DEFAULT 'pending',
    created_by_staff_id INT NULL,
    confirmed_at DATETIME NULL,
    confirmed_by_staff_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_expenses_status (status),
    INDEX idx_expenses_expense_date (expense_date),
    CONSTRAINT fk_expenses_created_by FOREIGN KEY (created_by_staff_id) REFERENCES staffs(id) ON DELETE SET NULL,
    CONSTRAINT fk_expenses_confirmed_by FOREIGN KEY (confirmed_by_staff_id) REFERENCES staffs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
