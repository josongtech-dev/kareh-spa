<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

$sessionId = isset($_GET['session_id']) ? intval($_GET['session_id']) : 0;

if ($sessionId <= 0) {
    Response::error('session_id is required', 400);
}

$authData = AuthMiddleware::requireAuth();
RateLimiter::limitApi();

require_once __DIR__ . '/../models/Session.php';
$sessionModel = new Session($conn);
$session = $sessionModel->getById($sessionId, $authData);

if (!$session) {
    Response::error('Session not found', 404);
}

$serviceLines = array_map(function ($line) {
    return [
        'id' => intval($line['id'] ?? 0),
        'service_name' => $line['service_name'] ?? '',
        'price' => floatval($line['price'] ?? 0),
        'quantity' => intval($line['quantity'] ?? 1),
        'line_total' => floatval($line['line_total'] ?? 0),
    ];
}, $session['service_lines'] ?? []);

$addonLines = array_map(function ($line) {
    return [
        'id' => intval($line['id'] ?? 0),
        'addon_name' => $line['addon_name'] ?? '',
        'price' => floatval($line['price'] ?? 0),
        'quantity' => intval($line['quantity'] ?? 1),
        'line_total' => floatval($line['line_total'] ?? 0),
    ];
}, $session['addon_lines'] ?? []);

$business = [
    'name' => "Kareh's Spa",
    'tagline' => 'Beauty & Wellness',
    'address' => 'Nairobi, Kenya',
    'phone' => envValue('BUSINESS_PHONE', '+254 700 000 000'),
    'email' => envValue('BUSINESS_EMAIL', 'info@karehspa.co.ke'),
    'website' => 'karehspa.co.ke',
];

Response::json([
    'session_id' => intval($session['id']),
    'session_code' => $session['session_code'] ?? '',
    'customer_name' => $session['customer_name'] ?? '',
    'client_phone' => $session['client_phone'] ?? '',
    'client_email' => $session['client_email'] ?? '',
    'service_lines' => $serviceLines,
    'addon_lines' => $addonLines,
    'subtotal' => floatval($session['subtotal'] ?? $session['total_amount'] ?? 0),
    'discount_amount' => floatval($session['discount_amount'] ?? 0),
    'total_amount' => floatval($session['total_amount'] ?? 0),
    'payment_method' => strtoupper($session['payment_method'] ?? ($session['billing_status'] === 'paid' ? 'M-PESA' : 'UNPAID')),
    'payment_transaction_code' => $session['payment_transaction_code'] ?? '',
    'billing_status' => $session['billing_status'] ?? 'unbilled',
    'paid_at' => $session['paid_at'] ?? '',
    'created_at' => $session['created_at'] ?? '',
    'business' => $business,
]);
