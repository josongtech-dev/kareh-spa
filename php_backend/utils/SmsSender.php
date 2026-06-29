<?php
require_once __DIR__ . '/../config/env.php';

class SmsSender {
    private static function getApiKey() {
        return trim((string) envValue('SMS_API_KEY', ''));
    }

    private static function getUsername() {
        return trim((string) envValue('SMS_USERNAME', ''));
    }

    private static function getPassword() {
        return trim((string) envValue('SMS_PASSWORD', ''));
    }

    private static function getSenderId() {
        return trim((string) envValue('SMS_SENDER_ID', 'KAREHS'));
    }

    private static function getAdminPhone() {
        return trim((string) envValue('SMS_ADMIN_PHONE', ''));
    }

    private static function normalizePhone($phone) {
        $phone = preg_replace('/[^0-9]/', '', trim((string) $phone));
        if (strlen($phone) === 0) return null;
        if (substr($phone, 0, 3) === '254' && strlen($phone) >= 12) {
            return $phone;
        }
        if (substr($phone, 0, 1) === '0' && strlen($phone) >= 10) {
            $phone = '254' . substr($phone, 1);
            return strlen($phone) >= 12 ? $phone : null;
        }
        if (strlen($phone) >= 9 && substr($phone, 0, 1) !== '0') {
            $phone = '254' . $phone;
            return strlen($phone) >= 12 ? $phone : null;
        }
        return null;
    }

    private static function message($text) {
        return "KAREHS SPA & BARBERSHOP - {$text}";
    }

