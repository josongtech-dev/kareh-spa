<?php
/**
 * Main API Entry Point
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Security.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

// Basic router logic or test endpoint
$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Handle simple test route
if (preg_match('/\/api\/test/', $request_uri)) {
    Response::json(['message' => 'API is working correctly', 'database' => 'connected']);
} else {
    Response::error('Endpoint not found', 404);
}
