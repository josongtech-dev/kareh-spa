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
$identifier = trim($payload['identifier'] ?? '');
$password = $payload['password'] ?? '';

if ($identifier === '' || $password === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Identifier and password are required"]);
    exit;
}

$query = "SELECT id, name, email, phone, password, role, loyalty_points, loyalty_tier, status
          FROM users
          WHERE (email = ? OR phone = ?) AND role = 'customer'
          LIMIT 1";
$stmt = $conn->prepare($query);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to prepare login query"]);
    exit;
}
$stmt->bind_param("ss", $identifier, $identifier);
$stmt->execute();
$result = $stmt->get_result();
$user = $result ? $result->fetch_assoc() : null;

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
    exit;
}

if (($user['status'] ?? 'Active') !== 'Active') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Your account is not active"]);
    exit;
}

$token = Security::issueToken($user['id'], 'customer');
if (!$token) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Authentication service misconfigured"]);
    exit;
}
unset($user['password']);

ActivityLogger::log($conn, 'auth', 'login', "Customer {$user['name']} logged in", 'customer', $user['id'], $user['name']);

echo json_encode([
    "status" => "success",
    "token" => $token,
    "user" => $user
]);
