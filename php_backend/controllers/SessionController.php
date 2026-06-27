<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Session.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/ActivityLogger.php';

class SessionController extends BaseController {
    private $sessionModel;
    private $authData;

    public function __construct($db, $authData = null) {
        parent::__construct($db);
        $this->sessionModel = new Session($db);
        $this->authData = $authData;
    }

    private function normalizeContactValue($value) {
        return trim((string)($value ?? ''));
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;

        switch ($method) {
            case 'GET':
                if ((isset($_GET['action']) ? $_GET['action'] : '') === 'feedback_summary') {
                    $this->getFeedbackSummary();
                } elseif ((isset($_GET['action']) ? $_GET['action'] : '') === 'feedback_notifications') {
                    $this->getFeedbackNotifications();
                } elseif ((isset($_GET['action']) ? $_GET['action'] : '') === 'payment_status') {
                    $this->getPaymentStatus();
                } elseif ($id) {
                    $this->getSession($id);
                } else {
                    $this->getAllSessions();
                }
                break;
            case 'POST':
                if (isset($_GET['action']) && $_GET['action'] == 'add_service') {
                    $this->addService();
                } elseif (isset($_GET['action']) && $_GET['action'] == 'initiate_payment') {
                    $this->initiatePayment();
                } elseif (isset($_GET['action']) && $_GET['action'] == 'pay_session') {
                    $this->paySession();
                } elseif (isset($_GET['action']) && $_GET['action'] == 'add_addon') {
                    $this->addAddon();
                } elseif (isset($_GET['action']) && $_GET['action'] == 'remove_addon') {
                    $this->removeAddonLine();
                } elseif (isset($_GET['action']) && $_GET['action'] == 'remove_service') {
                    $this->removeServiceLine();
                } elseif (isset($_GET['action']) && $_GET['action'] == 'mark_feedback_viewed') {
                    $this->markFeedbackViewed();
                } elseif (isset($_GET['action']) && $_GET['action'] == 'mark_all_feedback_viewed') {
                    $this->markAllFeedbackViewed();
                } else {
                    $this->createSession();
                }
                break;
            case 'PUT':
                if ($id) {
                    $this->updateSession($id);
                } else {
                    Response::error('ID is required for update', 400);
                }
                break;
            case 'DELETE':
                if ($id) {
                    $this->deleteSession($id);
                } else {
                    Response::error('ID is required for deletion', 400);
                }
                break;
            default:
                Response::error('Method not allowed', 405);
                break;
        }
    }

    private function getAllSessions() {
        $sessions = $this->sessionModel->getAll($this->authData);
        Response::json($sessions);
    }

    private function getSession($id) {
        $session = $this->sessionModel->getById($id, $this->authData);
        if ($session) {
            Response::json($session);
        } else {
            Response::error('Session not found', 404);
        }
    }

    private function getFeedbackSummary() {
        $startDate = trim((string)($_GET['start_date'] ?? ''));
        $endDate = trim((string)($_GET['end_date'] ?? ''));
        $limit = intval($_GET['limit'] ?? 5);
        $summary = $this->sessionModel->getFeedbackSummary(
            $startDate !== '' ? $startDate : null,
            $endDate !== '' ? $endDate : null,
            $limit
        );
        Response::json($summary);
    }

    private function getFeedbackNotifications() {
        $limit = intval($_GET['limit'] ?? 50);
        $payload = $this->sessionModel->getFeedbackNotifications($limit);
        Response::json($payload);
    }

