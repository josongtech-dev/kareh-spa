<?php
require_once __DIR__ . '/BaseModel.php';

class Session extends BaseModel {
    protected $table = 'sessions';
    private $lastError = null;
    private $hasOfferDiscountColumn = null;
    
    private function normalizeAmount($value) {
        return floatval(str_replace(',', '', (string) $value));
    }

    private function sessionHasOfferDiscountColumn() {
        if ($this->hasOfferDiscountColumn !== null) {
            return $this->hasOfferDiscountColumn;
        }
        $query = "SELECT COUNT(*) AS c
                  FROM information_schema.COLUMNS
                  WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'sessions'
                    AND COLUMN_NAME = 'offer_discount_amount'";
        $result = $this->conn->query($query);
        $row = $result ? $result->fetch_assoc() : null;
        $this->hasOfferDiscountColumn = intval($row['c'] ?? 0) > 0;
        return $this->hasOfferDiscountColumn;
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

    private function getServiceLineStatusFromSessionStatus($sessionStatus) {
        if ($sessionStatus === 'Completed') return 'completed';
        if ($sessionStatus === 'Voided') return 'voided';
        if ($sessionStatus === 'In Progress' || $sessionStatus === 'Finalizing') return 'in_progress';
        return 'pending';
    }

    private function sanitizeBillingStatus($status) {
        $allowed = ['unbilled', 'payment_requested', 'paid'];
        $status = strtolower(trim((string)$status));
        return in_array($status, $allowed, true) ? $status : 'unbilled';
    }

    private function calculateDiscountAmount($subtotal, $discountType, $discountValue) {
        $subtotal = max(0, floatval($subtotal));
        $discountValue = max(0, floatval($discountValue));
        if ($discountType === 'percent') {
            $discountValue = min($discountValue, 100);
            return ($subtotal * $discountValue) / 100;
        }
        return min($discountValue, $subtotal);
    }

    private function calculatePayableTotal($subtotal, $discountType, $discountValue) {
        $discountAmount = $this->calculateDiscountAmount($subtotal, $discountType, $discountValue);
        return max(0, floatval($subtotal) - $discountAmount);
    }

    private function calculateOfferDiscountForServiceLine($linePrice, $offers) {
        $price = max(0, floatval($linePrice));
        if ($price <= 0 || !is_array($offers) || empty($offers)) return 0;
        $best = 0.0;
        foreach ($offers as $offer) {
            $type = strtolower(trim((string)($offer['discount_type'] ?? 'percent')));
            $value = floatval($offer['discount_value'] ?? 0);
            if ($value <= 0) continue;
            $discount = 0.0;
            if ($type === 'amount') {
                $discount = min($value, $price);
            } else {
                $discount = ($price * min(100, max(0, $value))) / 100;
            }
            if ($discount > $best) $best = $discount;
        }
        return round($best, 2);
    }

    private function getActiveOffersByServiceId($serviceIds, $atDate = null) {
        $ids = array_values(array_unique(array_map('intval', is_array($serviceIds) ? $serviceIds : [])));
        $ids = array_values(array_filter($ids, function ($id) { return $id > 0; }));
        if (empty($ids)) return [];
        $when = trim((string)($atDate ?? ''));
        if ($when === '') $when = date('Y-m-d H:i:s');

        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $query = "SELECT o.id, o.discount_type, o.discount_value, os.service_id
                  FROM service_offers o
                  INNER JOIN service_offer_services os ON os.offer_id = o.id
                  WHERE o.status = 'Active'
                    AND (o.starts_at IS NULL OR o.starts_at <= ?)
                    AND (o.ends_at IS NULL OR o.ends_at >= ?)
                    AND os.service_id IN ($placeholders)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return [];
        $types = 'ss' . str_repeat('i', count($ids));
        $params = array_merge([$when, $when], $ids);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $res = $stmt->get_result();
        $map = [];
        while ($res && ($row = $res->fetch_assoc())) {
            $sid = intval($row['service_id'] ?? 0);
            if (!isset($map[$sid])) $map[$sid] = [];
            $map[$sid][] = $row;
        }
        return $map;
    }

    private function calculateSessionOfferDiscount($sessionId, $atDate = null) {
        $lines = $this->getServiceLines($sessionId);
        $activeLines = array_values(array_filter($lines, function ($line) {
            return strtolower((string)($line['status'] ?? '')) !== 'voided';
        }));
        if (empty($activeLines)) return 0.0;
        $serviceIds = array_map(function ($line) { return intval($line['service_id'] ?? 0); }, $activeLines);
        $offersByService = $this->getActiveOffersByServiceId($serviceIds, $atDate);
        $offerDiscount = 0.0;
        foreach ($activeLines as $line) {
            $sid = intval($line['service_id'] ?? 0);
            $linePrice = floatval($line['price'] ?? 0);
            $offerDiscount += $this->calculateOfferDiscountForServiceLine($linePrice, $offersByService[$sid] ?? []);
        }
        return round($offerDiscount, 2);
    }

    private function recalculateSessionAmountsExcludingVoided($sessionId) {
        $sumQuery = "SELECT COALESCE(SUM(price), 0) AS subtotal
                     FROM session_services
                     WHERE session_id = ?
                       AND status <> 'voided'";
        $sumStmt = $this->conn->prepare($sumQuery);
        if (!$sumStmt) return false;
        $sumStmt->bind_param("i", $sessionId);
        $sumStmt->execute();
        $sumRes = $sumStmt->get_result();
        $sumRow = $sumRes ? $sumRes->fetch_assoc() : null;
        $subtotal = floatval($sumRow['subtotal'] ?? 0);

        $snap = $this->getSessionBillingSnapshot($sessionId);
        if (!$snap) return false;
        $discountType = ($snap['discount_type'] ?? 'amount') === 'percent' ? 'percent' : 'amount';
        $discountValue = floatval($snap['discount_value'] ?? 0);
        $manualDiscountAmount = $this->calculateDiscountAmount($subtotal, $discountType, $discountValue);
        $offerDiscountAmount = $this->calculateSessionOfferDiscount($sessionId);
        $discountAmount = min($subtotal, $manualDiscountAmount + $offerDiscountAmount);
        $payable = max(0, $subtotal - $discountAmount);

        $updateQuery = $this->sessionHasOfferDiscountColumn()
            ? "UPDATE {$this->table}
               SET billing_subtotal = ?, offer_discount_amount = ?, discount_amount = ?, total_amount = ?
               WHERE id = ?"
            : "UPDATE {$this->table}
               SET billing_subtotal = ?, discount_amount = ?, total_amount = ?
               WHERE id = ?";
        $updateStmt = $this->conn->prepare($updateQuery);
        if (!$updateStmt) return false;
        if ($this->sessionHasOfferDiscountColumn()) {
            $updateStmt->bind_param("ddddi", $subtotal, $offerDiscountAmount, $discountAmount, $payable, $sessionId);
        } else {
            $updateStmt->bind_param("dddi", $subtotal, $discountAmount, $payable, $sessionId);
        }
        return $updateStmt->execute();
    }

    private function getSessionBillingSnapshot($sessionId) {
        $query = "SELECT id, status, billing_status, billing_subtotal, discount_type, discount_value, total_amount
                  FROM {$this->table}
                  WHERE id = ?
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param("i", $sessionId);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res ? $res->fetch_assoc() : null;
        if (!$row) return null;
        $row['billing_status'] = $this->sanitizeBillingStatus($row['billing_status'] ?? 'unbilled');
        return $row;
    }

    private function enrichSessionRowWithServiceLines($row) {
        if (!$row || !isset($row['id'])) return $row;

        $sessionId = intval($row['id']);
        $serviceLines = $this->getServiceLines($sessionId);
        $row['service_lines'] = $serviceLines;

        // Keep "additional_services" as add-ons only (exclude just one primary line instance).
        $additionalServices = $serviceLines;
        $primaryServiceId = intval($row['service_id'] ?? 0);
        if ($primaryServiceId > 0) {
            $primaryIndex = null;
            foreach ($additionalServices as $idx => $line) {
                if (intval($line['service_id'] ?? 0) === $primaryServiceId) {
                    $primaryIndex = $idx;
                    break;
                }
            }
            if ($primaryIndex !== null) {
                unset($additionalServices[$primaryIndex]);
                $additionalServices = array_values($additionalServices);
            }
        }
        // Hide cancelled/voided add-ons from add-on lists while keeping full service_lines for audit/history.
        $row['additional_services'] = array_values(array_filter($additionalServices, function ($line) {
            return strtolower((string)($line['status'] ?? '')) !== 'voided';
        }));
        $row['service_progress'] = $this->getSessionServiceProgress($sessionId);
        $row['addon_lines'] = $this->getAddonLines($sessionId);

        return $row;
    }

    private function calculateAddonUnitLabour(array $addonRow, int $quantity): float {
        $bulkAfter = isset($addonRow['bulk_after']) ? intval($addonRow['bulk_after']) : 0;
        if ($bulkAfter > 0 && $quantity >= $bulkAfter && $addonRow['bulk_labour_price'] !== null && $addonRow['bulk_labour_price'] !== '') {
            return $this->normalizeAmount($addonRow['bulk_labour_price']);
        }
        return $this->normalizeAmount($addonRow['labour_price'] ?? 0);
    }

    private function decorateAddonLineRow(array $row): array {
        $quantity = max(1, intval($row['quantity'] ?? 1));
        $material = $this->normalizeAmount($row['material_price'] ?? 0);
        $unitLabour = $this->normalizeAmount($row['labour_price'] ?? 0);
        $unitPrice = $material + $unitLabour;
        $row['quantity'] = $quantity;
        $row['price'] = $unitPrice;
        $row['line_total'] = $unitPrice * $quantity;
        return $row;
    }

    public function getAddonLines($sessionId) {
        $query = "SELECT sa.*, a.name AS addon_name
                  FROM session_addons sa
                  INNER JOIN addons a ON a.id = sa.addon_id
                  WHERE sa.session_id = ?
                  ORDER BY sa.id ASC";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return [];
        }
        $stmt->bind_param("i", $sessionId);
        $stmt->execute();
        $res = $stmt->get_result();
        $rows = [];
        while ($res && ($row = $res->fetch_assoc())) {
            $rows[] = $this->decorateAddonLineRow($row);
        }
        return $rows;
    }

