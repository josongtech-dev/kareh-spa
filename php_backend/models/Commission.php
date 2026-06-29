<?php
require_once __DIR__ . '/BaseModel.php';
require_once __DIR__ . '/CommissionRule.php';

class Commission extends BaseModel {
    protected $table = 'commissions';
    private const COMMISSION_POOL_RATE = 0.40;
    private const TAX_RATE = 0.12;
    private const STAFF_RATE = 0.10;
    private $resolvedRates = [];

    private function normalizeMonth($month) {
        if (!$month) return null;
        $month = trim((string)$month);
        if (preg_match('/^\d{4}-\d{2}$/', $month) !== 1) {
            return null;
        }
        return $month;
    }

    /**
     * Pool % and tax % are of gross; staff net % = pool % − tax %.
     * Spa keeps (100 − pool)% of gross; commission bucket (pool %) splits into tax + staff net.
     */
    private function getRateConfigForService($serviceId, $staffId = null) {
        $serviceId = intval($serviceId);
        $key = $serviceId > 0 ? (string)$serviceId : '0';
        if ($staffId !== null) $key .= '_s' . intval($staffId);
        if (isset($this->resolvedRates[$key])) {
            return $this->resolvedRates[$key];
        }

        $ruleModel = new CommissionRule($this->conn);
        $rule = $ruleModel->getForService($serviceId);

        $poolPct = self::COMMISSION_POOL_RATE * 100;
        $taxPct = self::TAX_RATE * 100;
        if ($rule) {
            $poolPct = floatval($rule['commission_pool_rate'] ?? $poolPct);
            $taxPct = floatval($rule['tax_rate'] ?? 0);
        }
        if ($taxPct > $poolPct) {
            $taxPct = $poolPct;
        }
        $staffPct = max(0, $poolPct - $taxPct);

        // Check for per-staff commission rate override
        if ($staffId !== null) {
            $staffId = intval($staffId);
            $staffQuery = "SELECT commission_rate FROM staffs WHERE id = ? AND commission_rate IS NOT NULL LIMIT 1";
            $staffStmt = $this->conn->prepare($staffQuery);
            if ($staffStmt) {
                $staffStmt->bind_param("i", $staffId);
                $staffStmt->execute();
                $staffRes = $staffStmt->get_result();
                $staffRow = $staffRes ? $staffRes->fetch_assoc() : null;
                if ($staffRow && isset($staffRow['commission_rate']) && $staffRow['commission_rate'] !== null) {
                    $overrideRate = floatval($staffRow['commission_rate']);
                    // Override just the staff rate; keep pool and tax as-is
                    // Recalculate tax if pool is fixed
                    $staffPct = max(0, min($overrideRate, $poolPct));
                }
            }
        }

        $poolDec = max(0, $poolPct / 100);
        $taxDec = max(0, $taxPct / 100);
        $staffDec = max(0, $staffPct / 100);

        $this->resolvedRates[$key] = [
            'pool' => $poolDec,
            'tax' => $taxDec,
            'staff' => $staffDec,
            'pool_pct' => $poolPct,
            'tax_pct' => $taxPct,
            'staff_pct' => $staffPct,
        ];
        return $this->resolvedRates[$key];
    }

