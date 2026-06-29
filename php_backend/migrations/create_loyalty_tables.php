<?php
/**
 * Create rewards and redemptions tables for loyalty program.
 */
$conn = require __DIR__ . '/../config/db.php';

$tables = [];

$tables[] = "CREATE TABLE IF NOT EXISTS `rewards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `points_required` int(11) NOT NULL DEFAULT 0,
  `stock` int(11) NOT NULL DEFAULT 0 COMMENT '0 = unlimited',
  `image_path` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

$tables[] = "CREATE TABLE IF NOT EXISTS `redemptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `reward_id` int(11) NOT NULL,
  `points_spent` int(11) NOT NULL DEFAULT 0,
  `status` enum('Pending','Approved','Rejected','Cancelled') DEFAULT 'Pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  KEY `reward_id` (`reward_id`),
  CONSTRAINT `redemptions_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `redemptions_ibfk_2` FOREIGN KEY (`reward_id`) REFERENCES `rewards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

$tables[] = "INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `value_type`) VALUES
  ('loyalty_earn_rate', '10', 'number'),
  ('loyalty_earn_unit', '100', 'number')";

foreach ($tables as $sql) {
    if ($conn->query($sql)) {
        echo "OK: " . substr($sql, 0, 60) . "...\n";
    } else {
        echo "ERROR: " . $conn->error . "\n";
    }
}

$conn->close();
echo "Migration complete.\n";
