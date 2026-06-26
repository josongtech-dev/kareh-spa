<?php
require_once __DIR__ . '/../config/db.php';

$exists = false;
$rows = 0;
$appointments = 0;
$duplicates = 0;
$appointmentsTotal = 0;
$appointmentsWithLegacyService = 0;

$appointmentsTotalResult = $conn->query("SELECT COUNT(*) AS c FROM appointments");
if ($appointmentsTotalResult) {
    $appointmentsTotal = intval($appointmentsTotalResult->fetch_assoc()['c'] ?? 0);
}

$appointmentsWithLegacyServiceResult = $conn->query("SELECT COUNT(*) AS c FROM appointments WHERE service_id IS NOT NULL");
if ($appointmentsWithLegacyServiceResult) {
    $appointmentsWithLegacyService = intval($appointmentsWithLegacyServiceResult->fetch_assoc()['c'] ?? 0);
}

$existsResult = $conn->query("SHOW TABLES LIKE 'appointment_services'");
if ($existsResult && $existsResult->num_rows > 0) {
    $exists = true;

    $rowsResult = $conn->query("SELECT COUNT(*) AS c FROM appointment_services");
    if ($rowsResult) {
        $rows = intval($rowsResult->fetch_assoc()['c'] ?? 0);
    }

    $appointmentsResult = $conn->query("SELECT COUNT(DISTINCT appointment_id) AS c FROM appointment_services");
    if ($appointmentsResult) {
        $appointments = intval($appointmentsResult->fetch_assoc()['c'] ?? 0);
    }

    $duplicateResult = $conn->query("
        SELECT COUNT(*) AS c
        FROM (
            SELECT appointment_id, service_id, COUNT(*) AS n
            FROM appointment_services
            GROUP BY appointment_id, service_id
            HAVING COUNT(*) > 1
        ) t
    ");
    if ($duplicateResult) {
        $duplicates = intval($duplicateResult->fetch_assoc()['c'] ?? 0);
    }
}

echo 'appointment_services_exists=' . ($exists ? 'yes' : 'no') . PHP_EOL;
echo 'appointment_services_rows=' . $rows . PHP_EOL;
echo 'appointments_with_service_lines=' . $appointments . PHP_EOL;
echo 'duplicate_service_pairs=' . $duplicates . PHP_EOL;
echo 'appointments_total=' . $appointmentsTotal . PHP_EOL;
echo 'appointments_with_legacy_service_id=' . $appointmentsWithLegacyService . PHP_EOL;

$conn->close();
