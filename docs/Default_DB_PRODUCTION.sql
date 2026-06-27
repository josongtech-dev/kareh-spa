-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 26, 2026 at 02:30 PM
-- Server version: 11.8.6-MariaDB-log
-- PHP Version: 7.2.34
--
-- PRODUCTION SEED: Schema + reference data only.
-- All transactional / operational tables are emptied.
--
-- SAFE TO RE-IMPORT: Uses CREATE TABLE IF NOT EXISTS and INSERT IGNORE.
-- All indexes and constraints are inlined into CREATE TABLE (no standalone
-- ALTER TABLE ADD KEY / ADD CONSTRAINT), so no "multiple primary key" or
-- "duplicate constraint" errors when re-importing over an existing DB.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `actor_type` varchar(20) NOT NULL DEFAULT 'staff',
  `actor_id` int(11) DEFAULT NULL,
  `actor_name` varchar(255) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  INDEX `idx_activity_category` (`category`),
  INDEX `idx_activity_actor` (`actor_type`, `actor_id`),
  INDEX `idx_activity_created_at` (`created_at`),
  INDEX `idx_activity_entity` (`entity_type`, `entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `addons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `material_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `labour_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bulk_after` int(11) DEFAULT NULL,
  `bulk_labour_price` decimal(10,2) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `appointment_manage_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appointment_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `token_expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  UNIQUE KEY `uq_appointment_manage_tokens_appointment` (`appointment_id`),
  CONSTRAINT `fk_appointment_manage_tokens_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appointment_code` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(100) DEFAULT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `service_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointment_code` (`appointment_code`),
  KEY `service_id` (`service_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `appointment_services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appointment_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `sequence_no` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  INDEX `idx_appointment_services_appointment` (`appointment_id`),
  INDEX `idx_appointment_services_service` (`service_id`),
  CONSTRAINT `fk_appointment_services_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appointment_services_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `commission_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `commission_pool_rate` decimal(5,2) NOT NULL COMMENT 'Percent of gross allocated to commission pool',
  `tax_rate` decimal(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Percent of gross withheld as tax',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `commission_rules`
--

INSERT IGNORE INTO `commission_rules` (`id`, `name`, `commission_pool_rate`, `tax_rate`, `sort_order`, `is_default`, `created_at`, `updated_at`) VALUES
(6, 'hair dresser (cap1)', 47.20, 12.00, 0, 0, '2026-04-20 11:45:06', '2026-04-20 11:45:06'),
(7, 'hair dresser (cap2)', 56.00, 12.00, 0, 0, '2026-04-20 11:46:29', '2026-04-20 11:46:29'),
(8, 'barber', 46.00, 10.00, 0, 0, '2026-04-20 11:47:22', '2026-04-20 11:47:22'),
(9, 'Beautician', 47.20, 12.00, 0, 0, '2026-04-20 11:48:46', '2026-04-20 11:48:46'),
(10, 'Shampoo girl', 47.20, 12.00, 0, 0, '2026-04-20 11:50:11', '2026-04-20 11:50:11');

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `commissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `session_service_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `source_type` enum('primary','addon') DEFAULT 'primary',
  `amount` decimal(10,2) NOT NULL,
  `gross_amount` decimal(10,2) DEFAULT 0.00,
  `commission_pool_amount` decimal(10,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `staff_amount` decimal(10,2) DEFAULT 0.00,
  `service_profit_amount` decimal(10,2) DEFAULT 0.00,
  `commission_rate` decimal(5,2) NOT NULL COMMENT 'Percentage rate at the time of session',
  `payment_status` enum('Pending','Paid') DEFAULT 'Pending',
  `payment_method` enum('Bank','Mobile Money','Cash') DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `settled_at` datetime DEFAULT NULL,
  `settlement_notes` text DEFAULT NULL,
  `handed_over_by` varchar(120) DEFAULT NULL,
  `settlement_batch_id` int(11) DEFAULT NULL,
  `payout_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  KEY `fk_commissions_service` (`service_id`),
  KEY `idx_commissions_settlement_batch` (`settlement_batch_id`),
  CONSTRAINT `commissions_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commissions_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_commissions_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_commissions_session_service` FOREIGN KEY (`session_service_id`) REFERENCES `session_services` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_commissions_settlement_batch` FOREIGN KEY (`settlement_batch_id`) REFERENCES `commission_settlement_batches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `commission_settlement_batches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `period_month` varchar(7) DEFAULT NULL COMMENT 'Service month (YYYY-MM) used when bulk-settling',
  `payment_method` varchar(32) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `settled_at` datetime DEFAULT NULL,
  `settlement_notes` text DEFAULT NULL,
  `handed_over_by` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `commission_settlement_batches_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `expense_date` date NOT NULL,
  `purpose` text NOT NULL,
  `transaction_code` varchar(120) NOT NULL DEFAULT '',
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','confirmed') NOT NULL DEFAULT 'pending',
  `created_by_staff_id` int(11) DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `confirmed_by_staff_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  INDEX `idx_expenses_status` (`status`),
  INDEX `idx_expenses_expense_date` (`expense_date`),
  CONSTRAINT `fk_expenses_created_by` FOREIGN KEY (`created_by_staff_id`) REFERENCES `staffs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expenses_confirmed_by` FOREIGN KEY (`confirmed_by_staff_id`) REFERENCES `staffs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `inhouse_service_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `preferred_date` date DEFAULT NULL,
  `preferred_time` time DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','approved','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_inhouse_member` (`member_id`),
  KEY `fk_inhouse_service` (`service_id`),
  CONSTRAINT `fk_inhouse_member` FOREIGN KEY (`member_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inhouse_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(128) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  INDEX `idx_password_resets_user_id` (`user_id`),
  CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `payment_audit_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `event_type` varchar(40) NOT NULL COMMENT 'initiated, ipn_received, callback_received, status_checked, confirmed, failed, cancelled, amount_mismatch',
  `event_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `pesapal_order_tracking_id` varchar(64) DEFAULT NULL,
  `pesapal_merchant_reference` varchar(80) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  INDEX `idx_payment_audit_session_id` (`session_id`),
  INDEX `idx_payment_audit_event_type` (`event_type`),
  INDEX `idx_payment_audit_created_at` (`created_at`),
  INDEX `idx_payment_audit_tracking_id` (`pesapal_order_tracking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT 0.00,
  `initial_cost` decimal(12,2) DEFAULT 0.00,
  `remaining_value` decimal(12,2) DEFAULT 0.00,
  `stock_quantity` int(11) DEFAULT 0,
  `quantity_remaining` decimal(10,2) DEFAULT NULL,
  `initial_quantity` decimal(10,2) DEFAULT 0.00,
  `quantity_unit` varchar(20) DEFAULT 'units',
  `reorder_level` decimal(10,2) DEFAULT 0.00,
  `status` enum('In Stock','Low Stock','Out of Stock') DEFAULT 'In Stock',
  `category` varchar(50) DEFAULT NULL,
  `product_type` enum('Saleable','Internal Use') DEFAULT 'Saleable',
  `tracking_mode` enum('Units','Level') DEFAULT 'Units',
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT IGNORE INTO `products` (`id`, `name`, `sku`, `description`, `price`, `cost_price`, `initial_cost`, `remaining_value`, `stock_quantity`, `quantity_remaining`, `initial_quantity`, `quantity_unit`, `reorder_level`, `status`, `category`, `product_type`, `tracking_mode`, `image_url`, `created_at`) VALUES
(5, 'Subaru dye', 'Dye', 'Dye', 100.00, 50.00, 250.00, 2500.00, 50, NULL, 5.00, 'units', 5.00, 'In Stock', 'Hair Care', 'Saleable', 'Units', '', '2026-05-03 19:51:58');

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `product_stock_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `movement_type` enum('restock','consumption','adjustment') NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_cost` decimal(12,4) DEFAULT 0.0000,
  `total_cost` decimal(12,2) DEFAULT 0.00,
  `previous_quantity` decimal(10,2) DEFAULT 0.00,
  `new_quantity` decimal(10,2) DEFAULT 0.00,
  `price_vs_initial_amount` decimal(12,4) DEFAULT 0.0000,
  `price_vs_initial_pct` decimal(8,4) DEFAULT 0.0000,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product_created` (`product_id`,`created_at`),
  CONSTRAINT `fk_product_stock_movements_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `schema_migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `migration` (`migration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schema_migrations`
--

INSERT IGNORE INTO `schema_migrations` (`id`, `migration`, `checksum`, `applied_at`) VALUES
(1, '001_initial_schema.sql', '4aba58587602559fbe44603683b276a2eeb653d70f2eb38a77b9fda4e6911464', '2026-04-14 08:04:56'),
(2, '002_update_staff_table.sql', 'f8ca80b15ed304719b6ef86b47617f99e3877e522be552ec8acbf3d4148bb93d', '2026-04-14 08:04:56'),
(3, '003_create_staffs_table.sql', 'c33a3450dd82379aa484be55628f4a439cdb7a983c8dace487a846ecc51c7d6c', '2026-04-14 08:04:56'),
(4, '004_add_activation_password.sql', '7575c437f89e0518f5cc79acb9cfe69d028b519a0494395ac6e551f73b6daf15', '2026-04-14 08:04:56'),
(5, '005_add_password_to_staffs.sql', '54fb9fb3692986357dfd17e8785a4236bfe02d008fe468102ffeac7833cc5414', '2026-04-14 08:04:56'),
(6, '006_add_username_and_uniqueness.sql', '5c1c88aa237cd67ec326f6339a144b1671165984e71b1a6c6d8e59995d88c539', '2026-04-14 08:04:56'),
(7, '007_add_created_by_to_staffs.sql', '320bf5ea1d4aaf2b202dd6d819a8ea66ea88cfb62dbe8a101d2ee6322f4fdf10', '2026-04-14 08:04:56'),
(8, '007_update_services.sql', '74f63658043e599789e855134f8760b1181b1c3f0c3d436ce2e92660e44ccd7c', '2026-04-14 08:04:56'),
(9, '008_create_sessions_table.sql', '0c38e1e0df73aac321e51d033da7d8b9b4e3aa7788c7610c1e8180aeb1e0595c', '2026-04-14 08:04:56'),
(10, '009_update_appointments_table.sql', '41001cf6405349a10fd6e1c01f1fa5587efb3713b6d1e8b36615fac97be250aa', '2026-04-14 08:04:56'),
(11, '010_update_users_for_loyalty.sql', '4c0dffdf79bb99f5867420af1cb1d83e9b7b529072b694216663ea48a3855af2', '2026-04-14 08:04:56'),
(12, '011_update_products_table.sql', 'aad7adaf6cd780e738a0250536fcabd3e7cc8196ae875f22ed9c272672f12d96', '2026-04-14 08:04:56'),
(13, '012_create_commissions_table.sql', '465af17357131c94c777426eef92041e08cbcc41d716139f7003b5e614655576', '2026-04-14 08:04:56'),
(14, '013_support_multiple_services_per_session.sql', '5cc3127ac5fb92c528992d228a78ba260bb131fb9f58e9045d7495d7beaa2e65', '2026-04-14 08:04:56'),
(15, '014_link_sessions_to_appointments.sql', '575166c86d27fab519ce755372d8da00ab86e7abc22f2ba4a643e0af38b2c792', '2026-04-14 08:04:56'),
(16, '015_service_categories_and_seed_services.sql', '1b2aff8d231babad31303fedbaeb7f28bb2e6548bd1b7ae8ed5061a970e3ac28', '2026-04-14 11:28:39'),
(17, '016_create_inhouse_service_requests_table.sql', 'ed50c71334a993499a1e08f7833ca085eb34f023a9098e0b50cfea412aae8ff7', '2026-04-14 11:56:18'),
(18, '017_expand_products_inventory_model.sql', 'f5285b863f4abb16283125740bef25ba87225add739815158139bb1294b2ac47', '2026-04-15 08:57:19'),
(19, '018_add_initial_quantity_to_products.sql', '2f36be8b0e01890c27d7b0f95233a7283a13fcab6e19036b0fe5037aa0facc16', '2026-04-15 09:21:04'),
(20, '019_add_cost_valuation_fields_to_products.sql', '4cbd4053c549fcc32a3403869a24f253772de2b727cffea9dc4233e447fcb5cb', '2026-04-15 09:25:41'),
(21, '020_create_product_stock_movements.sql', 'eee41d6737bca38789263e6d0e8d05e89098eb6ce25e3b09df43c3fef20a92bd', '2026-04-15 09:59:33'),
(22, '021_expand_commissions_for_service_split.sql', '1fecdddda8def36acaed57f31713482ffb624e6593f40b7af3d38897008c76ce', '2026-04-15 11:21:09'),
(23, '022_add_commission_settlement_metadata.sql', '74b6440cdf5151b8d6176b9a5ff49b0f87fe3227e04ccc3ecce599fb46d901db', '2026-04-15 11:44:13'),
(24, '023_create_system_settings_table.sql', '3355379aca20028a9524e4f5625c511e920bacb430d213ab8d062200d228c33f', '2026-04-16 10:24:31'),
(25, '024_add_finance_settings_defaults.sql', 'd1c0e5b27093be9e3b61897daf331e35ab974a512edbe9cccd7d800bc926b3d9', '2026-04-16 10:45:34'),
(26, '025_add_session_contact_and_feedback.sql', 'f02248561dee3e22bc0dbceb0ff8cf963f123c98e64117586bc8dd8d49941d36', '2026-04-17 10:30:03'),
(27, '026_add_feedback_view_tracking.sql', '22026bf91ad3e4a1599339ce74d34ddc6335fbaa1749a13be7e4e9e3cfe439a2', '2026-04-17 10:30:03'),
(28, '027_add_appointment_management_tokens.sql', '7623fcbe563135beaf222072cdabf9c4c348ce65ea6086fc26216e56ccc2ed1e', '2026-04-17 10:43:53'),
(29, '028_service_line_staffing_and_commission_link.sql', '613c3bad57d6f7b9ab37ad7ccce30cff46dcf19f0f8f0314f180a75f9c79e30e', '2026-04-17 11:14:24'),
(30, '029_add_session_billing_workflow_fields.sql', '65746370aa559d2797fa06acf7a125d0fbe7887d43d5b7887eb53a8bc36b4eae', '2026-04-17 12:44:21'),
(31, '029_commission_rules_and_service_link.sql', '9731b7cbcb0616053281087c81abe430bdb6040b8e127469de87a30f43b8001c', '2026-04-18 07:46:06'),
(32, '030_ensure_commission_rules_table.sql', 'dd819bed4703ba1c57eac3a96406c3974220d565254d83cb90fd81fa30eacfa3', '2026-04-18 07:46:06'),
(33, '031_commission_rules_standalone.sql', '3f1fb57ad51c9cfa084e4e5bcb163f24685d665798ba600c2959e7b05b543fc4', '2026-04-18 08:01:16'),
(34, '032_ensure_services_commission_rule_id.sql', 'e9ba15c1dd1cf8af21eb7d10be3a53967454fbc06dbed1e0d05a0a4208083d34', '2026-04-19 11:30:02'),
(35, '033_commission_settlement_batches.sql', 'bdc5016df648e476b790dfa896da3f4c3fc7268d899d73bdfd6cd8efc50d3a56', '2026-04-19 22:08:13'),
(36, '034_ensure_services_image_url.sql', '', '2026-06-26 13:40:00'),
(37, '035_create_service_offers.sql', '', '2026-06-26 13:40:00'),
(38, '036_create_expenses_table.sql', '', '2026-06-26 13:40:00'),
(39, '037_create_appointment_services_table.sql', '', '2026-06-26 13:40:00'),
(40, '038_create_token_blacklist.sql', '', '2026-06-26 13:40:00'),
(41, '039_create_password_resets_table.sql', '', '2026-06-26 13:40:00'),
(42, '040_simplify_sessions.sql', '', '2026-06-26 13:40:00'),
(43, '042_add_created_by_to_sessions.sql', '', '2026-06-26 13:40:00'),
(44, '043_add_pesapal_payment_fields.sql', '', '2026-06-26 13:40:00'),
(45, '044_expand_billing_status_and_pesapal.sql', '', '2026-06-26 13:40:00'),
(46, '045_create_addons_and_session_addons.sql', '', '2026-06-26 13:40:00'),
(47, '046_create_payment_audit_log.sql', '', '2026-06-26 13:40:00'),
(48, '047_add_session_services_default_flag.sql', '', '2026-06-26 13:40:00'),
(49, '048_create_activity_log.sql', '', '2026-06-26 13:40:00');

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `service_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_categories`
--

INSERT IGNORE INTO `service_categories` (`id`, `name`, `description`, `status`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'Kareh\'s Barbershop', 'Glow up starts here', 'Active', 1, '2026-04-14 11:28:38', '2026-04-14 11:28:38'),
(2, 'Professional Coloring', 'Vibrant and lasting color treatments', 'Active', 2, '2026-04-14 11:28:38', '2026-04-14 11:28:38'),
(3, 'The Spa Sanctuary', 'Unknot your hair and stress', 'Active', 3, '2026-04-14 11:28:38', '2026-04-14 11:28:38'),
(4, 'Nails & Hair Art', 'Tips, toes and total glow', 'Active', 4, '2026-04-14 11:28:38', '2026-04-14 11:28:38'),
(5, 'Nail art', NULL, 'Active', NULL, '2026-05-04 11:14:21', '2026-05-04 11:14:21');

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `service_offer_services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `offer_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_offer_service` (`offer_id`,`service_id`),
  CONSTRAINT `fk_offer_services_offer` FOREIGN KEY (`offer_id`) REFERENCES `service_offers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_offer_services_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `service_offers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percent','amount') NOT NULL DEFAULT 'percent',
  `discount_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration` varchar(50) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `commission_rule_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_services_category` (`category_id`),
  KEY `fk_services_commission_rule` (`commission_rule_id`),
  CONSTRAINT `fk_services_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_services_commission_rule` FOREIGN KEY (`commission_rule_id`) REFERENCES `commission_rules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT IGNORE INTO `services` (`id`, `name`, `description`, `price`, `duration`, `category`, `category_id`, `status`, `commission_rule_id`, `image_url`, `created_at`) VALUES
(23, 'Shave', 'Professional shave for different styles', 400.00, '40 min', 'Kareh\'s Barbershop', 1, 'Active', 8, 'uploads/services/fbc64cd2e138ccadd1a72010bbacb304.jpeg', '2026-04-21 04:28:25'),
(27, 'Coffee scrub', '', 600.00, '10min', 'Kareh\'s Barbershop', 1, 'Active', 10, '', '2026-05-01 16:54:49'),
(28, 'Apricot Scrub', '', 400.00, '10min', 'Kareh\'s Barbershop', 1, 'Active', 10, '', '2026-05-01 16:55:54'),
(31, 'Basic Facial Therapy', '', 2000.00, '1hr', 'The Spa Sanctuary', 3, 'Active', 10, '', '2026-05-01 16:58:17'),
(32, 'Deep Tissue Massage', '', 3500.00, '1hr 10min', 'The Spa Sanctuary', 3, 'Active', 10, '', '2026-05-01 16:58:54'),
(33, 'Sweedish Massage', '', 3000.00, '1hr', 'The Spa Sanctuary', 3, 'Active', 10, '', '2026-05-01 16:59:24'),
(34, 'Back Massage', '', 2000.00, '45min', 'The Spa Sanctuary', 3, 'Active', 10, '', '2026-05-01 16:59:52'),
(35, 'Body scrub', '', 4000.00, '2hrs', 'The Spa Sanctuary', 3, 'Active', NULL, '', '2026-05-01 17:00:26'),
(36, 'Scrub Steaming', '', 1500.00, '30min', 'The Spa Sanctuary', 3, 'Active', NULL, '', '2026-05-01 17:01:41'),
(37, 'Armpits Waxing', '', 800.00, '20min', 'The Spa Sanctuary', 3, 'Active', NULL, '', '2026-05-01 17:02:23'),
(38, 'Waxing with steam', '', 1000.00, '30min', 'The Spa Sanctuary', 3, 'Active', 10, '', '2026-05-01 17:02:53'),
(39, 'Brazillian Waxing', '', 2000.00, '45min', 'The Spa Sanctuary', 3, 'Active', 10, '', '2026-05-01 17:03:28'),
(40, 'Leg waxing', '', 1500.00, '30min', 'The Spa Sanctuary', 3, 'Active', NULL, '', '2026-05-01 17:03:56'),
(41, 'Arm waxing', '', 1000.00, '20min', 'The Spa Sanctuary', 3, 'Active', NULL, '', '2026-05-01 17:04:26'),
(42, 'Kid Shave', '', 250.00, '20min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-01 17:05:07'),
(43, 'Dye(Black shampoo)', 'dye', 800.00, '30 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-03 19:27:56'),
(44, 'Straightening', 'streighten', 300.00, '15', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 19:48:22'),
(45, 'Wash & blow', 'wash', 400.00, '15', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 19:50:25'),
(46, 'Full blowdry', 'blowdry', 500.00, '15', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 19:51:38'),
(47, 'Leave in Treatment', 'treatment', 1000.00, '30 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 19:52:40'),
(48, 'Deep Treatment', 'deep treatment', 1500.00, '45 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 19:54:31'),
(49, 'Drop lines', 'lines', 600.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 19:56:25'),
(50, 'Up-do lines', '', 800.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:01:20'),
(51, 'Lines extenxion', 'extend', 1000.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:02:19'),
(52, 'Knotless Braids kids', 'braiding', 2000.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:03:22'),
(53, 'Braids kids', 'braiding', 2000.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:04:01'),
(54, 'DREADLOC INST', 'dreads', 3500.00, '60 min', 'Nails & Hair Art', 4, 'Active', NULL, '', '2026-05-03 20:05:52'),
(55, 'dreadlocs retouch', 'retouch', 1800.00, '90', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 20:06:46'),
(56, 'Sisterlocs retie', 'retie', 3000.00, '90', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:07:37'),
(57, 'Interlocking', 'interloc', 2000.00, '100', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:11:08'),
(58, 'styling', 'style', 300.00, '15', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 20:11:50'),
(59, 'styling', 'style', 800.00, '15 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:12:25'),
(60, 'Own deep treatment', '', 1000.00, '30 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 09:31:07'),
(61, 'braiding adults', 'braid', 2500.00, '100', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:32:29'),
(62, 'Weaving', 'weave', 1800.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:32:57'),
(63, 'Ghanians', '', 2000.00, '120', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:33:31'),
(64, 'Twist outs', 'twist', 2000.00, '120', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:35:13'),
(65, 'Crocheting', '', 1500.00, '120', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:35:38'),
(66, 'Chem retouch(own)', 'chem', 1800.00, '60 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 09:36:26'),
(68, 'Virgin Application', 'application', 3000.00, '90', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 09:38:07'),
(69, 'Undo', 'reopen', 300.00, '30 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:41:14'),
(70, 'Wig laundry', 'wig wash', 1000.00, '30 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 09:42:20'),
(71, 'Matuta/twist', 'twist', 1000.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:42:55'),
(72, 'WASH&SET', 'setting', 500.00, '30 min', 'Nails & Hair Art', 4, 'Active', NULL, '', '2026-05-04 09:43:24'),
(73, 'Finger curls', 'curls', 1800.00, '60 min', 'Nails & Hair Art', 4, 'Active', NULL, '', '2026-05-04 09:44:28'),
(75, 'Chemical Retouch(ours)', 'retouch', 2500.00, '30 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 10:23:03'),
(76, 'FLAT IRON', 'ironing', 800.00, '60 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 10:24:02'),
(77, 'cream of nature', 'dye', 2500.00, '90', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 10:28:35'),
(78, 'Heena dye', '', 1500.00, '60 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 10:30:04'),
(79, 'Black Shampoo', '', 1000.00, '45 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 10:30:29'),
(80, 'Dye subaru', '', 1100.00, '45 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 10:32:45'),
(81, 'heena barber', '', 1100.00, '45 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 10:34:04'),
(82, 'Tancho dye', 'dye', 1150.00, '45 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 10:35:02'),
(83, 'Dye cream nature barber', 'dye', 2500.00, '60 min', 'Kareh\'s Barbershop', 1, 'Active', NULL, '', '2026-05-04 10:36:20'),
(84, 'Ladies Shave', '', 500.00, '30 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 10:38:15'),
(85, 'Texturizing', 'texturizing', 1500.00, '90', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 10:39:45'),
(86, 'Gel polish', '', 800.00, '15 min', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:46:02'),
(87, 'Manicure', 'hand wash', 1000.00, '30 min', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:46:46'),
(88, 'Manicure gel', 'gel', 1500.00, '45 min', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:47:28'),
(89, 'Pedicure', '', 1500.00, '40', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:48:03'),
(90, 'Pedicure gel', 'leg wash', 2000.00, '45', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:48:33'),
(91, 'Tips gel', 'tips', 2500.00, '60', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:49:03'),
(92, 'Builder gel', 'hardener', 2500.00, '60', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:50:01'),
(93, 'Acrylics', 'extenxions', 3500.00, '120', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:50:35'),
(94, 'razor shapping', 'shapping', 200.00, '15 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:51:09'),
(95, 'Tweezing', 'tweezer', 300.00, '30 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:51:40'),
(96, 'Threading', 'thread', 300.00, '30 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:52:09'),
(97, 'Facial Therapy', '', 2500.00, '60 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:52:34'),
(98, 'Strip lashes', 'lashes', 1000.00, '15 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:53:38'),
(99, 'cluster lashes', 'lashes', 1850.00, '45 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:54:23'),
(100, 'hybrid lashes', '', 3000.00, '45 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:54:57'),
(101, 'Gel removal,', 'removal', 500.00, '15', 'Nail art', 5, 'Active', NULL, '', '2026-05-04 10:56:28'),
(102, 'Lashes removal', 'removing lashes', 500.00, '15 min', 'The Spa Sanctuary', 3, 'Active', NULL, '', '2026-05-04 10:59:26'),
(103, 'Gum gel', 'gel', 2500.00, '45 min', 'Nail art', 5, 'Active', 9, '', '2026-05-04 11:04:41'),
(104, 'Teenage shave', 'shave', 300.00, '15 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 11:08:45'),
(105, 'Kids dye', '', 1500.00, '15 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 11:09:34'),
(106, 'Nail cutting', 'cut', 300.00, '15', 'Kareh\'s Barbershop', 1, 'Active', 9, '', '2026-05-04 11:10:15'),
(107, 'Beard Shave', '', 200.00, '15 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 11:10:48'),
(108, 'Hair cut', '', 150.00, '15', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 11:11:14'),
(109, 'BODY SCRUB', 'scrubbing', 4000.00, '90', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 11:22:45'),
(110, 'VIP Grooming', '', 2000.00, '90', 'Kareh\'s Barbershop', 1, 'Active', 9, '', '2026-05-04 11:26:42'),
(111, 'VIP SHAVE', '', 1000.00, '40 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 11:27:27'),
(112, 'PACKAGE(1)', 'FACIAL,PEDICURE,BACK MASSAGE', 6000.00, '120', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 11:29:03'),
(113, 'PACKAGE(2)', 'Massage,facial,pedicure', 7000.00, '125', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 11:29:40'),
(114, 'PACKAGE(3)', 'MANICURE,PEDICURE,MASSAGE,FACIAL', 8000.00, '140', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 11:31:44'),
(115, 'PACKAGE (4)', 'Massage,facial,bodysrub,pedicure', 1100.00, '160', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 11:34:25'),
(116, 'Beard dye', '', 600.00, '45 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 11:38:11'),
(117, 'STYLING', '', 700.00, '40 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-05 10:11:02');

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `session_addons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `addon_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `material_price` decimal(10,2) NOT NULL,
  `labour_price` decimal(10,2) NOT NULL,
  `bulk_labour_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_session_addons_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_session_addons_addon` FOREIGN KEY (`addon_id`) REFERENCES `addons` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `session_feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `token_expires_at` datetime NOT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `viewed_at` datetime DEFAULT NULL,
  `service_rating` tinyint(3) UNSIGNED DEFAULT NULL,
  `billing_rating` tinyint(3) UNSIGNED DEFAULT NULL,
  `feedback_text` text DEFAULT NULL,
  `client_name_snapshot` varchar(100) DEFAULT NULL,
  `client_email_snapshot` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  UNIQUE KEY `uq_session_feedback_session` (`session_id`),
  CONSTRAINT `fk_session_feedback_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_code` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `client_phone` varchar(20) DEFAULT NULL,
  `client_email` varchar(100) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `billing_subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_type` enum('amount','percent') NOT NULL DEFAULT 'amount',
  `discount_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `offer_discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_requested_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `payment_transaction_code` varchar(120) DEFAULT NULL,
  `pesapal_merchant_reference` varchar(80) DEFAULT NULL,
  `pesapal_order_tracking_id` varchar(64) DEFAULT NULL,
  `pesapal_redirect_url` text DEFAULT NULL,
  `pesapal_payment_method` varchar(20) DEFAULT NULL,
  `pesapal_initiated_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('In Progress','Finalizing','Completed','Voided') DEFAULT 'In Progress',
  `billing_status` enum('unbilled','payment_requested','paid','failed','cancelled') NOT NULL DEFAULT 'unbilled',
  `start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_time` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `appointment_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_code` (`session_code`),
  KEY `staff_id` (`staff_id`),
  KEY `service_id` (`service_id`),
  KEY `fk_sessions_appointment` (`appointment_id`),
  KEY `idx_sessions_billing_status` (`billing_status`),
  CONSTRAINT `fk_sessions_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `session_services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `assigned_staff_id` int(11) DEFAULT NULL,
  `is_from_appointment` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Marks services carried over from the original appointment',
  `price` decimal(10,2) NOT NULL,
  `status` enum('pending','in_progress','completed','voided') NOT NULL DEFAULT 'pending',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  KEY `idx_session_services_session_status` (`session_id`,`status`),
  KEY `idx_session_services_assigned_staff` (`assigned_staff_id`),
  CONSTRAINT `fk_session_services_assigned_staff` FOREIGN KEY (`assigned_staff_id`) REFERENCES `staffs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `session_services_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `session_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `staffs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `id_number` varchar(50) NOT NULL,
  `role` varchar(50) NOT NULL,
  `skill` varchar(100) DEFAULT NULL,
  `additional_info` text DEFAULT NULL,
  `activation_password` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `status` enum('Active','On Leave','Suspended','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `id_number` (`id_number`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staffs`
--

INSERT IGNORE INTO `staffs` (`id`, `name`, `username`, `email`, `phone`, `id_number`, `role`, `skill`, `additional_info`, `activation_password`, `password`, `image_path`, `status`, `created_at`, `updated_at`, `created_by`) VALUES
(12, 'Joseph Ongosh', 'Josongtech', 'ongoshdesktop@gmail.com', '0763640662', '38165164', 'owner', 'Developer/ Maintainer', 'System Developer and maintainer', NULL, '$2y$10$W/cxqyMJpp24LuA6fYpGzOIZ4nekvlRYsbN743I/EK0ayqRTkibVm', '', 'Active', '2026-04-20 11:30:28', '2026-05-03 08:23:05', 1),
(13, 'Solomon Orodi', 'Solo', 'solomonorody@gmail.com', '0713039001', '31764779', 'attendant', 'Nail technician', 'Nail technician', NULL, '$2y$10$zPtUhOKYV1s6umqs5hUxxOdIkHFnxCxMcEZ5FKoWTZKaiqZZH4XfW', '', 'Active', '2026-04-20 11:43:20', '2026-04-20 11:49:26', 1),
(14, 'Velma Achola', 'Miss Vee', 'velmaachola8@gmail.com', '0110545902', '41017920', 'attendant', 'Hairdresser/Beautician', 'Hairdresser/Beautician', NULL, '$2y$10$vkg5OH8jRc7ZlfUz5Mwa2exRF9If/d4MU6hHntmBX6yNWyzVbMpGW', 'uploads/4bdbdb18fc7c20ca67ec2b326e8db829.jpeg', 'Active', '2026-04-20 11:48:08', '2026-05-01 07:17:34', 1),
(15, 'Mary Wanjiru Mungai', 'Shiro', 'marymungai01@gmail.com', '0794820246', '41309623', 'attendant', 'Hairdresser/Beatician', 'Hairdresser/Beatician', NULL, '$2y$10$HOYLNHYVFxjnl46SJ9dHvOaH9A8TWSN/9/v6cwMFUt2r0TNumhVgi', '', 'Active', '2026-04-20 11:56:32', '2026-04-20 11:57:16', 1),
(16, 'Asha Naisenya', 'Asha', 'naisenyasha88@gmail.com', '0719359796', '37010717', 'attendant', 'Hairdresser/Beautician', 'Hairdresser/Beautician', NULL, '$2y$10$R/PZmDvkKyDNvaMqyrarRutgH1b.Qeo5e3CmOSyKAqjRIOcl2PyIm', '', 'Active', '2026-04-20 12:01:47', '2026-04-20 12:02:55', 1),
(17, 'TERESIA KINUTHIA', 'Triza', 'trizah4kinuthia1c@gmail.com', '0759052656', '25869540', 'attendant', 'Hairdresser/Beautician', 'Hairdresser/Beautician', NULL, '$2y$10$fkLo1rLlESz4IsU2z3vF7uaurlTwCTJIfNenRZ9iYVcqqdjV5XyYm', '', 'Active', '2026-04-20 12:11:20', '2026-04-20 12:13:15', 1),
(18, 'Lawrence Thairu', 'Lawrence', 'lawrence.sanyo100@gmail.com', '0728218911', '28644333', 'attendant', 'Nail technician/ Stylist', 'Nail technician/ Stylist', NULL, '$2y$10$SZ0GkGiYXZ1cJ42jyKph9.AtDTOCb./UwhcWvnGOM.HCDVhq.kRPK', '', 'Active', '2026-04-20 12:21:01', '2026-04-20 12:25:55', 1),
(19, 'Hannah Wanjiku', 'Hannah', 'njugunatafari@gmail.com', '0791082090', '38465088', 'attendant', 'Beautician', 'Dedicated Beautician with over 5 years of experience', NULL, '$2y$10$yyJc4uuJcdIFFCrOnTK/Y.W44jfHYC0i2TtaYRE8pFyvDlgbBdLQq', 'uploads/41de28c145220ac197562a4a73efc156.jpeg', 'Active', '2026-04-20 12:30:46', '2026-05-02 08:33:00', 1),
(20, 'Felix Wanyeki', 'Felix', 'felixfelo041@gmail.com', '0727618381', '37617875', 'attendant', 'Barber', 'Skilled Barber with over 5 years of experience', NULL, '$2y$10$JhZXrbFdjXzlIxu/Ica9DuvNFZDtuJ9oU9.2qVtfzK6TODD09.nra', 'uploads/aebb267b28f936c0297e40f4763a9e70.jpeg', 'Active', '2026-04-20 12:35:24', '2026-05-02 08:30:59', 1),
(25, 'Dismas Momanyi', 'Dismas', 'momanyid098@gmail.com', '0713 553998', '22914334', 'owner', 'management', 'Management', NULL, '$2y$10$Yust6V3Jx691..q/NEyGoeg41fcVC/tAq9uyNmFzFBmibEZu5HK8C', 'uploads/0baca0737b93d8de453d3664a3632604.jpeg', 'Active', '2026-04-21 07:13:14', '2026-04-23 19:23:27', 1),
(26, 'Mary Wangari', 'Mary', 'marycareh@gmail.com', '0727140581', '33211587', 'manager', 'management', 'Experienced Spa Manager', NULL, '$2y$10$dpXhXy06G9r6pMBYdHE8sOjTU3Z7da0AFZ.c7a58vgYQ0npCu6Jg2', 'uploads/a71bf30f302ae85fc37a824ddcac3dcc.jpeg', 'Active', '2026-05-01 06:25:31', '2026-05-02 08:29:10', 1),
(27, 'Grace', 'Grace', 'muigaigrace05@gmail.com', '0706127871', '34356696', 'attendant', 'Nail technician', 'Nailtechnician', NULL, '$2y$10$nGLr0.RPSzIageVkgA4DCe6YRqUe9emC/w0r2l332yEeKd5OEM0I6', 'uploads/4f18f69a5a6afae854e5ef2566a28244.jpeg', 'Active', '2026-05-01 07:10:50', '2026-05-02 08:26:37', 1),
(28, 'Patriciah', 'Patriciah', 'patriciahrasoa@gmail.com', '0720474157', '37683309', 'attendant', 'Hairdresser', 'Hairdresser', NULL, '$2y$10$RBalWaIjyMR/6So2cT8VYuhf81sghUKSdN.SHHAq4xDvpP/DWE6Le', 'uploads/80e5d894dde05af2347912622ac26619.jpeg', 'Active', '2026-05-01 07:14:10', '2026-05-02 08:25:55', 1),
(30, 'Allan Mwangi', 'Allan', 'allangassner0@gmail.com', '0757818141', '42865003', 'attendant', 'Barber', 'Experienced Barber with over 8 years', NULL, '$2y$10$JqL.JS4ENJFTqhIA.VrLnutzHZgaYNrT83R8465u2o4Zt9z0wUHi6', 'uploads/d1513778097bf9c52541d2a28eb53d35.jpeg', 'Active', '2026-05-02 06:26:02', '2026-05-02 08:25:08', 1);

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(120) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `value_type` enum('string','number','boolean','json') NOT NULL DEFAULT 'string',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT IGNORE INTO `system_settings` (`id`, `setting_key`, `setting_value`, `value_type`, `updated_at`) VALUES
(1, 'commission_pool_rate', '40', 'number', '2026-06-26 13:40:00'),
(2, 'commission_tax_rate', '12', 'number', '2026-06-26 13:40:00'),
(3, 'commission_staff_rate', '10', 'number', '2026-06-26 13:40:00'),
(4, 'offers_enabled', 'true', 'boolean', '2026-06-26 13:40:00'),
(5, 'offers_list', '["10% off manicure every Tuesday.","Free beard touch-up after 4 completed visits.","Members get priority weekend slots.","Birthday month facial discount."]', 'json', '2026-06-26 13:40:00'),
(6, 'staff_leaves_enabled', 'true', 'boolean', '2026-06-26 13:40:00'),
(7, 'staff_leave_default_days', '21', 'number', '2026-06-26 13:40:00'),
(8, 'staff_leave_requires_approval', 'true', 'boolean', '2026-06-26 13:40:00');

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `token_blacklist` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `token_jti` varchar(64) NOT NULL,
  `token_type` enum('customer','owner','manager','receptionist','attendant','staff','force_reset') NOT NULL DEFAULT 'customer',
  `user_id` int(10) UNSIGNED NOT NULL,
  `expires_at` int(10) UNSIGNED NOT NULL,
  `blacklisted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  INDEX `idx_token_blacklist_jti` (`token_jti`),
  INDEX `idx_token_blacklist_expires` (`expires_at`),
  INDEX `idx_token_blacklist_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','customer') DEFAULT 'customer',
  `loyalty_points` int(11) DEFAULT 0,
  `loyalty_tier` enum('Bronze','Silver','Gold') DEFAULT 'Bronze',
  `status` enum('Active','Inactive','Suspended') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT IGNORE INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `loyalty_points`, `loyalty_tier`, `status`, `created_at`, `updated_at`) VALUES
(4, 'Joseph Ongosh', 'ongoshdesktop@gmail.com', '0763640662', '$2y$10$q75GIzI0TlIxAyCisWKlrOHxpPgi49ImeUnwC2Mm82zDfdHiSBnW2', 'customer', 0, 'Bronze', 'Active', '2026-04-20 13:16:54', '2026-04-20 13:16:54');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
