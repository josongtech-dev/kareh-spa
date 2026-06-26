<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Appointment.php';
require_once __DIR__ . '/../utils/Response.php';

class AppointmentManageController extends BaseController {
    private $appointmentModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->appointmentModel = new Appointment($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            if (!$data) {
                $data = $_POST;
            }
            $token = trim((string)($data['token'] ?? ''));
            $action = trim((string)($data['action'] ?? ''));

            if ($token === '') {
                Response::error('Token is required', 400);
            }

            if ($action === '' || $action === 'view') {
                $this->getByToken($token);
            } else {
                $this->manageByToken($token, $data);
            }
            return;
        }
        Response::error('Method not allowed', 405);
    }

    private function getByToken($token) {
        $appointment = $this->appointmentModel->getByManageToken($token);
        if (!$appointment) {
            Response::error('Appointment management link is invalid', 404);
        }
        if (!empty($appointment['is_expired'])) {
            Response::error('Appointment management link has expired', 410);
        }
        Response::json($appointment);
    }

    private function manageByToken($token, $data) {
        [$ok, $payload] = $this->appointmentModel->manageByToken($token, $data);
        if (!$ok) {
            Response::error((string)$payload, 400);
        }
        Response::json(['message' => 'Appointment updated successfully', 'appointment' => $payload]);
    }
}
