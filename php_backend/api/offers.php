<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/OfferController.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    AuthMiddleware::requireAuth(['owner', 'manager']);
} else {
    RateLimiter::limitPublic();
}

$controller = new OfferController($conn);
try {
    $controller->handleRequest();
} catch (\Throwable $e) {
    error_log('offers.php fatal: ' . $e->getMessage());
    Response::error('Offers endpoint failed. Check backend logs.', 500);
}
