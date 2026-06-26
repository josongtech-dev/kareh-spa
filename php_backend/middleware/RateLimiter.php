<?php

class RateLimiter {
    private static $storageDir = null;

    private static function getStorageDir(): string {
        if (self::$storageDir === null) {
            $base = sys_get_temp_dir() . '/karehspa_ratelimit';
            if (!is_dir($base)) {
                @mkdir($base, 0700, true);
            }
            self::$storageDir = $base;
        }
        return self::$storageDir;
    }

    private static function getIdentifierKey(string $namespace): string {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
        if ($forwarded !== '' && filter_var($forwarded, FILTER_VALIDATE_IP)) {
            $ip = $forwarded;
        }
        return $namespace . '_' . str_replace(':', '.', $ip);
    }

    public static function checkRateLimit(string $namespace, int $maxRequests, int $windowSeconds): bool {
        $key = self::getIdentifierKey($namespace);
        $hash = hash('sha256', $key);
        $filePath = self::getStorageDir() . '/' . $hash . '.tmp';
        $now = time();

        $records = [];
        if (is_file($filePath)) {
            $content = @file_get_contents($filePath);
            if ($content !== false) {
                $records = json_decode($content, true) ?? [];
            }
        }

        $records = array_values(array_filter($records, function ($ts) use ($now, $windowSeconds) {
            return ($now - intval($ts)) < $windowSeconds;
        }));

        if (count($records) >= $maxRequests) {
            return false;
        }

        $records[] = $now;
        @file_put_contents($filePath, json_encode($records), LOCK_EX);
        return true;
    }

    public static function limitAuth(): void {
        $allowed = self::checkRateLimit('auth', 5, 60);
        if (!$allowed) {
            http_response_code(429);
            header('Retry-After: 60');
            echo json_encode(['status' => 'error', 'message' => 'Too many attempts. Please try again in 60 seconds.']);
            exit;
        }
    }

    public static function limitPublic(): void {
        $allowed = self::checkRateLimit('public', 30, 60);
        if (!$allowed) {
            http_response_code(429);
            echo json_encode(['status' => 'error', 'message' => 'Too many requests. Please slow down.']);
            exit;
        }
    }

    public static function limitApi(): void {
        $allowed = self::checkRateLimit('api', 120, 60);
        if (!$allowed) {
            http_response_code(429);
            echo json_encode(['status' => 'error', 'message' => 'Too many requests. Please slow down.']);
            exit;
        }
    }
}