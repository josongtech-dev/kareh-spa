<?php

class BaseController {
    protected $conn;
    private $postDataCache = null;

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
        if ($raw !== false && $raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return $decoded;
            }
            // Parse as URL-encoded (some LiteSpeed/Hostinger configs convert JSON)
            $parsed = [];
            parse_str($raw, $parsed);
            if (!empty($parsed)) {
                return $parsed;
            }
        }
        if (!empty($_POST) && is_array($_POST)) {
            return $_POST;
        }
        return [];
    }

    /** Read body once and cache it (php://input can only be read once per request). */
    protected function getBody(): array {
        if ($this->postDataCache === null) {
            $this->postDataCache = $this->getPostData();
        }
        return $this->postDataCache;
    }

    /**
     * Get a parameter from body (preferred), then $_GET, then $_POST.
     * Provides fallback for environments where php://input may be unreliable.
     */
    protected function getParam(string $key, $default = null) {
        $data = $this->getBody();
        if (isset($data[$key])) {
            return $data[$key];
        }
        if (isset($_GET[$key])) {
            return $_GET[$key];
        }
        if (isset($_POST[$key])) {
            return $_POST[$key];
        }
        return $default;
    }
}
