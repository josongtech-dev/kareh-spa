<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Member.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/AppointmentMailer.php';
require_once __DIR__ . '/../utils/ActivityLogger.php';

class MemberController extends BaseController {
    private $memberModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->memberModel = new Member($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $action = isset($_GET['action']) ? $_GET['action'] : '';

        if ($id === null || $action === '') {
            $body = $this->getBody();
            if ($id === null && isset($body['id'])) $id = intval($body['id']);
            if ($action === '' && isset($body['action'])) $action = trim((string)$body['action']);
        }

        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getMember($id);
                } else {
                    $this->getAllMembers();
                }
                break;
            case 'POST':
                if ($action === 'adjust_points' && $id) {
                    $this->adjustPoints($id);
                } else {
                    $this->createMember();
                }
                break;
            case 'PUT':
                if ($id) {
                    $this->updateMember($id);
                } else {
                    Response::error('ID is required for update', 400);
                }
                break;
            case 'DELETE':
                if ($id) {
                    $this->deleteMember($id);
                } else {
                    Response::error('ID is required for deletion', 400);
                }
                break;
            default:
                Response::error('Method not allowed', 405);
                break;
        }
    }

    private function getAllMembers() {
        $members = $this->memberModel->getAll();
        Response::json($members);
    }

    private function getMember($id) {
        $member = $this->memberModel->getById($id);
        if ($member) {
            Response::json($member);
        } else {
            Response::error('Member not found', 404);
        }
    }

    private function createMember() {
        $data = $this->getBody();

        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            Response::error('Name, Email, and Password are required', 400);
        }
        if (!filter_var((string)$data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('A valid email address is required', 400);
        }
        if (strlen((string)$data['password']) < 8) {
            Response::error('Password must be at least 8 characters', 400);
        }

        $id = $this->memberModel->create($data);
        if ($id) {
            $newMember = $this->memberModel->getById($id);
            AppointmentMailer::sendMemberWelcomeEmail($newMember);
            ActivityLogger::logFromAuthData($this->conn, 'member', 'create', "Created member #{$id}", null, 'member', $id);
            Response::json(['message' => 'Member registered successfully', 'member' => $newMember], 201);
        } else {
            Response::error('Failed to register member. Email might be already in use.', 500);
        }
    }

    private function updateMember($id) {
        $data = $this->getBody();

        if (isset($data['email']) && !filter_var((string)$data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('A valid email address is required', 400);
        }
        if (isset($data['loyalty_points']) && intval($data['loyalty_points']) < 0) {
            Response::error('Loyalty points cannot be negative', 400);
        }

        if ($this->memberModel->update($id, $data)) {
            $updatedMember = $this->memberModel->getById($id);
            ActivityLogger::logFromAuthData($this->conn, 'member', 'update', "Updated member #{$id}", null, 'member', $id);
            Response::json(['message' => 'Member updated successfully', 'member' => $updatedMember]);
        } else {
            Response::error('Failed to update member', 500);
        }
    }

    private function deleteMember($id) {
        if ($this->memberModel->delete($id)) {
            ActivityLogger::logFromAuthData($this->conn, 'member', 'delete', "Deleted member #{$id}", null, 'member', $id);
            Response::json(['message' => 'Member deleted successfully']);
        } else {
            Response::error('Failed to delete member', 500);
        }
    }

    private function adjustPoints($id) {
        $data = $this->getBody();
        $pointsChange = intval($data['points_change'] ?? 0);
        if ($pointsChange === 0) {
            Response::error('Points change must be a non-zero integer', 400);
        }

        if ($this->memberModel->adjustPoints($id, $pointsChange)) {
            $updatedMember = $this->memberModel->getById($id);
            Response::json(['message' => 'Points adjusted successfully', 'member' => $updatedMember]);
        } else {
            Response::error('Failed to adjust points', 500);
        }
    }
}
