<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

Security::sendCorsHeaders();
Security::sendSecurityHeaders();
Security::handlePreflight();
AuthMiddleware::requireAuth(['owner', 'manager', 'receptionist', 'attendant', 'staff', 'admin']);
RateLimiter::limitApi();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

$month = isset($_GET['month']) && preg_match('/^\d{4}-\d{2}$/', $_GET['month'])
    ? $_GET['month']
    : date('Y-m');

$runScalar = function (string $query, ?string $bindParam = null) use ($conn) {
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        error_log("Dashboard query prepare failed: " . $conn->error . " | Query: " . substr($query, 0, 150));
        return 0;
    }
    if ($bindParam !== null) {
        $stmt->bind_param("s", $bindParam);
    }
    if (!$stmt->execute()) {
        error_log("Dashboard query execute failed: " . $stmt->error . " | Query: " . substr($query, 0, 150));
        return 0;
    }
    $result = $stmt->get_result();
    if (!$result) {
        error_log("Dashboard query result failed: " . $stmt->error . " | Query: " . substr($query, 0, 150));
        return 0;
    }
    $row = $result->fetch_row();
    return $row ? $row[0] : 0;
};

$activeStaffCount = (int) $runScalar(
    "SELECT COUNT(*) FROM staffs WHERE LOWER(COALESCE(status, '')) = 'active'"
);

$activeMemberCount = (int) $runScalar(
    "SELECT COUNT(*) FROM users WHERE role = 'customer' AND LOWER(COALESCE(status, '')) = 'active'"
);

$openAppointmentsCount = (int) $runScalar(
    "SELECT COUNT(*) FROM appointments WHERE status IN ('pending', 'confirmed')"
);

$completedSessionsCount = (int) $runScalar(
    "SELECT COUNT(*) FROM sessions WHERE billing_status = 'paid'
     AND DATE_FORMAT(COALESCE(paid_at, created_at), '%Y-%m') = ?",
    $month
);

$monthlyRevenueCompleted = (float) $runScalar(
    "SELECT COALESCE(SUM(COALESCE(total_amount, 0)), 0)
     FROM sessions
     WHERE billing_status = 'paid'
       AND DATE_FORMAT(COALESCE(paid_at, created_at), '%Y-%m') = ?",
    $month
);

$activeServicesCount = (int) $runScalar(
    "SELECT COUNT(*) FROM services WHERE LOWER(COALESCE(status, '')) = 'active'"
);

$lowStockCount = (int) $runScalar(
    "SELECT COUNT(*) FROM products WHERE status = 'Low Stock'"
);

$inStockCount = (int) $runScalar(
    "SELECT COUNT(*) FROM products WHERE status = 'In Stock'"
);

$totalProducts = (int) $runScalar("SELECT COUNT(*) FROM products");
$stockLevelPct = $totalProducts > 0 ? (int) round(($inStockCount / $totalProducts) * 100) : 0;

Response::json([
    'active_staff_count' => $activeStaffCount,
    'active_member_count' => $activeMemberCount,
    'open_appointments_count' => $openAppointmentsCount,
    'completed_sessions_count' => $completedSessionsCount,
    'monthly_revenue_completed' => round($monthlyRevenueCompleted, 2),
    'active_services_count' => $activeServicesCount,
    'low_stock_count' => $lowStockCount,
    'stock_level_pct' => $stockLevelPct
]);
