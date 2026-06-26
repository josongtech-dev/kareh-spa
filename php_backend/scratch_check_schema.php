<?php
$conn = new mysqli('localhost', 'root', '', 'kareh_spa');
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$result = $conn->query("DESCRIBE staffs");
while ($row = $result->fetch_assoc()) {
    print_r($row);
}
$conn->close();
