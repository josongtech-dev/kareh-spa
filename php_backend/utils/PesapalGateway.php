<?php

class PesapalGateway {
    private $consumerKey;
    private $consumerSecret;
    private $environment;
    private $baseUrl;
    private static $caInfo;

    public function __construct() {
        $this->consumerKey = envValue('PESAPAL_CONSUMER_KEY', '');
        $this->consumerSecret = envValue('PESAPAL_CONSUMER_SECRET', '');
        $this->environment = envValue('PESAPAL_ENV', 'live');

        if ($this->consumerKey === '' || $this->consumerSecret === '') {
            throw new RuntimeException('Pesapal consumer key and secret must be configured in .env');
        }

        $this->baseUrl = $this->environment === 'live'
            ? 'https://pay.pesapal.com/v3'
            : 'https://cybqa.pesapal.com/pesapalv3';

        if (self::$caInfo === null) {
            $caPath = PHP_OS_FAMILY === 'Windows' ? 'C:/xampp/php/ext/cacert.pem' : '/etc/ssl/certs/ca-certificates.crt';
            if (!file_exists($caPath)) {
                $caPath = PHP_OS_FAMILY === 'Windows' ? 'C:/php/extras/ssl/cacert.pem' : '';
            }
            if ($caPath === '' || !file_exists($caPath)) {
                $caPath = ini_get('curl.cainfo') ?: '';
            }
            if ($caPath === '' || !file_exists($caPath)) {
                $caPath = null;
            }
            self::$caInfo = $caPath;
        }
    }

    public function getBaseUrl(): string {
        return $this->baseUrl;
    }

    public function getAccessToken(): ?object {
        $headers = [
            'Accept: application/json',
            'Content-Type: application/json',
        ];

        $postData = json_encode([
            'consumer_key' => $this->consumerKey,
            'consumer_secret' => $this->consumerSecret,
        ]);

        $response = $this->curlPost($this->baseUrl . '/api/Auth/RequestToken', $headers, $postData);
        if (!$response || isset($response->error)) {
            $errMsg = isset($response->error) ? (is_string($response->error) ? $response->error : json_encode($response->error)) : 'no response';
            error_log('Pesapal Auth Error: ' . $errMsg);
            return null;
        }
        return $response;
    }

    public function registerIPN(string $accessToken, string $ipnUrl, string $ipnType = 'GET'): ?object {
        $headers = [
            'Accept: application/json',
            'Content-Type: application/json',
            'Authorization: Bearer ' . $accessToken,
        ];

        $postData = json_encode([
            'url' => $ipnUrl,
            'ipn_notification_type' => $ipnType,
        ]);

        $response = $this->curlPost($this->baseUrl . '/api/URLSetup/RegisterIPN', $headers, $postData);
        if (!$response || isset($response->error)) {
            $errMsg = isset($response->error) ? (is_string($response->error) ? $response->error : json_encode($response->error)) : 'no response';
            error_log('Pesapal RegisterIPN Error: ' . $errMsg);
            return null;
        }
        return $response;
    }

    public function getRegisteredIPNs(string $accessToken): ?array {
        $headers = [
            'Accept: application/json',
            'Content-Type: application/json',
            'Authorization: Bearer ' . $accessToken,
        ];

        $response = $this->curlGet($this->baseUrl . '/api/URLSetup/GetIpnList', $headers);
        if (!$response) {
            error_log('Pesapal GetIpnList Error');
            return null;
        }
        return is_array($response) ? $response : [$response];
    }

    public function submitOrderRequest(string $accessToken, array $orderData): ?object {
        $headers = [
            'Accept: application/json',
            'Content-Type: application/json',
            'Authorization: Bearer ' . $accessToken,
        ];

        $postData = json_encode($orderData);
        $response = $this->curlPost($this->baseUrl . '/api/Transactions/SubmitOrderRequest', $headers, $postData);
        if (!$response || isset($response->error)) {
            $errMsg = isset($response->error) ? (is_string($response->error) ? $response->error : json_encode($response->error)) : 'no response';
            error_log('Pesapal SubmitOrder Error: ' . $errMsg);
            return null;
        }
        return $response;
    }

    public function getTransactionStatus(string $accessToken, string $orderTrackingId): ?object {
        $headers = [
            'Accept: application/json',
            'Content-Type: application/json',
            'Authorization: Bearer ' . $accessToken,
        ];

        $url = $this->baseUrl . '/api/Transactions/GetTransactionStatus?orderTrackingId=' . urlencode($orderTrackingId);
        $response = $this->curlGet($url, $headers);
        if (!$response || isset($response->error)) {
            $errMsg = isset($response->error) ? (is_string($response->error) ? $response->error : json_encode($response->error)) : 'no response';
            error_log('Pesapal GetTransactionStatus Error: ' . $errMsg);
            return null;
        }
        return $response;
    }

    public function getOrderStatusFromCallback(array $queryParams): ?object {
        $orderTrackingId = $queryParams['OrderTrackingId'] ?? '';
        $merchantReference = $queryParams['OrderMerchantReference'] ?? '';
        $notificationType = $queryParams['OrderNotificationType'] ?? '';

        if ($orderTrackingId === '') return null;

        $token = $this->getAccessToken();
        if (!$token || empty($token->token)) return null;

        return $this->getTransactionStatus($token->token, $orderTrackingId);
    }

    private function curlPost(string $url, array $headers, string $postData) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 1);
        if (self::$caInfo !== null) {
            curl_setopt($ch, CURLOPT_CAINFO, self::$caInfo);
        }
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError !== '') {
            error_log('Pesapal cURL POST Error: ' . $curlError);
            return null;
        }

        $decoded = json_decode($response);
        return $decoded ?: null;
    }

    private function curlGet(string $url, array $headers) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 1);
        if (self::$caInfo !== null) {
            curl_setopt($ch, CURLOPT_CAINFO, self::$caInfo);
        }
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError !== '') {
            error_log('Pesapal cURL GET Error: ' . $curlError);
            return null;
        }

        $decoded = json_decode($response);
        return $decoded ?: null;
    }
}
