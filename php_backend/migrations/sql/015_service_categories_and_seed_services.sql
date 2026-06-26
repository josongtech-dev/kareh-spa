-- Create normalized service categories table
CREATE TABLE IF NOT EXISTS service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Link services to categories
ALTER TABLE services
    ADD COLUMN IF NOT EXISTS category_id INT NULL AFTER category;

SET @category_fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'services'
      AND CONSTRAINT_NAME = 'fk_services_category'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @category_fk_sql := IF(
    @category_fk_exists = 0,
    'ALTER TABLE services ADD CONSTRAINT fk_services_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL',
    'SELECT 1'
);

PREPARE stmt_category_fk FROM @category_fk_sql;
EXECUTE stmt_category_fk;
DEALLOCATE PREPARE stmt_category_fk;

-- Seed categories (idempotent)
INSERT INTO service_categories (name, description, status, display_order)
VALUES
    ('Kareh''s Barbershop', 'Glow up starts here', 'Active', 1),
    ('Professional Coloring', 'Vibrant and lasting color treatments', 'Active', 2),
    ('The Spa Sanctuary', 'Unknot your hair and stress', 'Active', 3),
    ('Nails & Hair Art', 'Tips, toes and total glow', 'Active', 4)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    status = VALUES(status),
    display_order = VALUES(display_order);

-- Backfill category_id for old records before reseed
UPDATE services s
JOIN service_categories sc ON sc.name = s.category
SET s.category_id = sc.id
WHERE s.category_id IS NULL;

-- Rebuild service catalog from static list.
-- NOTE: this migration is destructive for the services table.
DELETE FROM session_services;
UPDATE appointments SET service_id = NULL;
UPDATE sessions SET service_id = NULL;
DELETE FROM services;

INSERT INTO services (name, description, price, duration, category, category_id, image_url, status)
VALUES
    ('Executive Shave', 'Signature hot towel finish', 1000.00, '45 min', 'Kareh''s Barbershop', (SELECT id FROM service_categories WHERE name = 'Kareh''s Barbershop'), '', 'Active'),
    ('Kids Shave', 'Gentle and trendy styles', 500.00, '30 min', 'Kareh''s Barbershop', (SELECT id FROM service_categories WHERE name = 'Kareh''s Barbershop'), '', 'Active'),
    ('Beard Sculpture', 'Trim and shape definition', 600.00, '35 min', 'Kareh''s Barbershop', (SELECT id FROM service_categories WHERE name = 'Kareh''s Barbershop'), '', 'Active'),
    ('Precision Hairline', 'Sharp and clean finish', 400.00, '25 min', 'Kareh''s Barbershop', (SELECT id FROM service_categories WHERE name = 'Kareh''s Barbershop'), '', 'Active'),

    ('Dye (Subaru / Tancho)', 'Rich, deep tones', 1200.00, '60 min', 'Professional Coloring', (SELECT id FROM service_categories WHERE name = 'Professional Coloring'), '', 'Active'),
    ('Cream of Nature Dye', 'Nourishing formula', 2000.00, '75 min', 'Professional Coloring', (SELECT id FROM service_categories WHERE name = 'Professional Coloring'), '', 'Active'),
    ('Black Heena / Shampoo', 'Organic and safe dyeing', 800.00, '50 min', 'Professional Coloring', (SELECT id FROM service_categories WHERE name = 'Professional Coloring'), '', 'Active'),
    ('Beard Dye Specialists', 'Uniform color blending', 700.00, '40 min', 'Professional Coloring', (SELECT id FROM service_categories WHERE name = 'Professional Coloring'), '', 'Active'),

    ('Full Body Massage', 'Relaxing aromatherapy', 3500.00, '90 min', 'The Spa Sanctuary', (SELECT id FROM service_categories WHERE name = 'The Spa Sanctuary'), '', 'Active'),
    ('Body Waxing', 'Smooth skin treatment', 2000.00, '60 min', 'The Spa Sanctuary', (SELECT id FROM service_categories WHERE name = 'The Spa Sanctuary'), '', 'Active'),
    ('Deep Cleansing Facials', 'Rejuvenating skin glow', 3000.00, '75 min', 'The Spa Sanctuary', (SELECT id FROM service_categories WHERE name = 'The Spa Sanctuary'), '', 'Active'),
    ('Make up & Artistry', 'Bridal and event makeup', 3500.00, '90 min', 'The Spa Sanctuary', (SELECT id FROM service_categories WHERE name = 'The Spa Sanctuary'), '', 'Active'),

    ('Braiding & Weaving', 'Master craftsmanship', 2500.00, '120 min', 'Nails & Hair Art', (SELECT id FROM service_categories WHERE name = 'Nails & Hair Art'), '', 'Active'),
    ('Gel, Tips & Acrylic', 'Professional nail art', 2000.00, '75 min', 'Nails & Hair Art', (SELECT id FROM service_categories WHERE name = 'Nails & Hair Art'), '', 'Active'),
    ('Signature Manicure', 'Detail-oriented care', 1500.00, '60 min', 'Nails & Hair Art', (SELECT id FROM service_categories WHERE name = 'Nails & Hair Art'), '', 'Active'),
    ('Luxury Pedicure', 'Full massage and scrub', 2000.00, '75 min', 'Nails & Hair Art', (SELECT id FROM service_categories WHERE name = 'Nails & Hair Art'), '', 'Active');
