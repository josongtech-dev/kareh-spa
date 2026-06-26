<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/SystemSettingController.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    AuthMiddleware::requireAuth(['owner', 'manager', 'admin']);
} else {
    RateLimiter::limitPublic();
}

$controller = new SystemSettingController($conn);
$controller->handleRequest();
