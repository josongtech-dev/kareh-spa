<?php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../utils/Security.php';
require_once __DIR__ . '/../../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

RateLimiter::limitPublic();

$data = json_decode(file_get_contents("php://input"), true);
$token = trim((string)($data['token'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($token === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Token and password are required']);
    exit;
}

if (strlen($password) < 8 ||
    !preg_match('/[A-Z]/', $password) ||
    !preg_match('/[a-z]/', $password) ||
    !preg_match('/[0-9]/', $password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 8 characters with uppercase, lowercase, and a digit']);
    exit;
}

$stmt = $conn->prepare("SELECT pr.id, pr.user_id, u.email
                        FROM password_resets pr
                        JOIN users u ON u.id = pr.user_id
                        WHERE pr.token = ? AND pr.used = 0 AND pr.expires_at > NOW()
                        LIMIT 1");
$stmt->bind_param('s', $token);
$stmt->execute();
$reset = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$reset) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or expired reset token']);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ? AND role = 'customer'");
$updateStmt->bind_param('si', $hashedPassword, $reset['user_id']);
$updateStmt->execute();
$updateStmt->close();

$markStmt = $conn->prepare("UPDATE password_resets SET used = 1 WHERE id = ?");
$markStmt->bind_param('i', $reset['id']);
$markStmt->execute();
$markStmt->close();

http_response_code(200);
echo json_encode(['message' => 'Password has been reset successfully. You can now log in.']);
