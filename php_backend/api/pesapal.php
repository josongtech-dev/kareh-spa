<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/PesapalGateway.php';
require_once __DIR__ . '/../utils/AppointmentMailer.php';
require_once __DIR__ . '/../models/Session.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();

$action = $_GET['action'] ?? '';

if ($action === 'ipn') {
    handleIPN($conn);
} elseif ($action === 'callback') {
    handleCallback($conn);
} elseif ($action === 'check_status') {
    RateLimiter::limitApi();
    checkTransactionStatus($conn);
} else {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Unknown action']);
    exit;
}

function resolveSession(mysqli $conn, string $merchantReference, string $orderTrackingId): ?array {
    $sessionModel = new Session($conn);

    if ($merchantReference !== '') {
        $session = $sessionModel->findSessionByMerchantReference($merchantReference);
        if ($session) return $session;
    }

    if ($orderTrackingId !== '') {
        $session = $sessionModel->findSessionByOrderTrackingId($orderTrackingId);
        if ($session) return $session;
    }

    return null;
}

function handleIPN(mysqli $conn) {
    $orderTrackingId = $_GET['OrderTrackingId'] ?? $_POST['OrderTrackingId'] ?? '';
    $merchantReference = $_GET['OrderMerchantReference'] ?? $_POST['OrderMerchantReference'] ?? '';
    $notificationType = $_GET['OrderNotificationType'] ?? $_POST['OrderNotificationType'] ?? '';

    error_log("Pesapal IPN received — TrackingId: $orderTrackingId, Ref: $merchantReference, Type: $notificationType");

    if ($orderTrackingId === '') {
        http_response_code(400);
        echo "Missing OrderTrackingId";
        exit;
    }

    try {
        $session = resolveSession($conn, $merchantReference, $orderTrackingId);

        $gateway = new PesapalGateway();
        $token = $gateway->getAccessToken();
        if (!$token || empty($token->token)) {
            error_log('Pesapal IPN: Failed to get access token');
            http_response_code(502);
            exit;
        }

        $status = $gateway->getTransactionStatus($token->token, $orderTrackingId);
        if (!$status) {
            error_log('Pesapal IPN: Failed to get transaction status');
            http_response_code(502);
            exit;
        }

        $desc = strtolower((string)($status->payment_status_description ?? ''));
        $code = $status->payment_status ?? '';
        $confirmationCode = $status->confirmation_code ?? '';
        $paidAmount = floatval($status->amount ?? 0);
        $paidCurrency = strtoupper((string)($status->currency ?? 'KES'));

        error_log("Pesapal IPN status: $desc, code: $code, confirmation: $confirmationCode, amount: $paidAmount $paidCurrency");

        if ($session) {
            $sessionModel = new Session($conn);
            $sessionId = intval($session['id']);

            if (($desc === 'completed' || $code === '1') && $paidAmount > 0) {
                $expectedAmount = floatval($session['total_amount'] ?? 0);

                if (abs($paidAmount - $expectedAmount) > 0.01) {
                    $sessionModel->logPaymentEvent($sessionId, 'amount_mismatch', [
                        'expected' => $expectedAmount,
                        'received' => $paidAmount,
                        'currency' => $paidCurrency,
                        'order_tracking_id' => $orderTrackingId,
                    ], $orderTrackingId, $merchantReference);
                    error_log("Pesapal IPN: AMOUNT MISMATCH for session $sessionId — expected $expectedAmount, received $paidAmount");
                }

                $confirmed = $sessionModel->confirmPesapalPayment($sessionId, $orderTrackingId, $confirmationCode);
                $sessionModel->logPaymentEvent($sessionId, 'confirmed', [
                    'payment_status_description' => $desc,
                    'payment_status' => $code,
                    'confirmation_code' => $confirmationCode,
                    'amount' => $paidAmount,
                    'currency' => $paidCurrency,
                ], $orderTrackingId, $merchantReference);
                if (is_array($confirmed) && !empty($confirmed['client_email'])) {
                    AppointmentMailer::sendPaymentReceived($confirmed);
                }
                error_log("Pesapal IPN: Session $sessionId marked as paid (ref: $merchantReference)");
            } elseif ($desc === 'failed' || $code === '3') {
                $sessionModel->failPesapalPayment($sessionId, $orderTrackingId);
                $sessionModel->logPaymentEvent($sessionId, 'failed', [
                    'payment_status_description' => $desc,
                    'payment_status' => $code,
                ], $orderTrackingId, $merchantReference);
                error_log("Pesapal IPN: Session $sessionId marked as failed");
            } else {
                $sessionModel->logPaymentEvent($sessionId, 'ipn_received', [
                    'payment_status_description' => $desc,
                    'payment_status' => $code,
                    'notification_type' => $notificationType,
                ], $orderTrackingId, $merchantReference);
                error_log("Pesapal IPN: Session $sessionId status: $desc");
            }
        } else {
            error_log("Pesapal IPN: No session found for TrackingId: $orderTrackingId, Ref: $merchantReference — status: $desc");
        }

        http_response_code(200);
        echo "OK";
    } catch (\Throwable $e) {
        error_log('Pesapal IPN error: ' . $e->getMessage());
        http_response_code(500);
        echo "Error";
    }
    exit;
}

