<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Service.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/ActivityLogger.php';

class ServiceController extends BaseController {
    private $serviceModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->serviceModel = new Service($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $resource = isset($_GET['resource']) ? trim((string) $_GET['resource']) : '';
        $action = isset($_GET['action']) ? trim((string) $_GET['action']) : '';

        if ($id === null || $action === '' || $resource === '') {
            $body = $this->getBody();
            if ($id === null && isset($body['id'])) $id = intval($body['id']);
            if ($action === '' && isset($body['action'])) $action = trim((string)$body['action']);
            if ($resource === '' && isset($body['resource'])) $resource = trim((string)$body['resource']);
            // Also check $_POST for multipart form data (uploads send id in FormData)
            if ($id === null && isset($_POST['id'])) $id = intval($_POST['id']);
            if ($action === '' && isset($_POST['action'])) $action = trim((string)$_POST['action']);
            if ($resource === '' && isset($_POST['resource'])) $resource = trim((string)$_POST['resource']);
        }

        switch ($method) {
            case 'GET':
                if ($resource === 'categories') {
                    $this->getServiceCategories();
                } elseif ($resource === 'linked-products' && $id) {
                    $this->getLinkedProducts($id);
                } elseif ($id) {
                    $this->getService($id);
                } else {
                    $this->getAllServices();
                }
                break;
            case 'POST':
                if ($resource === 'categories') {
                    $this->createServiceCategory();
                } elseif ($action === 'link-products' && $id) {
                    $this->setLinkedProducts($id);
                } elseif ($id) {
                    $this->updateService($id);
                } else {
                    $this->createService();
                }
                break;
            case 'PUT':
                if ($id) {
                    $this->updateService($id);
                } else {
                    Response::error('ID is required for update', 400);
                }
                break;
            case 'DELETE':
                if ($id) {
                    $this->deleteService($id);
                } else {
                    Response::error('ID is required for deletion', 400);
                }
                break;
            default:
                Response::error('Method not allowed', 405);
                break;
        }
    }

    /**
     * Commission rule fields are visible only to owner/manager (even on authenticated GET).
     */
    private function applyServiceCommissionVisibility($data) {
        $role = AuthMiddleware::getOptionalAuthRole();
        if (AuthMiddleware::isOwnerOrManagerRole($role)) {
            return $data;
        }
        if ($data === null) {
            return null;
        }
        if (is_array($data) && $data !== [] && array_key_exists(0, $data) && is_array($data[0])) {
            return array_map([$this, 'stripServiceCommissionFields'], $data);
        }
        return $this->stripServiceCommissionFields($data);
    }

    private function stripServiceCommissionFields($row) {
        if (!is_array($row)) {
            return $row;
        }
        unset($row['commission_rule_id'], $row['commission_rule_name'], $row['commission_rule_staff_pct']);
        return $row;
    }

    /**
     * JSON body, or multipart form fields in $_POST (same pattern as staff profile image).
     *
     * @return array<string, mixed>
     */
    private function getServiceBodyData() {
        if (!empty($_POST)) {
            return $_POST;
        }
        $json = $this->getBody();
        return is_array($json) ? $json : [];
    }

    private function normalizeCommissionRuleId($data) {
        if (!isset($data['commission_rule_id'])) {
            return $data;
        }
        $v = $data['commission_rule_id'];
        if ($v === '' || $v === null) {
            $data['commission_rule_id'] = null;
        }
        return $data;
    }

    private function getAllServices() {
        $services = $this->serviceModel->getAll();
        Response::json($this->applyServiceCommissionVisibility($services));
    }

    private function getServiceCategories() {
        $categories = $this->serviceModel->getCategories();
        Response::json($categories);
    }

    private function createServiceCategory() {
        $data = $this->getServiceBodyData();
        $name = trim((string) ($data['name'] ?? ''));
        if ($name === '') {
            Response::error('Category name is required', 400);
        }

        $status = trim((string) ($data['status'] ?? 'Active'));
        $displayOrder = $data['display_order'] ?? null;
        $result = $this->serviceModel->createCategory($name, $status, $displayOrder);

        if (!($result['ok'] ?? false)) {
            Response::error($result['message'] ?? 'Failed to create category', 500);
        }

        Response::json(
            [
                'message' => ($result['existing'] ?? false)
                    ? 'Category already exists'
                    : 'Category created',
                'category' => $result['row'] ?? null,
                'existing' => (bool) ($result['existing'] ?? false)
            ],
            ($result['existing'] ?? false) ? 200 : 201
        );
    }

