<?php
require_once __DIR__ . '/BaseModel.php';

class CommissionRule extends BaseModel {
    protected $table = 'commission_rules';

    /** @var string Last mysqli error for debugging failed operations */
    private $lastError = '';

    public function getLastError() {
        return $this->lastError;
    }

    private function setLastError($msg) {
        $this->lastError = (string)$msg;
    }

    public function getById($id) {
        $row = parent::getById($id);
        return $row ? $this->enrichRow($row) : null;
    }

    public function getAllOrdered() {
        $this->setLastError('');
        $query = "SELECT * FROM {$this->table} ORDER BY sort_order ASC, id ASC";
        $result = $this->conn->query($query);
        if ($result === false) {
            $this->setLastError($this->conn->error ?: 'Query failed');
            return null;
        }
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $this->enrichRow($row);
        }
        return $data;
    }

    public function getDefault() {
        $query = "SELECT * FROM {$this->table} WHERE is_default = 1 LIMIT 1";
        $result = $this->conn->query($query);
        $row = $result ? $result->fetch_assoc() : null;
        if ($row) {
            return $this->enrichRow($row);
        }
        $query = "SELECT * FROM {$this->table} ORDER BY id ASC LIMIT 1";
        $result = $this->conn->query($query);
        $row = $result ? $result->fetch_assoc() : null;
        return $row ? $this->enrichRow($row) : null;
    }

    /**
     * Rule assigned to the service, or the default rule.
     */
    public function getForService($serviceId) {
        $serviceId = intval($serviceId);
        if ($serviceId <= 0) {
            return $this->getDefault();
        }
        $query = "SELECT cr.*
                  FROM services s
                  LEFT JOIN {$this->table} cr ON cr.id = s.commission_rule_id
                  WHERE s.id = ?
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return $this->getDefault();
        }
        $stmt->bind_param("i", $serviceId);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res ? $res->fetch_assoc() : null;
        if ($row && !empty($row['id'])) {
            return $this->enrichRow($row);
        }
        return $this->getDefault();
    }

    private function enrichRow(array $row) {
        $row['id'] = intval($row['id'] ?? 0);
        $pool = floatval($row['commission_pool_rate'] ?? 0);
        $tax = floatval($row['tax_rate'] ?? 0);
        if ($tax > $pool) {
            $tax = $pool;
        }
        $row['commission_pool_rate'] = round($pool, 2);
        $row['tax_rate'] = round($tax, 2);
        $row['sort_order'] = intval($row['sort_order'] ?? 0);
        $row['is_default'] = intval($row['is_default'] ?? 0) ? 1 : 0;
        $row['net_commission_rate'] = max(0, round($pool - $tax, 2));
        $row['spa_retention_rate'] = max(0, round(100 - $pool, 2));
        return $row;
    }

    public function create(array $data) {
        $this->setLastError('');
        $name = trim((string)($data['name'] ?? ''));
        if ($name === '') {
            $this->setLastError('Name is required');
            return false;
        }
        $pool = floatval($data['commission_pool_rate'] ?? 0);
        $tax = floatval($data['tax_rate'] ?? 0);
        if ($pool < 0 || $tax < 0 || $tax > $pool) {
            $this->setLastError('Pool and tax must be valid (tax cannot exceed pool)');
            return false;
        }
        $sort = isset($data['sort_order']) ? intval($data['sort_order']) : 0;
        $isDefault = !empty($data['is_default']) ? 1 : 0;

        if ($isDefault) {
            $this->conn->query("UPDATE {$this->table} SET is_default = 0");
        }

        $query = "INSERT INTO {$this->table} (name, commission_pool_rate, tax_rate, sort_order, is_default)
                  VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            $this->setLastError($this->conn->error ?: 'Prepare failed');
            return false;
        }
        $stmt->bind_param("sddii", $name, $pool, $tax, $sort, $isDefault);
        if ($stmt->execute()) {
            return $stmt->insert_id;
        }
        $this->setLastError($stmt->error ?: $this->conn->error ?: 'Insert failed');
        return false;
    }

    public function update($id, array $data) {
        $this->setLastError('');
        $id = intval($id);
        if ($id <= 0) {
            return false;
        }
        $existing = $this->getById($id);
        if (!$existing) {
            $this->setLastError('Rule not found');
            return false;
        }

        $name = array_key_exists('name', $data) ? trim((string)$data['name']) : (string)$existing['name'];
        if ($name === '') {
            $this->setLastError('Name is required');
            return false;
        }

        $pool = array_key_exists('commission_pool_rate', $data)
            ? floatval($data['commission_pool_rate'])
            : floatval($existing['commission_pool_rate']);
        $tax = array_key_exists('tax_rate', $data)
            ? floatval($data['tax_rate'])
            : floatval($existing['tax_rate']);
        if ($pool < 0 || $tax < 0 || $tax > $pool) {
            $this->setLastError('Pool and tax must be valid (tax cannot exceed pool)');
            return false;
        }

        $sort = array_key_exists('sort_order', $data) ? intval($data['sort_order']) : intval($existing['sort_order'] ?? 0);
        $isDefault = array_key_exists('is_default', $data)
            ? (!empty($data['is_default']) ? 1 : 0)
            : intval($existing['is_default'] ?? 0);

        if ($isDefault) {
            $stmt = $this->conn->prepare("UPDATE {$this->table} SET is_default = 0 WHERE id <> ?");
            if ($stmt) {
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $stmt->close();
            }
        }

        $query = "UPDATE {$this->table}
                  SET name = ?, commission_pool_rate = ?, tax_rate = ?, sort_order = ?, is_default = ?
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            $this->setLastError($this->conn->error ?: 'Prepare failed');
            return false;
        }
        $stmt->bind_param("sddiii", $name, $pool, $tax, $sort, $isDefault, $id);
        if ($stmt->execute()) {
            return true;
        }
        $this->setLastError($stmt->error ?: $this->conn->error ?: 'Update failed');
        return false;
    }

    public function setDefault($id) {
        $id = intval($id);
        if ($id <= 0) {
            return false;
        }
        if (!$this->getById($id)) {
            return false;
        }
        $this->conn->begin_transaction();
        try {
            $this->conn->query("UPDATE {$this->table} SET is_default = 0");
            $stmt = $this->conn->prepare("UPDATE {$this->table} SET is_default = 1 WHERE id = ?");
            if (!$stmt) {
                throw new \Exception('prepare failed');
            }
            $stmt->bind_param("i", $id);
            if (!$stmt->execute()) {
                throw new \Exception('execute failed');
            }
            $this->conn->commit();
            return true;
        } catch (\Throwable $e) {
            $this->conn->rollback();
            return false;
        }
    }

    public function delete($id) {
        $id = intval($id);
        if ($id <= 0) {
            return false;
        }
        $row = $this->getById($id);
        if (!$row) {
            return false;
        }

        $check = $this->conn->prepare("SELECT COUNT(*) AS c FROM services WHERE commission_rule_id = ?");
        if ($check) {
            $check->bind_param("i", $id);
            $check->execute();
            $r = $check->get_result()->fetch_assoc();
            if (intval($r['c'] ?? 0) > 0) {
                return false;
            }
        }

        $wasDefault = !empty($row['is_default']);
        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return false;
        }
        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) {
            return false;
        }

        if ($wasDefault) {
            $this->conn->query("UPDATE {$this->table} SET is_default = 1 ORDER BY id ASC LIMIT 1");
        }

        return true;
    }
}
