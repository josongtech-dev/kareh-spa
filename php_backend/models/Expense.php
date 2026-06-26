<?php
require_once __DIR__ . '/BaseModel.php';

class Expense extends BaseModel {
    protected $table = 'expenses';

    public function getAllWithStaff($staffId = null) {
        $where = '';
        $params = [];
        $types = '';

        if ($staffId !== null && intval($staffId) > 0) {
            $where = ' WHERE e.created_by_staff_id = ?';
            $params[] = intval($staffId);
            $types .= 'i';
        }

        $query = "SELECT e.*,
                         sc.name AS created_by_name,
                         sf.name AS confirmed_by_name
                  FROM {$this->table} e
                  LEFT JOIN staffs sc ON sc.id = e.created_by_staff_id
                  LEFT JOIN staffs sf ON sf.id = e.confirmed_by_staff_id
                  {$where}
                  ORDER BY e.expense_date DESC, e.id DESC";

        if (!empty($params)) {
            $stmt = $this->conn->prepare($query);
            if (!$stmt) return [];
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $result = $this->conn->query($query);
        }

        $data = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        return $data;
    }

    public function getByIdWithStaff($id) {
        $query = "SELECT e.*,
                         sc.name AS created_by_name,
                         sf.name AS confirmed_by_name
                  FROM {$this->table} e
                  LEFT JOIN staffs sc ON sc.id = e.created_by_staff_id
                  LEFT JOIN staffs sf ON sf.id = e.confirmed_by_staff_id
                  WHERE e.id = ?
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return null;
        }
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $res = $stmt->get_result();
        return $res ? $res->fetch_assoc() : null;
    }

    public function create($data) {
        $name = trim((string)($data['name'] ?? ''));
        $expenseDate = $data['expense_date'] ?? '';
        $purpose = trim((string)($data['purpose'] ?? ''));
        $tx = trim((string)($data['transaction_code'] ?? ''));
        $amount = isset($data['amount']) ? floatval($data['amount']) : 0;
        $cb = isset($data['created_by_staff_id']) ? intval($data['created_by_staff_id']) : 0;

        $query = "INSERT INTO {$this->table}
                  (name, expense_date, purpose, transaction_code, amount, status, created_by_staff_id)
                  VALUES (?, ?, ?, ?, ?, 'pending', NULLIF(?, 0))";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return false;
        }
        $stmt->bind_param("ssssdi", $name, $expenseDate, $purpose, $tx, $amount, $cb);
        if (!$stmt->execute()) {
            return false;
        }
        return $stmt->insert_id;
    }

    public function update($id, $data) {
        $fields = [];
        $types = '';
        $params = [];

        if (isset($data['name'])) {
            $fields[] = 'name = ?';
            $types .= 's';
            $params[] = trim((string)$data['name']);
        }
        if (isset($data['expense_date'])) {
            $fields[] = 'expense_date = ?';
            $types .= 's';
            $params[] = $data['expense_date'];
        }
        if (isset($data['purpose'])) {
            $fields[] = 'purpose = ?';
            $types .= 's';
            $params[] = trim((string)$data['purpose']);
        }
        if (array_key_exists('transaction_code', $data)) {
            $fields[] = 'transaction_code = ?';
            $types .= 's';
            $params[] = trim((string)$data['transaction_code']);
        }
        if (isset($data['amount'])) {
            $fields[] = 'amount = ?';
            $types .= 'd';
            $params[] = floatval($data['amount']);
        }

        if (empty($fields)) {
            return false;
        }

        $types .= 'i';
        $params[] = intval($id);

        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            return false;
        }
        $stmt->bind_param($types, ...$params);
        return $stmt->execute();
    }

    public function confirm($id, $staffId) {
        $query = "UPDATE {$this->table}
                  SET status = 'confirmed',
                      confirmed_at = NOW(),
                      confirmed_by_staff_id = ?
                  WHERE id = ? AND status = 'pending'";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return false;
        }
        $sid = intval($staffId);
        $eid = intval($id);
        $stmt->bind_param("ii", $sid, $eid);
        if (!$stmt->execute()) {
            return false;
        }
        return $stmt->affected_rows > 0;
    }
}
