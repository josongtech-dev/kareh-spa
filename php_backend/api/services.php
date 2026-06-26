<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/ServiceController.php';
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

$controller = new ServiceController($conn);
try {
    $controller->handleRequest();
} catch (\Throwable $e) {
    error_log('services.php fatal: ' . $e->getMessage());
    Response::error('Services endpoint failed. Check backend logs.', 500);
}
