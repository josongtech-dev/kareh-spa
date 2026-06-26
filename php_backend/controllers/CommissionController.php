<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Commission.php';
require_once __DIR__ . '/../models/CommissionRule.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/AppointmentMailer.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/ActivityLogger.php';

class CommissionController extends BaseController {
    private $commissionModel;
    private $authData;
    
    private function getRangeFilters() {
        $month = isset($_GET['month']) ? trim($_GET['month']) : null;
        $startDate = isset($_GET['start_date']) ? trim($_GET['start_date']) : null;
        $endDate = isset($_GET['end_date']) ? trim($_GET['end_date']) : null;
        return [$month, $startDate, $endDate];
    }

    public function __construct($db, $authData = null) {
        parent::__construct($db);
        $this->commissionModel = new Commission($db);
        $this->authData = $authData;
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $action = isset($_GET['action']) ? $_GET['action'] : '';

        switch ($method) {
            case 'GET':
                if ($action === 'summary') {
                    $this->getSummary();
                } else if ($action === 'aggregated') {
                    $this->getAggregated();
                } else if ($action === 'sync') {
                    $this->syncCommissions();
                } else if ($id) {
                    $this->getStaffCommissions($id);
                } else {
                    $this->getAllCommissions();
                }
                break;
            case 'POST':
                if ($action === 'update_status' && $id) {
                    $this->updateStatus($id);
                } else if ($action === 'settle_staff' && $id) {
                    $this->settleStaff($id);
                } else {
                    $this->createCommission();
                }
                break;
            default:
                Response::error('Method not allowed', 405);
                break;
        }
    }

    private function getAllCommissions() {
        $commissions = $this->commissionModel->getAll($this->authData);
        Response::json($commissions);
    }

    private function getSummary() {
        [$month, $startDate, $endDate] = $this->getRangeFilters();
        $summary = $this->commissionModel->getSummary($month, $startDate, $endDate);
        Response::json($summary);
    }

    private function getAggregated() {
        [$month, $startDate, $endDate] = $this->getRangeFilters();
        $data = $this->commissionModel->getAggregated($month, $startDate, $endDate);
        Response::json($data);
    }

    private function stripCommissionRuleLabelsFromRows(array $rows) {
        $role = AuthMiddleware::getOptionalAuthRole();
        if (AuthMiddleware::isOwnerOrManagerRole($role)) {
            return $rows;
        }
        foreach ($rows as $i => $row) {
            unset($rows[$i]['commission_rule_name'], $rows[$i]['rule_pool_pct'], $rows[$i]['rule_tax_pct']);
        }
        return $rows;
    }

    private function stripCommissionRuleNameFromRows(array $rows) {
        $role = AuthMiddleware::getOptionalAuthRole();
        if (AuthMiddleware::isOwnerOrManagerRole($role)) {
            return $rows;
        }
        foreach ($rows as $i => $row) {
            unset($rows[$i]['commission_rule_name']);
        }
        return $rows;
    }

    private function getStaffCommissions($staff_id) {
        [$month, $startDate, $endDate] = $this->getRangeFilters();
        if ((isset($_GET['action']) ? $_GET['action'] : '') === 'details') {
            $paymentStatus = isset($_GET['payment_status']) ? trim((string)$_GET['payment_status']) : null;
            $settlementBatchId = isset($_GET['settlement_batch_id']) ? intval($_GET['settlement_batch_id']) : null;
            $payoutTxn = isset($_GET['payout_transaction_id']) ? trim((string)$_GET['payout_transaction_id']) : null;
            $payoutSettledAt = isset($_GET['payout_settled_at']) ? trim((string)$_GET['payout_settled_at']) : null;
            if ($payoutTxn === '') {
                $payoutTxn = null;
            }
            if ($payoutSettledAt === '') {
                $payoutSettledAt = null;
            }
            $details = $this->commissionModel->getStaffServiceDetails(
                $staff_id,
                $month,
                $startDate,
                $endDate,
                $paymentStatus,
                $settlementBatchId,
                $payoutTxn,
                $payoutSettledAt
            );
            Response::json($this->stripCommissionRuleLabelsFromRows($details));
        }
        $commissions = $this->commissionModel->getStaffCommissions($staff_id, $month, $startDate, $endDate);
        Response::json($this->stripCommissionRuleNameFromRows($commissions));
    }

