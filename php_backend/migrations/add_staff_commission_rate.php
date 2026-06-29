<?php
/**
 * Add commission_rate column to staffs table for per-staff commission rate overrides.
 */
$migrationPath = __DIR__ . '/../config/db.php';
if (!file_exists($migrationPath)) {
    die("Cannot find db.php at $migrationPath\n");
}
$conn = require $migrationPath;

$sql = "ALTER TABLE staffs ADD COLUMN commission_rate DECIMAL(5,2) NULL DEFAULT NULL AFTER skill";

if ($conn->query($sql)) {
    echo "Migration successful: Added commission_rate to staffs table.\n";
} else {
    echo "Migration error: " . $conn->error . "\n";
}

$conn->close();
