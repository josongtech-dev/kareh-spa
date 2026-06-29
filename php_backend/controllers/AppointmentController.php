<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Appointment.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/AppointmentMailer.php';
require_once __DIR__ . '/../utils/SmsSender.php';
require_once __DIR__ . '/../utils/ActivityLogger.php';

class AppointmentController extends BaseController {
    private $appointmentModel;
    private $authData;

    public function __construct($db, $authData = null) {
        parent::__construct($db);
        $this->appointmentModel = new Appointment($db);
        $this->authData = $authData;
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $customerEmail = isset($_GET['customer_email']) ? trim($_GET['customer_email']) : '';
        $dateFrom = isset($_GET['date_from']) ? trim($_GET['date_from']) : '';
        $dateTo = isset($_GET['date_to']) ? trim($_GET['date_to']) : '';
        $checkDate = isset($_GET['check_date']) ? trim($_GET['check_date']) : '';

        if ($id === null) {
            $body = $this->getBody();
            if ($id === null && isset($body['id'])) $id = intval($body['id']);
        }

        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getAppointment($id);
                } elseif ($customerEmail !== '') {
                    $this->getAppointmentsByCustomerEmail($customerEmail);
                } elseif ($checkDate !== '') {
                    $this->checkAvailability($checkDate);
                } elseif ($dateFrom !== '' && $dateTo !== '') {
                    $this->getAppointmentsByDateRange($dateFrom, $dateTo);
                } else {
                    $this->getAllAppointments();
                }
                break;
            case 'POST':
                $this->createAppointment();
                break;
            case 'PUT':
                if ($id) {
                    $this->updateAppointment($id);
                } else {
                    Response::error('ID is required for update', 400);
                }
                break;
            case 'DELETE':
                if ($id) {
                    $this->deleteAppointment($id);
                } else {
                    Response::error('ID is required for deletion', 400);
                }
                break;
            default:
                Response::error('Method not allowed', 405);
                break;
        }
    }

    private function getAllAppointments() {
        $appointments = $this->appointmentModel->getAll($this->authData);
        Response::json($appointments);
    }

    private function getAppointmentsByDateRange($dateFrom, $dateTo) {
        $staffId = isset($_GET['staff_id']) ? intval($_GET['staff_id']) : null;
        $appointments = $this->appointmentModel->getByDateRange($dateFrom, $dateTo, $staffId);
        Response::json($appointments);
    }

    private function checkAvailability($date) {
        $staffId = isset($_GET['staff_id']) && $_GET['staff_id'] !== '' ? intval($_GET['staff_id']) : null;
        $bookedSlots = $this->appointmentModel->getByDateRange($date, $date, $staffId);

        $bookedTimes = [];
        foreach ($bookedSlots as $apt) {
            $time = substr($apt['appointment_time'] ?? '', 0, 5);
            $status = strtolower($apt['status'] ?? '');
            if ($status !== 'cancelled') {
                $bookedTimes[] = $time;
            }
        }
        $bookedTimes = array_unique($bookedTimes);
        sort($bookedTimes);

        $allSlots = [];
        for ($h = 6; $h <= 21; $h++) {
            for ($m = 0; $m < 60; $m += 30) {
                $allSlots[] = sprintf('%02d:%02d', $h, $m);
            }
        }

        $available = array_values(array_diff($allSlots, $bookedTimes));

        Response::json([
            'date' => $date,
            'staff_id' => $staffId,
            'available_slots' => $available,
            'booked_slots' => array_values($bookedTimes),
        ]);
    }

    private function getAppointmentsByCustomerEmail($email) {
        $appointments = $this->appointmentModel->getByCustomerEmail($email);
        Response::json($appointments);
    }

    private function getAppointment($id) {
        $appointment = $this->appointmentModel->getById($id);
        if ($appointment) {
            Response::json($appointment);
        } else {
            Response::error('Appointment not found', 404);
        }
    }

    private function createAppointment() {
        $data = $this->getBody();
        
        if (!$data) {
            $data = $_POST;
        }

        if (empty($data['customer_name']) || empty($data['customer_phone']) || empty($data['appointment_date']) || empty($data['appointment_time'])) {
            Response::error('Name, Phone, Date, and Time are required', 400);
        }
        $serviceIds = [];
        if (isset($data['service_ids']) && is_array($data['service_ids'])) {
            foreach ($data['service_ids'] as $sid) {
                $sid = intval($sid);
                if ($sid > 0) $serviceIds[] = $sid;
            }
        } elseif (isset($data['service_id']) && $data['service_id'] !== '') {
            $sid = intval($data['service_id']);
            if ($sid > 0) $serviceIds[] = $sid;
        }
        if (empty($serviceIds)) {
            Response::error('At least one service is required', 400);
        }
        $data['service_ids'] = $serviceIds;
        $data['service_id'] = $serviceIds[0];

        $email = strtolower(trim((string)($data['customer_email'] ?? '')));
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('If provided, email must be valid', 400);
        }
        $data['customer_email'] = $email;

        $staffId = isset($data['staff_id']) && $data['staff_id'] !== '' ? intval($data['staff_id']) : null;
        $conflicts = $this->appointmentModel->getConflictingAppointments(
            $data['appointment_date'], $data['appointment_time'], $staffId
        );
        if (!empty($conflicts)) {
            $conflictNames = array_map(function ($c) {
                return $c['customer_name'] . ($c['staff_name'] ? ' (' . $c['staff_name'] . ')' : '');
            }, $conflicts);
            Response::error('Time slot conflicts with existing booking(s): ' . implode(', ', $conflictNames), 409);
        }

        $id = $this->appointmentModel->create($data);

        if ($id) {
            $newAppointment = $this->appointmentModel->getById($id);
            $manageToken = $this->appointmentModel->createOrRefreshManageToken($id);
            AppointmentMailer::sendBookingReceived($newAppointment, $manageToken ?: null);
            SmsSender::sendBookingReceived($newAppointment);
            SmsSender::sendAdminNotification("New booking #{$id} from {$newAppointment['customer_name']} for {$newAppointment['service_name']} on {$newAppointment['appointment_date']}");
            ActivityLogger::logFromAuthData($this->conn, 'appointment', 'create', "Created appointment #{$id}", $this->authData, 'appointment', $id);
            Response::json(['message' => 'Appointment created successfully', 'appointment' => $newAppointment], 201);
        } else {
            Response::error('Failed to create appointment', 500);
        }
    }

    private function updateAppointment($id) {
        $data = $this->getBody();
        
        if (!$data) {
            $data = $_POST;
        }

        $existingAppointment = $this->appointmentModel->getById($id);
        if (!$existingAppointment) {
            Response::error('Appointment not found', 404);
        }

        $date = $data['appointment_date'] ?? $existingAppointment['appointment_date'];
        $time = $data['appointment_time'] ?? $existingAppointment['appointment_time'];
        $staffId = isset($data['staff_id']) && $data['staff_id'] !== ''
            ? intval($data['staff_id'])
            : (isset($existingAppointment['staff_id']) ? intval($existingAppointment['staff_id']) : null);
        $conflicts = $this->appointmentModel->getConflictingAppointments($date, $time, $staffId, $id);
        if (!empty($conflicts)) {
            $conflictNames = array_map(function ($c) {
                return $c['customer_name'] . ($c['staff_name'] ? ' (' . $c['staff_name'] . ')' : '');
            }, $conflicts);
            Response::error('Time slot conflicts with existing booking(s): ' . implode(', ', $conflictNames), 409);
        }

        if ($this->appointmentModel->update($id, $data)) {
            $updatedAppointment = $this->appointmentModel->getById($id);

            $previousStatus = strtolower((string) ($existingAppointment['status'] ?? ''));
            $currentStatus = strtolower((string) ($updatedAppointment['status'] ?? ''));
            if ($previousStatus !== 'confirmed' && $currentStatus === 'confirmed') {
                AppointmentMailer::sendBookingConfirmed($updatedAppointment);
                SmsSender::sendBookingConfirmed($updatedAppointment);
                SmsSender::sendAdminNotification("Booking #{$id} ({$updatedAppointment['customer_name']}) CONFIRMED for {$updatedAppointment['service_name']} on {$updatedAppointment['appointment_date']}");
            }

            ActivityLogger::logFromAuthData($this->conn, 'appointment', 'update', "Updated appointment #{$id}", $this->authData, 'appointment', $id);
            Response::json(['message' => 'Appointment updated successfully', 'appointment' => $updatedAppointment]);
        } else {
            Response::error('Failed to update appointment', 500);
        }
    }

    private function deleteAppointment($id) {
        if ($this->appointmentModel->delete($id)) {
            ActivityLogger::logFromAuthData($this->conn, 'appointment', 'cancel', "Cancelled appointment #{$id}", $this->authData, 'appointment', $id);
            Response::json(['message' => 'Appointment deleted successfully']);
        } else {
            Response::error('Failed to delete appointment', 500);
        }
    }
}
