<?php
/**
 * Database Connection Configuration
 * Uses mysqli for database interaction
 */
require_once __DIR__ . '/env.php';

// Enforce East Africa Time for all backend date operations.
date_default_timezone_set('Africa/Nairobi');

// Global exception handler — never leak internals to clients
set_exception_handler(function (Throwable $e) {
    error_log('Uncaught Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    if (headers_sent() === false) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Internal server error']);
    }
    exit(1);
});

set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return false;
    throw new ErrorException($message, 0, $severity, $file, $line);
});

$host = envValue('DB_HOST', 'localhost');
$db_name = envValue('DB_NAME', 'kareh_spa');
$username = envValue('DB_USER', 'root');
$password = envValue('DB_PASSWORD', '');

// Create connection
$conn = new mysqli($host, $username, $password, $db_name);

// Check connection
if ($conn->connect_error) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database service unavailable"
    ]);
    exit();
}

// Set charset to utf8mb4 for unicode support
$conn->set_charset("utf8mb4");

// Keep MySQL session time aligned with EAT (+03:00)
$conn->query("SET time_zone = '+03:00'");

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
AuthMiddleware::init($conn);

return $conn;
