<?php
require_once __DIR__ . '/BaseModel.php';

class Member extends BaseModel {
    protected $table = 'users';

    public function getAll() {
        $query = "SELECT id, name, email, phone, role, loyalty_points, loyalty_tier, status, created_at 
                  FROM {$this->table} 
                  WHERE role = 'customer' 
                  ORDER BY created_at DESC";
        
        $result = $this->conn->query($query);
        $data = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        return $data;
    }

    public function getById($id) {
        $query = "SELECT id, name, email, phone, role, loyalty_points, loyalty_tier, status, created_at 
                  FROM {$this->table} 
                  WHERE id = ? AND role = 'customer'";
        
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;

        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    public function findByEmail($email) {
        $query = "SELECT id, name, email, phone, role, loyalty_points, loyalty_tier, status
                  FROM {$this->table}
                  WHERE email = ? AND role = 'customer'
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table} (name, email, phone, password, role, loyalty_points, loyalty_tier, status) 
                  VALUES (?, ?, ?, ?, 'customer', ?, ?, ?)";
                  
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;

        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $phone = $data['phone'] ?? '';
        $rawPassword = (string)($data['password'] ?? '');
        if ($rawPassword === '') {
            return false;
        }
        $password = password_hash($rawPassword, PASSWORD_DEFAULT);
        $points = isset($data['loyalty_points']) ? intval($data['loyalty_points']) : 0;
        $tier = $data['loyalty_tier'] ?? 'Bronze';
        $status = $data['status'] ?? 'Active';

        $stmt->bind_param("ssssiss", $name, $email, $phone, $password, $points, $tier, $status);
        
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
            'name' => 's', 'email' => 's', 'phone' => 's',
            'loyalty_points' => 'i', 'loyalty_tier' => 's', 'status' => 's'
        ];
        
        foreach ($fields as $field => $type) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $types .= $type;
                $params[] = $data[$field];
            }
        }

        if (empty($updates)) return false;

        $query = "UPDATE {$this->table} SET " . implode(', ', $updates) . " WHERE id = ? AND role = 'customer'";
        $types .= "i";
        $params[] = $id;

        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        
        $stmt->bind_param($types, ...$params);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = ? AND role = 'customer'";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function adjustPoints($id, $pointsChange) {
        $query = "UPDATE {$this->table} SET loyalty_points = loyalty_points + ? WHERE id = ? AND role = 'customer'";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("ii", $pointsChange, $id);
        
        if ($stmt->execute()) {
            $this->updateTierByPoints($id);
            return true;
        }
        return false;
    }

    private function updateTierByPoints($id) {
        // Simple logic: < 200 Bronze, 200-500 Silver, > 500 Gold
        $query = "UPDATE {$this->table} SET loyalty_tier = 
                  CASE 
                    WHEN loyalty_points >= 500 THEN 'Gold'
                    WHEN loyalty_points >= 200 THEN 'Silver'
                    ELSE 'Bronze'
                  END
                  WHERE id = ? AND role = 'customer'";
        $stmt = $this->conn->prepare($query);
        if ($stmt) {
            $stmt->bind_param("i", $id);
            $stmt->execute();
        }
    }
}
