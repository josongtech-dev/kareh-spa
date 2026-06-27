<?php
require_once __DIR__ . '/BaseModel.php';

class Session extends BaseModel {
    protected $table = 'sessions';
    private $lastError = null;

    private function normalizeAmount($value) {
        return floatval(str_replace(',', '', (string) $value));
    }

    private function entityExists($table, $id) {
        if (!$id || intval($id) <= 0) return false;
        $query = "SELECT id FROM {$table} WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $entityId = intval($id);
        $stmt->bind_param("i", $entityId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result && $result->num_rows > 0;
    }

    private function recalculateSessionTotal($sessionId) {
        $servicesTotal = 0;
        $sumQuery = "SELECT COALESCE(SUM(price), 0) AS total FROM session_services WHERE session_id = ?";
        $sumStmt = $this->conn->prepare($sumQuery);
        if ($sumStmt) {
            $sumStmt->bind_param("i", $sessionId);
            $sumStmt->execute();
            $sumRes = $sumStmt->get_result();
            $sumRow = $sumRes ? $sumRes->fetch_assoc() : null;
            $servicesTotal = floatval($sumRow['total'] ?? 0);
        }

        $addonsTotal = 0;
        $addonRows = $this->getAddonLinesRaw($sessionId);
        foreach ($addonRows as $a) {
            $qty = intval($a['quantity'] ?? 1);
            $matPrice = floatval($a['material_price'] ?? 0);
            $labPrice = floatval($a['labour_price'] ?? 0);
            $bulkLabPrice = isset($a['bulk_labour_price']) ? floatval($a['bulk_labour_price']) : null;
            $bulkAfter = isset($a['bulk_after']) ? intval($a['bulk_after']) : null;

            $materialTotal = $matPrice * $qty;

            if ($bulkAfter !== null && $bulkLabPrice !== null && $qty > $bulkAfter) {
                $labourTotal = ($labPrice * $bulkAfter) + ($bulkLabPrice * ($qty - $bulkAfter));
            } else {
                $labourTotal = $labPrice * $qty;
            }

            $addonsTotal += $materialTotal + $labourTotal;
        }

        $total = $servicesTotal + $addonsTotal;
        $updateStmt = $this->conn->prepare("UPDATE {$this->table} SET total_amount = ? WHERE id = ?");
        if (!$updateStmt) return false;
        $updateStmt->bind_param("di", $total, $sessionId);
        return $updateStmt->execute();
    }

    private function enrichSessionRowWithServiceLines($row) {
        if (!$row || !isset($row['id'])) return $row;
        $sessionId = intval($row['id']);
        $row['service_lines'] = $this->getServiceLines($sessionId);
        $row['addon_lines'] = $this->getAddonLines($sessionId);
        return $row;
    }

    public function getAll($authData = null) {
        $where = '';
        $params = [];
        $types = '';

        $role = strtolower((string)($authData['role'] ?? ''));
        if ($role === 'attendant') {
            $userId = intval($authData['user_id'] ?? 0);
            $where = ' WHERE (s.created_by = ? OR s.id IN (SELECT DISTINCT session_id FROM session_services WHERE assigned_staff_id = ?))';
            $params[] = $userId;
            $params[] = $userId;
            $types .= 'ii';
        }

        $query = "SELECT s.*, cb.name AS created_by_name,
                         a.appointment_code
                  FROM {$this->table} s
                  LEFT JOIN staffs cb ON cb.id = s.created_by
                  LEFT JOIN appointments a ON a.id = s.appointment_id
                  {$where}
                  ORDER BY s.created_at DESC";

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
                $data[] = $this->enrichSessionRowWithServiceLines($row);
            }
        }
        return $data;
    }

    public function getById($id, $authData = null) {
        $where = '';
        $params = [$id];
        $types = 'i';

        $role = strtolower((string)($authData['role'] ?? ''));
        if ($role === 'attendant') {
            $userId = intval($authData['user_id'] ?? 0);
            $where = ' AND (s.created_by = ? OR s.id IN (SELECT DISTINCT session_id FROM session_services WHERE assigned_staff_id = ?))';
            $params[] = $userId;
            $params[] = $userId;
            $types .= 'ii';
        }

        $query = "SELECT s.*, cb.name AS created_by_name,
                         a.appointment_code
                  FROM {$this->table} s
                  LEFT JOIN staffs cb ON cb.id = s.created_by
                  LEFT JOIN appointments a ON a.id = s.appointment_id
                  WHERE s.id = ?{$where}";

        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        return $this->enrichSessionRowWithServiceLines($row);
    }

    public function generateSessionCode() {
        $query = "SELECT MAX(CAST(SUBSTRING(session_code, 4) AS UNSIGNED)) AS max_num
                  FROM {$this->table}
                  WHERE session_code REGEXP '^SES[0-9]+$'";
        $result = $this->conn->query($query);
        $row = $result ? $result->fetch_assoc() : null;
        $nextNum = intval($row['max_num'] ?? 0) + 1;
        return 'SES' . str_pad((string) $nextNum, 3, '0', STR_PAD_LEFT);
    }

    public function create($data) {
        $this->conn->begin_transaction();
        try {
            $query = "INSERT INTO {$this->table} (
                        session_code, customer_name, client_phone, client_email,
                        total_amount, billing_status, notes, appointment_id, created_by
                      )
                      VALUES (?, ?, ?, ?, ?, 'unbilled', ?, NULLIF(?, 0), NULLIF(?, 0))";

            $stmt = $this->conn->prepare($query);
            if (!$stmt) throw new Exception("Prepare failed: " . $this->conn->error);

            $session_code = $this->generateSessionCode();
            $customer_name = !empty($data['customer_name']) ? $data['customer_name'] : 'Walk-in';
            $client_phone = isset($data['client_phone']) ? trim((string) $data['client_phone']) : '';
            $client_email = isset($data['client_email']) ? trim((string) $data['client_email']) : '';
            $total_amount = 0.00;
            $notes = $data['notes'] ?? '';
            $appointment_id = isset($data['appointment_id']) && $data['appointment_id'] !== '' ? intval($data['appointment_id']) : 0;
            $created_by = isset($data['created_by']) && $data['created_by'] !== '' ? intval($data['created_by']) : 0;

            $stmt->bind_param(
                "ssssdsii",
                $session_code,
                $customer_name,
                $client_phone,
                $client_email,
                $total_amount,
                $notes,
                $appointment_id,
                $created_by
            );

            if (!$stmt->execute()) throw new Exception("Execute failed: " . $stmt->error);
            $session_id = $stmt->insert_id;

            $this->conn->commit();
            $this->lastError = null;
            return $session_id;
        } catch (Exception $e) {
            $this->conn->rollback();
            $this->lastError = $e->getMessage();
            error_log($this->lastError);
            return false;
        }
    }

    public function update($id, $data) {
        $updates = [];
        $types = "";
        $params = [];

        $fields = [
            'customer_name' => 's',
            'client_phone' => 's',
            'client_email' => 's',
            'notes' => 's'
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
        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function addServiceToSession($sessionId, $serviceId, $price, $assignedStaffId = 0, $isFromAppointment = false) {
        $normalizedPrice = $this->normalizeAmount($price);
        $defaultFlag = $isFromAppointment ? 1 : 0;
        $this->conn->begin_transaction();
        try {
            $sessionQuery = "SELECT id, billing_status FROM {$this->table} WHERE id = ? LIMIT 1";
            $sessionStmt = $this->conn->prepare($sessionQuery);
            if (!$sessionStmt) throw new Exception("Prepare session fetch failed: " . $this->conn->error);
            $sessionStmt->bind_param("i", $sessionId);
            $sessionStmt->execute();
            $sessionRes = $sessionStmt->get_result();
            $sessionRow = $sessionRes ? $sessionRes->fetch_assoc() : null;
            if (!$sessionRow) throw new Exception("Session not found.");
            if (strtolower((string)($sessionRow['billing_status'] ?? '')) === 'paid') {
                throw new Exception("Paid sessions cannot be modified.");
            }

            $query = "INSERT INTO session_services (session_id, service_id, assigned_staff_id, price, is_from_appointment)
                      VALUES (?, ?, NULLIF(?, 0), ?, ?)";
            $stmt = $this->conn->prepare($query);
            if (!$stmt) throw new Exception("Prepare add service failed: " . $this->conn->error);
            $stmt->bind_param("iiidi", $sessionId, $serviceId, $assignedStaffId, $normalizedPrice, $defaultFlag);
            if (!$stmt->execute()) throw new Exception("Execute add service failed: " . $stmt->error);

            if (!$this->recalculateSessionTotal($sessionId)) {
                throw new Exception("Failed to update total after adding service.");
            }

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollback();
            $this->lastError = $e->getMessage();
            error_log($e->getMessage());
            return false;
        }
    }

    public function removeServiceFromSession($sessionServiceId) {
        $this->conn->begin_transaction();
        try {
            $fetchQuery = "SELECT ss.session_id, s.billing_status
                           FROM session_services ss
                           INNER JOIN {$this->table} s ON s.id = ss.session_id
                           WHERE ss.id = ?";
            $fetchStmt = $this->conn->prepare($fetchQuery);
            if (!$fetchStmt) throw new Exception("Prepare fetch failed: " . $this->conn->error);
            $fetchStmt->bind_param("i", $sessionServiceId);
            $fetchStmt->execute();
            $fetchRes = $fetchStmt->get_result();
            $row = $fetchRes ? $fetchRes->fetch_assoc() : null;
            if (!$row) throw new Exception("Service line not found.");
            if (strtolower((string)($row['billing_status'] ?? '')) === 'paid') {
                throw new Exception("Paid sessions cannot be modified.");
            }

            $sessionId = intval($row['session_id']);
            $deleteQuery = "DELETE FROM session_services WHERE id = ?";
            $deleteStmt = $this->conn->prepare($deleteQuery);
            if (!$deleteStmt) throw new Exception("Prepare delete failed: " . $this->conn->error);
            $deleteStmt->bind_param("i", $sessionServiceId);
            if (!$deleteStmt->execute()) throw new Exception("Execute delete failed: " . $deleteStmt->error);

            if (!$this->recalculateSessionTotal($sessionId)) {
                throw new Exception("Failed to update total after removing service.");
            }

            $this->conn->commit();
            $this->lastError = null;
            return true;
        } catch (Exception $e) {
            $this->conn->rollback();
            $this->lastError = $e->getMessage();
            error_log($e->getMessage());
            return false;
        }
    }

    public function paySession($sessionId, $transactionCode, $paymentMethod = 'manual') {
        $session = $this->getById($sessionId);
        if (!$session) {
            $this->lastError = 'Session not found.';
            return false;
        }
        if (strtolower((string)($session['billing_status'] ?? '')) === 'paid') {
            $this->lastError = 'Session is already paid.';
            return false;
        }

        $code = trim((string)$transactionCode);
        if ($code === '') {
            $this->lastError = 'Transaction code is required.';
            return false;
        }

        $query = "UPDATE {$this->table}
                  SET billing_status = 'paid',
                      paid_at = NOW(),
                      payment_transaction_code = ?,
                      pesapal_payment_method = ?
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            $this->lastError = 'Failed to prepare payment update.';
            return false;
        }
        $stmt->bind_param("ssi", $code, $paymentMethod, $sessionId);
        if (!$stmt->execute()) {
            $this->lastError = $stmt->error;
            return false;
        }
        $this->lastError = null;
        return true;
    }

    public function initiatePesapalPayment($sessionId, $paymentMethod) {
        $session = $this->getById($sessionId);
        if (!$session) {
            $this->lastError = 'Session not found.';
            return false;
        }
        if (!isset($session['billing_status']) || strtolower((string)($session['billing_status'] ?? '')) === 'paid') {
            $this->lastError = 'Session is already paid.';
            return false;
        }

        $total = floatval($session['total_amount'] ?? 0);

        $recalculatedTotal = 0;
        if (isset($session['service_lines']) && is_array($session['service_lines'])) {
            foreach ($session['service_lines'] as $line) {
                $recalculatedTotal += floatval($line['price'] ?? 0);
            }
        }
        if (isset($session['addon_lines']) && is_array($session['addon_lines'])) {
            foreach ($session['addon_lines'] as $addon) {
                $recalculatedTotal += floatval($addon['line_total'] ?? 0);
            }
        }

        if ($recalculatedTotal > 0 && abs($total - $recalculatedTotal) > 0.01) {
            $total = $recalculatedTotal;
            $fixStmt = $this->conn->prepare("UPDATE {$this->table} SET total_amount = ? WHERE id = ?");
            if ($fixStmt) {
                $fixStmt->bind_param("di", $total, $sessionId);
                $fixStmt->execute();
            }
        }

        if ($total < 0.01) {
            error_log('Pesapal initiate: total=' . $total . ' for session ' . $sessionId
                . ', service_lines=' . (isset($session['service_lines']) ? count($session['service_lines']) : 0)
                . ', billing_status=' . ($session['billing_status'] ?? '?'));
            $this->lastError = 'Session total (' . number_format($total, 2) . ') is below the minimum payment amount.';
            return false;
        }

        $merchantReference = $session['session_code'] . '-' . bin2hex(random_bytes(8));

        $query = "UPDATE {$this->table}
                  SET pesapal_merchant_reference = ?,
                      pesapal_payment_method = ?,
                      pesapal_initiated_amount = ?,
                      billing_status = 'payment_requested'
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            $this->lastError = 'Failed to prepare payment initiation.';
            return false;
        }
        $stmt->bind_param("ssdi", $merchantReference, $paymentMethod, $total, $sessionId);
        if (!$stmt->execute()) {
            $this->lastError = $stmt->error;
            return false;
        }

        $this->lastError = null;
        return [
            'merchant_reference' => $merchantReference,
            'amount' => $total,
            'currency' => 'KES',
            'session' => $session,
        ];
    }

    public function savePesapalOrderResponse($sessionId, $orderTrackingId, $redirectUrl) {
        $query = "UPDATE {$this->table}
                  SET pesapal_order_tracking_id = ?,
                      pesapal_redirect_url = ?
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("ssi", $orderTrackingId, $redirectUrl, $sessionId);
        if (!$stmt->execute()) return false;
        return true;
    }

    public function confirmPesapalPayment($sessionId, $orderTrackingId, $confirmationCode, $paymentMethod = null) {
        $this->conn->begin_transaction();
        try {
            $session = $this->getById($sessionId);
            if (!$session) throw new Exception('Session not found.');
            if (strtolower((string)($session['billing_status'] ?? '')) === 'paid') {
                if ($confirmationCode && empty($session['payment_transaction_code'])) {
                    $updateStmt = $this->conn->prepare(
                        "UPDATE {$this->table} SET payment_transaction_code = ? WHERE id = ? AND payment_transaction_code IS NULL"
                    );
                    if ($updateStmt) {
                        $updateStmt->bind_param("si", $confirmationCode, $sessionId);
                        $updateStmt->execute();
                    }
                }
                $this->conn->commit();
                return $this->getSessionNotificationData($sessionId) ?: $session;
            }

            $carryMethod = $paymentMethod ?: ($session['pesapal_payment_method'] ?? null);

            $code = $confirmationCode ?: null;

            $query = "UPDATE {$this->table}
                      SET billing_status = 'paid',
                          paid_at = NOW(),
                          payment_transaction_code = ?,
                          pesapal_order_tracking_id = ?,
                          pesapal_payment_method = COALESCE(?, pesapal_payment_method)
                      WHERE id = ? AND billing_status != 'paid'";
            $stmt = $this->conn->prepare($query);
            if (!$stmt) throw new Exception('Failed to prepare payment confirmation.');

            $stmt->bind_param("sssi", $code, $orderTrackingId, $carryMethod, $sessionId);
            if (!$stmt->execute()) throw new Exception($stmt->error);

            $this->conn->commit();

            $updated = $this->getSessionNotificationData($sessionId);

            $this->lastError = null;
            return $updated ?: true;
        } catch (Exception $e) {
            $this->conn->rollback();
            $this->lastError = $e->getMessage();
            error_log('Pesapal confirmPayment error: ' . $e->getMessage());
            return false;
        }
    }

    public function failPesapalPayment($sessionId, $orderTrackingId) {
        $query = "UPDATE {$this->table}
                  SET billing_status = 'failed',
                      pesapal_order_tracking_id = ?
                  WHERE id = ? AND billing_status = 'payment_requested'";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("si", $orderTrackingId, $sessionId);
        return $stmt->execute();
    }

    public function revertPesapalPayment($sessionId) {
        $query = "UPDATE {$this->table}
                  SET billing_status = 'failed',
                      paid_at = NULL,
                      payment_transaction_code = NULL
                  WHERE id = ? AND billing_status = 'paid'";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("i", $sessionId);
        return $stmt->execute();
    }

    public function cancelPesapalPayment($sessionId, $orderTrackingId) {
        $query = "UPDATE {$this->table}
                  SET billing_status = 'cancelled',
                      pesapal_order_tracking_id = ?
                  WHERE id = ? AND billing_status = 'payment_requested'";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("si", $orderTrackingId, $sessionId);
        return $stmt->execute();
    }

    public function findSessionByMerchantReference($merchantReference) {
        $query = "SELECT id, session_code, customer_name, total_amount, billing_status,
                         pesapal_order_tracking_id, pesapal_payment_method,
                         pesapal_merchant_reference, payment_transaction_code, paid_at
                   FROM {$this->table}
                   WHERE pesapal_merchant_reference = ?
                   LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param("s", $merchantReference);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result ? $result->fetch_assoc() : null;
    }

    public function findSessionByOrderTrackingId($orderTrackingId) {
        $query = "SELECT id, session_code, customer_name, total_amount, billing_status,
                         pesapal_merchant_reference, pesapal_payment_method,
                         payment_transaction_code, paid_at
                   FROM {$this->table}
                   WHERE pesapal_order_tracking_id = ?
                   LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param("s", $orderTrackingId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result ? $result->fetch_assoc() : null;
    }

    private function getSessionTotalRaw($session) {
        $lines = $session['service_lines'] ?? [];
        $total = 0;
        foreach ($lines as $line) {
            $total += floatval(str_replace(',', '', (string)($line['price'] ?? 0)));
        }
        $total -= floatval($session['discount_amount'] ?? 0);
        return max(0, $total);
    }

    public function getPesapalOrderStatus($sessionId) {
        $query = "SELECT pesapal_order_tracking_id, pesapal_merchant_reference,
                         billing_status, paid_at, payment_transaction_code
                  FROM {$this->table}
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param("i", $sessionId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result ? $result->fetch_assoc() : null;
    }

    public function getServiceLines($sessionId) {
        $query = "SELECT ss.*, sv.name as service_name,
                         st.name as assigned_staff_name, st.skill as assigned_staff_skill
                  FROM session_services ss
                  INNER JOIN services sv ON sv.id = ss.service_id
                  LEFT JOIN staffs st ON st.id = ss.assigned_staff_id
                  WHERE ss.session_id = ?
                  ORDER BY ss.id ASC";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return [];
        $stmt->bind_param("i", $sessionId);
        $stmt->execute();
        $res = $stmt->get_result();
        $rows = [];
        while ($res && ($row = $res->fetch_assoc())) {
            $rows[] = $row;
        }
        return $rows;
    }

    private function getAddonLinesRaw($sessionId) {
        $query = "SELECT sa.*, a.name as addon_name, a.bulk_after, a.bulk_labour_price
                  FROM session_addons sa
                  INNER JOIN addons a ON a.id = sa.addon_id
                  WHERE sa.session_id = ?
                  ORDER BY sa.id ASC";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return [];
        $stmt->bind_param("i", $sessionId);
        $stmt->execute();
        $res = $stmt->get_result();
        $rows = [];
        while ($res && ($row = $res->fetch_assoc())) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getAddonLines($sessionId) {
        $rows = $this->getAddonLinesRaw($sessionId);
        $result = [];
        foreach ($rows as $row) {
            $qty = intval($row['quantity'] ?? 1);
            $matPrice = floatval($row['material_price'] ?? 0);
            $labPrice = floatval($row['labour_price'] ?? 0);
            $bulkAfter = isset($row['bulk_after']) ? intval($row['bulk_after']) : null;
            $bulkLabPrice = isset($row['bulk_labour_price']) ? floatval($row['bulk_labour_price']) : null;

            $materialTotal = $matPrice * $qty;
            if ($bulkAfter !== null && $bulkLabPrice !== null && $qty > $bulkAfter) {
                $labourTotal = ($labPrice * $bulkAfter) + ($bulkLabPrice * ($qty - $bulkAfter));
            } else {
                $labourTotal = $labPrice * $qty;
            }

            $row['material_total'] = $materialTotal;
            $row['labour_total'] = $labourTotal;
            $row['line_total'] = $materialTotal + $labourTotal;
            $result[] = $row;
        }
        return $result;
    }

    public function addAddonToSession($sessionId, $addonId, $quantity) {
        $this->conn->begin_transaction();
        try {
            $sessionQuery = "SELECT id, billing_status FROM {$this->table} WHERE id = ? LIMIT 1";
            $sessionStmt = $this->conn->prepare($sessionQuery);
            if (!$sessionStmt) throw new Exception("Prepare session fetch failed: " . $this->conn->error);
            $sessionStmt->bind_param("i", $sessionId);
            $sessionStmt->execute();
            $sessionRes = $sessionStmt->get_result();
            $sessionRow = $sessionRes ? $sessionRes->fetch_assoc() : null;
            if (!$sessionRow) throw new Exception("Session not found.");
            if (strtolower((string)($sessionRow['billing_status'] ?? '')) === 'paid') {
                throw new Exception("Paid sessions cannot be modified.");
            }

            $addonQuery = "SELECT id, name, material_price, labour_price, bulk_after, bulk_labour_price FROM addons WHERE id = ? AND status = 'Active' LIMIT 1";
            $addonStmt = $this->conn->prepare($addonQuery);
            if (!$addonStmt) throw new Exception("Prepare addon fetch failed: " . $this->conn->error);
            $addonStmt->bind_param("i", $addonId);
            $addonStmt->execute();
            $addonRes = $addonStmt->get_result();
            $addonRow = $addonRes ? $addonRes->fetch_assoc() : null;
            if (!$addonRow) throw new Exception("Addon not found or inactive.");

            $qty = max(1, intval($quantity));

            $query = "INSERT INTO session_addons (session_id, addon_id, quantity, material_price, labour_price, bulk_labour_price)
                      VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            if (!$stmt) throw new Exception("Prepare add addon failed: " . $this->conn->error);

            $matPrice = floatval($addonRow['material_price']);
            $labPrice = floatval($addonRow['labour_price']);
            $bulkLabPrice = $addonRow['bulk_labour_price'] !== null ? floatval($addonRow['bulk_labour_price']) : null;

            $stmt->bind_param("iiddd", $sessionId, $addonId, $qty, $matPrice, $labPrice, $bulkLabPrice);
            if (!$stmt->execute()) throw new Exception("Execute add addon failed: " . $stmt->error);

            if (!$this->recalculateSessionTotal($sessionId)) {
                throw new Exception("Failed to update total after adding addon.");
            }
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollback();
            $this->lastError = $e->getMessage();
            error_log($e->getMessage());
            return false;
        }
    }

    public function removeAddonFromSession($sessionAddonId) {
        $this->conn->begin_transaction();
        try {
            $fetchQuery = "SELECT sa.session_id, s.billing_status
                           FROM session_addons sa
                           INNER JOIN {$this->table} s ON s.id = sa.session_id
                           WHERE sa.id = ?";
            $fetchStmt = $this->conn->prepare($fetchQuery);
            if (!$fetchStmt) throw new Exception("Prepare fetch failed: " . $this->conn->error);
            $fetchStmt->bind_param("i", $sessionAddonId);
            $fetchStmt->execute();
            $fetchRes = $fetchStmt->get_result();
            $row = $fetchRes ? $fetchRes->fetch_assoc() : null;
            if (!$row) throw new Exception("Addon line not found.");
            if (strtolower((string)($row['billing_status'] ?? '')) === 'paid') {
                throw new Exception("Paid sessions cannot be modified.");
            }

            $sessionId = intval($row['session_id']);
            $deleteQuery = "DELETE FROM session_addons WHERE id = ?";
            $deleteStmt = $this->conn->prepare($deleteQuery);
            if (!$deleteStmt) throw new Exception("Prepare delete failed: " . $this->conn->error);
            $deleteStmt->bind_param("i", $sessionAddonId);
            if (!$deleteStmt->execute()) throw new Exception("Execute delete failed: " . $deleteStmt->error);

            if (!$this->recalculateSessionTotal($sessionId)) {
                throw new Exception("Failed to update total after removing addon.");
            }
            $this->conn->commit();
            $this->lastError = null;
            return true;
        } catch (Exception $e) {
            $this->conn->rollback();
            $this->lastError = $e->getMessage();
            error_log($e->getMessage());
            return false;
        }
    }

    public function logPaymentEvent(int $sessionId, string $eventType, ?array $eventData = null, ?string $trackingId = null, ?string $merchantReference = null): void {
        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO payment_audit_log (session_id, event_type, event_data, ip_address, user_agent, pesapal_order_tracking_id, pesapal_merchant_reference)
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            if (!$stmt) return;

            $ip = $_SERVER['REMOTE_ADDR'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
            $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $jsonData = $eventData !== null ? json_encode($eventData) : null;
            $stmt->bind_param("issssss", $sessionId, $eventType, $jsonData, $ip, $ua, $trackingId, $merchantReference);
            if (!$stmt->execute()) {
                error_log('logPaymentEvent failed: ' . $stmt->error);
            }
            $stmt->close();
        } catch (\Throwable $e) {
            error_log('logPaymentEvent exception: ' . $e->getMessage());
        }
    }

    public function getLastError() {
        return $this->lastError;
    }

    public function getSessionNotificationData($sessionId) {
        $query = "SELECT s.id, s.session_code, s.customer_name, s.client_phone, s.client_email, s.total_amount,
                         s.created_at, s.paid_at, s.billing_status,
                         a.appointment_code,
                         a.customer_email as appointment_email, a.customer_phone as appointment_phone
                  FROM {$this->table} s
                  LEFT JOIN appointments a ON s.appointment_id = a.id
                  WHERE s.id = ?
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param("i", $sessionId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        if (!$row) return null;

        if (empty($row['client_email']) && !empty($row['appointment_email'])) {
            $row['client_email'] = $row['appointment_email'];
        }
        if (empty($row['client_phone']) && !empty($row['appointment_phone'])) {
            $row['client_phone'] = $row['appointment_phone'];
        }

        return $row;
    }

    public function getAppointmentById($appointmentId) {
        $query = "SELECT a.id, a.appointment_code, a.customer_name, a.customer_email, a.customer_phone,
                         a.service_id, a.staff_id, a.status, a.appointment_date, a.appointment_time,
                         sv.name as service_name, st.name as staff_name
                  FROM appointments a
                  LEFT JOIN services sv ON a.service_id = sv.id
                  LEFT JOIN staffs st ON a.staff_id = st.id
                  WHERE a.id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param("i", $appointmentId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        if (!$row) return null;

        $serviceItems = $this->getAppointmentServiceItems($appointmentId);
        if (!empty($serviceItems)) {
            $row['service_items'] = $serviceItems;
            if (empty($row['service_id'])) {
                $row['service_id'] = intval($serviceItems[0]['service_id'] ?? 0) ?: null;
            }
        }
        return $row;
    }

    public function getAppointmentServiceItems($appointmentId) {
        $appointmentId = intval($appointmentId);
        if ($appointmentId <= 0) return [];

        $tableCheck = $this->conn->query("SHOW TABLES LIKE 'appointment_services'");
        if (!$tableCheck || $tableCheck->num_rows === 0) return [];

        $query = "SELECT aps.service_id, aps.sequence_no, s.name AS service_name, s.price AS service_price
                  FROM appointment_services aps
                  LEFT JOIN services s ON s.id = aps.service_id
                  WHERE aps.appointment_id = ?
                  ORDER BY aps.sequence_no ASC, aps.id ASC";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return [];

        $stmt->bind_param("i", $appointmentId);
        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        while ($result && ($row = $result->fetch_assoc())) {
            $items[] = [
                'service_id' => intval($row['service_id'] ?? 0),
                'sequence_no' => intval($row['sequence_no'] ?? 0),
                'service_name' => $row['service_name'] ?? '',
                'price' => $this->normalizeAmount($row['service_price'] ?? 0),
            ];
        }
        return $items;
    }

    public function buildSessionServicesFromAppointment($appointmentId, $staffId = 0) {
        $items = $this->getAppointmentServiceItems($appointmentId);
        if (empty($items)) return null;

        $staffId = intval($staffId);
        $primary = array_shift($items);
        $additional = [];
        $totalAmount = floatval($primary['price'] ?? 0);

        foreach ($items as $item) {
            $price = floatval($item['price'] ?? 0);
            $totalAmount += $price;
            $additional[] = [
                'service_id' => intval($item['service_id'] ?? 0),
                'price' => $price,
                'assigned_staff_id' => $staffId,
            ];
        }

        return [
            'service_id' => intval($primary['service_id'] ?? 0),
            'total_amount' => $totalAmount,
            'additional_services' => $additional,
        ];
    }

    public function hasSessionForAppointment($appointmentId) {
        $query = "SELECT id FROM {$this->table} WHERE appointment_id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("i", $appointmentId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->num_rows > 0;
    }

    public function createOrRefreshFeedbackToken($sessionId, $ttlHours = 168) {
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $expiry = date('Y-m-d H:i:s', time() + (max(1, intval($ttlHours)) * 3600));

        $session = $this->getSessionNotificationData($sessionId);
        if (!$session) {
            return false;
        }

        $query = "INSERT INTO session_feedback (
                    session_id, token_hash, token_expires_at, submitted_at,
                    service_rating, billing_rating, feedback_text, client_name_snapshot, client_email_snapshot
                  ) VALUES (?, ?, ?, NULL, NULL, NULL, NULL, ?, ?)
                  ON DUPLICATE KEY UPDATE
                    token_hash = VALUES(token_hash),
                    token_expires_at = VALUES(token_expires_at),
                    submitted_at = NULL,
                    service_rating = NULL,
                    billing_rating = NULL,
                    feedback_text = NULL,
                    client_name_snapshot = VALUES(client_name_snapshot),
                    client_email_snapshot = VALUES(client_email_snapshot)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return false;
        }

        $nameSnapshot = (string)($session['customer_name'] ?? '');
        $emailSnapshot = (string)($session['client_email'] ?? '');
        $stmt->bind_param("issss", $sessionId, $tokenHash, $expiry, $nameSnapshot, $emailSnapshot);
        if (!$stmt->execute()) {
            return false;
        }

        return $token;
    }

    public function getFeedbackContextByToken($token) {
        if (empty($token)) return null;
        $tokenHash = hash('sha256', $token);
        $query = "SELECT sf.session_id, sf.token_expires_at, sf.submitted_at,
                         s.session_code, s.customer_name, s.total_amount, s.created_at, s.paid_at
                  FROM session_feedback sf
                  INNER JOIN sessions s ON s.id = sf.session_id
                  WHERE sf.token_hash = ?
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param("s", $tokenHash);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        if (!$row) return null;

        $isExpired = strtotime((string)$row['token_expires_at']) < time();
        $row['is_expired'] = $isExpired;
        $row['is_submitted'] = !empty($row['submitted_at']);
        return $row;
    }

    public function submitFeedbackByToken($token, $serviceRating, $billingRating, $feedbackText) {
        if (empty($token)) return false;
        $tokenHash = hash('sha256', $token);
        $query = "UPDATE session_feedback
                  SET service_rating = ?, billing_rating = ?, feedback_text = ?, submitted_at = NOW()
                  WHERE token_hash = ?
                    AND submitted_at IS NULL
                    AND token_expires_at >= NOW()";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;

        $safeFeedback = trim((string)($feedbackText ?? ''));
        $stmt->bind_param("iiss", $serviceRating, $billingRating, $safeFeedback, $tokenHash);
        if (!$stmt->execute()) return false;
        return $stmt->affected_rows > 0;
    }

    public function getFeedbackSummary($startDate = null, $endDate = null, $limit = 5) {
        $where = [];
        $types = '';
        $params = [];

        if (!empty($startDate)) {
            $where[] = "DATE(sf.submitted_at) >= ?";
            $types .= 's';
            $params[] = $startDate;
        }
        if (!empty($endDate)) {
            $where[] = "DATE(sf.submitted_at) <= ?";
            $types .= 's';
            $params[] = $endDate;
        }

        $whereSql = '';
        if (!empty($where)) {
            $whereSql = ' AND ' . implode(' AND ', $where);
        }

        $summaryQuery = "SELECT
                            COUNT(*) as feedback_count,
                            AVG(service_rating) as avg_service_rating,
                            AVG(billing_rating) as avg_billing_rating
                         FROM session_feedback sf
                         WHERE sf.submitted_at IS NOT NULL {$whereSql}";
        $summaryStmt = $this->conn->prepare($summaryQuery);
        if (!$summaryStmt) {
            return ['feedback_count' => 0, 'avg_service_rating' => 0, 'avg_billing_rating' => 0, 'recent_comments' => []];
        }
        if (!empty($params)) {
            $summaryStmt->bind_param($types, ...$params);
        }
        $summaryStmt->execute();
        $summaryRes = $summaryStmt->get_result();
        $summaryRow = $summaryRes ? $summaryRes->fetch_assoc() : null;

        $recentLimit = max(1, intval($limit));
        $recentQuery = "SELECT sf.session_id, sf.service_rating, sf.billing_rating, sf.feedback_text, sf.submitted_at,
                               s.session_code, s.customer_name
                        FROM session_feedback sf
                        INNER JOIN sessions s ON s.id = sf.session_id
                        WHERE sf.submitted_at IS NOT NULL
                          AND COALESCE(TRIM(sf.feedback_text), '') <> '' {$whereSql}
                        ORDER BY sf.submitted_at DESC
                        LIMIT {$recentLimit}";
        $recentStmt = $this->conn->prepare($recentQuery);
        $recentComments = [];
        if ($recentStmt) {
            if (!empty($params)) {
                $recentStmt->bind_param($types, ...$params);
            }
            $recentStmt->execute();
            $recentRes = $recentStmt->get_result();
            while ($recentRes && ($row = $recentRes->fetch_assoc())) {
                $recentComments[] = $row;
            }
        }

        return [
            'feedback_count' => intval($summaryRow['feedback_count'] ?? 0),
            'avg_service_rating' => round(floatval($summaryRow['avg_service_rating'] ?? 0), 2),
            'avg_billing_rating' => round(floatval($summaryRow['avg_billing_rating'] ?? 0), 2),
            'recent_comments' => $recentComments,
        ];
    }

    public function getFeedbackNotifications($limit = 50) {
        $safeLimit = max(1, intval($limit));

        $countQuery = "SELECT COUNT(*) AS unread_count
                       FROM session_feedback
                       WHERE submitted_at IS NOT NULL AND viewed_at IS NULL";
        $countResult = $this->conn->query($countQuery);
        $unreadCount = 0;
        if ($countResult) {
            $countRow = $countResult->fetch_assoc();
            $unreadCount = intval($countRow['unread_count'] ?? 0);
        }

        $itemsQuery = "SELECT sf.id, sf.session_id, sf.service_rating, sf.billing_rating, sf.feedback_text,
                              sf.submitted_at, sf.viewed_at, s.session_code, s.customer_name
                       FROM session_feedback sf
                       INNER JOIN sessions s ON s.id = sf.session_id
                       WHERE sf.submitted_at IS NOT NULL
                       ORDER BY sf.submitted_at DESC
                       LIMIT {$safeLimit}";
        $itemsResult = $this->conn->query($itemsQuery);
        $items = [];
        while ($itemsResult && ($row = $itemsResult->fetch_assoc())) {
            $items[] = $row;
        }

        return [
            'unread_count' => $unreadCount,
            'items' => $items,
        ];
    }

    public function markFeedbackAsViewed($feedbackId) {
        $id = intval($feedbackId);
        if ($id <= 0) return false;
        $query = "UPDATE session_feedback
                  SET viewed_at = COALESCE(viewed_at, NOW())
                  WHERE id = ? AND submitted_at IS NOT NULL";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) return false;
        return $stmt->affected_rows > 0;
    }

    public function markAllFeedbackAsViewed() {
        $query = "UPDATE session_feedback
                  SET viewed_at = NOW()
                  WHERE submitted_at IS NOT NULL AND viewed_at IS NULL";
        return (bool)$this->conn->query($query);
    }
}
