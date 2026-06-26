<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../utils/Security.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
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

$tokenData = AuthMiddleware::requireAuth();
RateLimiter::limitApi();

$revoked = Security::revokeToken($conn, $tokenData);
if (!$revoked) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Logout failed"]);
    exit;
}

$role = $tokenData['role'] ?? 'staff';
$actorId = $tokenData['user_id'] ?? 0;
$actorName = $tokenData['name'] ?? ($role === 'customer' ? 'Customer' : 'Staff');
ActivityLogger::log($conn, 'auth', 'logout', "User logged out", $role === 'customer' ? 'customer' : 'staff', $actorId, $actorName);

echo json_encode(["status" => "success", "message" => "Logged out successfully"]);