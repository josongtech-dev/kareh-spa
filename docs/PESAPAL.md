# Pesapal Payment Gateway — Integration Reference

> **API Version:** 3.0 (JSON REST)  
> **Last Updated:** 2026-06-23  
> **Source:** https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/api-reference  
> **Postman Collection:** https://documenter.getpostman.com/view/6715320/UyxepTv1  
> **Official PHP Sample:** https://github.com/Pesapal-Ltd/sample_api3  
> **Community PHP SDK:** https://github.com/katorymnd/pesapal-php-sdk  

---

## Table of Contents

1. [Environment URLs](#1-environment-urls)
2. [Authentication (Get Access Token)](#2-authentication-get-access-token)
3. [Register IPN URL](#3-register-ipn-url)
4. [Get Registered IPNs](#4-get-registered-ipns)
5. [Submit Order Request](#5-submit-order-request)
6. [Get Transaction Status](#6-get-transaction-status)
7. [Cancel Order](#7-cancel-order)
8. [Refund Request](#8-refund-request)
9. [Recurring Payments](#9-recurring-payments)
10. [Integration Flow](#10-integration-flow)
11. [Kareh SPA — Current Billing Architecture](#11-kareh-spa--current-billing-architecture)
12. [Proposed Integration Plan](#12-proposed-integration-plan)
13. [Reference Links](#13-reference-links)

---

## 1. Environment URLs

| Environment | Base URL |
|---|---|
| **Sandbox (Demo)** | `https://cybqa.pesapal.com/pesapalv3` |
| **Production (Live)** | `https://pay.pesapal.com/v3` |

### Sandbox Test Credentials

> **Note:** The sandbox credentials file at https://developer.pesapal.com/api3-demo-keys.txt may be behind a verification page.  
> Register at https://developer.pesapal.com/sign-up to get demo keys.

### Sandbox Test Cards / Payment Methods

> https://cybqa.pesapal.com/PesapalIframe/PesapalIframe3/TestPayments

---

## 2. Authentication (Get Access Token)

**Endpoint:** `POST /api/Auth/RequestToken`

| Environment | URL |
|---|---|
| Sandbox | `https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken` |
| Production | `https://pay.pesapal.com/v3/api/Auth/RequestToken` |

**Headers:**
```
Accept: application/json
Content-Type: application/json
```

**Request Body:**
```json
{
    "consumer_key": "your_consumer_key",
    "consumer_secret": "your_consumer_secret"
}
```

**Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiryDate": "2026-06-23T12:29:30.5177702Z",
    "error": null,
    "status": "200",
    "message": "Request processed successfully"
}
```

> **Important:** Token expires after **5 minutes**. Must be sent as `Bearer Token` in all subsequent API calls.

**PHP Sample (from official repo):**
```php
public function getAccessToken($consumer_key, $consumer_secret){
    $headers = array();
    $headers['accept'] = 'text/plain';
    $headers['content-type'] = 'application/json';

    $postData = array();
    $postData['consumer_key'] = $consumer_key;
    $postData['consumer_secret'] = $consumer_secret;
    $endPoint = $this->url.'/api/Auth/RequestToken';
    $response = $this->curlRequest($endPoint, $headers, $postData);
    return $response;
}
```

---

## 3. Register IPN URL

> **IPN = Instant Payment Notification** — Pesapal notifies your server asynchronously when payment status changes.

**Endpoint:** `POST /api/URLSetup/RegisterIPN`

| Environment | URL |
|---|---|
| Sandbox | `https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN` |
| Production | `https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN` |

**Authentication:** Bearer Token (from step 1)

**Headers:**
```
Accept: application/json
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "url": "https://karehspa.co.ke/api/pesapal/ipn",
    "ipn_notification_type": "GET"
}
```

> `ipn_notification_type` can be `GET` or `POST`.

**Response:**
```json
{
    "url": "https://karehspa.co.ke/api/pesapal/ipn",
    "ipn_notification_type": "GET",
    "ipn_id": "fe078e53-78da-4a83-aa89-e7ded5c456e6",
    "error": null,
    "status": "200",
    "message": "Request processed successfully"
}
```

> **Important:** The `ipn_id` (GUID) must be stored and sent in every `SubmitOrderRequest` as the `notification_id` field.  
> **The IPN URL MUST be publicly accessible (HTTPS).** For local dev, use ngrok.  
> Register IPN once per environment (sandbox vs production). The `ipn_id` is different for each environment.

---

## 4. Get Registered IPNs

**Endpoint:** `GET /api/URLSetup/GetIpnList`

| Environment | URL |
|---|---|
| Sandbox | `https://cybqa.pesapal.com/pesapalv3/api/URLSetup/GetIpnList` |
| Production | `https://pay.pesapal.com/v3/api/URLSetup/GetIpnList` |

**Authentication:** Bearer Token

**Response:**
```json
[
    {
        "url": "https://karehspa.co.ke/api/pesapal/ipn",
        "ipn_notification_type": "GET",
        "ipn_id": "fe078e53-78da-4a83-aa89-e7ded5c456e6",
        "error": null,
        "status": "200",
        "message": "Request processed successfully"
    }
]
```

---

## 5. Submit Order Request

**Endpoint:** `POST /api/Transactions/SubmitOrderRequest`

| Environment | URL |
|---|---|
| Sandbox | `https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest` |
| Production | `https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest` |

**Authentication:** Bearer Token

**Headers:**
```
Accept: application/json
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "id": "SES001-1712345678",
    "currency": "KES",
    "amount": 2500.00,
    "description": "Kareh's Spa — Session SES001",
    "callback_url": "https://karehspa.co.ke/payment/callback",
    "notification_id": "fe078e53-78da-4a83-aa89-e7ded5c456e6",
    "billing_address": {
        "email_address": "customer@example.com",
        "phone_number": "0712345678",
        "country_code": "KE",
        "first_name": "John",
        "middle_name": "",
        "last_name": "Doe",
        "line_1": "Billing Address Line 1",
        "line_2": "",
        "city": "Nairobi",
        "state": "",
        "postal_code": "",
        "zip_code": ""
    }
}
```

**Response:**
```json
{
    "order_tracking_id": "b945e4af-80a5-4ec1-8706-e03f8332fb04",
    "merchant_reference": "SES001-1712345678",
    "redirect_url": "https://cybqa.pesapal.com/pesapaliframe/PesapalIframe3/Index/?OrderTrackingId=b945e4af-80a5-4ec1-8706-e03f8332fb04",
    "error": null,
    "status": "200"
}
```

> `redirect_url` is where you send the customer to choose payment method (M-Pesa, cards, etc.).  
> Can be loaded in an iframe or as a full redirect.

### Callback (after payment)

After payment, Pesapal appends to your `callback_url`:
```
?OrderTrackingId=b945e4af-80a5-4ec1-8706-e03f8332fb04
&OrderMerchantReference=SES001-1712345678
&OrderNotificationType=CALLBACKURL
```

### IPN Notification (async)

The IPN sends (GET or POST depending on registration):
```
GET /api/pesapal/ipn?OrderTrackingId=b945e4af-80a5-4ec1-8706-e03f8332fb04&OrderMerchantReference=SES001-1712345678&OrderNotificationType=IPNCHANGE
```

> **Important:** Neither callback nor IPN includes the payment status. You **must** call `GetTransactionStatus` to get the actual status.

---

## 6. Get Transaction Status

**Endpoint:** `GET /api/Transactions/GetTransactionStatus?orderTrackingId={orderTrackingId}`

| Environment | URL |
|---|---|
| Sandbox | `https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId={id}` |
| Production | `https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId={id}` |

**Authentication:** Bearer Token

**Response:**
```json
{
    "payment_status_description": "COMPLETED",
    "payment_status": "1",
    "payment_method": "MPESA",
    "amount": 2500.00,
    "currency": "KES",
    "merchant_reference": "SES001-1712345678",
    "order_tracking_id": "b945e4af-80a5-4ec1-8706-e03f8332fb04",
    "confirmation_code": "MPE123456789",
    "created_date": "2026-06-23T10:30:00",
    "error": null,
    "status": "200"
}
```

**Payment status values:**

| `payment_status` | `payment_status_description` | Meaning |
|---|---|---|
| `0` | `INVALID` | Invalid request |
| `1` | `COMPLETED` | Payment successful |
| `2` | `PENDING` | Awaiting confirmation |
| `3` | `FAILED` | Payment failed |

> You can also optionally provide `merchantReference` as a query param:  
> `?orderTrackingId={id}&merchantReference={ref}`

---

## 7. Cancel Order

> Cancel a pending/unpaid order.

**Endpoint:** `POST /api/Transactions/CancelOrder`

| Environment | URL |
|---|---|
| Sandbox | `https://cybqa.pesapal.com/pesapalv3/api/Transactions/CancelOrder` |
| Production | `https://pay.pesapal.com/v3/api/Transactions/CancelOrder` |

**Authentication:** Bearer Token

**Request Body:**
```json
{
    "order_tracking_id": "b945e4af-80a5-4ec1-8706-e03f8332fb04"
}
```

---

## 8. Refund Request

> Refund a completed transaction.

**Endpoint:** `POST /api/Transactions/RefundRequest`

| Environment | URL |
|---|---|
| Sandbox | `https://cybqa.pesapal.com/pesapalv3/api/Transactions/RefundRequest` |
| Production | `https://pay.pesapal.com/v3/api/Transactions/RefundRequest` |

**Authentication:** Bearer Token

**Request Body:**
```json
{
    "confirmation_code": "MPE123456789",
    "amount": 2500.00,
    "remarks": "Customer requested refund",
    "requested_by": "Staff Name"
}
```

> One refund per transaction only.

---

## 9. Recurring Payments

> Enable subscription payments by adding an `account_number` field in `SubmitOrderRequest`.

**Additional field in SubmitOrderRequest:**
```json
{
    "account_number": "555-678"
}
```

The customer is then shown an option to opt into recurring on the Pesapal iframe. They configure frequency (daily/weekly/monthly/quarterly/yearly), start date, end date, and amount.

---

## 10. Integration Flow

### Full Payment Flow:

```
1. Backend gets access token          POST /api/Auth/RequestToken
                                              ↓
2. Backend registers IPN URL (once)   POST /api/URLSetup/RegisterIPN
                                              ↓
3. Backend submits order              POST /api/Transactions/SubmitOrderRequest
                                              ↓
4. Backend returns redirect_url to frontend
                                              ↓
5. Frontend redirects customer to redirect_url (or loads in iframe)
                                              ↓
6. Customer pays on Pesapal page (M-Pesa, card, etc.)
                                              ↓
7. Pesapal redirects customer back to callback_url
   (params: OrderTrackingId, OrderMerchantReference, OrderNotificationType)
                                              ↓
8. Frontend/callback page calls backend to verify status via GetTransactionStatus
                                              ↓
9. Pesapal asynchronously sends IPN to registered IPN URL
   (GET/POST with OrderTrackingId, OrderMerchantReference, OrderNotificationType)
                                              ↓
10. Backend IPN handler calls GetTransactionStatus to confirm status
                                              ↓
11. If COMPLETED → mark session as paid, store confirmation_code, order_tracking_id
```

### Important Notes:

- **Token expires in 5 minutes** — always get a fresh token before each API call
- **IPN is mandatory** — handles cases where customer closes browser before callback
- **Neither callback nor IPN includes payment status** — always call GetTransactionStatus
- **Store `order_tracking_id`** (from SubmitOrderRequest) on the session to query status later
- **Store `confirmation_code`** (from GetTransactionStatus when COMPLETED) as the payment transaction reference
- **Notify ID differs per environment** — sandbox notification_id won't work in production

---

## 11. Kareh SPA — Current Billing Architecture

### Current Database Schema (sessions table - simplified):

```sql
sessions
├── id                          INT (PK)
├── session_code                VARCHAR (e.g., SES001)
├── customer_name               VARCHAR
├── client_phone                VARCHAR
├── client_email                VARCHAR
├── total_amount                DECIMAL
├── billing_status              ENUM('unbilled','paid')
├── paid_at                     DATETIME (nullable)
├── payment_transaction_code    VARCHAR (nullable)
├── discount_type               ENUM('percent','amount')
├── discount_value              DECIMAL
├── discount_amount             DECIMAL
├── notes                       TEXT
├── appointment_id              INT (FK → appointments)
├── created_by                  INT (FK → staffs)
├── created_at                  DATETIME
└── updated_at                  DATETIME

session_services
├── id                          INT (PK)
├── session_id                  INT (FK → sessions)
├── service_id                  INT (FK → services)
├── assigned_staff_id           INT (FK → staffs)
├── price                       DECIMAL
└── status                      VARCHAR
```

### Current Payment Flow (Manual):

1. Staff creates session (from appointment or walk-in)
2. Staff adds services to session
3. Staff clicks "Pay" on session
4. Staff enters **external transaction code** manually (from M-Pesa message, etc.)
5. Backend marks `billing_status = 'paid'`, stores `payment_transaction_code`

### Key Files:

| File | Purpose |
|---|---|
| `php_backend/models/Session.php` | Session CRUD + `paySession()` |
| `php_backend/controllers/SessionController.php` | Route: `?action=pay_session` → `paySession()` |
| `php_backend/api/sessions.php` | HTTP route entry point |
| `frontend/src/api/sessions.ts` | Frontend API client |
| `frontend/src/pages/admin/SessionsManagementPage.tsx` | Admin UI |

---

## 12. Proposed Integration Plan

### New/Modified Files Needed:

#### Backend:
| File | Purpose |
|---|---|
| `php_backend/config/pesapal.php` | Pesapal configuration (keys, URLs) |
| `php_backend/utils/PesapalGateway.php` | Gateway helper class (auth, submit, query, IPN) |
| `php_backend/api/pesapal.php` or `php_backend/api/pesapal/` | Pesapal webhook/callback endpoints |
| `php_backend/controllers/PesapalController.php` | Handle IPN/callback requests |
| Modify `php_backend/models/Session.php` | Add `order_tracking_id`, `pesapal_ipn_id` fields |
| Modify `php_backend/controllers/SessionController.php` | Add `?action=initiate_payment` |
| Modify `php_backend/.env` / `.env.example` | Add `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`, `PESAPAL_ENV` |

#### Frontend:
| File | Purpose |
|---|---|
| `frontend/src/api/pesapal.ts` | Frontend API client for Pesapal endpoints |
| Modify `frontend/src/pages/admin/SessionsManagementPage.tsx` | Add "Pay via Pesapal" button, iframe/redirect modal |
| `frontend/src/pages/PaymentCallbackPage.tsx` | Handle callback URL after payment |

### New DB Columns (sessions table migration):

```sql
ALTER TABLE sessions
    ADD COLUMN pesapal_order_tracking_id VARCHAR(64) NULL AFTER payment_transaction_code,
    ADD COLUMN pesapal_ipn_notified TINYINT(1) DEFAULT 0 AFTER pesapal_order_tracking_id,
    ADD COLUMN pesapal_callback_processed TINYINT(1) DEFAULT 0 AFTER pesapal_ipn_notified;
```

### Environment Variables to Add:

```ini
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
PESAPAL_ENV=sandbox
PESAPAL_IPN_URL=https://karehspa.co.ke/api/pesapal/ipn
PESAPAL_CALLBACK_URL=https://karehspa.co.ke/payment/callback
```

### Full Flow After Integration:

1. Staff creates session (existing flow)
2. Staff adds services (existing flow)
3. Staff clicks "Request Payment" → frontend calls `POST /api/sessions.php?action=initiate_payment`
4. Backend:
   a. Gets Pesapal access token
   b. Submits order to Pesapal via SubmitOrderRequest
   c. Stores `order_tracking_id` on session
   d. Returns `redirect_url` to frontend
5. Frontend opens Pesapal iframe/modal with `redirect_url`
6. Customer pays on Pesapal
7. **Callback path:** Pesapal redirects to `PaymentCallbackPage` → frontend polls backend → backend calls `GetTransactionStatus` → marks paid if COMPLETED
8. **IPN path:** Pesapal sends async notification → `PesapalController` handles → calls `GetTransactionStatus` → marks paid if COMPLETED
9. Session is now marked `paid` with `confirmation_code` stored as `payment_transaction_code`

---

## 13. Reference Links

| Resource | URL |
|---|---|
| Developer Portal | https://developer.pesapal.com/ |
| API Reference (3.0) | https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/api-reference |
| Authentication | https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/authentication |
| Register IPN | https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/registeripnurl |
| SubmitOrderRequest | https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/submitorderrequest |
| GetTransactionStatus | https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/gettransactionstatus |
| Recurring Payments | https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/recurringpayments |
| Cancel/Refund | https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/additional-api3-endpoints |
| Postman Collection | https://documenter.getpostman.com/view/6715320/UyxepTv1 |
| Official PHP Sample | https://github.com/Pesapal-Ltd/sample_api3 |
| Community PHP SDK | https://github.com/katorymnd/pesapal-php-sdk |
| Sandbox Test Credentials | https://developer.pesapal.com/api3-demo-keys.txt |
| Sandbox Test Cards | https://cybqa.pesapal.com/PesapalIframe/PesapalIframe3/TestPayments |
| Register Business (Live) | https://www.pesapal.com/dashboard/account/register |
| Integration Tutorial (PHP) | https://joshuawilfred.medium.com/pesapal-payment-gateway-integration-with-rilt-stack-react-inertia-laravel-tailwindcss-8a8de8a71082 |
| Integration Tutorial (Django) | https://dev.to/joy_nyayieka/integrating-pesapal-api-30-on-django-58i0 |
| PCI/DSS Security | https://www.pesapal.com/security |
| Help & Support | https://www.pesapal.com/help-support |
