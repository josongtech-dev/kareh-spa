<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/AddonController.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    AuthMiddleware::requireAuth(['owner', 'manager', 'staff', 'admin']);
} else {
    RateLimiter::limitPublic();
}

$controller = new AddonController($conn);
try {
    $controller->handleRequest();
} catch (\Throwable $e) {
    error_log('addons.php fatal: ' . $e->getMessage());
    Response::error('Addons endpoint failed. Check backend logs.', 500);
}
