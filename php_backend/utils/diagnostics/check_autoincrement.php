<?php
$c = new mysqli('localhost', 'root', '', 'kareh_spa');
if ($c->connect_error) die("fail\n");

echo "=== Tables missing AUTO_INCREMENT ===\n";
$r = $c->query("SELECT t.TABLE_NAME, c.COLUMN_NAME, c.EXTRA
  FROM information_schema.TABLES t
  JOIN information_schema.COLUMNS c ON c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = t.TABLE_NAME AND c.COLUMN_KEY = 'PRI'
  WHERE t.TABLE_SCHEMA = 'kareh_spa' AND t.TABLE_TYPE = 'BASE TABLE'
  ORDER BY t.TABLE_NAME");
while ($row = $r->fetch_assoc()) {
    $ai = strpos($row['EXTRA'], 'auto_increment') !== false;
    echo sprintf("%-30s %-15s %s\n", $row['TABLE_NAME'], $row['COLUMN_NAME'], $ai ? 'OK' : 'MISSING AI');
}

echo "\n=== Triggers ===\n";
$r2 = $c->query("SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = 'kareh_spa'");
if ($r2 && $r2->num_rows > 0) {
    while ($row = $r2->fetch_assoc()) {
        echo json_encode($row) . "\n";
    }
} else {
    echo "none\n";
}
$c->close();
