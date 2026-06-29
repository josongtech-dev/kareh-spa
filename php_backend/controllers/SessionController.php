<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Session.php';
require_once __DIR__ . '/../models/Commission.php';
require_once __DIR__ . '/../models/Member.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/AppointmentMailer.php';

class SessionController extends BaseController {
    private $sessionModel;
    private $commissionModel;
    private $authData;

    public function __construct($db, $authData = null) {
        parent::__construct($db);
        $this->sessionModel = new Session($db);
        $this->commissionModel = new Commission($db);
        $this->authData = $authData;
    }

    private function normalizeContactValue($value) {
        return trim((string)($value ?? ''));
    }

    private function isValidPhone($phone) {
        if ($phone === '') return true;
        return (bool) preg_match('/^\+?[0-9\s\-()]{7,20}$/', $phone);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = $this->resolveRequestId();
        $action = $this->resolveRequestAction();

        switch ($method) {
            case 'GET':
                if ($action === 'feedback_summary') {
                    $this->getFeedbackSummary();
                } elseif ($action === 'feedback_notifications') {
                    $this->getFeedbackNotifications();
                } elseif ($id !== null && $id > 0) {
                    $this->getSession($id);
                } elseif ($id !== null && $id <= 0) {
                    Response::error('Valid session ID is required', 400);
                } else {
                    $this->getAllSessions();
                }
                break;
            case 'POST':
                if ($action === 'add_service') {
                    $this->addService();
                } elseif ($action === 'add_addon') {
                    $this->addAddon();
                } elseif ($action === 'remove_addon') {
                    $this->removeAddon();
                } elseif ($action === 'apply_billing_discount') {
                    $this->applyBillingDiscount();
                } elseif ($action === 'request_payment') {
                    $this->requestPayment();
                } elseif ($action === 'confirm_payment') {
                    $this->confirmPayment();
                } elseif ($action === 'service_line_action') {
                    $this->serviceLineAction();
                } elseif ($action === 'mark_feedback_viewed') {
                    $this->markFeedbackViewed();
                } elseif ($action === 'mark_all_feedback_viewed') {
                    $this->markAllFeedbackViewed();
                } else {
                    $this->createSession();
                }
                break;
            case 'PUT':
                if ($id !== null && $id > 0) {
                    $this->updateSession($id);
                } else {
                    Response::error('ID is required for update', 400);
                }
                break;
            case 'DELETE':
                if ($id !== null && $id > 0) {
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

    private function resolveRequestId(): ?int {
        if (isset($_GET['id'])) {
            return intval($_GET['id']);
        }
        $body = $this->getBody();
        if (isset($body['id'])) {
            return intval($body['id']);
        }
        return null;
    }

    private function resolveRequestAction(): string {
        return trim((string)$this->getParam('action', ''));
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
        $feedbackId = intval($this->getParam('feedback_id', 0));
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
        $data = $this->getBody();

        // Mapping frontend fields if necessary
        $appointmentId = $data['appointment_id'] ?? ($data['appointmentId'] ?? null);
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

            // Same rule as Appointments UI: session opens at most 30 minutes before appointment start.
            $apptDate = trim((string)($appointmentData['appointment_date'] ?? ''));
            $apptTime = trim((string)($appointmentData['appointment_time'] ?? ''));
            if ($apptDate !== '' && $apptTime !== '') {
                $timePart = substr($apptTime, 0, 8);
                $startTs = strtotime($apptDate . ' ' . $timePart);
                if ($startTs !== false) {
                    $earliestTs = $startTs - (30 * 60);
                    if (time() < $earliestTs) {
                        Response::error(
                            'A session can only be opened within 30 minutes before the appointment start time.',
                            400
                        );
                    }
                }
            }
        }

        $sessionData = [
            'customer_name' => $data['customer_name'] ?? ($data['customerName'] ?? ($appointmentData['customer_name'] ?? '')),
            'client_phone' => $data['client_phone'] ?? ($data['clientPhone'] ?? ($appointmentData['customer_phone'] ?? '')),
            'client_email' => $data['client_email'] ?? ($data['clientEmail'] ?? ($appointmentData['customer_email'] ?? '')),
            'staff_id' => $data['staff_id'] ?? ($data['staffId'] ?? ($appointmentData['staff_id'] ?? null)),
            'service_id' => $data['service_id'] ?? ($data['serviceId'] ?? ($appointmentData['service_id'] ?? null)),
            'total_amount' => $data['total_amount'] ?? ($data['totalAmount'] ?? 0.00),
            'status' => 'In Progress',
            'notes' => $data['notes'] ?? '',
            'additional_services' => $data['additional_services'] ?? [],
            'appointment_id' => $appointmentId
        ];

        if (!empty($appointmentId)) {
            $mappedServices = $this->sessionModel->buildSessionServicesFromAppointment(
                $appointmentId,
                intval($sessionData['staff_id'] ?? 0)
            );
            if ($mappedServices) {
                $sessionData['service_id'] = $mappedServices['service_id'];
                $sessionData['total_amount'] = $mappedServices['total_amount'];
                $sessionData['additional_services'] = array_merge(
                    $mappedServices['additional_services'],
                    $sessionData['additional_services']
                );
            }
        }

        if (empty($sessionData['customer_name'])) {
            Response::error('Customer name is required', 400);
        }

        $sessionData['client_phone'] = $this->normalizeContactValue($sessionData['client_phone']);
        $sessionData['client_email'] = strtolower($this->normalizeContactValue($sessionData['client_email']));
        if ($sessionData['client_email'] === '') {
            Response::error('Client email is required before starting a session', 400);
        }
        if (!filter_var($sessionData['client_email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Client email format is invalid', 400);
        }
        if (!$this->isValidPhone($sessionData['client_phone'])) {
            Response::error('Client phone format is invalid', 400);
        }

        $id = intval($this->sessionModel->create($sessionData));

        if ($id > 0) {
            $newSession = $this->sessionModel->getById($id, $this->authData);
            if (!$newSession) {
                Response::error('Session was created but could not be loaded. Please refresh the sessions list.', 500);
            }
            $sessionNotifyData = $this->sessionModel->getSessionNotificationData($id);
            if ($sessionNotifyData) {
                AppointmentMailer::sendSessionStarted($sessionNotifyData);
            }
            Response::json(['message' => 'Session created successfully', 'session' => $newSession], 201);
        } else {
            $detail = trim((string)($this->sessionModel->getLastError() ?? ''));
            $message = $detail !== '' ? $detail : 'Failed to create session';
            Response::error($message, 500);
        }
    }

    private function updateSession($id) {
        $data = $this->getBody();

        if (array_key_exists('client_email', $data)) {
            $email = strtolower($this->normalizeContactValue($data['client_email']));
            if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Response::error('Client email format is invalid', 400);
            }
            $data['client_email'] = $email;
        }
        if (array_key_exists('client_phone', $data)) {
            $phone = $this->normalizeContactValue($data['client_phone']);
            if (!$this->isValidPhone($phone)) {
                Response::error('Client phone format is invalid', 400);
            }
            $data['client_phone'] = $phone;
        }

        $beforeSession = $this->sessionModel->getById($id, $this->authData);
        if (!$beforeSession) {
            Response::error('Session not found', 404);
        }

        $billingStatus = strtolower((string)($beforeSession['billing_status'] ?? 'unbilled'));
        if ($billingStatus === 'paid' && isset($data['status']) && strcasecmp((string)$data['status'], (string)($beforeSession['status'] ?? '')) !== 0) {
            Response::error('Paid sessions cannot be reopened or status-modified.', 400);
        }
        if ($billingStatus === 'paid' && isset($data['status']) && $data['status'] === 'Voided') {
            Response::error('Paid sessions cannot be voided.', 400);
        }

        if ($this->sessionModel->update($id, $data)) {
            $updatedSession = $this->sessionModel->getById($id, $this->authData);

            $previousStatus = strtolower((string) ($beforeSession['status'] ?? ''));
            $currentStatus = strtolower((string) ($updatedSession['status'] ?? ''));
            if ($previousStatus !== 'completed' && $currentStatus === 'completed') {
                $clientEmail = strtolower(trim((string)($updatedSession['client_email'] ?? '')));
                if ($clientEmail !== '') {
                    $memberModel = new Member($this->conn);
                    $member = $memberModel->findByEmail($clientEmail);
                    if ($member) {
                        $spend = floatval($updatedSession['total_amount'] ?? 0);
                        $pointsToAward = (int) floor($spend / 100);
                        if ($pointsToAward > 0) {
                            $memberModel->adjustPoints((int)$member['id'], $pointsToAward);
                        }
                    }
                }

                $sessionNotifyData = $this->sessionModel->getSessionNotificationData($id);
                if ($sessionNotifyData && !empty($sessionNotifyData['client_email'])) {
                    $token = $this->sessionModel->createOrRefreshFeedbackToken($id);
                    AppointmentMailer::sendSessionCompletedWithFeedback($sessionNotifyData, $token ?: null);
                }
            }

            Response::json(['message' => 'Session updated successfully', 'session' => $updatedSession]);
        } else {
            Response::error('Failed to update session', 500);
        }
    }

    private function serviceLineAction() {
        $action = trim((string)$this->getParam('line_action', ''));
        $serviceLineId = intval($this->getParam('service_line_id', 0));
        if ($serviceLineId <= 0) {
            Response::error('service_line_id is required', 400);
        }

        if ($action === 'assign_staff') {
            $staffId = intval($this->getParam('staff_id', 0));
            if ($staffId <= 0) Response::error('staff_id is required', 400);
            if (!$this->sessionModel->assignStaffToServiceLine($serviceLineId, $staffId)) {
                Response::error('Failed to assign staff to service line', 500);
            }
            Response::json(['message' => 'Staff assigned to service line']);
        }

        if ($action === 'update_notes') {
            $notes = trim((string)$this->getParam('notes', ''));
            if (!$this->sessionModel->updateServiceLineNotes($serviceLineId, $notes)) {
                Response::error('Failed to update service line notes', 500);
            }
            Response::json(['message' => 'Service line notes updated']);
        }

        if ($action === 'set_status') {
            $status = trim((string)$this->getParam('status', ''));
            $line = $this->sessionModel->updateServiceLineStatus($serviceLineId, $status);
            if (!$line) {
                Response::error('Failed to update service line status', 500);
            }

            if ($status === 'completed') {
                $this->commissionModel->upsertFromServiceLine(
                    intval($line['session_id']),
                    intval($line['service_line_id']),
                    intval($line['service_id']),
                    intval($line['assigned_staff_id']),
                    floatval($line['price'])
                );
            }

            Response::json(['message' => 'Service line status updated']);
        }

        Response::error('Unsupported service line action', 400);
    }

    private function addService() {
        $sessionId = intval($this->getParam('session_id', 0));
        $serviceId = intval($this->getParam('service_id', 0));
        $price = floatval(str_replace(',', '', (string)$this->getParam('price', 0)));

        if ($sessionId <= 0 || $serviceId <= 0) {
            error_log("Session addService failed: Missing IDs - Session: $sessionId, Service: $serviceId");
            Response::error('Session ID and Service ID are required', 400);
        }

        if ($this->sessionModel->addServiceToSession($sessionId, $serviceId, $price)) {
            $session = $this->sessionModel->getById($sessionId, $this->authData);
            Response::json(['message' => 'Service added to session successfully', 'session' => $session]);
        } else {
            Response::error($this->sessionModel->getLastError() ?: 'Failed to add service to session', 400);
        }
    }

    private function addAddon() {
        $sessionId = intval($this->getParam('session_id', 0));
        $addonId = intval($this->getParam('addon_id', 0));
        $quantity = intval($this->getParam('quantity', 1));

        if ($sessionId <= 0 || $addonId <= 0) {
            Response::error($addonId <= 0
                ? 'Addon ID is invalid (0). Run docs/fix_production_zero_ids.sql on the production database.'
                : 'Session ID and Addon ID are required', 400);
        }
        if ($quantity <= 0) {
            Response::error('Quantity must be at least 1', 400);
        }

        if ($this->sessionModel->addAddonToSession($sessionId, $addonId, $quantity)) {
            $session = $this->sessionModel->getById($sessionId, $this->authData);
            Response::json(['message' => 'Addon added to session successfully', 'session' => $session]);
        } else {
            Response::error($this->sessionModel->getLastError() ?: 'Failed to add addon to session', 400);
        }
    }

    private function removeAddon() {
        $addonLineId = intval($this->getParam('addon_line_id', 0));
        if ($addonLineId <= 0) {
            Response::error('addon_line_id is required', 400);
        }

        if ($this->sessionModel->removeAddonFromSession($addonLineId)) {
            Response::json(['message' => 'Addon removed from session successfully']);
        } else {
            Response::error($this->sessionModel->getLastError() ?: 'Failed to remove addon from session', 400);
        }
    }

    private function applyBillingDiscount() {
        $sessionId = intval($this->getParam('session_id', 0));
        $discountType = trim((string)$this->getParam('discount_type', 'amount'));
        $discountValue = floatval($this->getParam('discount_value', 0));

        if ($sessionId <= 0) Response::error('session_id is required', 400);
        if (!in_array($discountType, ['amount', 'percent'], true)) Response::error('Invalid discount_type', 400);
        if ($discountValue < 0) Response::error('discount_value cannot be negative', 400);

        if (!$this->sessionModel->applyBillingDiscount($sessionId, $discountType, $discountValue)) {
            Response::error('Failed to apply billing discount', 400);
        }
        $session = $this->sessionModel->getById($sessionId, $this->authData);
        Response::json(['message' => 'Billing discount applied', 'session' => $session]);
    }

    private function requestPayment() {
        $sessionId = intval($this->getParam('session_id', 0));
        if ($sessionId <= 0) Response::error('session_id is required', 400);

        if (!$this->sessionModel->requestPayment($sessionId)) {
            Response::error('Failed to request payment', 400);
        }
        $session = $this->sessionModel->getById($sessionId, $this->authData);
        Response::json(['message' => 'Payment request recorded', 'session' => $session]);
    }

    private function confirmPayment() {
        $sessionId = intval($this->getParam('session_id', 0));
        $transactionCode = trim((string)$this->getParam('transaction_code', ''));
        if ($sessionId <= 0) Response::error('session_id is required', 400);
        if ($transactionCode === '') Response::error('transaction_code is required', 400);

        if (!$this->sessionModel->confirmPayment($sessionId, $transactionCode)) {
            Response::error('Failed to confirm payment', 400);
        }
        $session = $this->sessionModel->getById($sessionId, $this->authData);
        Response::json(['message' => 'Payment confirmed', 'session' => $session]);
    }

    private function deleteSession($id) {
        if ($this->sessionModel->delete($id)) {
            Response::json(['message' => 'Session deleted successfully']);
        } else {
            Response::error('Failed to delete session', 500);
        }
    }
}
