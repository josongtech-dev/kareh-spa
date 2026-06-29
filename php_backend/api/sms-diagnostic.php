<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../utils/Response.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

$results = [];

// 1. Environment check
$u = envValue('SMS_USERNAME', '');
$p = envValue('SMS_PASSWORD', '');
$s = envValue('SMS_SENDER_ID', '');
$a = envValue('SMS_ADMIN_PHONE', '');
$results['env'] = [
    'SMS_USERNAME' => $u ?: 'NOT SET',
    'SMS_PASSWORD' => $p ? 'SET' : 'NOT SET',
    'SMS_SENDER_ID' => $s ?: 'NOT SET',
    'SMS_ADMIN_PHONE' => $a ?: 'NOT SET',
];

// 2. PHP extensions
$results['php'] = [
    'curl' => extension_loaded('curl') ? 'AVAILABLE' : 'MISSING',
    'json' => extension_loaded('json') ? 'AVAILABLE' : 'MISSING',
];

// 3. DNS resolution
$host = 'smsportal.hostpinnacle.co.ke';
$ip = gethostbyname($host);
$results['dns'] = ($ip !== $host) ? "Resolved to {$ip}" : "FAILED to resolve {$host}";

// 4. API connectivity test (send test with testMessage=true)
if ($u && $p && $s) {
    $postData = http_build_query([
        'userid' => $u,
        'password' => $p,
        'sendMethod' => 'quick',
        'mobile' => '254723131736',
        'msg' => 'KAREHS SPA & BARBERSHOP - Diagnostic test from SMS system check.',
        'senderid' => $s,
        'msgType' => 'text',
        'output' => 'json',
        'testMessage' => 'true',
    ]);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://{$host}/SMSApi/send",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postData,
        CURLOPT_HTTPHEADER => ['content-type: application/x-www-form-urlencoded'],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $response = curl_exec($ch);
    $err = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $sslVerify = curl_getinfo($ch, CURLINFO_SSL_VERIFYRESULT);
    curl_close($ch);

    if ($err) {
        $results['api_test'] = "CURL ERROR: {$err}";
    } else {
        $decoded = json_decode($response, true);
        $apiStatus = $decoded['status'] ?? 'unknown';
        $apiReason = $decoded['reason'] ?? 'unknown';
        $results['api_test'] = [
            'http_code' => $httpCode,
            'ssl_verify' => $sslVerify,
            'api_status' => $apiStatus,
            'api_reason' => $apiReason,
            'raw_response' => substr($response, 0, 500),
        ];
    }
} else {
    $results['api_test'] = 'SKIPPED - env vars not configured';
}

// 5. Test sending to admin phone via SmsSender
require_once __DIR__ . '/../utils/SmsSender.php';
$smsResult = SmsSender::sendAdminNotification('Diagnostic test - if you see this, SMS is working.');
$results['sms_sender_test'] = $smsResult ? 'SUCCESS - SMS sent to admin' : 'FAILED';

header('Content-Type: application/json');
echo json_encode($results, JSON_PRETTY_PRINT);
