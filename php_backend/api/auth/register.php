<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../utils/Security.php';
require_once __DIR__ . '/../../middleware/RateLimiter.php';
require_once __DIR__ . '/../../utils/ActivityLogger.php';

Security::sendCorsHeaders('POST, OPTIONS');
Security::sendSecurityHeaders();
header("Content-Type: application/json");
Security::handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

RateLimiter::limitAuth();

$payload = json_decode(file_get_contents("php://input"), true);
$name = trim($payload['name'] ?? '');
$email = trim($payload['email'] ?? '');
$phone = trim($payload['phone'] ?? '');
$password = $payload['password'] ?? '';

if ($name === '' || $email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Name, email and password are required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Please provide a valid email address"]);
    exit;
}

$passwordErrors = [];
if (strlen($password) < 8) {
    $passwordErrors[] = 'at least 8 characters';
}
if (!preg_match('/[A-Z]/', $password)) {
    $passwordErrors[] = 'an uppercase letter';
}
if (!preg_match('/[a-z]/', $password)) {
    $passwordErrors[] = 'a lowercase letter';
}
if (!preg_match('/[0-9]/', $password)) {
    $passwordErrors[] = 'a digit';
}
if (!empty($passwordErrors)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Password must contain " . implode(', ', $passwordErrors)]);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$query = "INSERT INTO users (name, email, phone, password, role, loyalty_points, loyalty_tier, status)
          VALUES (?, ?, ?, ?, 'customer', 0, 'Bronze', 'Active')";
$stmt = $conn->prepare($query);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to prepare registration query"]);
    exit;
}
$stmt->bind_param("ssss", $name, $email, $phone, $hashedPassword);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Registration failed. Please try again."]);
    exit;
}

$newId = $stmt->insert_id;
ActivityLogger::log($conn, 'auth', 'registered', "Customer {$name} registered", 'customer', $newId, $name);

echo json_encode([
    "status" => "success",
    "message" => "Registration successful"
], JSON_UNESCAPED_SLASHES);
