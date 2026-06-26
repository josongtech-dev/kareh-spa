<?php
require_once __DIR__ . '/BaseModel.php';

class Appointment extends BaseModel {
    protected $table = 'appointments';

    private function sanitizeText($value) {
        return trim((string)($value ?? ''));
    }

    private function hasAppointmentServicesTable() {
        static $checked = false;
        static $exists = false;
        if ($checked) return $exists;
        $checked = true;
        $result = $this->conn->query("SHOW TABLES LIKE 'appointment_services'");
        $exists = $result && $result->num_rows > 0;
        return $exists;
    }

    private function fetchServiceItemsByAppointmentIds($appointmentIds) {
        $map = [];
        if (!$this->hasAppointmentServicesTable() || empty($appointmentIds)) {
            return $map;
        }

        $cleanIds = array_values(array_filter(array_map('intval', $appointmentIds), function ($id) {
            return $id > 0;
        }));
        if (empty($cleanIds)) return $map;

        $placeholders = implode(',', array_fill(0, count($cleanIds), '?'));
        $types = str_repeat('i', count($cleanIds));
        $query = "SELECT aps.id, aps.appointment_id, aps.service_id, aps.sequence_no, s.name AS service_name, s.price AS service_price, s.image_url AS service_image_url
                  FROM appointment_services aps
                  LEFT JOIN services s ON aps.service_id = s.id
                  WHERE aps.appointment_id IN ($placeholders)
                  ORDER BY aps.appointment_id ASC, aps.sequence_no ASC, aps.id ASC";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return $map;

        $stmt->bind_param($types, ...$cleanIds);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $appointmentId = intval($row['appointment_id'] ?? 0);
                if ($appointmentId <= 0) continue;
                if (!isset($map[$appointmentId])) $map[$appointmentId] = [];
                $map[$appointmentId][] = [
                    'id' => intval($row['id'] ?? 0),
                    'service_id' => intval($row['service_id'] ?? 0),
                    'sequence_no' => intval($row['sequence_no'] ?? 0),
                    'service_name' => $row['service_name'] ?? '',
                    'price' => $row['service_price'] ?? null,
                    'image_url' => $row['service_image_url'] ?? null,
                ];
            }
        }
        $stmt->close();
        return $map;
    }

    private function buildServiceSummary($serviceItems, $fallbackName = '') {
        if (!is_array($serviceItems) || empty($serviceItems)) {
            return $fallbackName;
        }
        $counts = [];
        foreach ($serviceItems as $item) {
            $name = trim((string)($item['service_name'] ?? ''));
            if ($name === '') continue;
            if (!isset($counts[$name])) $counts[$name] = 0;
            $counts[$name]++;
        }
        if (empty($counts)) return $fallbackName;
        $parts = [];
        foreach ($counts as $name => $count) {
            $parts[] = $count > 1 ? ($name . ' x' . $count) : $name;
        }
        return implode(', ', $parts);
    }

    private function normalizeServiceIds($data) {
        $serviceIds = [];
        if (isset($data['service_ids']) && is_array($data['service_ids'])) {
            foreach ($data['service_ids'] as $sid) {
                $sid = intval($sid);
                if ($sid > 0) $serviceIds[] = $sid;
            }
        } elseif (isset($data['service_id']) && $data['service_id'] !== '') {
            $sid = intval($data['service_id']);
            if ($sid > 0) $serviceIds[] = $sid;
        }
        return $serviceIds;
    }

    private function replaceAppointmentServices($appointmentId, $serviceIds) {
        if (!$this->hasAppointmentServicesTable()) return true;
        $appointmentId = intval($appointmentId);
        if ($appointmentId <= 0) return false;

        $deleteStmt = $this->conn->prepare("DELETE FROM appointment_services WHERE appointment_id = ?");
        if (!$deleteStmt) return false;
        $deleteStmt->bind_param("i", $appointmentId);
        if (!$deleteStmt->execute()) {
            $deleteStmt->close();
            return false;
        }
        $deleteStmt->close();

        if (empty($serviceIds)) return true;

        $insertStmt = $this->conn->prepare("INSERT INTO appointment_services (appointment_id, service_id, sequence_no) VALUES (?, ?, ?)");
        if (!$insertStmt) return false;
        $seq = 1;
        foreach ($serviceIds as $sid) {
            $sid = intval($sid);
            if ($sid <= 0) continue;
            $insertStmt->bind_param("iii", $appointmentId, $sid, $seq);
            if (!$insertStmt->execute()) {
                $insertStmt->close();
                return false;
            }
            $seq++;
        }
        $insertStmt->close();
        return true;
    }

    public function getAll($authData = null) {
        $where = '';
        $params = [];
        $types = '';

        $role = strtolower((string)($authData['role'] ?? ''));
        if ($role === 'attendant') {
            $where = ' WHERE a.staff_id = ?';
            $params[] = intval($authData['user_id']);
            $types .= 'i';
        }

        $query = "SELECT a.*, s.name as service_name, st.name as staff_name,
                         ses.id as session_id, ses.session_code,
                         CASE WHEN ses.id IS NOT NULL THEN 'Created'
                              ELSE NULL END as session_status
                  FROM {$this->table} a
                  LEFT JOIN services s ON a.service_id = s.id
                  LEFT JOIN staffs st ON a.staff_id = st.id
                  LEFT JOIN sessions ses ON ses.appointment_id = a.id
                  {$where}
                  ORDER BY a.appointment_date DESC, a.appointment_time DESC";

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
        $ids = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
                $ids[] = intval($row['id'] ?? 0);
            }
        }
        $serviceItemsMap = $this->fetchServiceItemsByAppointmentIds($ids);
        foreach ($data as &$row) {
            $aid = intval($row['id'] ?? 0);
            $items = $serviceItemsMap[$aid] ?? [];
            $row['service_items'] = $items;
            if (!empty($items)) {
                $row['service_name'] = $this->buildServiceSummary($items, (string)($row['service_name'] ?? ''));
            }
        }
        return $data;
    }

    public function getByCustomerEmail($email) {
        $email = strtolower(trim($email));
        if ($email === '') return [];

        $query = "SELECT a.*, s.name as service_name, st.name as staff_name,
                         ses.id as session_id, ses.session_code,
                         CASE WHEN ses.id IS NOT NULL THEN 'Created'
                              ELSE NULL END as session_status
                  FROM {$this->table} a
                  LEFT JOIN services s ON a.service_id = s.id
                  LEFT JOIN staffs st ON a.staff_id = st.id
                  LEFT JOIN sessions ses ON ses.appointment_id = a.id
                  WHERE LOWER(TRIM(a.customer_email)) = ?
                  ORDER BY a.appointment_date DESC, a.appointment_time DESC";

        $stmt = $this->conn->prepare($query);
        if (!$stmt) return [];
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();

        $data = [];
        $ids = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
                $ids[] = intval($row['id'] ?? 0);
            }
        }
        $serviceItemsMap = $this->fetchServiceItemsByAppointmentIds($ids);
        foreach ($data as &$row) {
            $items = $serviceItemsMap[intval($row['id'])] ?? [];
            if (!empty($items)) {
                $row['service_name'] = $this->buildServiceSummary($items, (string)($row['service_name'] ?? ''));
            }
        }
        return $data;
    }

    public function getById($id, $authData = null) {
        $role = strtolower((string)($authData['role'] ?? ''));
        $staffClause = '';
        $params = [$id];
        $types = 'i';

        if ($role === 'attendant') {
            $staffClause = ' AND a.staff_id = ?';
            $params[] = intval($authData['user_id']);
            $types .= 'i';
        }

        $query = "SELECT a.*, s.name as service_name, st.name as staff_name,
                         ses.id as session_id, ses.session_code,
                         CASE WHEN ses.id IS NOT NULL THEN 'Created'
                              ELSE NULL END as session_status
                  FROM {$this->table} a
                  LEFT JOIN services s ON a.service_id = s.id
                  LEFT JOIN staffs st ON a.staff_id = st.id
                  LEFT JOIN sessions ses ON ses.appointment_id = a.id
                  WHERE a.id = ?{$staffClause}";

        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;

        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        $appointment = $result ? $result->fetch_assoc() : null;
        $stmt->close();
        if (!$appointment) return null;

        $items = $this->fetchServiceItemsByAppointmentIds([intval($id)]);
        $serviceItems = $items[intval($id)] ?? [];
        $appointment['service_items'] = $serviceItems;
        if (!empty($serviceItems)) {
            $appointment['service_name'] = $this->buildServiceSummary($serviceItems, (string)($appointment['service_name'] ?? ''));
        }
        return $appointment;
    }

    public function generateAppointmentCode() {
        $query = "SELECT MAX(id) as max_id FROM {$this->table}";
        $result = $this->conn->query($query);
        $row = $result->fetch_assoc();
        $next_id = ($row['max_id'] ?? 0) + 1;
        return 'APT-' . str_pad($next_id, 3, '0', STR_PAD_LEFT);
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table} (appointment_code, customer_name, customer_email, customer_phone, service_id, staff_id, appointment_date, appointment_time, notes, status) 
                  VALUES (?, ?, ?, ?, NULLIF(?, 0), NULLIF(?, 0), ?, ?, ?, ?)";
                  
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;

        $appointment_code = $this->generateAppointmentCode();
        $customer_name = $data['customer_name'] ?? '';
        $customer_email = $data['customer_email'] ?? '';
        $customer_phone = $data['customer_phone'] ?? '';
        $serviceIds = $this->normalizeServiceIds($data);
        $service_id = !empty($serviceIds) ? intval($serviceIds[0]) : 0;
        $staff_id = isset($data['staff_id']) && $data['staff_id'] !== '' ? intval($data['staff_id']) : 0;
        $appointment_date = $data['appointment_date'] ?? '';
        $appointment_time = $data['appointment_time'] ?? '';
        $notes = $data['notes'] ?? '';
        $status = $data['status'] ?? 'pending';

        $stmt->bind_param("ssssiissss", $appointment_code, $customer_name, $customer_email, $customer_phone, $service_id, $staff_id, $appointment_date, $appointment_time, $notes, $status);
        
        $this->conn->begin_transaction();
        try {
            if (!$stmt->execute()) {
                throw new Exception('Failed to create appointment');
            }
            $appointmentId = intval($stmt->insert_id);
            if ($appointmentId <= 0) {
                throw new Exception('Invalid appointment id');
            }
            if (!$this->replaceAppointmentServices($appointmentId, $serviceIds)) {
                throw new Exception('Failed to save appointment services');
            }
            $this->conn->commit();
            return $appointmentId;
        } catch (Exception $e) {
            $this->conn->rollback();
            return false;
        }
    }

    public function update($id, $data) {
        $updates = [];
        $types = "";
        $params = [];
        $serviceIds = null;

        if (array_key_exists('service_ids', $data)) {
            $serviceIds = $this->normalizeServiceIds($data);
            $data['service_id'] = !empty($serviceIds) ? intval($serviceIds[0]) : null;
            unset($data['service_ids']);
        }
        
        $fields = [
            'customer_name' => 's', 'customer_email' => 's', 'customer_phone' => 's',
            'service_id' => 'i', 'staff_id' => 'i', 'appointment_date' => 's',
            'appointment_time' => 's', 'status' => 's', 'notes' => 's', 'cancel_reason' => 's'
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
        
        $this->conn->begin_transaction();
        try {
            $stmt->bind_param($types, ...$params);
            if (!$stmt->execute()) {
                throw new Exception('Failed to update appointment');
            }
            if (is_array($serviceIds)) {
                if (!$this->replaceAppointmentServices($id, $serviceIds)) {
                    throw new Exception('Failed to update appointment services');
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
        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function createOrRefreshManageToken($appointmentId, $ttlHours = 720) {
        $appointmentId = intval($appointmentId);
        if ($appointmentId <= 0) return false;
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $expiry = date('Y-m-d H:i:s', time() + (max(1, intval($ttlHours)) * 3600));

        $query = "INSERT INTO appointment_manage_tokens (appointment_id, token_hash, token_expires_at)
                  VALUES (?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                    token_hash = VALUES(token_hash),
                    token_expires_at = VALUES(token_expires_at)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("iss", $appointmentId, $tokenHash, $expiry);
        if (!$stmt->execute()) return false;
        return $token;
    }

    public function getByManageToken($token) {
        if (empty($token)) return null;
        $tokenHash = hash('sha256', $token);
        $query = "SELECT a.*, s.name as service_name, st.name as staff_name, amt.token_expires_at
                  FROM appointment_manage_tokens amt
                  INNER JOIN appointments a ON a.id = amt.appointment_id
                  LEFT JOIN services s ON a.service_id = s.id
                  LEFT JOIN staffs st ON a.staff_id = st.id
                  WHERE amt.token_hash = ?
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param("s", $tokenHash);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        if (!$row) return null;
        $appointmentId = intval($row['id'] ?? 0);
        $serviceItems = $this->fetchServiceItemsByAppointmentIds([$appointmentId]);
        $row['service_items'] = $serviceItems[$appointmentId] ?? [];
        if (!empty($row['service_items'])) {
            $row['service_name'] = $this->buildServiceSummary($row['service_items'], (string)($row['service_name'] ?? ''));
        }
        $row['is_expired'] = strtotime((string)$row['token_expires_at']) < time();
        return $row;
    }

    public function manageByToken($token, $payload) {
        $appointment = $this->getByManageToken($token);
        if (!$appointment || !empty($appointment['is_expired'])) return [false, 'Invalid or expired link'];

        $appointmentId = intval($appointment['id']);
        $action = strtolower($this->sanitizeText($payload['action'] ?? ''));
        $updates = [];

        if ($action === 'reschedule') {
            $newDate = $this->sanitizeText($payload['appointment_date'] ?? '');
            $newTime = $this->sanitizeText($payload['appointment_time'] ?? '');
            if ($newDate === '' || $newTime === '') return [false, 'Date and time are required to reschedule'];
            $updates['appointment_date'] = $newDate;
            $updates['appointment_time'] = $newTime;
            if (strtolower((string)($appointment['status'] ?? '')) === 'confirmed') {
                $updates['status'] = 'pending';
            }
        } elseif ($action === 'cancel') {
            $reason = $this->sanitizeText($payload['cancel_reason'] ?? '');
            if ($reason === '') return [false, 'Cancellation reason is required'];
            $existingNotes = $this->sanitizeText($appointment['notes'] ?? '');
            $updates['status'] = 'cancelled';
            $updates['cancel_reason'] = $reason;
            $updates['notes'] = trim($existingNotes . "\n\nClient cancellation reason: " . $reason);
        } elseif ($action === 'notes') {
            $notes = $this->sanitizeText($payload['notes'] ?? '');
            $updates['notes'] = $notes;
        } else {
            return [false, 'Unsupported action'];
        }

        if (!$this->update($appointmentId, $updates)) {
            return [false, 'Failed to update appointment'];
        }

        return [true, $this->getById($appointmentId)];
    }
}