    private function createCommission() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) $data = $_POST;

        if (empty($data['staff_id']) || empty($data['amount'])) {
            Response::error('Staff ID and Amount are required', 400);
        }

        $id = $this->commissionModel->create($data);
        if ($id) {
            Response::json(['message' => 'Commission recorded', 'id' => $id], 201);
        } else {
            Response::error('Failed to record commission', 500);
        }
    }

    private function updateStatus($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        $status = $data['status'] ?? 'Paid';
        $meta = $this->validateSettlementMeta($data, $status);

        if ($this->commissionModel->updateStatus($id, $status, $meta)) {
            if ($status === 'Paid') {
                $payoutEmailData = $this->commissionModel->getPaidCommissionEmailDataById($id);
                if ($payoutEmailData) {
                    AppointmentMailer::sendCommissionPaidEmail($payoutEmailData);
                }
            }
            ActivityLogger::logFromAuthData($this->conn, 'commission', 'update_status', "Updated commission status #{$id}", $this->authData, 'commission', $id);
            Response::json(['message' => 'Commission status updated']);
        } else {
            Response::error('Failed to update status', 500);
        }
    }

    private function settleStaff($staffId) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) $data = $_POST;
        $month = isset($data['month']) ? trim((string)$data['month']) : '';
        if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
            Response::error('Valid month (YYYY-MM) is required', 400);
        }

        $meta = $this->validateSettlementMeta($data, 'Paid');
        $result = $this->commissionModel->settleStaffForMonth(intval($staffId), $month, $meta);
        if (($result['updated'] ?? 0) > 0 && !empty($result['settlement_batch_id'])) {
            $payoutEmailData = $this->commissionModel->getPaidSettlementEmailDataByBatchId(intval($result['settlement_batch_id']));
            if ($payoutEmailData) {
                AppointmentMailer::sendCommissionPaidEmail($payoutEmailData);
            }
        }
        ActivityLogger::logFromAuthData($this->conn, 'commission', 'settle', "Settled commissions for staff #{$staffId} for {$month}", $this->authData, 'commission', $staffId);
        Response::json([
            'message' => 'Staff commissions settled successfully',
            'updated' => $result['updated'] ?? 0
        ]);
    }

    private function validateSettlementMeta($data, $status) {
        if ($status !== 'Paid') return [];
        $method = trim((string)($data['payment_method'] ?? ''));
        $txn = trim((string)($data['transaction_id'] ?? ''));
        $settledAt = trim((string)($data['settled_at'] ?? ''));
        $notes = trim((string)($data['settlement_notes'] ?? ''));
        $handedOverBy = trim((string)($data['handed_over_by'] ?? ''));

        $allowedMethods = ['Bank', 'Mobile Money', 'Cash'];
        if (!in_array($method, $allowedMethods, true)) {
            Response::error('Payment method is required (Bank, Mobile Money, or Cash)', 400);
        }
        if ($settledAt === '') {
            Response::error('Settlement date and time is required', 400);
        }
        if ($notes === '') {
            Response::error('Settlement notes are required', 400);
        }
        if (($method === 'Bank' || $method === 'Mobile Money') && $txn === '') {
            Response::error('Transaction ID is required for bank or mobile money payments', 400);
        }
        if ($method === 'Cash' && $handedOverBy === '') {
            Response::error('Handed over by is required for cash settlements', 400);
        }

        return [
            'payment_method' => $method,
            'transaction_id' => $txn !== '' ? $txn : null,
            'settled_at' => $settledAt,
            'settlement_notes' => $notes,
            'handed_over_by' => $handedOverBy !== '' ? $handedOverBy : null
        ];
    }

    private function syncCommissions() {
        $result = $this->commissionModel->syncFromCompletedSessions();
        $payload = [
            'message' => 'Commission sync completed',
            'inserted' => $result['inserted'] ?? 0,
            'updated' => $result['updated'] ?? 0,
            'skipped' => $result['skipped'] ?? 0,
            'skipped_paid' => $result['skipped_paid'] ?? 0,
            'skipped_other' => $result['skipped_other'] ?? 0,
        ];
        $role = AuthMiddleware::getOptionalAuthRole();
        if (AuthMiddleware::isOwnerOrManagerRole($role)) {
            $ruleModel = new CommissionRule($this->conn);
            $default = $ruleModel->getDefault();
            $poolRate = $default ? floatval($default['commission_pool_rate'] ?? 40) : 40;
            $taxRate = $default ? floatval($default['tax_rate'] ?? 0) : 0;
            $netStaff = $default ? floatval($default['net_commission_rate'] ?? max(0, $poolRate - $taxRate)) : max(0, $poolRate - $taxRate);
            $spaRetention = $default ? floatval($default['spa_retention_rate'] ?? max(0, 100 - $poolRate)) : max(0, 100 - $poolRate);
            $payload['default_rule'] = $default;
            $payload['rule'] = [
                'commission_pool_rate' => $poolRate,
                'tax_rate' => $taxRate,
                'net_staff_rate' => $netStaff,
                'spa_retention_rate' => $spaRetention
            ];
        }
        Response::json($payload);
    }
}
