<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Reward.php';
require_once __DIR__ . '/../models/Member.php';
require_once __DIR__ . '/../utils/Response.php';

class RewardController extends BaseController {
    private $rewardModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->rewardModel = new Reward($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $action = isset($_GET['action']) ? trim($_GET['action']) : '';

        if ($id === null || $action === '') {
            $body = $this->getBody();
            if ($id === null && isset($body['id'])) $id = intval($body['id']);
            if ($action === '' && isset($body['action'])) $action = trim((string)$body['action']);
        }

        switch ($method) {
            case 'GET':
                if ($id) {
                    $reward = $this->rewardModel->getById($id);
                    if ($reward) Response::json($reward);
                    else Response::error('Reward not found', 404);
                } elseif ($action === 'member_history') {
                    $this->getMemberRedemptionHistory();
                } elseif ($action === 'all_history') {
                    $this->getAllRedemptionHistory();
                } else {
                    $rewards = $this->rewardModel->getAll();
                    Response::json($rewards);
                }
                break;
            case 'POST':
                if ($action === 'redeem') {
                    $this->redeemReward();
                } elseif ($id) {
                    $this->updateReward($id);
                } else {
                    $this->createReward();
                }
                break;
            case 'DELETE':
                if ($id) {
                    $this->deleteReward($id);
                } else {
                    Response::error('ID is required', 400);
                }
                break;
            default:
                Response::error('Method not allowed', 405);
        }
    }

    private function createReward() {
        $data = $this->getBody();
        if (empty($data['name'])) Response::error('Name is required', 400);
        $id = $this->rewardModel->create($data);
        if ($id) {
            $reward = $this->rewardModel->getById($id);
            Response::json($reward, 201);
        } else {
            Response::error('Failed to create reward', 500);
        }
    }

    private function updateReward($id) {
        $data = $this->getBody();
        if ($this->rewardModel->update($id, $data)) {
            Response::json(['message' => 'Reward updated']);
        } else {
            Response::error('Failed to update reward', 500);
        }
    }

    private function deleteReward($id) {
        if ($this->rewardModel->delete($id)) {
            Response::json(['message' => 'Reward deleted']);
        } else {
            Response::error('Failed to delete reward', 500);
        }
    }

    private function redeemReward() {
        $data = $this->getBody();
        $memberId = intval($data['member_id'] ?? 0);
        $rewardId = intval($data['reward_id'] ?? 0);
        if ($memberId <= 0 || $rewardId <= 0) {
            Response::error('member_id and reward_id are required', 400);
        }
        $result = $this->rewardModel->redeem($memberId, $rewardId);
        if (isset($result['error'])) {
            Response::error($result['error'], 400);
        }
        Response::json($result);
    }

    private function getMemberRedemptionHistory() {
        $memberId = isset($_GET['member_id']) ? intval($_GET['member_id']) : 0;
        if ($memberId <= 0) Response::error('member_id is required', 400);
        $query = "SELECT r.*, rw.name as reward_name, rw.points_required
                  FROM redemptions r
                  JOIN rewards rw ON rw.id = r.reward_id
                  WHERE r.member_id = ?
                  ORDER BY r.created_at DESC";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) Response::error('Database error', 500);
        $stmt->bind_param("i", $memberId);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
        Response::json($data);
    }

    private function getAllRedemptionHistory() {
        $query = "SELECT r.*, rw.name as reward_name, rw.points_required, u.name as member_name, u.email as member_email
                  FROM redemptions r
                  JOIN rewards rw ON rw.id = r.reward_id
                  JOIN users u ON u.id = r.member_id
                  ORDER BY r.created_at DESC
                  LIMIT 100";
        $result = $this->conn->query($query);
        $data = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
        Response::json($data);
    }
}