    private static function send($phone, $message) {
        $phone = self::normalizePhone($phone);
        if (!$phone) {
            error_log("SmsSender: invalid phone number");
            return false;
        }

        $username = self::getUsername();
        $password = self::getPassword();
        $apiKey = self::getApiKey();

        if ($username === '' || $password === '') {
            error_log("SmsSender: SMS_USERNAME or SMS_PASSWORD not configured");
            return false;
        }

        $senderId = self::getSenderId();
        $msg = self::message($message);

        $postData = [
            'userid' => $username,
            'password' => $password,
            'sendMethod' => 'quick',
            'mobile' => $phone,
            'msg' => $msg,
            'senderid' => $senderId,
            'msgType' => 'text',
            'output' => 'json',
            'duplicatecheck' => 'true',
        ];

        $headers = [
            'cache-control: no-cache',
            'content-type: application/x-www-form-urlencoded',
        ];

        if ($apiKey !== '') {
            $headers[] = "apikey: {$apiKey}";
        }

        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => 'https://smsportal.hostpinnacle.co.ke/SMSApi/send',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => http_build_query($postData),
            CURLOPT_HTTPHEADER => $headers,
        ]);

        $response = curl_exec($curl);
        $err = curl_error($curl);
        curl_close($curl);

        if ($err) {
            error_log("SmsSender cURL error: {$err}");
            return false;
        }

        $decoded = json_decode($response, true);
        $status = $decoded['status'] ?? '';
        $reason = $decoded['reason'] ?? '';

        if ($status !== 'success') {
            error_log("SmsSender API error: {$reason} — response: {$response}");
            return false;
        }

        return true;
    }

    public static function sendBookingReceived($appointment) {
        $phone = $appointment['customer_phone'] ?? '';
        if ($phone === '') {
            error_log("SmsSender::sendBookingReceived: customer_phone is empty for appointment #" . ($appointment['id'] ?? '?'));
            return false;
        }

        $name = $appointment['customer_name'] ?? 'Valued Client';
        $service = $appointment['service_name'] ?? 'selected service';
        $date = self::formatDate($appointment['appointment_date'] ?? '');
        $time = self::formatTime($appointment['appointment_time'] ?? '');
        $code = $appointment['appointment_code'] ?? '';

        $msg = "Hi {$name}, we have received your booking for {$service} on {$date} at {$time}. Booking code: {$code}. We'll confirm shortly. Thank you for choosing Kareh's Spa & Barbershop.";

        return self::send($phone, $msg);
    }

    public static function sendBookingConfirmed($appointment) {
        $phone = $appointment['customer_phone'] ?? '';
        if ($phone === '') {
            error_log("SmsSender::sendBookingConfirmed: customer_phone is empty for appointment #" . ($appointment['id'] ?? '?'));
            return false;
        }

        $name = $appointment['customer_name'] ?? 'Valued Client';
        $service = $appointment['service_name'] ?? 'your service';
        $date = self::formatDate($appointment['appointment_date'] ?? '');
        $time = self::formatTime($appointment['appointment_time'] ?? '');
        $staff = $appointment['staff_name'] ?? 'our team';

        $msg = "Hi {$name}, your appointment for {$service} on {$date} at {$time} with {$staff} is CONFIRMED. Thank you for choosing Kareh's Spa & Barbershop.";

        return self::send($phone, $msg);
    }

    public static function sendPaymentReceipt($session) {
        $phone = $session['client_phone'] ?? '';
        if ($phone === '') {
            error_log("SmsSender::sendPaymentReceipt: client_phone is empty for session #" . ($session['id'] ?? '?') . " code: " . ($session['session_code'] ?? '?'));
            return false;
        }

        $name = $session['customer_name'] ?? 'Valued Client';
        $amount = number_format((float)($session['total_amount'] ?? 0), 2);
        $code = $session['session_code'] ?? '';

        $lines = ["Payment received, thank you."];
        $lines[] = "RECEIPT {$code}";

        $services = is_array($session['service_lines'] ?? null) ? $session['service_lines'] : [];
        foreach ($services as $s) {
            $svcName = $s['service_name'] ?? 'Service';
            $svcPrice = number_format((float)($s['price'] ?? 0), 2);
            $lines[] = "{$svcName} KES {$svcPrice}";
        }

        $addons = is_array($session['addon_lines'] ?? null) ? $session['addon_lines'] : [];
        foreach ($addons as $a) {
            $addonName = $a['addon_name'] ?? 'Addon';
            $qty = intval($a['quantity'] ?? 1);
            $lineTotal = number_format((float)($a['line_total'] ?? 0), 2);
            $lines[] = "{$addonName} x{$qty} KES {$lineTotal}";
        }

        $lines[] = "Total KES {$amount}";
        $lines[] = "Thank you for choosing Kareh's Spa & Barbershop.";

        $msg = implode("\n", $lines);

        return self::send($phone, $msg);
    }

    public static function sendMemberWelcome($member) {
        $phone = $member['phone'] ?? '';
        if ($phone === '') return false;

        $name = $member['name'] ?? 'Valued Member';
        $tier = $member['loyalty_tier'] ?? 'Bronze';
        $points = $member['loyalty_points'] ?? '0';

        $msg = "Welcome {$name}! Your membership is active. Tier: {$tier}. Points: {$points}. Thank you for choosing Kareh's Spa & Barbershop.";

        return self::send($phone, $msg);
    }

    public static function sendCommissionPaid($payout) {
        $phone = $payout['staff_phone'] ?? '';
        if ($phone === '') return false;

        $name = $payout['staff_name'] ?? 'Team Member';
        $amount = number_format((float)($payout['total_amount'] ?? 0), 2);
        $month = $payout['month'] ?? '';
        $method = $payout['payment_method'] ?? '';

        $msg = "Hi {$name}, your commission of KES {$amount} for {$month} has been paid via {$method}. Thank you.";

        return self::send($phone, $msg);
    }

    public static function sendAdminNotification($message) {
        $phone = self::getAdminPhone();
        if ($phone === '') return false;

        return self::send($phone, "ADMIN: {$message}. Thank you.");
    }

    private static function formatDate($value) {
        $ts = strtotime((string) $value);
        if (!$ts) return (string) $value;
        return date('D, d M', $ts);
    }

    private static function formatTime($value) {
        $ts = strtotime((string) $value);
        if (!$ts) return (string) $value;
        return date('h:i A', $ts);
    }
}
