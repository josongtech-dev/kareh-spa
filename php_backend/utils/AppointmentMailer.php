<?php
require_once __DIR__ . '/../config/env.php';

class AppointmentMailer {
    private static function isValidEmail($email) {
        return !empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    private static function send($toEmail, $subject, $htmlBody) {
        if (!self::isValidEmail($toEmail)) {
            return false;
        }

        $fromAddress = envValue('MAIL_FROM_ADDRESS', 'no-reply@karehspa.local');
        $fromName = envValue('MAIL_FROM_NAME', "Kareh's Spa");
        $safeFromName = str_replace(["\r", "\n"], '', $fromName);

        $mailer = strtolower(trim((string)envValue('MAIL_MAILER', 'mail')));
        if ($mailer === 'smtp') {
            return self::sendViaSmtp($toEmail, $subject, $htmlBody, $fromAddress, $safeFromName);
        }

        return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $safeFromName);
    }

    private static function sendViaSmtp($toEmail, $subject, $htmlBody, $fromAddress, $fromName) {
        $host = trim((string)envValue('MAIL_HOST', 'smtp.gmail.com'));
        $port = intval(envValue('MAIL_PORT', '465'));
        $username = trim((string)envValue('MAIL_USERNAME', ''));
        $password = (string)envValue('MAIL_PASSWORD', '');
        $encryption = strtolower(trim((string)envValue('MAIL_ENCRYPTION', 'ssl')));
        $timeout = intval(envValue('MAIL_TIMEOUT', '15'));

        if ($host === '' || $port <= 0 || $username === '' || $password === '') {
            error_log('SMTP not fully configured; falling back to mail().');
            return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
        }

        $transportHost = $host;
        // Implicit SSL wraps the socket before SMTP banner (commonly port 465).
        if ($encryption === 'ssl') {
            $transportHost = 'ssl://' . $host;
        }

        $socket = @stream_socket_client(
            $transportHost . ':' . $port,
            $errno,
            $errstr,
            max(5, $timeout),
            STREAM_CLIENT_CONNECT
        );

        if (!$socket) {
            error_log("SMTP connection failed: {$errno} {$errstr}");
            return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
        }

        stream_set_timeout($socket, max(5, $timeout));

        if (!self::smtpExpect($socket, [220])) {
            fclose($socket);
            return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
        }

        $ehloHost = parse_url(self::frontendBaseUrl(), PHP_URL_HOST);
        if (!is_string($ehloHost) || trim($ehloHost) === '') {
            $ehloHost = 'localhost';
        }
        if (!self::smtpCommand($socket, 'EHLO ' . $ehloHost, [250])) {
            fclose($socket);
            return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
        }

        // Explicit TLS upgrades plain SMTP sockets (commonly port 587).
        if ($encryption === 'tls') {
            if (!self::smtpCommand($socket, 'STARTTLS', [220])) {
                fclose($socket);
                return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
            }
            if (!@stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                error_log('SMTP STARTTLS crypto negotiation failed.');
                fclose($socket);
                return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
            }
            if (!self::smtpCommand($socket, 'EHLO ' . $ehloHost, [250])) {
                fclose($socket);
                return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
            }
        }

        if (!self::smtpCommand($socket, 'AUTH LOGIN', [334])) {
            fclose($socket);
            return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
        }
        if (!self::smtpCommand($socket, base64_encode($username), [334])) {
            fclose($socket);
            return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
        }
        if (!self::smtpCommand($socket, base64_encode($password), [235])) {
            fclose($socket);
            return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
        }

        if (!self::smtpCommand($socket, 'MAIL FROM:<' . $fromAddress . '>', [250])) {
            fclose($socket);
            return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
        }
        if (!self::smtpCommand($socket, 'RCPT TO:<' . $toEmail . '>', [250, 251])) {
            fclose($socket);
            return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
        }
        if (!self::smtpCommand($socket, 'DATA', [354])) {
            fclose($socket);
            return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
        }

        $encodedSubject = '=?UTF-8?B?' . base64_encode((string)$subject) . '?=';
        $headers = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-Type: text/html; charset=UTF-8';
        $headers[] = 'From: ' . $fromName . ' <' . $fromAddress . '>';
        $headers[] = 'To: <' . $toEmail . '>';
        $headers[] = 'Subject: ' . $encodedSubject;
        $headers[] = 'Date: ' . date(DATE_RFC2822);

        $data = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody;
        $data = str_replace(["\r\n.\r\n", "\n.\n"], ["\r\n..\r\n", "\n..\n"], $data);
        fwrite($socket, $data . "\r\n.\r\n");
        if (!self::smtpExpect($socket, [250])) {
            fclose($socket);
            return self::sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName);
        }

