<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/CommissionRuleController.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

AuthMiddleware::requireAuth(['owner', 'manager']);
RateLimiter::limitApi();

$controller = new CommissionRuleController($conn);
$controller->handleRequest();
