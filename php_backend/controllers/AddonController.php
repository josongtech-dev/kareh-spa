<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Addon.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/ActivityLogger.php';

class AddonController extends BaseController {
    private $addonModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->addonModel = new Addon($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;

        switch ($method) {
            case 'GET':
                if (isset($_GET['active']) && $_GET['active'] === '1') {
                    $this->getActiveAddons();
                } elseif ($id) {
                    $this->getAddon($id);
                } else {
                    $this->getAllAddons();
                }
                break;
            case 'POST':
                $this->createAddon();
                break;
            case 'PUT':
                if ($id) {
                    $this->updateAddon($id);
                } else {
                    Response::error('ID is required for update', 400);
                }
                break;
            case 'DELETE':
                if ($id) {
                    $this->deleteAddon($id);
                } else {
                    Response::error('ID is required for deletion', 400);
                }
                break;
            default:
                Response::error('Method not allowed', 405);
                break;
        }
    }

    private function getAllAddons() {
        $addons = $this->addonModel->getAll();
        Response::json($addons);
    }

    private function getActiveAddons() {
        $addons = $this->addonModel->getActive();
        Response::json($addons);
    }

    private function getAddon($id) {
        $addon = $this->addonModel->getById($id);
        if ($addon) {
            Response::json($addon);
        } else {
            Response::error('Addon not found', 404);
        }
    }

    private function createAddon() {
        $data = $this->getPostData();
        $id = $this->addonModel->create($data);
        if ($id) {
            $addon = $this->addonModel->getById($id);
            ActivityLogger::logFromAuthData($this->conn, 'addon', 'create', "Created addon #{$id}", null, 'addon', $id);
            Response::json(['message' => 'Addon created successfully', 'addon' => $addon], 201);
        } else {
            Response::error('Failed to create addon. Name is required.', 400);
        }
    }

    private function updateAddon($id) {
        $existing = $this->addonModel->getById($id);
        if (!$existing) {
            Response::error('Addon not found', 404);
        }
        $data = $this->getPostData();
        if ($this->addonModel->update($id, $data)) {
            $addon = $this->addonModel->getById($id);
            ActivityLogger::logFromAuthData($this->conn, 'addon', 'update', "Updated addon #{$id}", null, 'addon', $id);
            Response::json(['message' => 'Addon updated successfully', 'addon' => $addon]);
        } else {
            Response::error('Failed to update addon', 500);
        }
    }

    private function deleteAddon($id) {
        if ($this->addonModel->delete($id)) {
            Response::json(['message' => 'Addon deleted successfully']);
        } else {
            Response::error('Failed to delete addon', 500);
        }
    }
}