function handleCallback(mysqli $conn) {
    $orderTrackingId = $_GET['OrderTrackingId'] ?? '';
    $merchantReference = $_GET['OrderMerchantReference'] ?? '';
    $notificationType = $_GET['OrderNotificationType'] ?? '';

    error_log("Pesapal Callback — TrackingId: $orderTrackingId, Ref: $merchantReference");

    if ($orderTrackingId === '') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing OrderTrackingId']);
        exit;
    }

    try {
        $gateway = new PesapalGateway();
        $token = $gateway->getAccessToken();
        if (!$token || empty($token->token)) {
            echo json_encode(['status' => 'error', 'message' => 'Payment service unavailable']);
            exit;
        }

        $status = $gateway->getTransactionStatus($token->token, $orderTrackingId);
        if (!$status) {
            echo json_encode(['status' => 'error', 'message' => 'Unable to verify payment status']);
            exit;
        }

        $desc = strtolower((string)($status->payment_status_description ?? ''));
        $code = $status->payment_status ?? '';
        $confirmationCode = $status->confirmation_code ?? '';
        $paidAmount = floatval($status->amount ?? 0);
        $paidCurrency = strtoupper((string)($status->currency ?? 'KES'));

        $session = resolveSession($conn, $merchantReference, $orderTrackingId);

        if ($session) {
            $sessionModel = new Session($conn);
            $sessionId = intval($session['id']);

            if (($desc === 'completed' || $code === '1') && $paidAmount > 0) {
                $expectedAmount = floatval($session['total_amount'] ?? 0);

                if (abs($paidAmount - $expectedAmount) > 0.01) {
                    $sessionModel->logPaymentEvent($sessionId, 'amount_mismatch', [
                        'expected' => $expectedAmount,
                        'received' => $paidAmount,
                        'currency' => $paidCurrency,
                        'order_tracking_id' => $orderTrackingId,
                    ], $orderTrackingId, $merchantReference);
                    error_log("Pesapal Callback: AMOUNT MISMATCH for session $sessionId — expected $expectedAmount, received $paidAmount");
                }

                $confirmed = $sessionModel->confirmPesapalPayment($sessionId, $orderTrackingId, $confirmationCode);
                $sessionModel->logPaymentEvent($sessionId, 'confirmed', [
                    'payment_status_description' => $desc,
                    'payment_status' => $code,
                    'confirmation_code' => $confirmationCode,
                    'amount' => $paidAmount,
                    'currency' => $paidCurrency,
                ], $orderTrackingId, $merchantReference);
                if (is_array($confirmed) && !empty($confirmed['client_email'])) {
                    AppointmentMailer::sendPaymentReceived($confirmed);
                }
                error_log("Pesapal Callback: Session $sessionId marked as paid");
            } elseif ($desc === 'failed' || $code === '3') {
                $sessionModel->failPesapalPayment($sessionId, $orderTrackingId);
                $sessionModel->logPaymentEvent($sessionId, 'failed', [
                    'payment_status_description' => $desc,
                    'payment_status' => $code,
                ], $orderTrackingId, $merchantReference);
                error_log("Pesapal Callback: Session $sessionId marked as failed");
            } else {
                $sessionModel->logPaymentEvent($sessionId, 'callback_received', [
                    'payment_status_description' => $desc,
                    'payment_status' => $code,
                    'notification_type' => $notificationType,
                ], $orderTrackingId, $merchantReference);
            }
        }

        $frontendBase = rtrim(envValue('FRONTEND_BASE_URL', 'https://karehspa.co.ke'), '/');
        $redirectUrl = $frontendBase . '/payment/callback?order_tracking_id=' . urlencode($orderTrackingId)
            . '&merchant_reference=' . urlencode($merchantReference)
            . '&status=' . urlencode($desc);

        header('Location: ' . $redirectUrl);
        exit;
    } catch (\Throwable $e) {
        error_log('Pesapal callback error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Payment verification failed']);
        exit;
    }
}

