<?php
require_once __DIR__ . '/../../utils/Security.php';
require_once __DIR__ . '/../../middleware/RateLimiter.php';
require_once __DIR__ . '/../../utils/ActivityLogger.php';

Security::sendCorsHeaders('POST, OPTIONS');
Security::sendSecurityHeaders();
header("Content-Type: application/json");
Security::handlePreflight();

require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

RateLimiter::limitAuth();

$payload = json_decode(file_get_contents("php://input"), true);
$identifier = trim($payload['identifier'] ?? '');
$password = trim((string)($payload['password'] ?? ''));

function matchesSecret($plainTextInput, $storedValue) {
    if ($storedValue === null || $storedValue === '') {
        return false;
    }

    $secretInfo = password_get_info($storedValue);
    $isHashed = isset($secretInfo['algo']) && (int)$secretInfo['algo'] !== 0;

    if ($isHashed) {
        return password_verify($plainTextInput, $storedValue);
    }

    // Plain-text passwords are no longer accepted.
    return false;
}

if ($identifier === '' || $password === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Identifier and password are required"]);
    exit;
}

$query = "SELECT id, name, username, email, phone, id_number, role, status, activation_password, password
          FROM staffs
          WHERE (username = ? OR email = ? OR phone = ? OR id_number = ?)
          LIMIT 1";
$stmt = $conn->prepare($query);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to prepare staff login query"]);
    exit;
}

$stmt->bind_param("ssss", $identifier, $identifier, $identifier, $identifier);
$stmt->execute();
$result = $stmt->get_result();
$staff = $result ? $result->fetch_assoc() : null;

if (!$staff) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
    exit;
}

if (($staff['status'] ?? 'Active') !== 'Active') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Your account is not active"]);
    exit;
}

$storedPassword = trim((string)($staff['password'] ?? ''));
$storedActivationPassword = trim((string)($staff['activation_password'] ?? ''));

if (matchesSecret($password, $storedPassword)) {
    $tokenRole = strtolower(trim((string)($staff['role'] ?? 'staff')));
    if ($tokenRole === 'system owner') {
        $tokenRole = 'owner';
    }
    $token = Security::issueToken($staff['id'], $tokenRole, 43200);
    if (!$token) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Authentication service misconfigured"]);
        exit;
    }

    unset($staff['password'], $staff['activation_password']);

    ActivityLogger::log($conn, 'auth', 'login', "Staff {$staff['name']} ({$staff['role']}) logged in", 'staff', $staff['id'], $staff['name']);

    echo json_encode([
        "status" => "success",
        "token" => $token,
        "must_reset_password" => false,
        "user" => $staff
    ]);
    exit;
}

if (matchesSecret($password, $storedActivationPassword)) {
    $resetToken = Security::issueToken($staff['id'], 'force_reset', 1800);
    if (!$resetToken) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Authentication service misconfigured"]);
        exit;
    }

    unset($staff['password'], $staff['activation_password']);

    ActivityLogger::log($conn, 'auth', 'login_activation', "Staff {$staff['name']} logged in with activation password (must reset)", 'staff', $staff['id'], $staff['name']);

    echo json_encode([
        "status" => "success",
        "must_reset_password" => true,
        "reset_token" => $resetToken,
        "user" => $staff
    ]);
    exit;
}

http_response_code(401);
echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
