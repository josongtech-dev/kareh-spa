-- Create session_services table to support multiple services in one session
CREATE TABLE IF NOT EXISTS session_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    service_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optionally, we could remove service_id from sessions if we migrate data, 
-- but for simplicity now we will treat sessions.service_id as the primary service and secondary ones in this table.
-- Actually, it's better to move all services to this table for consistency.
