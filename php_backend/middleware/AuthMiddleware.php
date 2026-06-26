<?php
require_once __DIR__ . '/../utils/Security.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {
    private static $db = null;

    public static function init($conn): void {
        self::$db = $conn;
    }

    public static function requireAuth($allowedRoles = []) {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if ($header === '' && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $header = $headers['Authorization'] ?? '';
        }

        if (!preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
            Response::error('Authentication required', 401);
        }

        $tokenData = Security::parseToken($matches[1] ?? '');
        if (!$tokenData || intval($tokenData['user_id'] ?? 0) <= 0) {
            Response::error('Invalid or expired token', 401);
        }

        $jti = $tokenData['jti'] ?? '';
        if ($jti !== '' && self::$db !== null && Security::isTokenRevoked(self::$db, $jti)) {
            Response::error('Token revoked. Please log in again.', 401);
        }

        $role = strtolower((string)($tokenData['role'] ?? ''));
        if (!empty($allowedRoles) && !in_array($role, $allowedRoles, true)) {
            Response::error('Forbidden', 403);
        }

        return $tokenData;
    }

    /**
     * Bearer role when a valid token is present, or null (for optional public endpoints).
     */
    public static function getOptionalAuthRole() {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if ($header === '' && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }

        if (!preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
            return null;
        }

        $tokenData = Security::parseToken($matches[1] ?? '');
        if (!$tokenData || intval($tokenData['user_id'] ?? 0) <= 0) {
            return null;
        }

        $jti = $tokenData['jti'] ?? '';
        if ($jti !== '' && self::$db !== null && Security::isTokenRevoked(self::$db, $jti)) {
            return null;
        }

        return strtolower((string)($tokenData['role'] ?? ''));
    }

    public static function isOwnerOrManagerRole($role) {
        return $role !== null && $role !== '' && in_array($role, ['owner', 'manager'], true);
    }
}
