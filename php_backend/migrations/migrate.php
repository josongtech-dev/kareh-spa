<?php
/**
 * Database Migration Runner
 * Run this from the terminal: php migrations/migrate.php
 */

require_once __DIR__ . '/../config/db.php';

$sql_dir = __DIR__ . '/sql';
$files = array_values(array_filter(scandir($sql_dir), function ($file) use ($sql_dir) {
    return pathinfo($file, PATHINFO_EXTENSION) === 'sql' && is_file($sql_dir . '/' . $file);
}));
sort($files, SORT_NATURAL);

$allowDestructive = in_array('--allow-destructive', $argv, true);
$forceReplay = in_array('--force-replay', $argv, true);

function runMultiQuery(mysqli $conn, string $sql): bool {
    if (!$conn->multi_query($sql)) {
        return false;
    }
    do {
        if ($result = $conn->store_result()) {
            $result->free();
        }
    } while ($conn->more_results() && $conn->next_result());
    return true;
}

function hasDestructiveSql(string $sql): bool {
    if (preg_match('/\b(DROP\s+TABLE|TRUNCATE\s+TABLE|TRUNCATE)\b/i', $sql) === 1) {
        return true;
    }
    // Block DELETE without WHERE (full-table wipe). Targeted DELETE ... WHERE is allowed for migrations.
    if (preg_match('/\bDELETE\s+FROM\b/i', $sql) === 1) {
        return preg_match('/\bWHERE\b/i', $sql) !== 1;
    }
    return false;
}

// Track applied migrations to avoid re-running old files.
$schemaMigrationsSql = "
CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration VARCHAR(255) NOT NULL UNIQUE,
    checksum VARCHAR(64) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

if (!runMultiQuery($conn, $schemaMigrationsSql)) {
    echo "Failed to initialize schema_migrations: " . $conn->error . PHP_EOL;
    exit(1);
}

// Protect existing non-empty environments: baseline instead of replaying legacy scripts.
$migrationCountRes = $conn->query("SELECT COUNT(*) AS c FROM schema_migrations");
$migrationCount = $migrationCountRes ? intval($migrationCountRes->fetch_assoc()['c']) : 0;
$tableCountRes = $conn->query("SELECT COUNT(*) AS c FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME NOT IN ('schema_migrations')");
$tableCount = $tableCountRes ? intval($tableCountRes->fetch_assoc()['c']) : 0;

if ($migrationCount === 0 && $tableCount > 0 && !$forceReplay) {
    echo "Existing database detected with no migration history. Baseline mode activated for safety." . PHP_EOL;
    echo "Recording current migration files as applied without executing them..." . PHP_EOL;
    foreach ($files as $file) {
        $checksum = hash_file('sha256', $sql_dir . '/' . $file);
        $stmt = $conn->prepare("INSERT INTO schema_migrations (migration, checksum) VALUES (?, ?)");
        if ($stmt) {
            $stmt->bind_param("ss", $file, $checksum);
            $stmt->execute();
            $stmt->close();
        }
    }
    echo "Baseline completed. Create a new migration file for future schema changes." . PHP_EOL;
    $conn->close();
    exit(0);
}

echo "Starting migrations...\n";

foreach ($files as $file) {
    $sql = file_get_contents($sql_dir . '/' . $file);
    if ($sql === false) {
        echo "Error reading $file" . PHP_EOL;
        exit(1);
    }

    $checksum = hash('sha256', $sql);
    $checkStmt = $conn->prepare("SELECT checksum FROM schema_migrations WHERE migration = ?");
    $checkStmt->bind_param("s", $file);
    $checkStmt->execute();
    $existing = $checkStmt->get_result()->fetch_assoc();
    $checkStmt->close();

    if ($existing) {
        if ($existing['checksum'] !== $checksum) {
            echo "WARNING: $file has changed after being applied. Create a new migration instead of editing old ones." . PHP_EOL;
        } else {
            echo "Skipping $file (already applied)." . PHP_EOL;
        }
        continue;
    }

    if (!$allowDestructive && hasDestructiveSql($sql)) {
        echo "Blocked destructive migration $file. Re-run with --allow-destructive if you really intend this." . PHP_EOL;
        exit(1);
    }

    echo "Executing $file... ";
    if (!runMultiQuery($conn, $sql)) {
        echo "Error: " . $conn->error . PHP_EOL;
        exit(1);
    }

    $insertStmt = $conn->prepare("INSERT INTO schema_migrations (migration, checksum) VALUES (?, ?)");
    if (!$insertStmt) {
        echo "Error saving migration state for $file: " . $conn->error . PHP_EOL;
        exit(1);
    }
    $insertStmt->bind_param("ss", $file, $checksum);
    if (!$insertStmt->execute()) {
        echo "Error recording migration $file: " . $insertStmt->error . PHP_EOL;
        $insertStmt->close();
        exit(1);
    }
    $insertStmt->close();
    echo "Success!" . PHP_EOL;
}

echo "Migrations completed.\n";
$conn->close();
