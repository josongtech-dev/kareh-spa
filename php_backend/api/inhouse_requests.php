<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders('GET, POST, PUT, OPTIONS');
Security::sendSecurityHeaders();
header("Content-Type: application/json");
Security::handlePreflight();

$authUser = AuthMiddleware::requireAuth(['customer', 'owner', 'manager', 'receptionist', 'attendant', 'staff', 'admin']);
RateLimiter::limitApi();
$isStaff = in_array(strtolower((string)($authUser['role'] ?? '')), ['owner', 'manager', 'receptionist', 'attendant', 'staff', 'admin'], true);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $memberId = isset($_GET['member_id']) ? intval($_GET['member_id']) : 0;
    $all = isset($_GET['all']) && $_GET['all'] === '1';

    if ($all && $isStaff) {
        $query = "SELECT r.*, s.name AS service_name, u.name AS member_name, u.email AS member_email, u.phone AS member_phone
                  FROM inhouse_service_requests r
                  JOIN services s ON s.id = r.service_id
                  JOIN users u ON u.id = r.member_id
                  ORDER BY r.created_at DESC";
        $result = $conn->query($query);
        $rows = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
        echo json_encode(["status" => "success", "data" => $rows]);
        exit;
    }

    if (!$isStaff && $memberId !== intval($authUser['user_id'] ?? 0)) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"]);
        exit;
    }

    if ($memberId <= 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "member_id is required"]);
        exit;
    }

    $query = "SELECT r.*, s.name AS service_name
              FROM inhouse_service_requests r
              JOIN services s ON s.id = r.service_id
              WHERE r.member_id = ?
              ORDER BY r.created_at DESC";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to prepare list query"]);
        exit;
    }
    $stmt->bind_param("i", $memberId);
    $stmt->execute();
    $result = $stmt->get_result();
    $rows = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    echo json_encode(["status" => "success", "data" => $rows]);
    exit;
}

if ($method === 'POST') {
    $payload = json_decode(file_get_contents("php://input"), true);
    $memberId = intval($payload['member_id'] ?? 0);
    $serviceId = intval($payload['service_id'] ?? 0);
    $preferredDate = $payload['preferred_date'] ?? null;
    $preferredTime = $payload['preferred_time'] ?? null;
    $location = trim($payload['location'] ?? '');
    $notes = trim($payload['notes'] ?? '');

    if ($memberId <= 0 || $serviceId <= 0 || $location === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "member_id, service_id and location are required"]);
        exit;
    }

    if (!$isStaff && $memberId !== intval($authUser['user_id'] ?? 0)) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"]);
        exit;
    }

    $query = "INSERT INTO inhouse_service_requests
                (member_id, service_id, preferred_date, preferred_time, location, notes, status)
              VALUES (?, ?, ?, ?, ?, ?, 'pending')";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to prepare insert query"]);
        exit;
    }
    $stmt->bind_param("iissss", $memberId, $serviceId, $preferredDate, $preferredTime, $location, $notes);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to submit in-house request"]);
        exit;
    }

    echo json_encode(["status" => "success", "message" => "Request submitted successfully", "id" => $stmt->insert_id]);
    exit;
}

if ($method === 'PUT') {
    if (!$isStaff) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden"]);
        exit;
    }

    $payload = json_decode(file_get_contents("php://input"), true);
    $id = intval($payload['id'] ?? 0);
    $status = trim($payload['status'] ?? '');

    if ($id <= 0 || !in_array($status, ['approved', 'completed', 'cancelled'], true)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Valid id and status (approved/completed/cancelled) are required"]);
        exit;
    }

    $query = "UPDATE inhouse_service_requests SET status = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to prepare update query"]);
        exit;
    }
    $stmt->bind_param("si", $status, $id);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to update request"]);
        exit;
    }

    echo json_encode(["status" => "success", "message" => "Request updated successfully"]);
    exit;
}

http_response_code(405);
echo json_encode(["status" => "error", "message" => "Method not allowed"]);
