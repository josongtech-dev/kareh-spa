CREATE TABLE IF NOT EXISTS inhouse_service_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    service_id INT NOT NULL,
    preferred_date DATE NULL,
    preferred_time TIME NULL,
    location VARCHAR(255) NOT NULL,
    notes TEXT NULL,
    status ENUM('pending', 'approved', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inhouse_member FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_inhouse_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
