<?php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../utils/Security.php';
require_once __DIR__ . '/../../middleware/RateLimiter.php';
require_once __DIR__ . '/../../utils/AppointmentMailer.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

RateLimiter::limitPublic();

$data = json_decode(file_get_contents("php://input"), true);
$email = strtolower(trim((string)($data['email'] ?? '')));

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'A valid email address is required']);
    exit;
}

$stmt = $conn->prepare("SELECT id, name, email FROM users WHERE email = ? AND role = 'customer' LIMIT 1");
$stmt->bind_param('s', $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user) {
    http_response_code(200);
    echo json_encode(['message' => 'If the email is registered, a reset link has been sent.']);
    exit;
}

$resetToken = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

$insertStmt = $conn->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)");
$insertStmt->bind_param('iss', $user['id'], $resetToken, $expiresAt);
$insertStmt->execute();
$insertStmt->close();

$resetLink = envValue('FRONTEND_BASE_URL', 'https://karehspa.co.ke') . '/reset-password?token=' . rawurlencode($resetToken);

$subject = "Reset Your Kareh's Spa Password";
$name = htmlspecialchars($user['name'] ?? 'Valued Member', ENT_QUOTES, 'UTF-8');
$safeLink = htmlspecialchars($resetLink, ENT_QUOTES, 'UTF-8');
$body = "
    <h2 style='margin-bottom:8px;'>Hi {$name},</h2>
    <p>We received a request to reset the password for your Kareh's Spa account.</p>
    <p>Click the link below to set a new password. This link expires in 1 hour.</p>
    <p style='text-align:center;margin:24px 0;'>
        <a href='{$safeLink}' style='display:inline-block;padding:12px 32px;background:#6f42c1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;'>Reset Password</a>
    </p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thank you,<br/>Kareh's Spa Team</p>
";

AppointmentMailer::sendRaw($user['email'], $subject, $body);

http_response_code(200);
echo json_encode(['message' => 'If the email is registered, a reset link has been sent.']);