    private function markFeedbackViewed() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) $data = $_POST;
        $feedbackId = intval($data['feedback_id'] ?? 0);
        if ($feedbackId <= 0) {
            Response::error('feedback_id is required', 400);
        }
        if (!$this->sessionModel->markFeedbackAsViewed($feedbackId)) {
            Response::error('Feedback notification not found or already viewed', 404);
        }
        Response::json(['message' => 'Feedback notification marked as viewed']);
    }

    private function markAllFeedbackViewed() {
        $this->sessionModel->markAllFeedbackAsViewed();
        Response::json(['message' => 'All feedback notifications marked as viewed']);
    }

    private function createSession() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            $data = $_POST;
        }

        $appointmentId = isset($data['appointment_id']) ? $data['appointment_id'] : (isset($data['appointmentId']) ? $data['appointmentId'] : null);
        $appointmentData = null;
        if (!empty($appointmentId)) {
            $appointmentId = intval($appointmentId);
            $appointmentData = $this->sessionModel->getAppointmentById($appointmentId);
            if (!$appointmentData) {
                Response::error('Appointment not found', 404);
            }
            if ($appointmentData['status'] !== 'confirmed') {
                Response::error('Only confirmed appointments can open a session', 400);
            }
            if ($this->sessionModel->hasSessionForAppointment($appointmentId)) {
                Response::error('A session already exists for this appointment', 409);
            }
        }

        $s = function ($key) use ($data, $appointmentData) {
            if (isset($data[$key])) return $data[$key];
            $camel = lcfirst(str_replace('_', '', ucwords($key, '_')));
            if (isset($data[$camel])) return $data[$camel];
            if (isset($appointmentData) && isset($appointmentData[$key])) return $appointmentData[$key];
            return null;
        };

        $rawCreatedBy = $s('created_by');
        $createdById = ($rawCreatedBy !== null && $rawCreatedBy !== '') ? intval($rawCreatedBy) : 0;
        if ($createdById <= 0 && isset($this->authData['user_id'])) {
            $createdById = intval($this->authData['user_id']);
        }

        $sessionData = [
            'customer_name' => $s('customer_name') ?? 'Walk-in',
            'client_phone' => $s('client_phone') ?? '',
            'client_email' => $s('client_email') ?? '',
            'notes' => $s('notes') ?? '',
            'appointment_id' => $appointmentId,
            'created_by' => $createdById > 0 ? $createdById : null
        ];

        if (empty($sessionData['customer_name'])) {
            Response::error('Customer name is required', 400);
        }

        $sessionData['client_phone'] = $this->normalizeContactValue($sessionData['client_phone']);
        $sessionData['client_email'] = strtolower($this->normalizeContactValue($sessionData['client_email']));

        $id = $this->sessionModel->create($sessionData);

        if ($id) {
            if (!empty($appointmentId)) {
                $staffId = intval($data['staff_id'] ?? $appointmentData['staff_id'] ?? 0);
                $built = $this->sessionModel->buildSessionServicesFromAppointment($appointmentId, $staffId);
                if ($built) {
                    $primaryPrice = floatval($appointmentData['service_items'][0]['price'] ?? $built['total_amount']);
                    $this->sessionModel->addServiceToSession($id, $built['service_id'], $primaryPrice, $staffId, true);
                    foreach ($built['additional_services'] as $svc) {
                        $this->sessionModel->addServiceToSession(
                            $id,
                            $svc['service_id'],
                            $svc['price'],
                            $svc['assigned_staff_id'],
                            true
                        );
                    }
                }
            }

            $newSession = $this->sessionModel->getById($id, $this->authData);
            if (!$newSession) {
                Response::error('Session was created but could not be loaded. Please refresh the sessions list.', 500);
            }

            $src = $appointmentId ? "appointment {$newSession['appointment_code']}" : 'manual';
            ActivityLogger::logFromAuthData($this->conn, 'session', 'created', "Session {$newSession['session_code']} created ({$src})", $this->authData, 'session', $id);

            Response::json(['message' => 'Session created successfully', 'session' => $newSession], 201);
        } else {
            $detail = trim((string)($this->sessionModel->getLastError() ?? ''));
            $message = $detail !== '' ? $detail : 'Failed to create session';
            Response::error($message, 500);
        }
    }

    private function updateSession($id) {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            $data = $_POST;
        }

        $beforeSession = $this->sessionModel->getById($id, $this->authData);
        if (!$beforeSession) {
            Response::error('Session not found', 404);
        }

        if ($this->sessionModel->update($id, $data)) {
            $updatedSession = $this->sessionModel->getById($id, $this->authData);
            ActivityLogger::logFromAuthData($this->conn, 'session', 'updated', "Session {$updatedSession['session_code']} details updated", $this->authData, 'session', $id);
            Response::json(['message' => 'Session updated successfully', 'session' => $updatedSession]);
        } else {
            Response::error('Failed to update session', 500);
        }
    }

    private function addService() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) $data = $_POST;

        $sessionId = isset($data['session_id']) ? intval($data['session_id']) : null;
        $serviceId = isset($data['service_id']) ? intval($data['service_id']) : null;
        $price = isset($data['price']) ? floatval(str_replace(',', '', $data['price'])) : 0;
        $assignedStaffId = isset($data['assigned_staff_id']) ? intval($data['assigned_staff_id']) : 0;

        if (!$sessionId || !$serviceId) {
            Response::error('Session ID and Service ID are required', 400);
        }

        if ($this->sessionModel->addServiceToSession($sessionId, $serviceId, $price, $assignedStaffId)) {
            $session = $this->sessionModel->getById($sessionId, $this->authData);
            $code = $session ? ($session['session_code'] ?? 'Unknown') : 'Unknown';
            $svcName = $session ? ($session['service_lines'][count($session['service_lines']) - 1]['service_name'] ?? 'service') : 'service';
            ActivityLogger::logFromAuthData($this->conn, 'session', 'service_added', "{$svcName} added to session {$code}", $this->authData, 'session', $sessionId);
            $session = $session ?: ['id' => $sessionId];
            Response::json(['message' => 'Service added to session successfully', 'session' => $session]);
        } else {
            $detail = $this->sessionModel->getLastError();
            Response::error($detail ?: 'Failed to add service to session', 400);
        }
    }

    private function removeServiceLine() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) $data = $_POST;
        $serviceLineId = isset($data['service_line_id']) ? intval($data['service_line_id']) : null;
        if (!$serviceLineId) {
            Response::error('service_line_id is required', 400);
        }
        if ($this->sessionModel->removeServiceFromSession($serviceLineId)) {
            $sessionId = intval($data['session_id'] ?? 0);
            if ($sessionId) {
                $session = $this->sessionModel->getById($sessionId, $this->authData);
                ActivityLogger::logFromAuthData($this->conn, 'session', 'service_removed', "Service removed from session {$session['session_code']}", $this->authData, 'session', $sessionId);
            }
            Response::json(['message' => 'Service removed successfully']);
        } else {
            $detail = $this->sessionModel->getLastError();
            Response::error($detail ?: 'Failed to remove service', 400);
        }
    }

    private function addAddon() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) $data = $_POST;

        $sessionId = isset($data['session_id']) ? intval($data['session_id']) : null;
        $addonId = isset($data['addon_id']) ? intval($data['addon_id']) : null;
        $quantity = isset($data['quantity']) ? intval($data['quantity']) : 1;

        if (!$sessionId || !$addonId) {
            Response::error('Session ID and Addon ID are required', 400);
        }

        if ($this->sessionModel->addAddonToSession($sessionId, $addonId, $quantity)) {
            $session = $this->sessionModel->getById($sessionId, $this->authData);
            ActivityLogger::logFromAuthData($this->conn, 'session', 'addon_added', "Add-on added to session {$session['session_code']}", $this->authData, 'session', $sessionId);
            Response::json(['message' => 'Addon added to session successfully', 'session' => $session]);
        } else {
            $detail = $this->sessionModel->getLastError();
            Response::error($detail ?: 'Failed to add addon to session', 400);
        }
    }

    private function removeAddonLine() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) $data = $_POST;
        $addonLineId = isset($data['addon_line_id']) ? intval($data['addon_line_id']) : null;
        if (!$addonLineId) {
            Response::error('addon_line_id is required', 400);
        }
        if ($this->sessionModel->removeAddonFromSession($addonLineId)) {
            $sessionId = intval($data['session_id'] ?? 0);
            if ($sessionId) {
                $session = $this->sessionModel->getById($sessionId, $this->authData);
                ActivityLogger::logFromAuthData($this->conn, 'session', 'addon_removed', "Add-on removed from session {$session['session_code']}", $this->authData, 'session', $sessionId);
            }
            Response::json(['message' => 'Addon removed successfully']);
        } else {
            $detail = $this->sessionModel->getLastError();
            Response::error($detail ?: 'Failed to remove addon', 400);
        }
    }

    private function initiatePayment() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) $data = $_POST;

        $sessionId = intval($data['session_id'] ?? 0);
        $paymentMethod = trim((string)($data['payment_method'] ?? ''));
        $allowedMethods = ['MPESA', 'CARD'];

        if ($sessionId <= 0) Response::error('session_id is required', 400);
        if ($paymentMethod === '' || !in_array($paymentMethod, $allowedMethods, true)) {
            Response::error('Valid payment_method is required: MPESA or CARD', 400);
        }

        $initData = $this->sessionModel->initiatePesapalPayment($sessionId, $paymentMethod);
        if (!$initData) {
            Response::error($this->sessionModel->getLastError() ?: 'Failed to initiate payment', 400);
        }

        try {
            require_once __DIR__ . '/../utils/PesapalGateway.php';
            $gateway = new PesapalGateway();
            $token = $gateway->getAccessToken();
            if (!$token || empty($token->token)) {
                Response::error('Failed to authenticate with payment gateway', 502);
            }

            $ipnUrl = envValue('PESAPAL_IPN_URL', '');
            $ipnId = envValue('PESAPAL_IPN_ID', '');

            if ($ipnId === '') {
                $ipns = $gateway->getRegisteredIPNs($token->token);
                if ($ipns && count($ipns) > 0) {
                    $ipnId = $ipns[0]->ipn_id ?? '';
                }
            }
            if ($ipnId === '' && $ipnUrl !== '') {
                $ipn = $gateway->registerIPN($token->token, $ipnUrl);
                if ($ipn && !empty($ipn->ipn_id)) {
                    $ipnId = $ipn->ipn_id;
                }
            }
            if ($ipnId === '') {
                Response::error('Payment notification URL not configured. Set PESAPAL_IPN_ID or PESAPAL_IPN_URL in .env', 500);
            }

            $sessionData = $initData['session'];
            $frontendBase = rtrim(envValue('FRONTEND_BASE_URL', 'https://karehspa.co.ke'), '/');
            $callbackUrl = $frontendBase . '/php_backend/api/pesapal.php?action=callback&session_id=' . $sessionId;

            $billingAddress = [
                'email_address' => $sessionData['client_email'] ?: 'noreply@karehspa.co.ke',
                'phone_number' => $sessionData['client_phone'] ?: '0712345678',
                'country_code' => 'KE',
                'first_name' => $sessionData['customer_name'] ?: 'Customer',
                'middle_name' => '',
                'last_name' => '',
                'line_1' => 'Kareh\'s Spa',
                'line_2' => '',
                'city' => 'Nairobi',
                'state' => '',
                'postal_code' => '',
                'zip_code' => '',
            ];

            $roundedAmount = round($initData['amount'], 2);
            if ($roundedAmount < 0.01) {
                error_log('Pesapal initiatePayment: rounded amount is ' . $roundedAmount . ' from original ' . $initData['amount'] . ' for session ' . $sessionId);
                Response::error('Payment amount is invalid after rounding.', 400);
            }

            $orderData = [
                'id' => $initData['merchant_reference'],
                'currency' => 'KES',
                'amount' => $roundedAmount,
                'description' => 'Kareh\'s Spa — ' . $sessionData['session_code'],
                'callback_url' => $callbackUrl,
                'notification_id' => $ipnId,
                'billing_address' => $billingAddress,
            ];

            if ($paymentMethod === 'CARD') {
                $orderData['payment_method'] = 'CARD';
            }

            $order = $gateway->submitOrderRequest($token->token, $orderData);
            if (!$order || empty($order->redirect_url)) {
                Response::error('Failed to create payment order', 502);
            }

            $this->sessionModel->savePesapalOrderResponse(
                $sessionId,
                $order->order_tracking_id ?? '',
                $order->redirect_url
            );

            $this->sessionModel->logPaymentEvent($sessionId, 'initiated', [
                'payment_method' => $paymentMethod,
                'amount' => $initData['amount'],
                'merchant_reference' => $initData['merchant_reference'],
                'order_tracking_id' => $order->order_tracking_id ?? '',
            ], $order->order_tracking_id ?? '', $initData['merchant_reference']);

            ActivityLogger::logFromAuthData($this->conn, 'payment', 'initiated', "Online payment ( {$paymentMethod} ) of KES {$initData['amount']} initiated for session {$sessionData['session_code']}", $this->authData, 'session', $sessionId);

            Response::json([
                'message' => 'Payment initiated successfully',
                'redirect_url' => $order->redirect_url,
                'order_tracking_id' => $order->order_tracking_id ?? '',
                'merchant_reference' => $initData['merchant_reference'],
            ]);
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 500);
        } catch (\Throwable $e) {
            error_log('Pesapal initiatePayment error: ' . $e->getMessage());
            Response::error('Payment service unavailable', 502);
        }
    }

    private function paySession() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) $data = $_POST;
        $sessionId = intval($data['session_id'] ?? 0);
        $transactionCode = trim((string)($data['transaction_code'] ?? ''));
        $paymentMethod = strtoupper(trim((string)($data['payment_method'] ?? 'manual')));
        if ($sessionId <= 0) Response::error('session_id is required', 400);
        if ($transactionCode === '') Response::error('transaction_code is required', 400);

        if (!$this->sessionModel->paySession($sessionId, $transactionCode, $paymentMethod)) {
            $detail = $this->sessionModel->getLastError();
            Response::error($detail ?: 'Failed to record payment', 400);
        }
        $session = $this->sessionModel->getById($sessionId, $this->authData);
        $this->sessionModel->logPaymentEvent($sessionId, 'manual_payment', [
            'transaction_code' => $transactionCode,
            'amount' => $session['total_amount'] ?? 0,
        ]);
        ActivityLogger::logFromAuthData($this->conn, 'payment', 'manual', "Manual payment of KES {$session['total_amount']} recorded for session {$session['session_code']}", $this->authData, 'session', $sessionId);
        if (!empty($session['client_email'])) {
            require_once __DIR__ . '/../utils/AppointmentMailer.php';
            AppointmentMailer::sendPaymentReceived($session);
        }
        Response::json(['message' => 'Payment recorded successfully', 'session' => $session]);
    }

    private function getPaymentStatus() {
        $sessionId = intval($_GET['id'] ?? 0);
        if ($sessionId <= 0) {
            $merchantRef = trim((string)($_GET['merchant_reference'] ?? ''));
            if ($merchantRef === '') Response::error('id or merchant_reference is required', 400);
            $session = $this->sessionModel->findSessionByMerchantReference($merchantRef);
            if (!$session) Response::error('Session not found', 404);
            $sessionId = intval($session['id']);
        }

        $orderData = $this->sessionModel->getPesapalOrderStatus($sessionId);
        if (!$orderData) Response::error('Session not found', 404);

        $this->sessionModel->logPaymentEvent($sessionId, 'status_checked', [
            'billing_status' => $orderData['billing_status'] ?? 'unknown',
        ], $orderData['pesapal_order_tracking_id'] ?? null, $orderData['pesapal_merchant_reference'] ?? null);

        $billingStatus = strtolower((string)($orderData['billing_status'] ?? ''));
        if ($billingStatus === 'paid') {
            Response::json([
                'status' => 'completed',
                'message' => 'Payment completed successfully',
                'paid_at' => $orderData['paid_at'],
                'transaction_code' => $orderData['payment_transaction_code'],
            ]);
            return;
        }
        if ($billingStatus === 'failed') {
            Response::json(['status' => 'failed', 'message' => 'Payment failed']);
            return;
        }
        if ($billingStatus === 'cancelled') {
            Response::json(['status' => 'cancelled', 'message' => 'Payment was cancelled']);
            return;
        }

        $orderTrackingId = $orderData['pesapal_order_tracking_id'] ?? '';
        if ($orderTrackingId === '') {
            Response::json([
                'status' => 'pending',
                'message' => 'Payment not yet initiated',
            ]);
            return;
        }

        try {
            require_once __DIR__ . '/../utils/PesapalGateway.php';
            $gateway = new PesapalGateway();
            $token = $gateway->getAccessToken();
            if (!$token || empty($token->token)) {
                Response::json(['status' => 'pending', 'message' => 'Unable to verify payment status']);
                return;
            }

            $statusResult = $gateway->getTransactionStatus($token->token, $orderTrackingId);
            if (!$statusResult) {
                Response::json(['status' => 'pending', 'message' => 'Payment status unknown']);
                return;
            }

            $desc = strtolower((string)($statusResult->payment_status_description ?? ''));
            $code = $statusResult->payment_status ?? '';
            $confirmationCode = $statusResult->confirmation_code ?? '';

            if ($desc === 'completed' || $code === '1' || $desc === 'pending') {
                $confirmed = $this->sessionModel->confirmPesapalPayment($sessionId, $orderTrackingId, $confirmationCode);
                $this->sessionModel->logPaymentEvent($sessionId, 'confirmed', [
                    'payment_status_description' => $desc,
                    'payment_status' => $code,
                    'confirmation_code' => $confirmationCode,
                ], $orderTrackingId);
                if (is_array($confirmed) && !empty($confirmed['client_email'])) {
                    require_once __DIR__ . '/../utils/AppointmentMailer.php';
                    AppointmentMailer::sendPaymentReceived($confirmed);
                }
                Response::json([
                    'status' => 'completed',
                    'message' => 'Payment completed',
                    'paid_at' => date('Y-m-d H:i:s'),
                    'transaction_code' => $confirmationCode,
                    'confirmation_code' => $confirmationCode,
                ]);
            } elseif ($desc === 'failed' || $code === '3') {
                $this->sessionModel->failPesapalPayment($sessionId, $orderTrackingId);
                $this->sessionModel->logPaymentEvent($sessionId, 'failed', [
                    'payment_status_description' => $desc,
                    'payment_status' => $code,
                ], $orderTrackingId);
                Response::json(['status' => 'failed', 'message' => 'Payment failed']);
            } else {
                Response::json(['status' => 'pending', 'message' => 'Payment status: ' . ($statusResult->payment_status_description ?? 'unknown')]);
            }
        } catch (\Throwable $e) {
            error_log('Pesapal payment_status error: ' . $e->getMessage());
            Response::json(['status' => 'pending', 'message' => 'Unable to verify payment status']);
        }
    }

    private function deleteSession($id) {
        if ($this->sessionModel->delete($id)) {
            Response::json(['message' => 'Session deleted successfully']);
        } else {
            Response::error('Failed to delete session', 500);
        }
    }
}
