<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/ExpenseController.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

$auth = AuthMiddleware::requireAuth(['owner', 'manager', 'receptionist']);
RateLimiter::limitApi();

$controller = new ExpenseController($conn, $auth);
$controller->handleRequest();