    private function getService($id) {
        $service = $this->serviceModel->getById($id);
        if ($service) {
            Response::json($this->applyServiceCommissionVisibility($service));
        } else {
            Response::error('Service not found', 404);
        }
    }

    private function createService() {
        $data = $this->normalizeCommissionRuleId($this->getServiceBodyData());
        if (empty($data['name']) || !isset($data['price'])) {
            Response::error('Missing required fields (name, price)', 400);
        }

        if (isset($_FILES['service_image']) && $_FILES['service_image']['error'] === UPLOAD_ERR_OK) {
            $uploaded = $this->uploadServiceImage($_FILES['service_image']);
            if (!$uploaded) {
                Response::error('Invalid image file or upload failed. Use JPG, PNG, or WebP under 5MB.', 400);
            }
            $data['image_url'] = $uploaded;
        }

        $id = $this->serviceModel->create($data);
        if ($id) {
            ActivityLogger::logFromAuthData($this->conn, 'service', 'create', "Created service #{$id}", null, 'service', $id);
            Response::json(['message' => 'Service created', 'id' => $id], 201);
        } else {
            Response::error('Failed to create service', 500);
        }
    }

    private function updateService($id) {
        $existing = $this->serviceModel->getById($id);
        if (!$existing) {
            Response::error('Service not found', 404);
        }

        $data = $this->normalizeCommissionRuleId($this->getServiceBodyData());
        if ($data === []) {
            Response::error('Request body is required (JSON or multipart form)', 400);
        }

        if (!empty($data['remove_image'])) {
            $data['image_url'] = '';
            $this->maybeDeleteServiceImageFile($existing['image_url'] ?? null);
        }

        if (isset($_FILES['service_image']) && $_FILES['service_image']['error'] === UPLOAD_ERR_OK) {
            $uploaded = $this->uploadServiceImage($_FILES['service_image']);
            if (!$uploaded) {
                Response::error('Invalid image file or upload failed. Use JPG, PNG, or WebP under 5MB.', 400);
            }
            $this->maybeDeleteServiceImageFile($existing['image_url'] ?? null);
            $data['image_url'] = $uploaded;
        }

        unset($data['remove_image']);

        if (!$this->serviceModel->update($id, $data)) {
            Response::error('Failed to update service (no changes or database error)', 500);
        }
        ActivityLogger::logFromAuthData($this->conn, 'service', 'update', "Updated service #{$id}", null, 'service', $id);
        Response::json(['message' => 'Service updated']);
    }

    private function maybeDeleteServiceImageFile($storedPath) {
        $storedPath = trim((string) $storedPath);
        if ($storedPath === '') {
            return;
        }
        if (strpos($storedPath, '..') !== false) {
            return;
        }
        if (strpos($storedPath, 'uploads/') !== 0) {
            return;
        }
        $full = realpath(__DIR__ . '/../' . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $storedPath));
        $root = realpath(__DIR__ . '/../uploads');
        if ($full === false || $root === false || strpos($full, $root) !== 0) {
            return;
        }
        if (is_file($full)) {
            @unlink($full);
        }
    }

    /**
     * Same validation as staff passport upload; files stored under uploads/services/.
     *
     * @return string|false Relative path e.g. uploads/services/abc.jpg
     */
    private function uploadServiceImage($file) {
        $target_dir = __DIR__ . '/../uploads/services/';
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
            return 'uploads/services/' . $file_name;
        }
        return false;
    }

    private function getLinkedProducts($id) {
        $products = $this->serviceModel->getLinkedProducts($id);
        Response::json($products);
    }

    private function setLinkedProducts($id) {
        $data = $this->getBody();
        if (!$data || !isset($data['products'])) {
            Response::error('Products array is required', 400);
        }
        if ($this->serviceModel->setLinkedProducts($id, $data['products'])) {
            ActivityLogger::logFromAuthData($this->conn, 'service', 'link_products', "Updated linked products for service #{$id}", null, 'service', $id);
            Response::json(['message' => 'Linked products updated']);
        } else {
            Response::error('Failed to update linked products', 500);
        }
    }

    private function deleteService($id) {
        if ($this->serviceModel->delete($id)) {
            ActivityLogger::logFromAuthData($this->conn, 'service', 'delete', "Deleted service #{$id}", null, 'service', $id);
            Response::json(['message' => 'Service deleted']);
        } else {
            Response::error('Failed to delete service', 500);
        }
    }
}
