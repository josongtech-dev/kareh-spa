<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Offer.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/ActivityLogger.php';

class OfferController extends BaseController {
    private $offerModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->offerModel = new Offer($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;

        if ($id === null) {
            $body = $this->getBody();
            if (isset($body['id'])) $id = intval($body['id']);
        }

        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getOne($id);
                } else {
                    $this->getAll();
                }
                break;
            case 'POST':
                $this->create();
                break;
            case 'PUT':
                if (!$id) Response::error('ID is required for update', 400);
                $this->update($id);
                break;
            case 'DELETE':
                if (!$id) Response::error('ID is required for deletion', 400);
                $this->delete($id);
                break;
            default:
                Response::error('Method not allowed', 405);
        }
    }

    private function body() {
        return $this->getBody();
    }

    private function getAll() {
        $role = AuthMiddleware::getOptionalAuthRole();
        $onlyActive = !AuthMiddleware::isOwnerOrManagerRole($role);
        Response::json($this->offerModel->getAll($onlyActive));
    }

    private function getOne($id) {
        $offer = $this->offerModel->getById($id);
        if (!$offer) Response::error('Offer not found', 404);
        $role = AuthMiddleware::getOptionalAuthRole();
        if (!AuthMiddleware::isOwnerOrManagerRole($role)) {
            $isActiveNow = ($offer['status'] ?? '') === 'Active';
            $starts = !empty($offer['starts_at']) ? strtotime((string)$offer['starts_at']) : null;
            $ends = !empty($offer['ends_at']) ? strtotime((string)$offer['ends_at']) : null;
            $now = time();
            if (!$isActiveNow || ($starts && $starts > $now) || ($ends && $ends < $now)) {
                Response::error('Offer not found', 404);
            }
        }
        Response::json($offer);
    }

    private function create() {
        $data = $this->body();
        if (empty(trim((string)($data['name'] ?? '')))) {
            Response::error('Offer name is required', 400);
        }
        if (!isset($data['service_ids']) || !is_array($data['service_ids']) || count($data['service_ids']) === 0) {
            Response::error('Select at least one service for this offer', 400);
        }
        $id = $this->offerModel->create($data);
        if (!$id) Response::error('Failed to create offer', 500);
        ActivityLogger::logFromAuthData($this->conn, 'offer', 'create', "Created offer #{$id}", null, 'offer', $id);
        Response::json(['message' => 'Offer created', 'id' => $id], 201);
    }

    private function update($id) {
        $data = $this->body();
        if (!$this->offerModel->update($id, $data)) {
            Response::error('Failed to update offer', 500);
        }
        ActivityLogger::logFromAuthData($this->conn, 'offer', 'update', "Updated offer #{$id}", null, 'offer', $id);
        Response::json(['message' => 'Offer updated']);
    }

    private function delete($id) {
        if (!$this->offerModel->delete($id)) {
            Response::error('Failed to delete offer', 500);
        }
        ActivityLogger::logFromAuthData($this->conn, 'offer', 'delete', "Deleted offer #{$id}", null, 'offer', $id);
        Response::json(['message' => 'Offer deleted']);
    }
}