    public function addAddonToSession($sessionId, $addonId, $quantity = 1) {
        $quantity = max(1, intval($quantity));
        $this->conn->begin_transaction();
        try {
            $sessionQuery = "SELECT status, billing_status, billing_subtotal, discount_type, discount_value, total_amount
                             FROM {$this->table}
                             WHERE id = ? LIMIT 1";
            $sessionStmt = $this->conn->prepare($sessionQuery);
            if (!$sessionStmt) {
                throw new Exception('Prepare session fetch failed: ' . $this->conn->error);
            }
            $sessionStmt->bind_param("i", $sessionId);
            $sessionStmt->execute();
            $sessionRes = $sessionStmt->get_result();
            $sessionRow = $sessionRes ? $sessionRes->fetch_assoc() : null;
            if (!$sessionRow) {
                throw new Exception('Session not found.');
            }
            $billingStatus = $this->sanitizeBillingStatus($sessionRow['billing_status'] ?? 'unbilled');
            if ($billingStatus === 'paid') {
                throw new Exception('Paid sessions cannot be modified.');
            }

            $addonQuery = "SELECT id, name, material_price, labour_price, bulk_after, bulk_labour_price, status
                           FROM addons
                           WHERE id = ? LIMIT 1";
            $addonStmt = $this->conn->prepare($addonQuery);
            if (!$addonStmt) {
                throw new Exception('Prepare addon fetch failed: ' . $this->conn->error);
            }
            $addonStmt->bind_param("i", $addonId);
            $addonStmt->execute();
            $addonRes = $addonStmt->get_result();
            $addonRow = $addonRes ? $addonRes->fetch_assoc() : null;
            if (!$addonRow) {
                throw new Exception('Addon not found.');
            }
            if (strcasecmp((string)($addonRow['status'] ?? ''), 'Active') !== 0) {
                throw new Exception('Addon is not active.');
            }

            $materialPrice = $this->normalizeAmount($addonRow['material_price'] ?? 0);
            $catalogLabour = $this->normalizeAmount($addonRow['labour_price'] ?? 0);
            $bulkAfter = isset($addonRow['bulk_after']) && $addonRow['bulk_after'] !== '' && $addonRow['bulk_after'] !== null
                ? intval($addonRow['bulk_after'])
                : null;
            $bulkLabourPrice = ($bulkAfter !== null && $addonRow['bulk_labour_price'] !== null && $addonRow['bulk_labour_price'] !== '')
                ? $this->normalizeAmount($addonRow['bulk_labour_price'])
                : null;
            $effectiveLabour = $this->calculateAddonUnitLabour([
                'labour_price' => $catalogLabour,
                'bulk_after' => $bulkAfter,
                'bulk_labour_price' => $bulkLabourPrice,
            ], $quantity);

            $insertQuery = "INSERT INTO session_addons
                            (session_id, addon_id, quantity, material_price, labour_price, bulk_labour_price)
                            VALUES (?, ?, ?, ?, ?, NULL)";
            $insertStmt = $this->conn->prepare($insertQuery);
            if (!$insertStmt) {
                throw new Exception('Prepare addon insert failed: ' . $this->conn->error);
            }
            $insertStmt->bind_param(
                "iiidd",
                $sessionId,
                $addonId,
                $quantity,
                $materialPrice,
                $effectiveLabour
            );
            if (!$insertStmt->execute()) {
                throw new Exception('Execute addon insert failed: ' . $insertStmt->error);
            }

            $lineTotal = ($materialPrice + $effectiveLabour) * $quantity;

            $currentSubtotal = floatval($sessionRow['billing_subtotal'] ?? 0);
            if ($currentSubtotal <= 0) {
                $currentSubtotal = floatval($sessionRow['total_amount'] ?? 0);
            }
            $newSubtotal = $currentSubtotal + $lineTotal;
            $discountType = ($sessionRow['discount_type'] ?? 'amount') === 'percent' ? 'percent' : 'amount';
            $discountValue = floatval($sessionRow['discount_value'] ?? 0);
            $discountAmount = $this->calculateDiscountAmount($newSubtotal, $discountType, $discountValue);
            $newTotal = $this->calculatePayableTotal($newSubtotal, $discountType, $discountValue);

            $updateQuery = "UPDATE {$this->table}
                            SET billing_subtotal = ?, discount_amount = ?, total_amount = ?
                            WHERE id = ?";
            $updateStmt = $this->conn->prepare($updateQuery);
            if (!$updateStmt) {
                throw new Exception('Prepare total update failed: ' . $this->conn->error);
            }
            $updateStmt->bind_param("dddi", $newSubtotal, $discountAmount, $newTotal, $sessionId);
            if (!$updateStmt->execute()) {
                throw new Exception('Execute total update failed: ' . $updateStmt->error);
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

    public function removeAddonFromSession($addonLineId) {
        $this->conn->begin_transaction();
        try {
            $lineQuery = "SELECT sa.id, sa.session_id, sa.quantity, sa.material_price, sa.labour_price,
                                 s.billing_status, s.billing_subtotal, s.discount_type, s.discount_value, s.total_amount
                          FROM session_addons sa
                          INNER JOIN {$this->table} s ON s.id = sa.session_id
                          WHERE sa.id = ?
                          LIMIT 1";
            $lineStmt = $this->conn->prepare($lineQuery);
            if (!$lineStmt) {
                throw new Exception('Prepare addon line fetch failed: ' . $this->conn->error);
            }
            $lineStmt->bind_param("i", $addonLineId);
            $lineStmt->execute();
            $lineRes = $lineStmt->get_result();
            $lineRow = $lineRes ? $lineRes->fetch_assoc() : null;
            if (!$lineRow) {
                throw new Exception('Addon line not found.');
            }
            if ($this->sanitizeBillingStatus($lineRow['billing_status'] ?? 'unbilled') === 'paid') {
                throw new Exception('Paid sessions cannot be modified.');
            }

            $lineTotal = $this->decorateAddonLineRow($lineRow)['line_total'];
            $sessionId = intval($lineRow['session_id']);

            $deleteStmt = $this->conn->prepare("DELETE FROM session_addons WHERE id = ?");
            if (!$deleteStmt) {
                throw new Exception('Prepare addon delete failed: ' . $this->conn->error);
            }
            $deleteStmt->bind_param("i", $addonLineId);
            if (!$deleteStmt->execute()) {
                throw new Exception('Execute addon delete failed: ' . $deleteStmt->error);
            }

            $currentSubtotal = floatval($lineRow['billing_subtotal'] ?? 0);
            if ($currentSubtotal <= 0) {
                $currentSubtotal = floatval($lineRow['total_amount'] ?? 0);
            }
            $newSubtotal = max(0, $currentSubtotal - $lineTotal);
            $discountType = ($lineRow['discount_type'] ?? 'amount') === 'percent' ? 'percent' : 'amount';
            $discountValue = floatval($lineRow['discount_value'] ?? 0);
            $discountAmount = $this->calculateDiscountAmount($newSubtotal, $discountType, $discountValue);
            $newTotal = $this->calculatePayableTotal($newSubtotal, $discountType, $discountValue);

            $updateStmt = $this->conn->prepare("UPDATE {$this->table}
                                                SET billing_subtotal = ?, discount_amount = ?, total_amount = ?
                                                WHERE id = ?");
            if (!$updateStmt) {
                throw new Exception('Prepare total update failed: ' . $this->conn->error);
            }
            $updateStmt->bind_param("dddi", $newSubtotal, $discountAmount, $newTotal, $sessionId);
            if (!$updateStmt->execute()) {
                throw new Exception('Execute total update failed: ' . $updateStmt->error);
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

    public function getAll($authData = null) {
        $where = '';
        $params = [];
        $types = '';

        $role = strtolower((string)($authData['role'] ?? ''));
        if ($role === 'attendant') {
            $where = ' WHERE (s.staff_id = ? OR s.staff_id IS NULL)';
            $params[] = intval($authData['user_id']);
            $types .= 'i';
        }

        $query = "SELECT s.*, st.name as staff_name, st.skill as staff_skill, sv.name as service_name, sv.price as service_price,
                         a.appointment_code, a.appointment_date, a.appointment_time,
                         TIMESTAMPDIFF(SECOND, s.start_time, COALESCE(s.end_time, NOW())) as elapsed_seconds
                  FROM {$this->table} s
                  LEFT JOIN staffs st ON s.staff_id = st.id
                  LEFT JOIN services sv ON s.service_id = sv.id
                  LEFT JOIN appointments a ON s.appointment_id = a.id
                  {$where}
                  ORDER BY s.created_at DESC";

        if (!empty($params)) {
            $stmt = $this->conn->prepare($query);
            if (!$stmt) {
                $this->lastError = 'getAll prepare failed: ' . $this->conn->error;
                error_log($this->lastError);
                return [];
            }
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $result = $this->conn->query($query);
            if (!$result) {
                $this->lastError = 'getAll query failed: ' . $this->conn->error;
                error_log($this->lastError);
                return [];
            }
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
        $role = strtolower((string)($authData['role'] ?? ''));
        $staffClause = '';
        $params = [$id];
        $types = 'i';

        if ($role === 'attendant') {
            $staffClause = ' AND (s.staff_id = ? OR s.staff_id IS NULL)';
            $params[] = intval($authData['user_id']);
            $types .= 'i';
        }

        $query = "SELECT s.*, st.name as staff_name, st.skill as staff_skill, sv.name as service_name, sv.price as service_price,
                         a.appointment_code, a.appointment_date, a.appointment_time,
                         TIMESTAMPDIFF(SECOND, s.start_time, COALESCE(s.end_time, NOW())) as elapsed_seconds
                  FROM {$this->table} s
                  LEFT JOIN staffs st ON s.staff_id = st.id
                  LEFT JOIN services sv ON s.service_id = sv.id
                  LEFT JOIN appointments a ON s.appointment_id = a.id
                  WHERE s.id = ?{$staffClause}";

        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;

        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

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
                        session_code, customer_name, client_phone, client_email, staff_id, service_id,
                        total_amount, billing_subtotal, billing_status, status, start_time, notes, appointment_id
                      )
                      VALUES (?, ?, ?, ?, NULLIF(?, 0), NULLIF(?, 0), ?, ?, ?, ?, NOW(), ?, NULLIF(?, 0))";
                      
            $stmt = $this->conn->prepare($query);
            if (!$stmt) throw new Exception("Prepare failed: " . $this->conn->error);

            $session_code = $this->generateSessionCode();
            $customer_name = !empty($data['customer_name']) ? $data['customer_name'] : 'Walk-in';
            $client_phone = isset($data['client_phone']) ? trim((string) $data['client_phone']) : '';
            $client_email = isset($data['client_email']) ? trim((string) $data['client_email']) : '';
            $staff_id = isset($data['staff_id']) ? intval($data['staff_id']) : 0;
            $service_id = isset($data['service_id']) ? intval($data['service_id']) : 0;
            if (!$this->entityExists('staffs', $staff_id)) {
                $staff_id = 0;
            }
            if (!$this->entityExists('services', $service_id)) {
                $service_id = 0;
            }
            $total_amount = isset($data['total_amount']) ? $this->normalizeAmount($data['total_amount']) : 0.00;
            $status = $data['status'] ?? 'In Progress';
            $billingSubtotal = $total_amount;
            $billingStatus = 'unbilled';
            $notes = $data['notes'] ?? '';
            $appointment_id = isset($data['appointment_id']) && $data['appointment_id'] !== '' ? intval($data['appointment_id']) : 0;

            $stmt->bind_param(
                "ssssiiddsssi",
                $session_code,
                $customer_name,
                $client_phone,
                $client_email,
                $staff_id,
                $service_id,
                $total_amount,
                $billingSubtotal,
                $billingStatus,
                $status,
                $notes,
                $appointment_id
            );
            
            if (!$stmt->execute()) throw new Exception("Execute failed: " . $stmt->error);
            $session_id = $stmt->insert_id;

            $lineStatus = $this->getServiceLineStatusFromSessionStatus($status);
            $lineStart = ($lineStatus === 'in_progress') ? date('Y-m-d H:i:s') : null;
            $lineEnd = ($lineStatus === 'completed' || $lineStatus === 'voided') ? date('Y-m-d H:i:s') : null;

            // Primary service line
            if ($service_id > 0) {
                $primaryPrice = 0.00;
                $priceStmt = $this->conn->prepare("SELECT price FROM services WHERE id = ? LIMIT 1");
                if ($priceStmt) {
                    $priceStmt->bind_param("i", $service_id);
                    $priceStmt->execute();
                    $priceRes = $priceStmt->get_result();
                    $priceRow = $priceRes ? $priceRes->fetch_assoc() : null;
                    $primaryPrice = $priceRow ? $this->normalizeAmount($priceRow['price']) : 0.00;
                }

                $primaryQuery = "INSERT INTO session_services (session_id, service_id, assigned_staff_id, price, status, start_time, end_time)
                                 VALUES (?, ?, NULLIF(?, 0), ?, ?, ?, ?)";
                $primaryStmt = $this->conn->prepare($primaryQuery);
                if (!$primaryStmt) throw new Exception("Primary service insert prepare failed: " . $this->conn->error);
                $primaryStmt->bind_param("iiidsss", $session_id, $service_id, $staff_id, $primaryPrice, $lineStatus, $lineStart, $lineEnd);
                if (!$primaryStmt->execute()) throw new Exception("Primary service insert failed: " . $primaryStmt->error);
            }

            // Handle additional services
            if (isset($data['additional_services']) && is_array($data['additional_services'])) {
                $svc_query = "INSERT INTO session_services (session_id, service_id, assigned_staff_id, price, status, start_time, end_time)
                              VALUES (?, ?, NULLIF(?, 0), ?, ?, ?, ?)";
                $svc_stmt = $this->conn->prepare($svc_query);
                foreach ($data['additional_services'] as $svc) {
                    $svc_id = intval($svc['service_id']);
                    if (!$this->entityExists('services', $svc_id)) {
                        continue;
                    }
                    $svc_price = isset($svc['price']) ? $this->normalizeAmount($svc['price']) : 0.00;
                    $assignedStaffId = isset($svc['assigned_staff_id']) ? intval($svc['assigned_staff_id']) : $staff_id;
                    if (!$this->entityExists('staffs', $assignedStaffId)) {
                        $assignedStaffId = $staff_id;
                    }
                    $svc_stmt->bind_param("iiidsss", $session_id, $svc_id, $assignedStaffId, $svc_price, $lineStatus, $lineStart, $lineEnd);
                    if (!$svc_stmt->execute()) throw new Exception("Additional service insert failed: " . $svc_stmt->error);
                }
            }

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
            'staff_id' => 'i',
            'service_id' => 'i',
            'total_amount' => 'd',
            'billing_subtotal' => 'd',
            'discount_value' => 'd',
            'discount_amount' => 'd',
            'status' => 's',
            'billing_status' => 's',
            'discount_type' => 's',
            'end_time' => 's',
            'payment_requested_at' => 's',
            'paid_at' => 's',
            'payment_transaction_code' => 's',
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

        // Auto-close session timestamp when marked completed (unless explicitly set).
        if (isset($data['status']) && $data['status'] === 'Completed' && !isset($data['end_time'])) {
            $updates[] = "end_time = NOW()";
        }

        $this->conn->begin_transaction();
        try {
            $query = "UPDATE {$this->table} SET " . implode(', ', $updates) . " WHERE id = ?";
            $types .= "i";
            $params[] = $id;

            $stmt = $this->conn->prepare($query);
            if (!$stmt) throw new Exception("Prepare session update failed: " . $this->conn->error);
            $stmt->bind_param($types, ...$params);
            if (!$stmt->execute()) throw new Exception("Execute session update failed: " . $stmt->error);

            if (isset($data['status'])) {
                $apptQuery = "SELECT appointment_id FROM {$this->table} WHERE id = ? LIMIT 1";
                $apptStmt = $this->conn->prepare($apptQuery);
                if ($apptStmt) {
                    $apptStmt->bind_param("i", $id);
                    $apptStmt->execute();
                    $apptRes = $apptStmt->get_result();
                    $apptRow = $apptRes ? $apptRes->fetch_assoc() : null;
                    $appointmentId = $apptRow['appointment_id'] ?? null;

                    if (!empty($appointmentId)) {
                        $sessionStatus = $data['status'];
                        $appointmentStatus = null;
                        if ($sessionStatus === 'Completed') {
                            $appointmentStatus = 'completed';
                        } elseif ($sessionStatus === 'Voided') {
                            $appointmentStatus = 'cancelled';
                        } elseif ($sessionStatus === 'In Progress' || $sessionStatus === 'Finalizing') {
                            // Keep canonical enum; frontend derives "In Session Progress" from linked session status.
                            $appointmentStatus = 'confirmed';
                        }

                        if ($appointmentStatus) {
                            $updateAppt = "UPDATE appointments SET status = ? WHERE id = ?";
                            $updateApptStmt = $this->conn->prepare($updateAppt);
                            if ($updateApptStmt) {
                                $updateApptStmt->bind_param("si", $appointmentStatus, $appointmentId);
                                if (!$updateApptStmt->execute()) {
                                    throw new Exception("Appointment status sync failed: " . $updateApptStmt->error);
                                }
                            }
                        }
                    }
                }
            }

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollback();
            error_log($e->getMessage());
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

    public function addServiceToSession($sessionId, $serviceId, $price) {
        $normalizedPrice = $this->normalizeAmount($price);
        $this->conn->begin_transaction();
        try {
            $sessionQuery = "SELECT status, staff_id, billing_status, billing_subtotal, discount_type, discount_value
                             FROM {$this->table}
                             WHERE id = ? LIMIT 1";
            $sessionStmt = $this->conn->prepare($sessionQuery);
            if (!$sessionStmt) throw new Exception("Prepare session fetch failed: " . $this->conn->error);
            $sessionStmt->bind_param("i", $sessionId);
            $sessionStmt->execute();
            $sessionRes = $sessionStmt->get_result();
            $sessionRow = $sessionRes ? $sessionRes->fetch_assoc() : null;
            if (!$sessionRow) throw new Exception("Session not found.");
            $billingStatus = $this->sanitizeBillingStatus($sessionRow['billing_status'] ?? 'unbilled');
            if ($billingStatus === 'paid') {
                throw new Exception("Paid sessions cannot be modified.");
            }

            $lineStatus = $this->getServiceLineStatusFromSessionStatus((string)$sessionRow['status']);
            $lineStart = ($lineStatus === 'in_progress') ? date('Y-m-d H:i:s') : null;
            $lineEnd = ($lineStatus === 'completed' || $lineStatus === 'voided') ? date('Y-m-d H:i:s') : null;
            $assignedStaffId = intval($sessionRow['staff_id'] ?? 0);

            $query = "INSERT INTO session_services (session_id, service_id, assigned_staff_id, price, status, start_time, end_time) VALUES (?, ?, NULLIF(?, 0), ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            if (!$stmt) throw new Exception("Prepare add service failed: " . $this->conn->error);
            $stmt->bind_param("iiidsss", $sessionId, $serviceId, $assignedStaffId, $normalizedPrice, $lineStatus, $lineStart, $lineEnd);
            if (!$stmt->execute()) throw new Exception("Execute add service failed: " . $stmt->error);

            $currentSubtotal = floatval($sessionRow['billing_subtotal'] ?? 0);
            if ($currentSubtotal <= 0) {
                $currentSubtotal = floatval($sessionRow['total_amount'] ?? 0);
            }
            $newSubtotal = $currentSubtotal + $normalizedPrice;
            $discountType = ($sessionRow['discount_type'] ?? 'amount') === 'percent' ? 'percent' : 'amount';
            $discountValue = floatval($sessionRow['discount_value'] ?? 0);
            $discountAmount = $this->calculateDiscountAmount($newSubtotal, $discountType, $discountValue);
            $newTotal = $this->calculatePayableTotal($newSubtotal, $discountType, $discountValue);

            $updateQuery = "UPDATE {$this->table}
                            SET billing_subtotal = ?, discount_amount = ?, total_amount = ?
                            WHERE id = ?";
            $updateStmt = $this->conn->prepare($updateQuery);
            if (!$updateStmt) throw new Exception("Prepare total update failed: " . $this->conn->error);
            $updateStmt->bind_param("dddi", $newSubtotal, $discountAmount, $newTotal, $sessionId);
            if (!$updateStmt->execute()) throw new Exception("Execute total update failed: " . $updateStmt->error);

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollback();
            $this->lastError = $e->getMessage();
            error_log($e->getMessage());
            return false;
        }
    }

    public function applyBillingDiscount($sessionId, $discountType, $discountValue) {
        $session = $this->getSessionBillingSnapshot($sessionId);
        if (!$session) {
            $this->lastError = 'Session not found.';
            return false;
        }
        if (($session['billing_status'] ?? 'unbilled') === 'paid') {
            $this->lastError = 'Paid sessions cannot be discounted.';
            return false;
        }

        $safeType = ($discountType === 'percent') ? 'percent' : 'amount';
        $safeValue = max(0, floatval($discountValue));
        $subtotal = floatval($session['billing_subtotal'] ?? 0);
        if ($subtotal <= 0) {
            $sumQuery = "SELECT COALESCE(SUM(price),0) AS subtotal FROM session_services WHERE session_id = ?";
            $sumStmt = $this->conn->prepare($sumQuery);
            if ($sumStmt) {
                $sumStmt->bind_param("i", $sessionId);
                $sumStmt->execute();
                $sumRes = $sumStmt->get_result();
                $sumRow = $sumRes ? $sumRes->fetch_assoc() : null;
                $subtotal = floatval($sumRow['subtotal'] ?? 0);
            }
        }

        $manualDiscountAmount = $this->calculateDiscountAmount($subtotal, $safeType, $safeValue);
        $offerDiscountAmount = $this->calculateSessionOfferDiscount($sessionId);
        $discountAmount = min($subtotal, $manualDiscountAmount + $offerDiscountAmount);
        $payable = max(0, $subtotal - $discountAmount);

        $query = $this->sessionHasOfferDiscountColumn()
            ? "UPDATE {$this->table}
               SET billing_subtotal = ?, discount_type = ?, discount_value = ?, offer_discount_amount = ?, discount_amount = ?, total_amount = ?
               WHERE id = ?"
            : "UPDATE {$this->table}
               SET billing_subtotal = ?, discount_type = ?, discount_value = ?, discount_amount = ?, total_amount = ?
               WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            $this->lastError = 'Failed to prepare billing discount update.';
            return false;
        }
        if ($this->sessionHasOfferDiscountColumn()) {
            $stmt->bind_param("dsddddi", $subtotal, $safeType, $safeValue, $offerDiscountAmount, $discountAmount, $payable, $sessionId);
        } else {
            $stmt->bind_param("dsdddi", $subtotal, $safeType, $safeValue, $discountAmount, $payable, $sessionId);
        }
        if (!$stmt->execute()) {
            $this->lastError = $stmt->error;
            return false;
        }
        $this->lastError = null;
        return true;
    }

    public function requestPayment($sessionId) {
        $session = $this->getSessionBillingSnapshot($sessionId);
        if (!$session) {
            $this->lastError = 'Session not found.';
            return false;
        }
        if (($session['billing_status'] ?? 'unbilled') === 'paid') {
            $this->lastError = 'Session is already paid.';
            return false;
        }

        $query = "UPDATE {$this->table}
                  SET billing_status = 'payment_requested',
                      payment_requested_at = NOW()
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            $this->lastError = 'Failed to prepare payment request update.';
            return false;
        }
        $stmt->bind_param("i", $sessionId);
        if (!$stmt->execute()) {
            $this->lastError = $stmt->error;
            return false;
        }
        $this->lastError = null;
        return true;
    }

    public function confirmPayment($sessionId, $transactionCode) {
        $session = $this->getSessionBillingSnapshot($sessionId);
        if (!$session) {
            $this->lastError = 'Session not found.';
            return false;
        }
        if (($session['billing_status'] ?? 'unbilled') === 'paid') {
            $this->lastError = 'Session is already paid.';
            return false;
        }

        $code = trim((string)$transactionCode);
        if ($code === '') {
            $this->lastError = 'Transaction code is required to confirm payment.';
            return false;
        }

        $query = "UPDATE {$this->table}
                  SET billing_status = 'paid',
                      paid_at = NOW(),
                      payment_transaction_code = ?
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            $this->lastError = 'Failed to prepare payment confirmation update.';
            return false;
        }
        $stmt->bind_param("si", $code, $sessionId);
        if (!$stmt->execute()) {
            $this->lastError = $stmt->error;
            return false;
        }
        $this->lastError = null;
        return true;
    }

    public function getServiceLines($sessionId) {
        $query = "SELECT ss.*, sv.name as service_name, sv.duration as service_duration_minutes,
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

    public function assignStaffToServiceLine($serviceLineId, $staffId) {
        if (!$this->entityExists('staffs', $staffId)) return false;
        $query = "UPDATE session_services SET assigned_staff_id = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("ii", $staffId, $serviceLineId);
        return $stmt->execute();
    }

    public function updateServiceLineNotes($serviceLineId, $notes) {
        $query = "UPDATE session_services SET notes = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("si", $notes, $serviceLineId);
        return $stmt->execute();
    }

    public function updateServiceLineStatus($serviceLineId, $status) {
        $allowed = ['pending', 'in_progress', 'completed', 'voided'];
        if (!in_array($status, $allowed, true)) return false;

        $sessionQuery = "SELECT ss.id, ss.status, ss.session_id, ss.assigned_staff_id, ss.service_id, ss.price,
                                s.status as session_status
                         FROM session_services ss
                         INNER JOIN sessions s ON s.id = ss.session_id
                         WHERE ss.id = ? LIMIT 1";
        $sessionStmt = $this->conn->prepare($sessionQuery);
        if (!$sessionStmt) return false;
        $sessionStmt->bind_param("i", $serviceLineId);
        $sessionStmt->execute();
        $sessionRes = $sessionStmt->get_result();
        $line = $sessionRes ? $sessionRes->fetch_assoc() : null;
        if (!$line) return false;

        $updates = ["status = ?"];
        $types = "s";
        $params = [$status];
        if ($status === 'in_progress') {
            $updates[] = "start_time = COALESCE(start_time, NOW())";
            $updates[] = "end_time = NULL";
        } elseif ($status === 'completed' || $status === 'voided') {
            $updates[] = "end_time = NOW()";
            $updates[] = "start_time = COALESCE(start_time, NOW())";
        } else {
            $updates[] = "end_time = NULL";
        }
        $types .= "i";
        $params[] = $serviceLineId;

        $query = "UPDATE session_services SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param($types, ...$params);
        if (!$stmt->execute()) return false;
        $this->recalculateSessionAmountsExcludingVoided(intval($line['session_id']));
        return [
            'session_id' => intval($line['session_id']),
            'service_line_id' => intval($line['id']),
            'assigned_staff_id' => intval($line['assigned_staff_id'] ?? 0),
            'service_id' => intval($line['service_id'] ?? 0),
            'price' => floatval($line['price'] ?? 0),
            'status' => $status
        ];
    }

    public function canCloseSession($sessionId) {
        $query = "SELECT COUNT(*) as open_count
                  FROM session_services
                  WHERE session_id = ?
                    AND status NOT IN ('completed','voided')";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("i", $sessionId);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res ? $res->fetch_assoc() : null;
        return intval($row['open_count'] ?? 0) === 0;
    }

    public function getSessionServiceProgress($sessionId) {
        $query = "SELECT
                    SUM(CASE WHEN status <> 'voided' THEN 1 ELSE 0 END) as total_services,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_services,
                    SUM(CASE WHEN status NOT IN ('completed','voided') THEN 1 ELSE 0 END) as open_services
                  FROM session_services
                  WHERE session_id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return ['total_services' => 0, 'completed_services' => 0, 'open_services' => 0];
        $stmt->bind_param("i", $sessionId);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res ? $res->fetch_assoc() : null;
        return [
            'total_services' => intval($row['total_services'] ?? 0),
            'completed_services' => intval($row['completed_services'] ?? 0),
            'open_services' => intval($row['open_services'] ?? 0),
        ];
    }

    public function getLastError() {
        return $this->lastError;
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

    public function getAppointmentBySessionId($sessionId) {
        $query = "SELECT a.id, a.appointment_code, a.customer_name, a.customer_email, a.customer_phone,
                         a.appointment_date, a.appointment_time, a.status, sv.name as service_name, st.name as staff_name
                  FROM {$this->table} s
                  INNER JOIN appointments a ON a.id = s.appointment_id
                  LEFT JOIN services sv ON a.service_id = sv.id
                  LEFT JOIN staffs st ON a.staff_id = st.id
                  WHERE s.id = ?
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param("i", $sessionId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result ? $result->fetch_assoc() : null;
    }

    public function getSessionNotificationData($sessionId) {
        $query = "SELECT s.id, s.session_code, s.customer_name, s.client_phone, s.client_email, s.total_amount,
                         s.start_time, s.end_time, s.status,
                         sv.name as service_name, st.name as staff_name, a.appointment_code,
                         a.customer_email as appointment_email, a.customer_phone as appointment_phone
                  FROM {$this->table} s
                  LEFT JOIN services sv ON s.service_id = sv.id
                  LEFT JOIN staffs st ON s.staff_id = st.id
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
                         s.session_code, s.customer_name, s.total_amount, s.start_time, s.end_time,
                         sv.name as service_name, st.name as staff_name
                  FROM session_feedback sf
                  INNER JOIN sessions s ON s.id = sf.session_id
                  LEFT JOIN services sv ON s.service_id = sv.id
                  LEFT JOIN staffs st ON s.staff_id = st.id
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
