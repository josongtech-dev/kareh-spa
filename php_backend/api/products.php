<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/ProductController.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();
AuthMiddleware::requireAuth(['owner', 'manager', 'receptionist', 'attendant', 'staff', 'admin']);
RateLimiter::limitApi();

$controller = new ProductController($conn);
$controller->handleRequest();
