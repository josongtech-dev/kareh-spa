<?php

class ActivityLogger
{
    public static function log(
        mysqli $conn,
        string $category,
        string $action,
        string $description,
        string $actorType = 'staff',
        ?int $actorId = null,
        ?string $actorName = null,
        ?string $entityType = null,
        ?int $entityId = null
    ): void {
        $ip = $_SERVER['REMOTE_ADDR'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';

        try {
            $stmt = $conn->prepare(
                "INSERT INTO activity_log (actor_type, actor_id, actor_name, category, action, description, entity_type, entity_id, ip_address)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            if (!$stmt) return;

            $stmt->bind_param(
                "sisssssis",
                $actorType,
                $actorId,
                $actorName,
                $category,
                $action,
                $description,
                $entityType,
                $entityId,
                $ip
            );
            if (!$stmt->execute()) {
                error_log('ActivityLogger::log failed: ' . $stmt->error);
            }
            $stmt->close();
        } catch (\Throwable $e) {
            error_log('ActivityLogger::log exception: ' . $e->getMessage());
        }
    }

    public static function logFromAuthData(
        mysqli $conn,
        string $category,
        string $action,
        string $description,
        ?array $authData = null,
        ?string $entityType = null,
        ?int $entityId = null
    ): void {
        $actorType = 'staff';
        $actorId = null;
        $actorName = null;

        if ($authData !== null) {
            $actorId = intval($authData['user_id'] ?? 0);
            $role = strtolower((string)($authData['role'] ?? ''));
            if ($role === 'customer') {
                $actorType = 'customer';
            }
            $actorName = $authData['name'] ?? $authData['username'] ?? null;
        }

        self::log($conn, $category, $action, $description, $actorType, $actorId, $actorName, $entityType, $entityId);
    }
}
