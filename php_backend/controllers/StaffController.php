<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Staff.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/AppointmentMailer.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/ActivityLogger.php';

class StaffController extends BaseController {
    private $staffModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->staffModel = new Staff($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;

        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getStaff($id);
                } else {
                    $this->getAllStaff();
                }
                break;
            case 'POST':
                if ($id) {
                    $this->updateStaff($id);
                } else {
                    $this->createStaff();
                }
                break;
            case 'PUT':
                // Note: PUT usually doesn't support multipart/form-data as easily in PHP
                // For simplicity, we can use POST with an _method override or just handle it as POST
                if ($id) {
                    $this->updateStaff($id);
                } else {
                    Response::error('ID is required for update', 400);
                }
                break;
            case 'DELETE':
                if ($id) {
                    $this->deleteStaff($id);
                } else {
                    Response::error('ID is required for deletion', 400);
                }
                break;
            default:
                Response::error('Method not allowed', 405);
                break;
        }
    }

    private function getAllStaff() {
        $staff = $this->staffModel->getAll();
        $roleFilter = isset($_GET['role']) ? strtolower(trim($_GET['role'])) : '';
        $statusFilter = isset($_GET['status']) ? strtolower(trim($_GET['status'])) : '';

        if ($roleFilter !== '') {
            $staff = array_values(array_filter($staff, function ($row) use ($roleFilter) {
                return strtolower((string)($row['role'] ?? '')) === $roleFilter;
            }));
        }

        if ($statusFilter !== '') {
            $staff = array_values(array_filter($staff, function ($row) use ($statusFilter) {
                return strtolower((string)($row['status'] ?? '')) === $statusFilter;
            }));
        }

        Response::json($staff);
    }

    private function getStaff($id) {
        $member = $this->staffModel->getById($id);
        if ($member) {
            Response::json($member);
        } else {
            Response::error('Staff member not found', 404);
        }
    }

    private function createStaff() {
        // Map frontend camelCase to backend snake_case
        $data = $_POST;
        
        if (
            empty($data['name']) ||
            empty($data['phone']) ||
            empty($data['username']) ||
            empty($data['email']) ||
            empty($data['idNumber'])
        ) {
            Response::error('Name, Email, Phone, Username, and ID Number are required', 400);
        }
        if (!filter_var((string)$data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('A valid email address is required', 400);
        }

        // Mapping
        // Mapping & Hashing
        if (isset($data['idNumber'])) $data['id_number'] = $data['idNumber'];
        if (isset($data['additionalInfo'])) $data['additional_info'] = $data['additionalInfo'];
        if (isset($data['commissionRate'])) $data['commission_rate'] = $data['commissionRate'] !== '' ? (float)$data['commissionRate'] : null;
        if (isset($data['email']) && !filter_var((string)$data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('A valid email address is required', 400);
        }
        $plainActivationPassword = $data['activationPassword'] ?? '';
        if (!empty($data['activationPassword'])) {
            $data['activation_password'] = password_hash($data['activationPassword'], PASSWORD_DEFAULT);
        }
        if (!empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $duplicateChecks = [
            'username' => ['label' => 'Username', 'value' => $data['username'] ?? null],
            'email' => ['label' => 'Email address', 'value' => $data['email'] ?? null],
            'phone' => ['label' => 'Phone number', 'value' => $data['phone'] ?? null],
            'id_number' => ['label' => 'ID number', 'value' => $data['id_number'] ?? null],
        ];

        foreach ($duplicateChecks as $field => $meta) {
            if ($this->staffModel->findDuplicateField($field, $meta['value'])) {
                Response::error($meta['label'] . ' already exists. Use a unique value.', 409);
            }
        }
        
        $authData = AuthMiddleware::requireAuth(['owner', 'manager']);
        $data['created_by'] = $authData['user_id'];

        // Handle Image Upload
        $image_path = '';
        if (isset($_FILES['passport_image']) && $_FILES['passport_image']['error'] === UPLOAD_ERR_OK) {
            $image_path = $this->uploadFile($_FILES['passport_image']);
            if (!$image_path) {
                Response::error('Failed to upload image', 500);
            }
        }

        $data['image_path'] = $image_path;
        $id = $this->staffModel->create($data);

        if ($id) {
            $newStaff = $this->staffModel->getById($id);
            AppointmentMailer::sendStaffActivationEmail($newStaff ?: $data, $plainActivationPassword);
            ActivityLogger::logFromAuthData($this->conn, 'staff', 'create', "Created staff member #{$id}", null, 'staff', $id);
            Response::json(['message' => 'Staff member created', 'id' => $id], 201);
        } else {
            Response::error('Failed to create staff member', 500);
        }
    }

    private function updateStaff($id) {
        $data = $_POST; 
        
        // Mapping
        // Mapping & Hashing
        if (isset($data['idNumber'])) $data['id_number'] = $data['idNumber'];
        if (isset($data['additionalInfo'])) $data['additional_info'] = $data['additionalInfo'];
        if (isset($data['commissionRate'])) $data['commission_rate'] = $data['commissionRate'] !== '' ? (float)$data['commissionRate'] : null;
        if (!empty($data['activationPassword'])) {
            $data['activation_password'] = password_hash($data['activationPassword'], PASSWORD_DEFAULT);
        }
        if (!empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $duplicateChecks = [
            'username' => ['label' => 'Username', 'value' => $data['username'] ?? null],
            'email' => ['label' => 'Email address', 'value' => $data['email'] ?? null],
            'phone' => ['label' => 'Phone number', 'value' => $data['phone'] ?? null],
            'id_number' => ['label' => 'ID number', 'value' => $data['id_number'] ?? null],
        ];

        foreach ($duplicateChecks as $field => $meta) {
            if ($this->staffModel->findDuplicateField($field, $meta['value'], $id)) {
                Response::error($meta['label'] . ' already exists. Use a unique value.', 409);
            }
        }

        if (isset($_FILES['passport_image']) && $_FILES['passport_image']['error'] === UPLOAD_ERR_OK) {
            $image_path = $this->uploadFile($_FILES['passport_image']);
            if ($image_path) {
                $data['image_path'] = $image_path;
            }
        }

        if ($this->staffModel->update($id, $data)) {
            ActivityLogger::logFromAuthData($this->conn, 'staff', 'update', "Updated staff member #{$id}", null, 'staff', $id);
            Response::json(['message' => 'Staff member updated']);
        } else {
            Response::error('Failed to update staff member', 500);
        }
    }

    private function deleteStaff($id) {
        if ($this->staffModel->delete($id)) {
            ActivityLogger::logFromAuthData($this->conn, 'staff', 'delete', "Deleted staff member #{$id}", null, 'staff', $id);
            Response::json(['message' => 'Staff member deleted']);
        } else {
            Response::error('Failed to delete staff member', 500);
        }
    }

    private function uploadFile($file) {
        $target_dir = __DIR__ . '/../uploads/';
        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0755, true);
        }

        $maxSize = 5 * 1024 * 1024;
        if (($file['size'] ?? 0) > $maxSize) {
            return false;
        }

        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $file_extension = strtolower((string)pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($file_extension, $allowedExtensions, true)) {
            return false;
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = $finfo ? finfo_file($finfo, $file['tmp_name']) : '';
        if ($finfo) {
            finfo_close($finfo);
        }
        if (!in_array($mimeType, $allowedMimeTypes, true)) {
            return false;
        }

        $file_name = bin2hex(random_bytes(16)) . '.' . $file_extension;
        $target_file = $target_dir . $file_name;

        if (move_uploaded_file($file['tmp_name'], $target_file)) {
            // Return only the relative path as requested
            return 'uploads/' . $file_name;
        }
        return false;
    }
}
