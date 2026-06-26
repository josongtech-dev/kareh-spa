-- Offers that can be applied to one or many services.
CREATE TABLE IF NOT EXISTS service_offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  discount_type ENUM('percent', 'amount') NOT NULL DEFAULT 'percent',
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS service_offer_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  offer_id INT NOT NULL,
  service_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_offer_service (offer_id, service_id),
  CONSTRAINT fk_offer_services_offer FOREIGN KEY (offer_id) REFERENCES service_offers(id) ON DELETE CASCADE,
  CONSTRAINT fk_offer_services_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Track the portion of discount coming from active offers (manual discount remains in discount_type/value).
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS offer_discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER discount_amount;
