<?php
require_once __DIR__ . '/BaseModel.php';

class Staff extends BaseModel {
    protected $table = 'staffs'; // Updated table name

    public function findDuplicateField($field, $value, $excludeId = null) {
        $allowedFields = ['username', 'email', 'phone', 'id_number'];
        if (!in_array($field, $allowedFields, true)) {
            return false;
        }

        if ($value === null || trim((string)$value) === '') {
            return false;
        }

        $value = trim((string)$value);
        $query = "SELECT id FROM {$this->table} WHERE {$field} = ?";

        if ($excludeId !== null) {
            $query .= " AND id != ?";
        }

        $query .= " LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return false;
        }

        if ($excludeId !== null) {
            $stmt->bind_param("si", $value, $excludeId);
        } else {
            $stmt->bind_param("s", $value);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        return $row ? true : false;
    }

    public function create($data) {
        $hasRate = isset($data['commission_rate']) && $data['commission_rate'] !== '' && $data['commission_rate'] !== null;
        
        if ($hasRate) {
            $query = "INSERT INTO {$this->table} (name, username, email, phone, id_number, role, skill, commission_rate, additional_info, image_path, activation_password, status, created_by) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        } else {
            $query = "INSERT INTO {$this->table} (name, username, email, phone, id_number, role, skill, additional_info, image_path, activation_password, status, created_by) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        }
                   
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;

        $name = $data['name'] ?? '';
        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $phone = $data['phone'] ?? '';
        $id_number = $data['id_number'] ?? '';
        $role = $data['role'] ?? '';
        $skill = $data['skill'] ?? '';
        $commission_rate = $hasRate ? (float)$data['commission_rate'] : null;
        $additional_info = $data['additional_info'] ?? '';
        $image_path = $data['image_path'] ?? '';
        $activation_password = $data['activation_password'] ?? '';
        $status = $data['status'] ?? 'Active';
        $created_by = (int)($data['created_by'] ?? 1);

        if ($hasRate) {
            $stmt->bind_param("sssssssdssssi", $name, $username, $email, $phone, $id_number, $role, $skill, $commission_rate, $additional_info, $image_path, $activation_password, $status, $created_by);
        } else {
            $stmt->bind_param("sssssssssssi", $name, $username, $email, $phone, $id_number, $role, $skill, $additional_info, $image_path, $activation_password, $status, $created_by);
        }
        
        if ($stmt->execute()) {
            return $stmt->insert_id;
        }
        return false;
    }

    public function update($id, $data) {
        $updates = [];
        $types = "";
        $params = [];
        
        $fields = [
            'name' => 's', 'username' => 's', 'email' => 's', 'phone' => 's', 
            'id_number' => 's', 'role' => 's', 'skill' => 's', 'commission_rate' => 'd',
            'additional_info' => 's', 
            'image_path' => 's', 'status' => 's', 'activation_password' => 's', 
            'password' => 's', 'created_by' => 'i'
        ];
        
        foreach ($fields as $field => $type) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $types .= $type;
                $params[] = $data[$field];
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
