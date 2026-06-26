-- Support multiple service lines per appointment, including duplicate services.
CREATE TABLE IF NOT EXISTS appointment_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    service_id INT NOT NULL,
    sequence_no INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_appointment_services_appointment (appointment_id),
    INDEX idx_appointment_services_service (service_id),
    CONSTRAINT fk_appointment_services_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_services_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Backfill existing appointments as a single service line.
INSERT INTO appointment_services (appointment_id, service_id, sequence_no)
SELECT a.id, a.service_id, 1
FROM appointments a
LEFT JOIN appointment_services aps
  ON aps.appointment_id = a.id
WHERE a.service_id IS NOT NULL
  AND aps.id IS NULL;
