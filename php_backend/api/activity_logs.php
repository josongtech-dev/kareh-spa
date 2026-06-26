<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();
$authData = AuthMiddleware::requireAuth(['owner', 'manager', 'receptionist', 'staff', 'admin']);
RateLimiter::limitApi();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

$page = max(1, intval($_GET['page'] ?? 1));
$perPage = min(100, max(10, intval($_GET['per_page'] ?? 50)));
$offset = ($page - 1) * $perPage;

$category = trim((string)($_GET['category'] ?? ''));
$search = trim((string)($_GET['search'] ?? ''));
$dateFrom = trim((string)($_GET['date_from'] ?? ''));
$dateTo = trim((string)($_GET['date_to'] ?? ''));
$actorId = isset($_GET['actor_id']) ? intval($_GET['actor_id']) : 0;

$where = [];
$params = [];
$types = '';

if ($category !== '' && $category !== 'all') {
    $where[] = 'al.category = ?';
    $params[] = $category;
    $types .= 's';
}

if ($search !== '') {
    $where[] = '(al.description LIKE ? OR al.actor_name LIKE ? OR al.action LIKE ?)';
    $like = '%' . $search . '%';
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $types .= 'sss';
}

if ($dateFrom !== '') {
    $where[] = 'al.created_at >= ?';
    $params[] = $dateFrom . ' 00:00:00';
    $types .= 's';
}

if ($dateTo !== '') {
    $where[] = 'al.created_at <= ?';
    $params[] = $dateTo . ' 23:59:59';
    $types .= 's';
}

if ($actorId > 0) {
    $where[] = 'al.actor_id = ?';
    $params[] = $actorId;
    $types .= 'i';
}

$whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

$countQuery = "SELECT COUNT(*) FROM activity_log al {$whereClause}";
$countStmt = $conn->prepare($countQuery);
if (!$countStmt) {
    Response::error('Failed to prepare count query', 500);
}
if (!empty($params)) {
    $countStmt->bind_param($types, ...$params);
}
$countStmt->execute();
$countResult = $countStmt->get_result();
$total = (int)($countResult->fetch_row()[0] ?? 0);
$countStmt->close();

$query = "SELECT al.* FROM activity_log al {$whereClause} ORDER BY al.created_at DESC LIMIT ? OFFSET ?";
$params[] = $perPage;
$params[] = $offset;
$types .= 'ii';

$stmt = $conn->prepare($query);
if (!$stmt) {
    Response::error('Failed to prepare query', 500);
}
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$logs = [];
while ($row = $result->fetch_assoc()) {
    $logs[] = $row;
}
$stmt->close();

Response::json([
    'logs' => $logs,
    'total' => $total,
    'page' => $page,
    'per_page' => $perPage,
    'total_pages' => $total > 0 ? (int)ceil($total / $perPage) : 0,
]);
