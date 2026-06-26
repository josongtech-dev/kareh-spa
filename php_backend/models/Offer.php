<?php
require_once __DIR__ . '/BaseModel.php';

class Offer extends BaseModel {
    protected $table = 'service_offers';

    private function mapOfferRow($row) {
        if (!$row) return null;
        $row['service_ids'] = $this->getOfferServiceIds(intval($row['id'] ?? 0));
        return $row;
    }

    private function getOfferServiceIds($offerId) {
        try {
            $offerId = intval($offerId);
            if ($offerId <= 0) return [];
            $query = "SELECT service_id FROM service_offer_services WHERE offer_id = ? ORDER BY service_id";
            $stmt = $this->conn->prepare($query);
            if (!$stmt) return [];
            $stmt->bind_param("i", $offerId);
            $stmt->execute();
            $result = $stmt->get_result();
            $ids = [];
            while ($result && ($row = $result->fetch_assoc())) {
                $ids[] = intval($row['service_id']);
            }
            return $ids;
        } catch (\Throwable $e) {
            return [];
        }
    }

    private function syncOfferServices($offerId, $serviceIds) {
        $offerId = intval($offerId);
        if ($offerId <= 0) return false;
        $deleteStmt = $this->conn->prepare("DELETE FROM service_offer_services WHERE offer_id = ?");
        if (!$deleteStmt) return false;
        $deleteStmt->bind_param("i", $offerId);
        if (!$deleteStmt->execute()) return false;

        $cleanIds = array_values(array_unique(array_map('intval', is_array($serviceIds) ? $serviceIds : [])));
        $cleanIds = array_values(array_filter($cleanIds, function ($id) { return $id > 0; }));
        if (empty($cleanIds)) return true;

        $insertStmt = $this->conn->prepare("INSERT INTO service_offer_services (offer_id, service_id) VALUES (?, ?)");
        if (!$insertStmt) return false;
        foreach ($cleanIds as $sid) {
            $insertStmt->bind_param("ii", $offerId, $sid);
            if (!$insertStmt->execute()) return false;
        }
        return true;
    }

    public function getAll($onlyActive = false) {
        try {
            $query = "SELECT * FROM {$this->table}";
            if ($onlyActive) {
                $query .= " WHERE status = 'Active'
                            AND (starts_at IS NULL OR starts_at <= NOW())
                            AND (ends_at IS NULL OR ends_at >= NOW())";
            }
            $query .= " ORDER BY created_at DESC";
            $result = $this->conn->query($query);
            $rows = [];
            while ($result && ($row = $result->fetch_assoc())) {
                $rows[] = $this->mapOfferRow($row);
            }
            return $rows;
        } catch (\Throwable $e) {
            // Database may not be migrated yet; keep API readable for UI.
            return [];
        }
    }

    public function getById($id) {
        try {
            $id = intval($id);
            $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = ? LIMIT 1");
            if (!$stmt) return null;
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result ? $result->fetch_assoc() : null;
            return $this->mapOfferRow($row);
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function create($data) {
        $name = trim((string)($data['name'] ?? ''));
        if ($name === '') return false;
        $description = trim((string)($data['description'] ?? ''));
        $discountType = trim((string)($data['discount_type'] ?? 'percent')) === 'amount' ? 'amount' : 'percent';
        $discountValue = max(0, floatval($data['discount_value'] ?? 0));
        $startsAt = trim((string)($data['starts_at'] ?? ''));
        $endsAt = trim((string)($data['ends_at'] ?? ''));
        $status = trim((string)($data['status'] ?? 'Active')) === 'Inactive' ? 'Inactive' : 'Active';

        $this->conn->begin_transaction();
        try {
            $query = "INSERT INTO {$this->table}
                      (name, description, discount_type, discount_value, starts_at, ends_at, status)
                      VALUES (?, ?, ?, ?, NULLIF(?, ''), NULLIF(?, ''), ?)";
            $stmt = $this->conn->prepare($query);
            if (!$stmt) throw new Exception('Failed to prepare offer insert');
            $stmt->bind_param("sssdsss", $name, $description, $discountType, $discountValue, $startsAt, $endsAt, $status);
            if (!$stmt->execute()) throw new Exception('Failed to insert offer');
            $offerId = intval($stmt->insert_id);
            if (!$this->syncOfferServices($offerId, $data['service_ids'] ?? [])) {
                throw new Exception('Failed to assign services to offer');
            }
            $this->conn->commit();
            return $offerId;
        } catch (Exception $e) {
            $this->conn->rollback();
            return false;
        }
    }

    public function update($id, $data) {
        $id = intval($id);
        if ($id <= 0) return false;
        $fields = [];
        $types = '';
        $params = [];
        $map = [
            'name' => 's',
            'description' => 's',
            'discount_type' => 's',
            'discount_value' => 'd',
            'starts_at' => 's',
            'ends_at' => 's',
            'status' => 's',
        ];
        foreach ($map as $field => $type) {
            if (!array_key_exists($field, $data)) continue;
            if (($field === 'discount_type')) {
                $value = trim((string)$data[$field]) === 'amount' ? 'amount' : 'percent';
            } elseif ($field === 'discount_value') {
                $value = max(0, floatval($data[$field]));
            } elseif (($field === 'status')) {
                $value = trim((string)$data[$field]) === 'Inactive' ? 'Inactive' : 'Active';
            } else {
                $value = $data[$field];
            }
            if (($field === 'starts_at' || $field === 'ends_at') && trim((string)$value) === '') {
                $fields[] = "{$field} = NULL";
                continue;
            }
            $fields[] = "{$field} = ?";
            $types .= $type;
            $params[] = $value;
        }

        $this->conn->begin_transaction();
        try {
            if (!empty($fields)) {
                $query = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
                $types .= 'i';
                $params[] = $id;
                $stmt = $this->conn->prepare($query);
                if (!$stmt) throw new Exception('Failed to prepare offer update');
                $stmt->bind_param($types, ...$params);
                if (!$stmt->execute()) throw new Exception('Failed to update offer');
            }
            if (array_key_exists('service_ids', $data)) {
                if (!$this->syncOfferServices($id, $data['service_ids'])) {
                    throw new Exception('Failed to update offer services');
                }
            }
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollback();
            return false;
        }
    }

    public function delete($id) {
        $id = intval($id);
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = ?");
        if (!$stmt) return false;
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