function loadReceiptSessionData(Session $sessionModel, int $sessionId): ?array {
    $full = $sessionModel->getById($sessionId);
    if (!$full) return null;
    return [
        'session_id' => $sessionId,
        'session_code' => $full['session_code'] ?? '',
        'customer_name' => $full['customer_name'] ?? '',
        'client_phone' => $full['client_phone'] ?? '',
        'client_email' => $full['client_email'] ?? '',
        'service_lines' => $full['service_lines'] ?? [],
        'addon_lines' => $full['addon_lines'] ?? [],
        'total_amount' => floatval($full['total_amount'] ?? 0),
        'payment_transaction_code' => $full['payment_transaction_code'] ?? '',
        'paid_at' => $full['paid_at'] ?? '',
        'payment_method' => $full['pesapal_payment_method'] ?? '',
    ];
}

function checkTransactionStatus(mysqli $conn) {
    $orderTrackingId = trim((string)($_GET['order_tracking_id'] ?? ''));
    if ($orderTrackingId === '') {
        Response::error('order_tracking_id is required', 400);
    }

    try {
        $merchantReference = $_GET['merchant_reference'] ?? '';

        $session = resolveSession($conn, $merchantReference, $orderTrackingId);
        if ($session) {
            $sessionModel = new Session($conn);
            $sessionId = intval($session['id']);

            $billingStatus = strtolower((string)($session['billing_status'] ?? ''));
            if ($billingStatus === 'paid') {
                $sessionModel->logPaymentEvent($sessionId, 'status_checked', [
                    'payment_status_description' => 'completed',
                    'payment_status' => '1',
                    'source' => 'db_cache',
                ], $orderTrackingId, $session['pesapal_merchant_reference'] ?? $merchantReference);

                $receipt = loadReceiptSessionData($sessionModel, $sessionId);

                $resp = [
                    'status' => 'completed',
                    'payment_status' => '1',
                    'description' => 'Payment completed successfully',
                    'confirmation_code' => $session['payment_transaction_code'] ?? '',
                    'amount' => floatval($session['total_amount'] ?? 0),
                    'currency' => 'KES',
                    'payment_method' => $session['pesapal_payment_method'] ?? '',
                    'merchant_reference' => $session['pesapal_merchant_reference'] ?? '',
                    'order_tracking_id' => $orderTrackingId,
                    'created_date' => $session['paid_at'] ?? '',
                ];
                if ($receipt) {
                    $resp['receipt'] = $receipt;
                }
                Response::json($resp);
                return;
            }
        }

        $gateway = new PesapalGateway();
        $token = $gateway->getAccessToken();
        if (!$token || empty($token->token)) {
            Response::error('Payment service unavailable', 502);
        }

        $status = $gateway->getTransactionStatus($token->token, $orderTrackingId);
        if (!$status) {
            Response::error('Unable to verify payment status', 502);
        }

        $desc = strtolower((string)($status->payment_status_description ?? ''));
        $code = $status->payment_status ?? '';
        $confirmationCode = $status->confirmation_code ?? '';

        $receipt = null;
        if ($session && $sessionId && ($desc === 'completed' || $code === '1') && floatval($status->amount ?? 0) > 0) {
            $confirmed = $sessionModel->confirmPesapalPayment($sessionId, $orderTrackingId, $confirmationCode);
            $sessionModel->logPaymentEvent($sessionId, 'confirmed', [
                'payment_status_description' => $desc,
                'payment_status' => $code,
                'confirmation_code' => $confirmationCode,
                'source' => 'check_status_poll',
            ], $orderTrackingId, $merchantReference);
            if (is_array($confirmed) && !empty($confirmed['client_email'])) {
                require_once __DIR__ . '/../utils/AppointmentMailer.php';
                AppointmentMailer::sendPaymentReceived($confirmed);
            }
            $receipt = loadReceiptSessionData($sessionModel, $sessionId);
        } elseif ($session && $sessionId) {
            $sessionModel->logPaymentEvent($sessionId, 'status_checked', [
                'payment_status_description' => $desc,
                'payment_status' => $code,
            ], $orderTrackingId, $session['pesapal_merchant_reference'] ?? $merchantReference);
        }

        $resp = [
            'status' => $desc,
            'payment_status' => $code,
            'description' => $status->payment_status_description ?? '',
            'confirmation_code' => $confirmationCode,
            'amount' => floatval($status->amount ?? 0),
            'currency' => strtoupper((string)($status->currency ?? 'KES')),
            'payment_method' => $status->payment_method ?? '',
            'merchant_reference' => $status->merchant_reference ?? '',
            'order_tracking_id' => $status->order_tracking_id ?? '',
            'created_date' => $status->created_date ?? '',
        ];
        if ($receipt) {
            $resp['receipt'] = $receipt;
        }
        Response::json($resp);
    } catch (\Throwable $e) {
        error_log('Pesapal check_status error: ' . $e->getMessage());
        Response::error('Payment verification failed', 502);
    }
}
