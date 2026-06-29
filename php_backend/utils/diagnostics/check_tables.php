<?php
$conn = new mysqli('localhost', 'root', '', 'kareh_spa');
if ($conn->connect_error) die('Connection failed');

$tables = ['payment_audit_log', 'session_addons', 'activity_log', 'commissions', 'addons', 'session_services', 'sessions'];
foreach ($tables as $t) {
    $r = $conn->query("SHOW CREATE TABLE $t");
    if ($r && $row = $r->fetch_assoc()) {
        echo "=== $t ===\n";
        echo $row['Create Table'] . "\n\n";
    } else {
        echo "=== $t === not found\n\n";
    }
}
$conn->close();
