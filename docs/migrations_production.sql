-- ============================================================
-- Kareh Spa — Production Migrations
-- Run this file to apply all new tables/columns added
-- by recent feature implementations.
-- ============================================================

-- ============================================================
-- 1. service_products: linking table for product auto-consumption
-- ============================================================
CREATE TABLE IF NOT EXISTS `service_products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `service_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_service_product` (`service_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. staffs: add commission_rate column for per-staff overrides
-- ============================================================
ALTER TABLE `staffs`
    ADD COLUMN `commission_rate` DECIMAL(5,2) NULL DEFAULT NULL AFTER `skill`;

-- ============================================================
-- 3. rewards: redeemable loyalty rewards catalogue
-- ============================================================
CREATE TABLE IF NOT EXISTS `rewards` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `points_required` INT(11) NOT NULL DEFAULT 0,
    `stock` INT(11) NOT NULL DEFAULT 0 COMMENT '0 = unlimited',
    `image_path` VARCHAR(255) DEFAULT NULL,
    `status` ENUM('Active','Inactive') DEFAULT 'Active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. redemptions: member reward redemption history
-- ============================================================
CREATE TABLE IF NOT EXISTS `redemptions` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `member_id` INT(11) NOT NULL,
    `reward_id` INT(11) NOT NULL,
    `points_spent` INT(11) NOT NULL DEFAULT 0,
    `status` ENUM('Pending','Approved','Rejected','Cancelled') DEFAULT 'Pending',
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `member_id` (`member_id`),
    KEY `reward_id` (`reward_id`),
    CONSTRAINT `redemptions_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `redemptions_ibfk_2` FOREIGN KEY (`reward_id`) REFERENCES `rewards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. system_settings: loyalty earn rate config
-- ============================================================
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `value_type`) VALUES
    ('loyalty_earn_rate', '10', 'number'),
    ('loyalty_earn_unit', '100', 'number');
