<?php
require_once __DIR__ . '/../config/env.php';

class Security {
    public static function sendSecurityHeaders() {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }

    /**
     * Origins that must always be allowed for local Vite / dev (merged with APP_ALLOWED_ORIGINS).
     * Without this, a production-only .env caused ACAO to fall back to the first prod URL and
     * browsers blocked http://localhost:5173 preflights.
     *
     * @return string[]
     */
    private static function defaultLocalDevOrigins(): array {
        return [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:4173',
            'http://127.0.0.1:4173',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost',
            'http://127.0.0.1',
        ];
    }

    /**
     * @return string[]
     */
    private static function mergeCorsAllowedOrigins(): array {
        $origins = self::defaultLocalDevOrigins();

        $origins[] = 'https://karehspa.co.ke';
        $origins[] = 'https://www.karehspa.co.ke';

        $envRaw = trim((string)envValue('APP_ALLOWED_ORIGINS', ''));
        if ($envRaw !== '') {
            $extra = array_filter(array_map('trim', explode(',', $envRaw)));
            foreach ($extra as $o) {
                if ($o !== '') $origins[] = $o;
            }
        }

        return array_values(array_unique($origins));
    }

    public static function sendCorsHeaders($allowedMethods = 'GET, POST, PUT, DELETE, OPTIONS') {
        $allowedOrigins = self::mergeCorsAllowedOrigins();
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Vary: Origin');
        } elseif ($origin === '') {
            // No Origin (e.g. curl, server-side); not a browser CORS request.
            // Do NOT set Access-Control-Allow-Origin to avoid caching issues.
        }
        // Unknown Origin: send no Access-Control-Allow-Origin (avoid wrong ACAO like a prod-only fallback).

        header("Access-Control-Allow-Methods: {$allowedMethods}");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    }

    public static function handlePreflight() {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        $remainder = strlen($data) % 4;
        if ($remainder > 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }

    private static function loadSigningSecret(): string {
        $secret = (string)envValue('APP_KEY', '');
        if ($secret === '' || $secret === 'dev-only-change-me') {
            trigger_error('APP_KEY is not set or is a default value. Generate a secure random key.', E_USER_WARNING);
            return 'dev-only-change-me';
        }
        return $secret;
    }

    public static function generateRandomKey(): string {
        return bin2hex(random_bytes(32));
    }

    public static function issueToken($userId, $role, $ttlSeconds = 86400) {
        $secret = self::loadSigningSecret();

        $now = time();
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $payload = [
            'sub' => intval($userId),
            'role' => (string)$role,
            'iat' => $now,
            'exp' => $now + max(300, intval($ttlSeconds)),
            'jti' => bin2hex(random_bytes(16))
        ];

        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        $signature = hash_hmac('sha256', "{$headerEncoded}.{$payloadEncoded}", $secret, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        return "{$headerEncoded}.{$payloadEncoded}.{$signatureEncoded}";
    }

    public static function parseToken($token) {
        $token = trim((string)$token);
        if ($token === '') {
            return null;
        }

        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        $secret = self::loadSigningSecret();

        [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;
        $expected = self::base64UrlEncode(hash_hmac('sha256', "{$headerEncoded}.{$payloadEncoded}", $secret, true));
        if (!hash_equals($expected, $signatureEncoded)) {
            return null;
        }

        $payloadJson = self::base64UrlDecode($payloadEncoded);
        $payload = json_decode($payloadJson, true);
        if (!is_array($payload)) {
            return null;
        }

        $exp = intval($payload['exp'] ?? 0);
        if ($exp > 0 && time() > $exp) {
            return null;
        }

        return [
            'user_id' => intval($payload['sub'] ?? 0),
            'role' => strtolower((string)($payload['role'] ?? '')),
            'issued_at' => intval($payload['iat'] ?? 0),
            'jti' => (string)($payload['jti'] ?? '')
        ];
    }

    public static function revokeToken(mysqli $conn, array $tokenData): bool {
        $jti = $tokenData['jti'] ?? '';
        if ($jti === '') {
            return false;
        }

        $stmt = $conn->prepare(
            "INSERT IGNORE INTO token_blacklist (token_jti, token_type, user_id, expires_at)
             VALUES (?, ?, ?, ?)"
        );
        if (!$stmt) {
            return false;
        }

        $issuedAt = intval($tokenData['issued_at'] ?? time());
        $expiresAt = $issuedAt + 86400;
        $role = $tokenData['role'] ?? 'customer';
        $userId = $tokenData['user_id'] ?? 0;
        $stmt->bind_param("ssii", $jti, $role, $userId, $expiresAt);
        $result = $stmt->execute();
        $stmt->close();

        self::cleanExpiredBlacklist($conn);
        return $result;
    }

    public static function isTokenRevoked(mysqli $conn, string $jti): bool {
        if ($jti === '') {
            return false;
        }

        $stmt = $conn->prepare("SELECT 1 FROM token_blacklist WHERE token_jti = ? AND expires_at > UNIX_TIMESTAMP() LIMIT 1");
        if (!$stmt) {
            return false;
        }

        $stmt->bind_param("s", $jti);
        $stmt->execute();
        $result = $stmt->get_result();
        $revoked = $result && $result->fetch_row();
        $stmt->close();
        return (bool)$revoked;
    }

    private static function cleanExpiredBlacklist(mysqli $conn): void {
        $conn->query("DELETE FROM token_blacklist WHERE expires_at <= UNIX_TIMESTAMP()");
    }
}
