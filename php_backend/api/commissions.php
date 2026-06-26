<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/CommissionController.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders('GET, POST, OPTIONS');
Security::sendSecurityHeaders();
Security::handlePreflight();
$authData = AuthMiddleware::requireAuth(['owner', 'manager', 'attendant', 'staff', 'admin']);
RateLimiter::limitApi();

$controller = new CommissionController($conn, $authData);
$controller->handleRequest();
