<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/AppointmentController.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;
$customerEmail = isset($_GET['customer_email']) ? trim($_GET['customer_email']) : '';
$authData = null;

$isPublicHistoryRequest = $method === 'GET' && !$id && $customerEmail !== '';

if ($method !== 'POST' || $id) {
    if ($isPublicHistoryRequest) {
        RateLimiter::limitAuth();
    } else {
        $authData = AuthMiddleware::requireAuth(['owner', 'manager', 'receptionist', 'attendant', 'staff', 'admin']);
    }
} else {
    RateLimiter::limitPublic();
}

$controller = new AppointmentController($conn, $authData);
$controller->handleRequest();
