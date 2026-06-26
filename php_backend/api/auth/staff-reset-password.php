<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../utils/Security.php';
require_once __DIR__ . '/../../middleware/RateLimiter.php';

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
$resetToken = trim($payload['reset_token'] ?? '');
$newPassword = $payload['new_password'] ?? '';
$confirmPassword = $payload['confirm_password'] ?? '';

if ($resetToken === '' || $newPassword === '' || $confirmPassword === '') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Reset token and passwords are required"]);
    exit;
}

if ($newPassword !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Passwords do not match"]);
    exit;
}

$passwordErrors = [];
if (strlen($newPassword) < 8) {
    $passwordErrors[] = 'at least 8 characters';
}
if (!preg_match('/[A-Z]/', $newPassword)) {
    $passwordErrors[] = 'an uppercase letter';
}
if (!preg_match('/[a-z]/', $newPassword)) {
    $passwordErrors[] = 'a lowercase letter';
}
if (!preg_match('/[0-9]/', $newPassword)) {
    $passwordErrors[] = 'a digit';
}
if (!empty($passwordErrors)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Password must contain " . implode(', ', $passwordErrors)]);
    exit;
}

$parsedToken = Security::parseToken($resetToken);
if (!$parsedToken) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Invalid reset token"]);
    exit;
}

$tokenRole = strtolower((string)($parsedToken['role'] ?? ''));
if ($tokenRole !== 'force_reset') {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Invalid reset token"]);
    exit;
}

$staffId = intval($parsedToken['user_id'] ?? 0);
if ($staffId <= 0) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Reset token expired"]);
    exit;
}

$staffQuery = "SELECT id, name, username, email, phone, id_number, role, status FROM staffs WHERE id = ? LIMIT 1";
$staffStmt = $conn->prepare($staffQuery);
if (!$staffStmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to prepare staff lookup query"]);
    exit;
}

$staffStmt->bind_param("i", $staffId);
$staffStmt->execute();
$staffResult = $staffStmt->get_result();
$staff = $staffResult ? $staffResult->fetch_assoc() : null;

if (!$staff) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Staff account not found"]);
    exit;
}

$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
$updateQuery = "UPDATE staffs SET password = ?, activation_password = NULL WHERE id = ?";
$updateStmt = $conn->prepare($updateQuery);
if (!$updateStmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to prepare password reset query"]);
    exit;
}

$updateStmt->bind_param("si", $hashedPassword, $staffId);
if (!$updateStmt->execute()) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to update password"]);
    exit;
}

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

echo json_encode([
    "status" => "success",
    "message" => "Password reset successful",
    "token" => $token,
    "user" => $staff
]);
