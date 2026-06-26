<?php

class Response {
    /**
     * Send a JSON response
     * @param mixed $data The data to return
     * @param int $status HTTP status code (default 200)
     */
    public static function json($data, $status = 200) {
        header('Content-Type: application/json');
        http_response_code($status);
        
        $response = [
            'status' => $status >= 200 && $status < 300 ? 'success' : 'error',
            'data' => $data
        ];
        
        echo json_encode($response);
        exit();
    }

    /**
     * Send an error JSON response
     * @param string $message The error message
     * @param int $status HTTP status code (default 400)
     */
    public static function error($message, $status = 400) {
        header('Content-Type: application/json');
        http_response_code($status);
        
        echo json_encode([
            'status' => 'error',
            'message' => $message
        ]);
        exit();
    }
}
