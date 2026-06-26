<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Session.php';
require_once __DIR__ . '/../utils/Response.php';

class SessionFeedbackController extends BaseController {
    private $sessionModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->sessionModel = new Session($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            $data = $_POST;
        }

        $token = trim((string)($data['token'] ?? ''));
        if ($token === '') {
            Response::error('Feedback token is required', 400);
        }

        $action = trim((string)($data['action'] ?? 'view'));
        if ($action === 'view') {
            $this->getFeedbackContext($token);
        } else {
            $this->submitFeedback($data);
        }
    }

    private function getFeedbackContext($token) {
        $context = $this->sessionModel->getFeedbackContextByToken($token);
        if (!$context) {
            Response::error('Feedback link is invalid', 404);
        }
        if (!empty($context['is_expired'])) {
            Response::error('Feedback link has expired', 410);
        }
        if (!empty($context['is_submitted'])) {
            Response::error('Feedback already submitted for this session', 409);
        }

        Response::json([
            'session_code' => $context['session_code'] ?? '',
            'customer_name' => $context['customer_name'] ?? '',
            'total_amount' => $context['total_amount'] ?? 0,
            'created_at' => $context['created_at'] ?? null,
            'paid_at' => $context['paid_at'] ?? null
        ]);
    }

    private function submitFeedback($data) {
        $token = trim((string)($data['token'] ?? ''));
        $serviceRating = intval($data['service_rating'] ?? 0);
        $billingRating = intval($data['billing_rating'] ?? 0);
        $feedbackText = trim((string)($data['feedback_text'] ?? ''));

        if ($serviceRating < 1 || $serviceRating > 5) {
            Response::error('Service rating must be between 1 and 5', 400);
        }
        if ($billingRating < 1 || $billingRating > 5) {
            Response::error('Billing rating must be between 1 and 5', 400);
        }

        $ok = $this->sessionModel->submitFeedbackByToken($token, $serviceRating, $billingRating, $feedbackText);
        if (!$ok) {
            Response::error('Feedback could not be submitted. Link may be invalid, expired, or already used.', 409);
        }

        Response::json(['message' => 'Thank you for your feedback']);
    }
}
