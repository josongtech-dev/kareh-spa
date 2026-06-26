CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actor_type VARCHAR(20) NOT NULL DEFAULT 'staff',
    actor_id INT DEFAULT NULL,
    actor_name VARCHAR(255) DEFAULT NULL,
    category VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    entity_type VARCHAR(50) DEFAULT NULL,
    entity_id INT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_category (category),
    INDEX idx_activity_actor (actor_type, actor_id),
    INDEX idx_activity_created_at (created_at),
    INDEX idx_activity_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
