<?php
require_once __DIR__ . '/BaseModel.php';

class SystemSetting extends BaseModel {
    protected $table = 'system_settings';

    private function castValue($rawValue, $valueType) {
        if ($valueType === 'number') {
            return is_numeric($rawValue) ? floatval($rawValue) : 0;
        }
        if ($valueType === 'boolean') {
            return in_array(strtolower((string)$rawValue), ['1', 'true', 'yes', 'on'], true);
        }
        if ($valueType === 'json') {
            $decoded = json_decode((string)$rawValue, true);
            return json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }
        return (string)$rawValue;
    }

    private function resolveValueType($value) {
        if (is_bool($value)) return 'boolean';
        if (is_int($value) || is_float($value)) return 'number';
        if (is_array($value) || is_object($value)) return 'json';
        return 'string';
    }

    private function encodeValue($value, $valueType) {
        if ($valueType === 'json') {
            return json_encode($value);
        }
        if ($valueType === 'boolean') {
            return $value ? 'true' : 'false';
        }
        return (string)$value;
    }

    public function getAllAssoc() {
        $query = "SELECT setting_key, setting_value, value_type FROM {$this->table}";
        $result = $this->conn->query($query);
        $settings = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $settings[$row['setting_key']] = $this->castValue($row['setting_value'], $row['value_type']);
            }
        }
        return $settings;
    }

    public function upsertMany($settings) {
        if (!is_array($settings)) return false;
        $query = "INSERT INTO {$this->table} (setting_key, setting_value, value_type)
                  VALUES (?, ?, ?)
                  ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), value_type = VALUES(value_type)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;

        foreach ($settings as $key => $value) {
            $valueType = $this->resolveValueType($value);
            $encoded = $this->encodeValue($value, $valueType);
            $settingKey = (string)$key;
            $stmt->bind_param("sss", $settingKey, $encoded, $valueType);
            if (!$stmt->execute()) {
                return false;
            }
        }
        return true;
    }
}
