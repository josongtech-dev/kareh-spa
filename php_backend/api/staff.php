<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/StaffController.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;
$roleFilter = strtolower(trim((string)($_GET['role'] ?? '')));
$statusFilter = strtolower(trim((string)($_GET['status'] ?? '')));
$isPublicAttendantLookup = $method === 'GET' && !$id && $roleFilter === 'attendant' && $statusFilter === 'active';

if ($isPublicAttendantLookup) {
    RateLimiter::limitPublic();
} else {
    AuthMiddleware::requireAuth(['owner', 'manager', 'receptionist', 'attendant', 'staff', 'admin']);
    RateLimiter::limitApi();
}

$controller = new StaffController($conn);
$controller->handleRequest();
