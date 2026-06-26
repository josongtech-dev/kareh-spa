<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/SystemSetting.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/ActivityLogger.php';

class SystemSettingController extends BaseController {
    private $settingModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->settingModel = new SystemSetting($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        switch ($method) {
            case 'GET':
                $this->getSettings();
                break;
            case 'PUT':
            case 'POST':
                $this->saveSettings();
                break;
            default:
                Response::error('Method not allowed', 405);
        }
    }

    private function getSettings() {
        $settings = $this->settingModel->getAllAssoc();
        Response::json($settings);
    }

    private function saveSettings() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data['settings']) || !is_array($data['settings'])) {
            Response::error('Settings payload is required', 400);
        }

        if ($this->settingModel->upsertMany($data['settings'])) {
            ActivityLogger::logFromAuthData($this->conn, 'settings', 'update', "Updated system settings", null, 'setting', null);
            Response::json(['message' => 'Settings updated successfully']);
        }

        Response::error('Failed to update settings', 500);
    }
}
