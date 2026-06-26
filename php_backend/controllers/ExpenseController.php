<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Expense.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/ActivityLogger.php';

class ExpenseController extends BaseController {
    private $expenseModel;
    /** @var array<string, mixed> */
    private $authUser;

    public function __construct($db, array $authUser) {
        parent::__construct($db);
        $this->expenseModel = new Expense($db);
        $this->authUser = $authUser;
    }

    private function role(): string {
        return strtolower(trim((string)($this->authUser['role'] ?? '')));
    }

    private function isManagerOrOwner(): bool {
        return in_array($this->role(), ['owner', 'manager'], true);
    }

    private function requireManagerOrOwner(): void {
        if (!$this->isManagerOrOwner()) {
            Response::error('Only managers and owners can perform this action', 403);
        }
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $action = isset($_GET['action']) ? trim((string)$_GET['action']) : '';

        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getOne($id);
                } else {
                    $this->getAll();
                }
                break;
            case 'POST':
                if ($action === 'confirm' && $id) {
                    $this->confirm($id);
                } else {
                    $this->create();
                }
                break;
            case 'PUT':
                if ($id) {
                    $this->update($id);
                } else {
                    Response::error('ID is required', 400);
                }
                break;
            case 'DELETE':
                if ($id) {
                    $this->delete($id);
                } else {
                    Response::error('ID is required', 400);
                }
                break;
            default:
                Response::error('Method not allowed', 405);
        }
    }

    private function getAll() {
        $role = $this->role();
        if ($role === 'receptionist') {
            $rows = $this->expenseModel->getAllWithStaff(intval($this->authUser['user_id'] ?? 0));
        } else {
            $rows = $this->expenseModel->getAllWithStaff();
        }
        Response::json($rows);
    }

    private function getOne($id) {
        $row = $this->expenseModel->getByIdWithStaff($id);
        if (!$row) {
            Response::error('Expense not found', 404);
        }
        Response::json($row);
    }

    private function create() {
        $data = $this->getPostData();
        $name = trim((string)($data['name'] ?? ''));
        $expenseDate = trim((string)($data['expense_date'] ?? ''));
        $purpose = trim((string)($data['purpose'] ?? ''));
        $tx = trim((string)($data['transaction_code'] ?? ''));
        $amount = isset($data['amount']) ? floatval($data['amount']) : 0;

        if ($name === '' || $expenseDate === '' || $purpose === '') {
            Response::error('Name, date, and purpose are required', 400);
        }
        if ($amount < 0) {
            Response::error('Amount cannot be negative', 400);
        }

        $staffId = intval($this->authUser['user_id'] ?? 0);
        $payload = [
            'name' => $name,
            'expense_date' => $expenseDate,
            'purpose' => $purpose,
            'transaction_code' => $tx,
            'amount' => $amount,
            'created_by_staff_id' => $staffId > 0 ? $staffId : null,
        ];

        $newId = $this->expenseModel->create($payload);
        if (!$newId) {
            Response::error('Failed to create expense', 500);
        }
        $row = $this->expenseModel->getByIdWithStaff(intval($newId));
        ActivityLogger::logFromAuthData($this->conn, 'expense', 'create', "Created expense #{$newId}", $this->authUser, 'expense', $newId);
        Response::json(['message' => 'Expense recorded', 'expense' => $row], 201);
    }

    private function update($id) {
        $this->requireManagerOrOwner();
        $data = $this->getPostData();
        $existing = $this->expenseModel->getById($id);
        if (!$existing) {
            Response::error('Expense not found', 404);
        }

        if (!$this->expenseModel->update($id, $data)) {
            Response::error('Failed to update expense', 500);
        }
        $row = $this->expenseModel->getByIdWithStaff($id);
        ActivityLogger::logFromAuthData($this->conn, 'expense', 'update', "Updated expense #{$id}", $this->authUser, 'expense', $id);
        Response::json(['message' => 'Expense updated', 'expense' => $row]);
    }

    private function delete($id) {
        $this->requireManagerOrOwner();
        if (!$this->expenseModel->getById($id)) {
            Response::error('Expense not found', 404);
        }
        if (!$this->expenseModel->delete($id)) {
            Response::error('Failed to delete expense', 500);
        }
        ActivityLogger::logFromAuthData($this->conn, 'expense', 'delete', "Deleted expense #{$id}", $this->authUser, 'expense', $id);
        Response::json(['message' => 'Expense deleted']);
    }

    private function confirm($id) {
        $this->requireManagerOrOwner();
        $staffId = intval($this->authUser['user_id'] ?? 0);
        if ($staffId <= 0) {
            Response::error('Invalid staff context', 400);
        }
        if (!$this->expenseModel->getById($id)) {
            Response::error('Expense not found', 404);
        }
        if (!$this->expenseModel->confirm($id, $staffId)) {
            Response::error('Expense could not be confirmed (already confirmed or missing)', 400);
        }
        $row = $this->expenseModel->getByIdWithStaff($id);
        Response::json(['message' => 'Expense confirmed', 'expense' => $row]);
    }
}
