<?php

class BaseModel {
    protected $conn;
    protected $table;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table;
        $result = $this->conn->query($query);
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return null;
        }
        $safeId = intval($id);
        $stmt->bind_param("i", $safeId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result ? $result->fetch_assoc() : null;
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return false;
        }
        $safeId = intval($id);
        $stmt->bind_param("i", $safeId);
        return $stmt->execute();
    }
}
