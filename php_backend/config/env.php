<?php
/**
 * Environment helpers for backend configuration.
 */

if (!function_exists('loadDotEnvFile')) {
    function loadDotEnvFile($filePath) {
        static $loadedFiles = [];
        if (isset($loadedFiles[$filePath]) || !is_file($filePath)) {
            return;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if (!$lines) {
            $loadedFiles[$filePath] = true;
            return;
        }

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '' || strpos($trimmed, '#') === 0) {
                continue;
            }

            $parts = explode('=', $trimmed, 2);
            if (count($parts) !== 2) {
                continue;
            }

            $key = trim($parts[0]);
            $value = trim($parts[1]);
            $value = trim($value, "\"'");

            if ($key === '') {
                continue;
            }

            // Later files (e.g. .env.local) should override earlier values.
            putenv("{$key}={$value}");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }

        $loadedFiles[$filePath] = true;
    }
}

$backendRoot = dirname(__DIR__);
loadDotEnvFile($backendRoot . '/.env');

// Never let local overrides replace production secrets/config.
$appEnvRaw = getenv('APP_ENV');
if ($appEnvRaw === false && isset($_ENV['APP_ENV'])) {
    $appEnvRaw = $_ENV['APP_ENV'];
}
if ($appEnvRaw === false && isset($_SERVER['APP_ENV'])) {
    $appEnvRaw = $_SERVER['APP_ENV'];
}
$appEnv = strtolower(trim((string)($appEnvRaw ?: 'production')));

$host = strtolower((string)($_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? ''));
$host = explode(':', $host)[0];
$remoteAddr = (string)($_SERVER['REMOTE_ADDR'] ?? '');
$isLocalRuntime = in_array($host, ['localhost', '127.0.0.1', '::1'], true)
    || in_array($remoteAddr, ['127.0.0.1', '::1'], true);

$cliLocalOverride = PHP_SAPI === 'cli' && is_file($backendRoot . '/.env.local');

if ($appEnv !== 'production' || $isLocalRuntime || $cliLocalOverride) {
    loadDotEnvFile($backendRoot . '/.env.local');
}

if (!function_exists('envValue')) {
    function envValue($key, $default = null) {
        $value = getenv($key);
        if ($value === false && isset($_ENV[$key])) {
            $value = $_ENV[$key];
        }
        if ($value === false && isset($_SERVER[$key])) {
            $value = $_SERVER[$key];
        }
        if ($value === false || $value === null || $value === '') {
            return $default;
        }
        return $value;
    }
}
