<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/AppointmentManageController.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders('POST, OPTIONS');
Security::sendSecurityHeaders();
Security::handlePreflight();

RateLimiter::limitPublic();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

$controller = new AppointmentManageController($conn);
$controller->handleRequest();
