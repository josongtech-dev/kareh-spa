<?php
require_once __DIR__ . '/BaseModel.php';

class Addon extends BaseModel {
    protected $table = 'addons';

    public function getAll() {
        $query = "SELECT * FROM {$this->table} ORDER BY name ASC";
        $result = $this->conn->query($query);
        $rows = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
        }
        return $rows;
    }

    public function getActive() {
        $query = "SELECT * FROM {$this->table} WHERE status = 'Active' ORDER BY name ASC";
        $result = $this->conn->query($query);
        $rows = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
        }
        return $rows;
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table} (name, material_price, labour_price, bulk_after, bulk_labour_price, status)
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;

        $name = trim((string)($data['name'] ?? ''));
        $materialPrice = floatval(str_replace(',', '', (string)($data['material_price'] ?? 0)));
        $labourPrice = floatval(str_replace(',', '', (string)($data['labour_price'] ?? 0)));
        $bulkAfter = isset($data['bulk_after']) && $data['bulk_after'] !== '' && $data['bulk_after'] !== null ? intval($data['bulk_after']) : null;
        $bulkLabourPrice = $bulkAfter !== null ? floatval(str_replace(',', '', (string)($data['bulk_labour_price'] ?? 0))) : null;
        $status = in_array(($data['status'] ?? ''), ['Active', 'Inactive']) ? $data['status'] : 'Active';

        if ($name === '') return false;

        $stmt->bind_param("sddids", $name, $materialPrice, $labourPrice, $bulkAfter, $bulkLabourPrice, $status);
        if (!$stmt->execute()) return false;
        return $stmt->insert_id;
    }

    public function update($id, $data) {
        $updates = [];
        $types = '';
        $params = [];

        $fields = [
            'name' => 's',
            'material_price' => 'd',
            'labour_price' => 'd',
            'bulk_after' => 'i',
            'bulk_labour_price' => 'd',
            'status' => 's',
        ];

        foreach ($fields as $field => $type) {
            if (array_key_exists($field, $data)) {
                $updates[] = "$field = ?";
                $types .= $type;
                $value = $data[$field];

                if ($field === 'name') $value = trim((string)$value);
                elseif (in_array($field, ['material_price', 'labour_price', 'bulk_labour_price'])) {
                    $value = floatval(str_replace(',', '', (string)$value));
                }
                elseif ($field === 'bulk_after') {
                    $value = ($value !== '' && $value !== null) ? intval($value) : null;
                    $types = substr($types, 0, -1) . 'i';
                }
                elseif ($field === 'status') {
                    if (!in_array($value, ['Active', 'Inactive'])) $value = 'Active';
                }

                $params[] = $value;
            }
        }

        if (empty($updates)) return false;

        $query = "UPDATE {$this->table} SET " . implode(', ', $updates) . " WHERE id = ?";
        $types .= "i";
        $params[] = $id;

        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param($types, ...$params);
        return $stmt->execute();
    }
}
