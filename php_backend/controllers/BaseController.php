<?php

class BaseController {
    protected $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * JSON body for POST/PUT/PATCH. Falls back to $_POST when input is empty (some proxies strip PUT bodies).
     *
     * @return array<string, mixed>
     */
    protected function getPostData() {
        $raw = file_get_contents('php://input');
        $decoded = null;
        if ($raw !== false && $raw !== '') {
            $decoded = json_decode($raw, true);
        }
        if (is_array($decoded)) {
            return $decoded;
        }
        if (!empty($_POST) && is_array($_POST)) {
            return $_POST;
        }
        return [];
    }
}