    private function normalizeDate($date) {
        if (!$date) return null;
        $date = trim((string)$date);
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1) {
            return null;
        }
        return $date;
    }

    /**
     * One payout/settlement action — commission lines point here so multiple paid rows per staff stay distinct.
     */
    private function insertSettlementBatch($staffId, $periodMonth, $meta) {
        $staffId = intval($staffId);
        $pm = $this->normalizeMonth($periodMonth);
        if ($pm === null) {
            $pm = null;
        }
        $method = $meta['payment_method'] ?? null;
        $txn = isset($meta['transaction_id']) && $meta['transaction_id'] !== '' ? $meta['transaction_id'] : null;
        $settledAt = $meta['settled_at'] ?? null;
        $notes = $meta['settlement_notes'] ?? null;
        $handed = isset($meta['handed_over_by']) && $meta['handed_over_by'] !== '' ? $meta['handed_over_by'] : null;

        $query = "INSERT INTO commission_settlement_batches
                  (staff_id, period_month, payment_method, transaction_id, settled_at, settlement_notes, handed_over_by)
                  VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return null;
        }
        $stmt->bind_param("issssss", $staffId, $pm, $method, $txn, $settledAt, $notes, $handed);
        if (!$stmt->execute()) {
            return null;
        }
        return intval($stmt->insert_id);
    }

    private function appendPeriodFilter(&$query, &$types, &$params, $month = null, $startDate = null, $endDate = null) {
        $month = $this->normalizeMonth($month);
        $startDate = $this->normalizeDate($startDate);
        $endDate = $this->normalizeDate($endDate);
        $dateExpr = "DATE(COALESCE(ses.paid_at, ses.created_at, c.created_at))";

        if ($month) {
            $query .= " AND DATE_FORMAT(COALESCE(ses.paid_at, ses.created_at, c.created_at), '%Y-%m') = ?";
            $types .= "s";
            $params[] = $month;
            return;
        }
        if ($startDate) {
            $query .= " AND {$dateExpr} >= ?";
            $types .= "s";
            $params[] = $startDate;
        }
        if ($endDate) {
            $query .= " AND {$dateExpr} <= ?";
            $types .= "s";
            $params[] = $endDate;
        }
    }

    public function getAll($authData = null) {
        $where = '';
        $params = [];
        $types = '';

        $role = strtolower((string)($authData['role'] ?? ''));
        if ($role === 'attendant') {
            $where = ' WHERE c.staff_id = ?';
            $params[] = intval($authData['user_id']);
            $types .= 'i';
        }

        $query = "SELECT c.*, s.name as staff_name, ses.session_code, sv.name as service_name
                  FROM {$this->table} c
                  JOIN staffs s ON c.staff_id = s.id
                  LEFT JOIN sessions ses ON c.session_id = ses.id
                  LEFT JOIN services sv ON c.service_id = sv.id
                  {$where}
                  ORDER BY c.created_at DESC";

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

    public function getStaffCommissions($staff_id, $month = null, $startDate = null, $endDate = null) {
        $query = "SELECT c.*, ses.session_code, sv.name as service_name,
                         cr.name AS commission_rule_name
                  FROM {$this->table} c
                  LEFT JOIN sessions ses ON c.session_id = ses.id
                  LEFT JOIN services sv ON c.service_id = sv.id
                  LEFT JOIN commission_rules cr ON cr.id = sv.commission_rule_id
                  WHERE c.staff_id = ?";
        $types = "i";
        $params = [$staff_id];
        $this->appendPeriodFilter($query, $types, $params, $month, $startDate, $endDate);
        $query .= " ORDER BY c.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        return $data;
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table} 
                  (staff_id, session_id, session_service_id, service_id, source_type, amount, gross_amount, commission_pool_amount, tax_amount, staff_amount, service_profit_amount, commission_rate, payment_status) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            error_log("Commission::create prepare failed: " . $this->conn->error);
            return false;
        }

        $staff_id = intval($data['staff_id']);
        $session_id = isset($data['session_id']) ? intval($data['session_id']) : null;
        $session_service_id = isset($data['session_service_id']) ? intval($data['session_service_id']) : null;
        $service_id = isset($data['service_id']) ? intval($data['service_id']) : null;
        $source_type = $data['source_type'] ?? 'primary';
        $amount = floatval($data['amount'] ?? 0);
        $gross_amount = floatval($data['gross_amount'] ?? 0);
        $pool_amount = floatval($data['commission_pool_amount'] ?? 0);
        $tax_amount = floatval($data['tax_amount'] ?? 0);
        $staff_amount = floatval($data['staff_amount'] ?? $amount);
        $service_profit_amount = floatval($data['service_profit_amount'] ?? 0);
        $rate = floatval($data['commission_rate'] ?? (self::STAFF_RATE * 100));
        $status = $data['payment_status'] ?? 'Pending';

        $stmt->bind_param(
            "iiiisddddddds",
            $staff_id,
            $session_id,
            $session_service_id,
            $service_id,
            $source_type,
            $amount,
            $gross_amount,
            $pool_amount,
            $tax_amount,
            $staff_amount,
            $service_profit_amount,
            $rate,
            $status
        );
        try {
            if ($stmt->execute()) {
                return $stmt->insert_id;
            }
            error_log("Commission::create failed: " . $stmt->error . " | data=" . json_encode($data));
        } catch (\Throwable $e) {
            error_log("Commission::create exception: " . $e->getMessage() . " | data=" . json_encode($data));
        }
        return false;
    }

    public function updateStatus($id, $status, $meta = []) {
        $id = intval($id);
        $method = $meta['payment_method'] ?? null;
        $txnId = $meta['transaction_id'] ?? null;
        $settledAt = $meta['settled_at'] ?? null;
        $notes = $meta['settlement_notes'] ?? null;
        $handedOverBy = $meta['handed_over_by'] ?? null;

        if ($status === 'Paid') {
            $row = $this->getCommissionStaffAndMonth($id);
            if (!$row) {
                return false;
            }
            $batchId = $this->insertSettlementBatch(intval($row['staff_id']), $row['period_month'], $meta);
            if (!$batchId) {
                return false;
            }
            $query = "UPDATE {$this->table}
                      SET payment_status = ?,
                          payout_date = ?,
                          payment_method = ?,
                          transaction_id = ?,
                          settled_at = ?,
                          settlement_notes = ?,
                          handed_over_by = ?,
                          settlement_batch_id = ?
                      WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            if (!$stmt) {
                return false;
            }
            $payoutDate = $settledAt;
            $stmt->bind_param("sssssssii", $status, $payoutDate, $method, $txnId, $settledAt, $notes, $handedOverBy, $batchId, $id);
            return $stmt->execute();
        }

        $query = "UPDATE {$this->table}
                  SET payment_status = ?,
                      payout_date = NULL,
                      payment_method = NULL,
                      transaction_id = NULL,
                      settled_at = NULL,
                      settlement_notes = NULL,
                      handed_over_by = NULL,
                      settlement_batch_id = NULL
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("si", $status, $id);
        return $stmt->execute();
    }

    private function getCommissionStaffAndMonth($commissionId) {
        $commissionId = intval($commissionId);
        $query = "SELECT c.staff_id,
                         DATE_FORMAT(COALESCE(ses.paid_at, ses.created_at, c.created_at), '%Y-%m') AS period_month
                  FROM {$this->table} c
                  LEFT JOIN sessions ses ON c.session_id = ses.id
                  WHERE c.id = ?
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return null;
        }
        $stmt->bind_param("i", $commissionId);
        $stmt->execute();
        $res = $stmt->get_result();
        return $res ? $res->fetch_assoc() : null;
    }

    public function getSummary($month = null, $startDate = null, $endDate = null) {
        $query = "SELECT 
                    SUM(CASE WHEN payment_status = 'Pending' THEN amount ELSE 0 END) as total_pending,
                    SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END) as total_paid,
                    SUM(IFNULL(tax_amount, 0)) as total_tax,
                    SUM(IFNULL(service_profit_amount, 0)) as total_service_profit,
                    COUNT(*) as total_records
                  FROM {$this->table} c
                  LEFT JOIN sessions ses ON c.session_id = ses.id
                  WHERE 1=1";
        $types = "";
        $params = [];
        $this->appendPeriodFilter($query, $types, $params, $month, $startDate, $endDate);
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return ['total_pending' => 0, 'total_paid' => 0, 'total_tax' => 0, 'total_service_profit' => 0, 'total_records' => 0];
        if ($types !== "") {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        return $result ? $result->fetch_assoc() : ['total_pending' => 0, 'total_paid' => 0, 'total_tax' => 0, 'total_service_profit' => 0, 'total_records' => 0];
    }

    /**
     * Pending: one row per staff (all outstanding lines). Paid: one row per settlement batch so repeat payouts
     * for the same person stay separate and each can show its own transaction reference.
     */
    public function getAggregated($month = null, $startDate = null, $endDate = null) {
        $pending = $this->getAggregatedPendingRows($month, $startDate, $endDate);
        $paidBatched = $this->getAggregatedPaidByBatch($month, $startDate, $endDate);
        $paidLegacy = $this->getAggregatedPaidLegacyUngrouped($month, $startDate, $endDate);
        $merged = array_merge($pending, $paidBatched, $paidLegacy);
        usort($merged, function ($a, $b) {
            $nameCmp = strcmp((string)($a['staff_name'] ?? ''), (string)($b['staff_name'] ?? ''));
            if ($nameCmp !== 0) {
                return $nameCmp;
            }
            $order = ['Pending' => 0, 'Paid' => 1];
            $pa = $order[$a['payment_status'] ?? ''] ?? 9;
            $pb = $order[$b['payment_status'] ?? ''] ?? 9;
            if ($pa !== $pb) {
                return $pa <=> $pb;
            }
            return floatval($b['total_earnings'] ?? 0) <=> floatval($a['total_earnings'] ?? 0);
        });
        return $merged;
    }

    private function getAggregatedPendingRows($month = null, $startDate = null, $endDate = null) {
        $query = "SELECT s.id as staff_id, s.name as staff_name, 'Pending' AS payment_status,
                         COUNT(c.id) as bookings,
                         SUM(IFNULL(c.staff_amount, IFNULL(c.amount, 0))) as total_earnings,
                         MAX(IFNULL(c.commission_rate, 0)) as current_rate,
                         SUM(IFNULL(c.staff_amount, c.amount)) as pending_earnings,
                         0 as paid_earnings,
                         NULL AS settlement_batch_id,
                         NULL AS transaction_id,
                         NULL AS settled_at,
                         NULL AS batch_payment_method
                  FROM {$this->table} c
                  INNER JOIN staffs s ON c.staff_id = s.id
                  LEFT JOIN sessions ses ON c.session_id = ses.id
                  WHERE c.payment_status = 'Pending'";
        $types = "";
        $params = [];
        $this->appendPeriodFilter($query, $types, $params, $month, $startDate, $endDate);
        $query .= " GROUP BY s.id, s.name
                  HAVING COUNT(c.id) > 0";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return [];
        }
        if ($types !== "") {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $data = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        return $data;
    }

    private function getAggregatedPaidByBatch($month = null, $startDate = null, $endDate = null) {
        $query = "SELECT s.id as staff_id, s.name as staff_name, 'Paid' AS payment_status,
                         COUNT(c.id) as bookings,
                         SUM(IFNULL(c.staff_amount, IFNULL(c.amount, 0))) as total_earnings,
                         MAX(IFNULL(c.commission_rate, 0)) as current_rate,
                         0 as pending_earnings,
                         SUM(IFNULL(c.staff_amount, c.amount)) as paid_earnings,
                         b.id AS settlement_batch_id,
                         b.transaction_id,
                         b.settled_at,
                         b.payment_method AS batch_payment_method
                  FROM {$this->table} c
                  INNER JOIN staffs s ON c.staff_id = s.id
                  INNER JOIN commission_settlement_batches b ON c.settlement_batch_id = b.id
                  LEFT JOIN sessions ses ON c.session_id = ses.id
                  WHERE c.payment_status = 'Paid'";
        $types = "";
        $params = [];
        $this->appendPeriodFilter($query, $types, $params, $month, $startDate, $endDate);
        $query .= " GROUP BY s.id, s.name, b.id, b.transaction_id, b.settled_at, b.payment_method
                  HAVING COUNT(c.id) > 0";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return [];
        }
        if ($types !== "") {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $data = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        return $data;
    }

    /**
     * Paid rows not yet linked to a batch (should be rare after migration); group by settlement fingerprint.
     */
    private function getAggregatedPaidLegacyUngrouped($month = null, $startDate = null, $endDate = null) {
        $query = "SELECT s.id as staff_id, s.name as staff_name, 'Paid' AS payment_status,
                         COUNT(c.id) as bookings,
                         SUM(IFNULL(c.staff_amount, IFNULL(c.amount, 0))) as total_earnings,
                         MAX(IFNULL(c.commission_rate, 0)) as current_rate,
                         0 as pending_earnings,
                         SUM(IFNULL(c.staff_amount, c.amount)) as paid_earnings,
                         NULL AS settlement_batch_id,
                         MAX(c.transaction_id) AS transaction_id,
                         MAX(c.settled_at) AS settled_at,
                         MAX(c.payment_method) AS batch_payment_method
                  FROM {$this->table} c
                  INNER JOIN staffs s ON c.staff_id = s.id
                  LEFT JOIN sessions ses ON c.session_id = ses.id
                  WHERE c.payment_status = 'Paid'
                    AND c.settlement_batch_id IS NULL";
        $types = "";
        $params = [];
        $this->appendPeriodFilter($query, $types, $params, $month, $startDate, $endDate);
        $query .= " GROUP BY s.id, s.name,
                         IFNULL(c.transaction_id, ''),
                         IFNULL(c.settled_at, ''),
                         IFNULL(c.payment_method, '')
                  HAVING COUNT(c.id) > 0";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return [];
        }
        if ($types !== "") {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $data = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        return $data;
    }

    /**
     * @param string|null $paymentStatus If 'Pending' or 'Paid', only return lines with that status (matches aggregated table row).
     * @param int|null $settlementBatchId When Paid, filter to one payout batch (matches one aggregated paid row).
     * @param string|null $payoutTxn When Paid with no batch id (legacy), match transaction_id.
     * @param string|null $payoutSettledAt When Paid with no batch id (legacy), match settled_at (datetime string from API).
     */
    public function getStaffServiceDetails($staffId, $month = null, $startDate = null, $endDate = null, $paymentStatus = null, $settlementBatchId = null, $payoutTxn = null, $payoutSettledAt = null) {
        $query = "SELECT
                    c.id,
                    c.session_id,
                    c.session_service_id,
                    c.service_id,
                    c.source_type,
                    c.commission_rate AS net_staff_pct,
                    c.gross_amount AS charge_amount,
                    c.tax_amount,
                    c.staff_amount,
                    c.commission_pool_amount,
                    c.service_profit_amount,
                    c.payment_status,
                    c.transaction_id,
                    c.settled_at,
                    c.settlement_batch_id,
                    ses.session_code,
                    COALESCE(ss.created_at, ses.created_at, c.created_at) AS service_date,
                    sv.name AS service_name,
                    sv.duration AS service_duration_minutes,
                    cr.name AS commission_rule_name,
                    cr.commission_pool_rate AS rule_pool_pct,
                    cr.tax_rate AS rule_tax_pct
                  FROM {$this->table} c
                  LEFT JOIN sessions ses ON c.session_id = ses.id
                  LEFT JOIN session_services ss ON c.session_service_id = ss.id
                  LEFT JOIN services sv ON c.service_id = sv.id
                  LEFT JOIN commission_rules cr ON cr.id = sv.commission_rule_id
                  WHERE c.staff_id = ?";
        $types = "i";
        $params = [$staffId];
        $this->appendPeriodFilter($query, $types, $params, $month, $startDate, $endDate);
        $ps = is_string($paymentStatus) ? trim($paymentStatus) : '';
        if ($ps !== '' && in_array($ps, ['Pending', 'Paid'], true)) {
            $query .= " AND c.payment_status = ?";
            $types .= "s";
            $params[] = $ps;
        }
        $batchId = intval($settlementBatchId);
        if ($batchId > 0 && $ps === 'Paid') {
            $query .= " AND c.settlement_batch_id = ?";
            $types .= "i";
            $params[] = $batchId;
        } elseif ($ps === 'Paid' && $batchId <= 0 && $payoutSettledAt !== null && trim((string)$payoutSettledAt) !== '') {
            $query .= " AND c.settlement_batch_id IS NULL AND c.settled_at = ?";
            $types .= "s";
            $params[] = trim((string)$payoutSettledAt);
            $txn = $payoutTxn !== null ? trim((string)$payoutTxn) : '';
            $query .= " AND IFNULL(c.transaction_id, '') = ?";
            $types .= "s";
            $params[] = $txn;
        }
        $query .= " ORDER BY service_date DESC, c.id DESC";

        $stmt = $this->conn->prepare($query);
        if (!$stmt) return [];
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        return $rows;
    }

    /**
     * One commission row per session service line (unique session_service_id).
     * - Pending: recalculates/accumulates latest amounts when price or rules change (UPDATE).
     * - Paid: row is immutable; sync will not change it (skip_paid).
     * - New completed lines always INSERT a new row (new session_service_id).
     *
     * @return 'insert'|'update'|'skip_paid'|'skip_invalid'|'error'
     */
    public function upsertFromServiceLineResult($sessionId, $sessionServiceId, $serviceId, $staffId, $gross) {
        $sessionId = intval($sessionId);
        $sessionServiceId = intval($sessionServiceId);
        $serviceId = intval($serviceId);
        $staffId = intval($staffId);
        $gross = floatval($gross);

        if ($sessionId <= 0 || $sessionServiceId <= 0 || $serviceId <= 0 || $staffId <= 0 || $gross <= 0) {
            error_log("upsertFromServiceLineResult: skip_invalid sessionId={$sessionId} ssId={$sessionServiceId} svcId={$serviceId} staffId={$staffId} gross={$gross}");
            return 'skip_invalid';
        }

        $existingQuery = "SELECT id, payment_status FROM {$this->table} WHERE session_service_id = ? LIMIT 1";
        $existingStmt = $this->conn->prepare($existingQuery);
        if (!$existingStmt) {
            error_log("upsertFromServiceLineResult: existing check prepare failed: " . $this->conn->error);
            return 'error';
        }
        $existingStmt->bind_param("i", $sessionServiceId);
        $existingStmt->execute();
        $existingRes = $existingStmt->get_result();
        $existing = $existingRes ? $existingRes->fetch_assoc() : null;

        $rateCfg = $this->getRateConfigForService($serviceId, $staffId);
        $pool = round($gross * $rateCfg['pool'], 2);
        $tax = round($gross * $rateCfg['tax'], 2);
        $staff = round($gross * $rateCfg['staff'], 2);
        $serviceProfit = round($gross - $pool, 2);
        $ratePct = $rateCfg['staff_pct'];

        if ($existing) {
            $existingStatus = strtolower(trim((string)($existing['payment_status'] ?? '')));
            if ($existingStatus !== 'pending') {
                return 'skip_paid';
            }
            // Only pending rows are updated (amounts track latest gross/rules until payout).
            $updateQuery = "UPDATE {$this->table}
                            SET staff_id = ?,
                                session_id = ?,
                                service_id = ?,
                                source_type = 'primary',
                                amount = ?,
                                gross_amount = ?,
                                commission_pool_amount = ?,
                                tax_amount = ?,
                                staff_amount = ?,
                                service_profit_amount = ?,
                                commission_rate = ?
                            WHERE id = ?
                              AND payment_status = 'Pending'";
            $updateStmt = $this->conn->prepare($updateQuery);
            if (!$updateStmt) {
                return 'error';
            }
            $updateStmt->bind_param(
                "iiidddddddi",
                $staffId,
                $sessionId,
                $serviceId,
                $staff,
                $gross,
                $pool,
                $tax,
                $staff,
                $serviceProfit,
                $ratePct,
                $existing['id']
            );
            if (!$updateStmt->execute()) {
                return 'error';
            }
            if ($updateStmt->affected_rows > 0) {
                return 'update';
            }
            // MySQL reports 0 rows when values are unchanged; confirm row is still pending vs race to Paid.
            $chkStmt = $this->conn->prepare("SELECT payment_status FROM {$this->table} WHERE id = ? LIMIT 1");
            if (!$chkStmt) {
                return 'error';
            }
            $cid = (int)$existing['id'];
            $chkStmt->bind_param("i", $cid);
            $chkStmt->execute();
            $chkRes = $chkStmt->get_result();
            $chkRow = $chkRes ? $chkRes->fetch_assoc() : null;
            if ($chkRow && strtolower(trim((string)($chkRow['payment_status'] ?? ''))) === 'pending') {
                return 'update';
            }
            return 'skip_paid';
        }

        $newId = $this->create([
            'staff_id' => $staffId,
            'session_id' => $sessionId,
            'session_service_id' => $sessionServiceId,
            'service_id' => $serviceId,
            'source_type' => 'primary',
            'amount' => $staff,
            'gross_amount' => $gross,
            'commission_pool_amount' => $pool,
            'tax_amount' => $tax,
            'staff_amount' => $staff,
            'service_profit_amount' => $serviceProfit,
            'commission_rate' => $ratePct,
            'payment_status' => 'Pending'
        ]);
        return $newId ? 'insert' : 'error';
    }

    /**
     * @return bool True if a pending row was inserted or updated; false if skipped (e.g. already paid) or error.
     */
    public function upsertFromServiceLine($sessionId, $sessionServiceId, $serviceId, $staffId, $gross) {
        $r = $this->upsertFromServiceLineResult($sessionId, $sessionServiceId, $serviceId, $staffId, $gross);
        return $r === 'insert' || $r === 'update';
    }

    public function syncFromCompletedSessions() {
        $query = "SELECT s.id as session_id, ss.id as session_service_id, ss.assigned_staff_id as staff_id,
                         ss.service_id, ss.price
                  FROM sessions s
                  INNER JOIN session_services ss ON ss.session_id = s.id
                  WHERE s.billing_status = 'paid'
                    AND ss.assigned_staff_id IS NOT NULL
                    AND ss.price > 0";
        $result = $this->conn->query($query);
        if (!$result) {
            return ['inserted' => 0, 'updated' => 0, 'skipped_paid' => 0, 'skipped_other' => 0, 'error' => true];
        }

        $inserted = 0;
        $updated = 0;
        $skippedPaid = 0;
        $skippedOther = 0;

        while ($line = $result->fetch_assoc()) {
            $action = $this->upsertFromServiceLineResult(
                intval($line['session_id']),
                intval($line['session_service_id']),
                intval($line['service_id']),
                intval($line['staff_id']),
                floatval($line['price'])
            );
            switch ($action) {
                case 'insert':
                    $inserted++;
                    break;
                case 'update':
                    $updated++;
                    break;
                case 'skip_paid':
                    $skippedPaid++;
                    break;
                default:
                    $skippedOther++;
                    break;
            }
        }

        return [
            'inserted' => $inserted,
            'updated' => $updated,
            'skipped_paid' => $skippedPaid,
            'skipped_other' => $skippedOther,
            'skipped' => $skippedPaid + $skippedOther,
        ];
    }

    private function commissionExists($sessionId, $staffId, $serviceId, $sourceType) {
        $query = "SELECT id FROM {$this->table} WHERE session_id = ? AND staff_id = ? AND service_id = ? AND source_type = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("iiis", $sessionId, $staffId, $serviceId, $sourceType);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result && $result->num_rows > 0;
    }

    private function getExistingCommission($sessionId, $staffId, $serviceId, $sourceType) {
        $query = "SELECT id, payment_status FROM {$this->table}
                  WHERE session_id = ? AND staff_id = ? AND service_id = ? AND source_type = ?
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param("iiis", $sessionId, $staffId, $serviceId, $sourceType);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result ? $result->fetch_assoc() : null;
    }

    private function updateCommissionAmounts($id, $gross, $pool, $tax, $staff, $serviceProfit, $ratePct) {
        $query = "UPDATE {$this->table}
                  SET amount = ?,
                      gross_amount = ?,
                      commission_pool_amount = ?,
                      tax_amount = ?,
                      staff_amount = ?,
                      service_profit_amount = ?,
                      commission_rate = ?
                  WHERE id = ? AND payment_status = 'Pending'";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $amount = $staff;
        $stmt->bind_param("dddddddi", $amount, $gross, $pool, $tax, $staff, $serviceProfit, $ratePct, $id);
        return $stmt->execute();
    }

    public function settleStaffForMonth($staffId, $month, $meta) {
        $month = $this->normalizeMonth($month);
        if (!$month) {
            return ['updated' => 0];
        }

        $this->conn->begin_transaction();
        try {
            $batchId = $this->insertSettlementBatch(intval($staffId), $month, $meta);
            if (!$batchId) {
                $this->conn->rollback();
                return ['updated' => 0];
            }

            $query = "UPDATE {$this->table} c
                      LEFT JOIN sessions ses ON c.session_id = ses.id
                      SET c.payment_status = 'Paid',
                          c.payout_date = ?,
                          c.payment_method = ?,
                          c.transaction_id = ?,
                          c.settled_at = ?,
                          c.settlement_notes = ?,
                          c.handed_over_by = ?,
                          c.settlement_batch_id = ?
                      WHERE c.staff_id = ?
                        AND c.payment_status = 'Pending'
                        AND DATE_FORMAT(COALESCE(ses.paid_at, ses.created_at, c.created_at), '%Y-%m') = ?";
            $stmt = $this->conn->prepare($query);
            if (!$stmt) {
                $this->conn->rollback();
                return ['updated' => 0];
            }

            $settledAt = $meta['settled_at'];
            $method = $meta['payment_method'];
            $txn = $meta['transaction_id'] ?? null;
            $notes = $meta['settlement_notes'] ?? null;
            $handed = $meta['handed_over_by'] ?? null;
            $sid = intval($staffId);
            $stmt->bind_param("ssssssiis", $settledAt, $method, $txn, $settledAt, $notes, $handed, $batchId, $sid, $month);
            if (!$stmt->execute()) {
                $this->conn->rollback();
                return ['updated' => 0];
            }
            $updated = $stmt->affected_rows;
            $this->conn->commit();
            return ['updated' => $updated, 'settlement_batch_id' => $batchId];
        } catch (Exception $e) {
            $this->conn->rollback();
            return ['updated' => 0];
        }
    }

    public function getPaidCommissionEmailDataById($commissionId) {
        $query = "SELECT c.id, c.staff_id, c.staff_amount, c.transaction_id, c.payment_method, c.settled_at,
                         DATE_FORMAT(COALESCE(ses.paid_at, ses.created_at, c.created_at), '%Y-%m') AS payout_month,
                         st.name AS staff_name, st.email AS staff_email,
                         sv.name AS service_name,
                         COALESCE(ses.paid_at, ses.created_at, c.created_at) AS service_date
                  FROM {$this->table} c
                  JOIN staffs st ON c.staff_id = st.id
                  LEFT JOIN sessions ses ON c.session_id = ses.id
                  LEFT JOIN services sv ON c.service_id = sv.id
                  WHERE c.id = ? AND c.payment_status = 'Paid'
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param("i", $commissionId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        if (!$row) return null;

        return [
            'staff_name' => $row['staff_name'] ?? '',
            'staff_email' => $row['staff_email'] ?? '',
            'month' => $row['payout_month'] ?? '',
            'transaction_id' => $row['transaction_id'] ?? '',
            'payment_method' => $row['payment_method'] ?? '',
            'settled_at' => $row['settled_at'] ?? '',
            'total_amount' => (float)($row['staff_amount'] ?? 0),
            'services' => [[
                'service_name' => $row['service_name'] ?? 'Service',
                'staff_amount' => (float)($row['staff_amount'] ?? 0),
                'service_date' => $row['service_date'] ?? ''
            ]]
        ];
    }

    public function getPaidSettlementEmailDataForStaffMonth($staffId, $month, $settledAt, $transactionId = null) {
        $month = $this->normalizeMonth($month);
        if (!$month) return null;

        $query = "SELECT c.staff_amount, c.transaction_id, c.payment_method, c.settled_at,
                         st.name AS staff_name, st.email AS staff_email,
                         sv.name AS service_name,
                         COALESCE(ses.paid_at, ses.created_at, c.created_at) AS service_date
                  FROM {$this->table} c
                  JOIN staffs st ON c.staff_id = st.id
                  LEFT JOIN sessions ses ON c.session_id = ses.id
                  LEFT JOIN services sv ON c.service_id = sv.id
                  WHERE c.staff_id = ?
                    AND c.payment_status = 'Paid'
                    AND DATE_FORMAT(COALESCE(ses.paid_at, ses.created_at, c.created_at), '%Y-%m') = ?
                    AND c.settled_at = ?";
        if (!empty($transactionId)) {
            $query .= " AND c.transaction_id = ?";
        }
        $query .= " ORDER BY service_date DESC, c.id DESC";

        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        if (!empty($transactionId)) {
            $stmt->bind_param("isss", $staffId, $month, $settledAt, $transactionId);
        } else {
            $stmt->bind_param("iss", $staffId, $month, $settledAt);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        if (!$result) return null;

        $rows = [];
        $total = 0.0;
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
            $total += (float)($row['staff_amount'] ?? 0);
        }
        if (count($rows) === 0) return null;

        $first = $rows[0];
        $services = [];
        foreach ($rows as $row) {
            $services[] = [
                'service_name' => $row['service_name'] ?? 'Service',
                'staff_amount' => (float)($row['staff_amount'] ?? 0),
                'service_date' => $row['service_date'] ?? ''
            ];
        }

        return [
            'staff_name' => $first['staff_name'] ?? '',
            'staff_email' => $first['staff_email'] ?? '',
            'month' => $month,
            'transaction_id' => $first['transaction_id'] ?? '',
            'payment_method' => $first['payment_method'] ?? '',
            'settled_at' => $first['settled_at'] ?? $settledAt,
            'total_amount' => $total,
            'services' => $services
        ];
    }

    /**
     * Email payload for exactly one payout batch (one settlement action).
     */
    public function getPaidSettlementEmailDataByBatchId($batchId) {
        $batchId = intval($batchId);
        if ($batchId <= 0) {
            return null;
        }

        $query = "SELECT c.staff_amount,
                         b.transaction_id,
                         b.payment_method,
                         b.settled_at,
                         b.period_month,
                         st.name AS staff_name, st.email AS staff_email,
                         sv.name AS service_name,
                         COALESCE(ses.paid_at, ses.created_at, c.created_at) AS service_date
                  FROM {$this->table} c
                  INNER JOIN commission_settlement_batches b ON c.settlement_batch_id = b.id
                  JOIN staffs st ON c.staff_id = st.id
                  LEFT JOIN sessions ses ON c.session_id = ses.id
                  LEFT JOIN services sv ON c.service_id = sv.id
                  WHERE c.settlement_batch_id = ? AND c.payment_status = 'Paid'
                  ORDER BY service_date DESC, c.id DESC";

        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return null;
        }
        $stmt->bind_param("i", $batchId);
        $stmt->execute();
        $result = $stmt->get_result();
        if (!$result) {
            return null;
        }

        $rows = [];
        $total = 0.0;
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
            $total += (float)($row['staff_amount'] ?? 0);
        }
        if (count($rows) === 0) {
            return null;
        }

        $first = $rows[0];
        $month = $this->normalizeMonth($first['period_month'] ?? '');
        if (!$month) {
            $month = '';
        }
        $services = [];
        foreach ($rows as $row) {
            $services[] = [
                'service_name' => $row['service_name'] ?? 'Service',
                'staff_amount' => (float)($row['staff_amount'] ?? 0),
                'service_date' => $row['service_date'] ?? ''
            ];
        }

        return [
            'staff_name' => $first['staff_name'] ?? '',
            'staff_email' => $first['staff_email'] ?? '',
            'month' => $month,
            'transaction_id' => $first['transaction_id'] ?? '',
            'payment_method' => $first['payment_method'] ?? '',
            'settled_at' => $first['settled_at'] ?? '',
            'total_amount' => $total,
            'services' => $services
        ];
    }
}
