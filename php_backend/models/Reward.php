<?php
require_once __DIR__ . '/BaseModel.php';

class Reward extends BaseModel {
    protected $table = 'rewards';

    public function getAllActive() {
        $query = "SELECT * FROM {$this->table} WHERE status = 'Active' ORDER BY points_required ASC";
        $result = $this->conn->query($query);
        if (!$result) return [];
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table} (name, description, points_required, stock, image_path, status) 
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $name = $data['name'] ?? '';
        $description = $data['description'] ?? '';
        $pointsRequired = intval($data['points_required'] ?? 0);
        $stock = intval($data['stock'] ?? 0);
        $imagePath = $data['image_path'] ?? '';
        $status = $data['status'] ?? 'Active';
        $stmt->bind_param("ssiiss", $name, $description, $pointsRequired, $stock, $imagePath, $status);
        if ($stmt->execute()) return $stmt->insert_id;
        return false;
    }

    public function update($id, $data) {
        $updates = [];
        $types = "";
        $params = [];
        $fields = [
            'name' => 's', 'description' => 's', 'points_required' => 'i',
            'stock' => 'i', 'image_path' => 's', 'status' => 's',
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

    public function delete($id) {
        return parent::delete($id);
    }

    public function redeem($memberId, $rewardId) {
        $memberModel = new Member($this->conn);
        $member = $memberModel->getById($memberId);
        if (!$member) return ['error' => 'Member not found'];

        $reward = $this->getById($rewardId);
        if (!$reward || $reward['status'] !== 'Active') return ['error' => 'Reward not available'];

        $memberPoints = intval($member['loyalty_points'] ?? 0);
        $pointsNeeded = intval($reward['points_required']);
        if ($memberPoints < $pointsNeeded) return ['error' => 'Insufficient points'];

        if (intval($reward['stock']) > 0) {
            if (intval($reward['stock']) <= 0) return ['error' => 'Reward out of stock'];
        }

        $this->conn->begin_transaction();
        try {
            // Deduct points
            $updatePoints = "UPDATE users SET loyalty_points = loyalty_points - ? WHERE id = ? AND loyalty_points >= ?";
            $stmt = $this->conn->prepare($updatePoints);
            if (!$stmt) throw new Exception('Prepare failed');
            $stmt->bind_param("iii", $pointsNeeded, $memberId, $pointsNeeded);
            $stmt->execute();
            if ($stmt->affected_rows === 0) throw new Exception('Insufficient points or member not found');

            // Decrement stock if limited
            if (intval($reward['stock']) > 0) {
                $updateStock = "UPDATE {$this->table} SET stock = stock - 1 WHERE id = ? AND stock > 0";
                $sStmt = $this->conn->prepare($updateStock);
                if (!$sStmt) throw new Exception('Stock prepare failed');
                $sStmt->bind_param("i", $rewardId);
                $sStmt->execute();
                if ($sStmt->affected_rows === 0) throw new Exception('Reward out of stock');
            }

            // Create redemption record
            $insertRedemption = "INSERT INTO redemptions (member_id, reward_id, points_spent, status) VALUES (?, ?, ?, 'Pending')";
            $rStmt = $this->conn->prepare($insertRedemption);
            if (!$rStmt) throw new Exception('Redemption prepare failed');
            $rStmt->bind_param("iii", $memberId, $rewardId, $pointsNeeded);
            $rStmt->execute();
            $redemptionId = $rStmt->insert_id;

            // Update tier
            $memberModel->updateTierByPoints($memberId);

            $this->conn->commit();
            return ['success' => true, 'redemption_id' => $redemptionId, 'points_spent' => $pointsNeeded];
        } catch (Exception $e) {
            $this->conn->rollback();
            return ['error' => $e->getMessage()];
        }
    }
}
