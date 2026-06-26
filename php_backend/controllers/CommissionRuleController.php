<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/CommissionRule.php';
require_once __DIR__ . '/../utils/Response.php';

class CommissionRuleController extends BaseController {
    private $model;

    public function __construct($db) {
        parent::__construct($db);
        $this->model = new CommissionRule($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $action = isset($_GET['action']) ? trim((string)$_GET['action']) : '';

        if ($method === 'GET') {
            if ($id) {
                $row = $this->model->getById($id);
                if ($row) {
                    Response::json($row);
                } else {
                    Response::error('Rule not found', 404);
                }
            } else {
                $list = $this->model->getAllOrdered();
                if ($list === null) {
                    Response::error('Could not load commission rules', 500);
                }
                Response::json($list);
            }
            return;
        }

        if ($method === 'POST') {
            if ($action === 'set_default' && $id) {
                if ($this->model->setDefault($id)) {
                    Response::json(['message' => 'Default commission rule updated']);
                }
                Response::error('Failed to set default rule', 500);
            }
            $data = $this->getPostData() ?: $_POST;
            $newId = $this->model->create($data);
            if ($newId) {
                $created = $this->model->getById($newId);
                Response::json(['message' => 'Commission rule created', 'rule' => $created], 201);
            }
            $this->model->getLastError();
            Response::error('Invalid commission rule data', 400);
        }

        if ($method === 'PUT' && $id) {
            $data = $this->getPostData() ?: $_POST;
            if ($this->model->update($id, $data)) {
                Response::json(['message' => 'Commission rule updated', 'rule' => $this->model->getById($id)]);
            }
            Response::error('Failed to update commission rule', 400);
        }

        if ($method === 'DELETE' && $id) {
            if ($this->model->delete($id)) {
                Response::json(['message' => 'Commission rule deleted']);
            }
            Response::error('Cannot delete rule (in use by a service, or invalid)', 400);
        }

        Response::error('Method not allowed', 405);
    }
}