        self::smtpCommand($socket, 'QUIT', [221]);
        fclose($socket);
        return true;
    }

    private static function sendViaPhpMail($toEmail, $subject, $htmlBody, $fromAddress, $fromName) {
        $headers = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=UTF-8';
        $headers[] = 'From: ' . $fromName . ' <' . $fromAddress . '>';
        return @mail($toEmail, $subject, $htmlBody, implode("\r\n", $headers));
    }

    private static function smtpCommand($socket, $command, $expectedCodes) {
        fwrite($socket, $command . "\r\n");
        return self::smtpExpect($socket, $expectedCodes);
    }

    private static function smtpExpect($socket, $expectedCodes) {
        $line = '';
        do {
            $part = fgets($socket, 515);
            if ($part === false) {
                return false;
            }
            $line = $part;
        } while (isset($line[3]) && $line[3] === '-');

        $code = intval(substr($line, 0, 3));
        if (!in_array($code, $expectedCodes, true)) {
            error_log('SMTP unexpected response: ' . trim($line));
            return false;
        }
        return true;
    }

    private static function formatDate($dateValue) {
        $ts = strtotime((string) $dateValue);
        if (!$ts) return (string) $dateValue;
        return date('D, d M Y', $ts);
    }

    private static function formatTime($timeValue) {
        $ts = strtotime((string) $timeValue);
        if (!$ts) return (string) $timeValue;
        return date('h:i A', $ts);
    }

    private static function valueOrFallback($value, $fallback = 'N/A') {
        if (!isset($value) || $value === '') return $fallback;
        return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
    }

    private static function formatDateTime($value) {
        $ts = strtotime((string) $value);
        if (!$ts) return self::valueOrFallback($value, 'N/A');
        return date('D, d M Y h:i A', $ts);
    }

    private static function frontendBaseUrl() {
        $value = trim((string) envValue('FRONTEND_BASE_URL', 'https://karehspa.co.ke'));
        if ($value === '') {
            $value = 'https://karehspa.co.ke';
        }
        return rtrim($value, '/');
    }

    public static function sendBookingReceived($appointment, $manageToken = null) {
        $to = $appointment['customer_email'] ?? '';
        if (!self::isValidEmail($to)) return false;

        $appointmentId = self::valueOrFallback($appointment['id']);
        $appointmentCode = self::valueOrFallback($appointment['appointment_code']);
        $customerName = self::valueOrFallback($appointment['customer_name'], 'Valued Client');
        $serviceName = self::valueOrFallback($appointment['service_name'], 'To be confirmed');
        $date = self::formatDate($appointment['appointment_date'] ?? '');
        $time = self::formatTime($appointment['appointment_time'] ?? '');
        $manageCta = '';
        if (!empty($manageToken)) {
            $manageUrl = self::frontendBaseUrl() . '/manage-appointment?token=' . rawurlencode((string)$manageToken);
            $safeManageUrl = htmlspecialchars($manageUrl, ENT_QUOTES, 'UTF-8');
            $manageCta = "
                <p><strong>Manage your appointment:</strong> <a href='{$safeManageUrl}' target='_blank' rel='noopener noreferrer'>{$safeManageUrl}</a></p>
                <p>You can reschedule, cancel (with a reason), or add notes by following this link.</p>
            ";
        }

        $subject = "Booking received - Appointment #{$appointmentId}";
        $body = "
            <h2 style='margin-bottom:8px;'>Hi {$customerName},</h2>
            <p>We have received your booking request at Kareh's Spa.</p>
            <p><strong>Appointment ID:</strong> {$appointmentId}<br/>
            <strong>Booking Code:</strong> {$appointmentCode}<br/>
            <strong>Service:</strong> {$serviceName}<br/>
            <strong>Date:</strong> {$date}<br/>
            <strong>Time:</strong> {$time}</p>
            <p>We will review and confirm your appointment shortly.</p>
            {$manageCta}
            <p>Thank you for choosing Kareh's Spa.</p>
        ";

        return self::send($to, $subject, $body);
    }

    public static function sendBookingConfirmed($appointment) {
        $to = $appointment['customer_email'] ?? '';
        if (!self::isValidEmail($to)) return false;

        $appointmentId = self::valueOrFallback($appointment['id']);
        $appointmentCode = self::valueOrFallback($appointment['appointment_code']);
        $customerName = self::valueOrFallback($appointment['customer_name'], 'Valued Client');
        $serviceName = self::valueOrFallback($appointment['service_name'], 'Your selected service');
        $staffName = self::valueOrFallback($appointment['staff_name'], 'Our specialist');
        $date = self::formatDate($appointment['appointment_date'] ?? '');
        $time = self::formatTime($appointment['appointment_time'] ?? '');

        $subject = "Appointment confirmed - #{$appointmentId}";
        $body = "
            <h2 style='margin-bottom:8px;'>Hi {$customerName},</h2>
            <p>Your appointment has been confirmed.</p>
            <p><strong>Appointment ID:</strong> {$appointmentId}<br/>
            <strong>Booking Code:</strong> {$appointmentCode}<br/>
            <strong>Service:</strong> {$serviceName}<br/>
            <strong>Staff:</strong> {$staffName}<br/>
            <strong>Date:</strong> {$date}<br/>
            <strong>Time:</strong> {$time}</p>
            <p>We look forward to serving you at Kareh's Spa.</p>
        ";

        return self::send($to, $subject, $body);
    }

    public static function sendStaffActivationEmail($staff, $plainActivationPassword) {
        $to = $staff['email'] ?? '';
        if (!self::isValidEmail($to) || empty($plainActivationPassword)) return false;

        $name = self::valueOrFallback($staff['name'] ?? 'Team Member');
        $username = self::valueOrFallback($staff['username'] ?? '');
        $role = self::valueOrFallback($staff['role'] ?? 'staff');
        $loginLink = htmlspecialchars((string) envValue('STAFF_LOGIN_URL', 'https://karehspa.co.ke/admin/login'), ENT_QUOTES, 'UTF-8');
        $activationPassword = htmlspecialchars((string) $plainActivationPassword, ENT_QUOTES, 'UTF-8');

        $subject = "Your Kareh's Spa staff account is ready";
        $body = "
            <h2 style='margin-bottom:8px;'>Hi {$name},</h2>
            <p>Your staff account at Kareh's Spa has been created successfully.</p>
            <p><strong>Username:</strong> {$username}<br/>
            <strong>Role:</strong> {$role}<br/>
            <strong>Activation Password:</strong> {$activationPassword}</p>
            <p><strong>Login Link:</strong> <a href='{$loginLink}' target='_blank' rel='noopener noreferrer'>{$loginLink}</a></p>
            <p>Please sign in and complete activation as instructed by admin.</p>
        ";

        return self::send($to, $subject, $body);
    }

    public static function sendMemberWelcomeEmail($member) {
        $to = $member['email'] ?? '';
        if (!self::isValidEmail($to)) return false;

        $name = self::valueOrFallback($member['name'] ?? 'Valued Member');
        $memberId = self::valueOrFallback($member['id'] ?? '');
        $tier = self::valueOrFallback($member['loyalty_tier'] ?? 'Bronze');
        $points = self::valueOrFallback($member['loyalty_points'] ?? '0');
        $memberLoginLink = htmlspecialchars((string) envValue('MEMBER_LOGIN_URL', 'https://karehspa.co.ke/login'), ENT_QUOTES, 'UTF-8');

        $subject = "Welcome to Kareh's Spa Membership";
        $body = "
            <h2 style='margin-bottom:8px;'>Hi {$name},</h2>
            <p>Welcome to Kareh's Spa. Your member account has been created.</p>
            <p><strong>Member ID:</strong> {$memberId}<br/>
            <strong>Loyalty Tier:</strong> {$tier}<br/>
            <strong>Starting Points:</strong> {$points}</p>
            <p><strong>Login Link:</strong> <a href='{$memberLoginLink}' target='_blank' rel='noopener noreferrer'>{$memberLoginLink}</a></p>
            <p>Thank you for joining us. We look forward to serving you.</p>
        ";

        return self::send($to, $subject, $body);
    }

    public static function sendCommissionPaidEmail($payout) {
        $to = $payout['staff_email'] ?? '';
        if (!self::isValidEmail($to)) return false;

        $staffName = self::valueOrFallback($payout['staff_name'] ?? 'Team Member');
        $month = self::valueOrFallback($payout['month'] ?? '');
        $transactionId = self::valueOrFallback($payout['transaction_id'] ?? '');
        $paymentMethod = self::valueOrFallback($payout['payment_method'] ?? '');
        $settledAtRaw = (string)($payout['settled_at'] ?? '');
        $settledDate = self::formatDate($settledAtRaw);
        $settledTime = self::formatTime($settledAtRaw);
        $totalAmount = number_format((float)($payout['total_amount'] ?? 0), 2);

        $serviceLines = '';
        $services = is_array($payout['services'] ?? null) ? $payout['services'] : [];
        foreach ($services as $service) {
            $serviceName = self::valueOrFallback($service['service_name'] ?? 'Service');
            $serviceDate = self::formatDate($service['service_date'] ?? '');
            $serviceAmount = number_format((float)($service['staff_amount'] ?? 0), 2);
            $serviceLines .= "<li>{$serviceName} - KES {$serviceAmount} ({$serviceDate})</li>";
        }
        if ($serviceLines === '') {
            $serviceLines = '<li>No service line items available.</li>';
        }

        $subject = "Commission payment processed - {$month}";
        $body = "
            <h2 style='margin-bottom:8px;'>Hi {$staffName},</h2>
            <p>Your commission payment has been processed.</p>
            <p><strong>Month:</strong> {$month}<br/>
            <strong>Total Amount:</strong> KES {$totalAmount}<br/>
            <strong>Payment Method:</strong> {$paymentMethod}<br/>
            <strong>Transaction Code:</strong> {$transactionId}<br/>
            <strong>Settlement Date:</strong> {$settledDate}<br/>
            <strong>Settlement Time:</strong> {$settledTime}</p>
            <p><strong>Services covered this month:</strong></p>
            <ul>{$serviceLines}</ul>
            <p>Thank you for your excellent service.</p>
        ";

        return self::send($to, $subject, $body);
    }

    public static function sendPaymentReceived($session) {
        $to = $session['client_email'] ?? '';
        if (!self::isValidEmail($to)) return false;

        $sessionCode = self::valueOrFallback($session['session_code'] ?? 'N/A');
        $customerName = self::valueOrFallback($session['customer_name'] ?? 'Valued Client');
        $totalAmount = number_format((float)($session['total_amount'] ?? 0), 2);
        $paidAt = self::formatDateTime($session['paid_at'] ?? date('Y-m-d H:i:s'));
        $transactionCode = self::valueOrFallback($session['payment_transaction_code'] ?? '');

        $subject = "Payment received - {$sessionCode}";
        $body = "
            <h2 style='margin-bottom:8px;'>Hi {$customerName},</h2>
            <p>We have received your payment for session {$sessionCode}. Thank you!</p>
            <p><strong>Session ID:</strong> {$sessionCode}<br/>
            <strong>Amount Paid:</strong> KES {$totalAmount}<br/>
            <strong>Transaction Code:</strong> {$transactionCode}<br/>
            <strong>Paid At:</strong> {$paidAt}</p>
            <p>Thank you for choosing Kareh's Spa.</p>
        ";

        return self::send($to, $subject, $body);
    }

    public static function sendRaw($toEmail, $subject, $htmlBody) {
        return self::send($toEmail, $subject, $htmlBody);
    }
}
