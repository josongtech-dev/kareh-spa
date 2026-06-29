# KAREH'S SPA — SYSTEM DOCUMENTATION

> **Website:** https://karehspa.co.ke
> **Stack:** PHP (vanilla) + MySQL + React 19 (Vite/TypeScript)
> **Auth:** Custom JWT (HS256)

---

## TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
2. [Directory Structure](#2-directory-structure)
3. [Database Schema](#3-database-schema)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [API Layer](#5-api-layer)
6. [Backend Layer (Models & Controllers)](#6-backend-layer-models--controllers)
7. [Frontend Layer](#7-frontend-layer)
8. [Core Features & Workflows](#8-core-features--workflows)
9. [Business Logic Deep Dives](#9-business-logic-deep-dives)
10. [Migration System](#10-migration-system)
11. [Email System](#11-email-system)
12. [Security Model & Known Issues](#12-security-model--known-issues)
13. [Pending Work & Tech Debt](#13-pending-work--tech-debt)
14. [Conventions & Patterns](#14-conventions--patterns)

---

## 1. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                       │
│  Vite dev server (:5173) → proxies /api → PHP backend        │
│  React 19 + React Router v7 + Bootstrap 5 + Axios            │
│  27 page components, 18 API client modules, 10 shared comps  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/JSON (JWT Bearer token)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (PHP REST API)                     │
│  19 API endpoint files → 14 Controllers → 12 Models          │
│  Custom JWT (Security.php) → AuthMiddleware                  │
│  MySQLi (no ORM), 37+ migrations                             │
└──────────────────────────┬──────────────────────────────────┘
                           │ MySQLi
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Database                             │
│  21 tables, utf8mb4, Africa/Nairobi timezone                 │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **No PHP framework** — Vanilla PHP with manual requires, no autoloader, no Composer
- **No ORM** — Raw MySQLi with prepared statements everywhere
- **Custom JWT** — HMAC-SHA256 implemented in `utils/Security.php`, no library
- **Multi-auth** — Separate tokens for customers (`token`) and staff (`admin_token`)
- **Public endpoints** — Some GET endpoints (services, offers, settings) are intentionally public

---

## 2. DIRECTORY STRUCTURE

```
kareh-spa/
├── SYSTEM.md                           ← This file
├── SECURITY_DEPLOYMENT.md              ← Production security checklist
│
├── frontend/                           ← React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── main.tsx                    ← Entry point
│   │   ├── App.tsx                     ← Router with role-based route guards
│   │   ├── adminAccess.ts             ← Role definitions & permission helpers
│   │   ├── adminReporting.ts          ← Analytics/reporting utilities
│   │   ├── api/                        ← 18 API client modules
│   │   │   ├── axiosInstance.ts        ← Axios + auth interceptor
│   │   │   ├── config.ts              ← API base URL from env
│   │   │   ├── auth.ts                ← Login/register/logout
│   │   │   ├── appointments.ts
│   │   │   ├── appointmentManage.ts
│   │   │   ├── services.ts
│   │   │   ├── staff.ts
│   │   │   ├── members.ts
│   │   │   ├── sessions.ts
│   │   │   ├── commissions.ts
│   │   │   ├── commissionRules.ts
│   │   │   ├── expenses.ts
│   │   │   ├── products.ts
│   │   │   ├── offers.ts
│   │   │   ├── settings.ts
│   │   │   ├── sessionFeedback.ts
│   │   │   ├── dashboard.ts
│   │   │   └── inhouseRequests.ts
│   │   ├── components/                 ← 10 shared UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── BrandedLoader.tsx
│   │   │   ├── MediaLightbox.tsx
│   │   │   ├── ServiceImageThumb.tsx
│   │   │   └── admin/
│   │   │       ├── AdminModal.tsx
│   │   │       ├── AdminTable.tsx
│   │   │       ├── ConfirmModal.tsx
│   │   │       ├── FeedbackModal.tsx
│   │   │       └── SuccessModal.tsx
│   │   └── pages/                      ← 27 page components
│   │       ├── HomePage.tsx
│   │       ├── AboutPage.tsx
│   │       ├── ServicesPage.tsx
│   │       ├── GalleryPage.tsx
│   │       ├── BookingPage.tsx
│   │       ├── ManageAppointmentPage.tsx
│   │       ├── SessionFeedbackPage.tsx
│   │       ├── RegisterPage.tsx
│   │       ├── UserLoginPage.tsx
│   │       ├── member/                 ← 5 member portal pages
│   │       └── admin/                  ← 16 admin portal pages
│
└── php_backend/                        ← PHP REST API
    ├── .env                            ← Production secrets (LIVE!)
    ├── .env.local                      ← Local overrides
    ├── .htaccess                       ← Blocks config/, migrations/, migrate.php
    ├── config/
    │   ├── db.php                      ← MySQLi connection (EAT timezone)
    │   └── env.php                     ← .env loader with local override
    ├── utils/
    │   ├── Security.php                ← JWT issue/parse, CORS, security headers
    │   ├── Response.php                ← JSON response helper (json/error)
    │   └── AppointmentMailer.php       ← SMTP email client (6 templates)
    ├── middleware/
    │   └── AuthMiddleware.php          ← Bearer token validation + role guard
    ├── models/                         ← Data layer (12 files)
    │   ├── BaseModel.php               ← Base: getAll, getById, delete
    │   ├── Appointment.php
    │   ├── Session.php                 ← 1069 lines — largest model
    │   ├── Service.php
    │   ├── Staff.php
    │   ├── Member.php
    │   ├── Product.php
    │   ├── Offer.php
    │   ├── Expense.php
    │   ├── Commission.php              ← 954 lines — commission engine
    │   ├── CommissionRule.php
    │   └── SystemSetting.php
    ├── controllers/                    ← Business logic (14 files)
    │   ├── BaseController.php          ← getPostData() JSON + $_POST fallback
    │   ├── AppointmentController.php
    │   ├── AppointmentManageController.php
    │   ├── SessionController.php
    │   ├── SessionFeedbackController.php
    │   ├── ServiceController.php
    │   ├── StaffController.php
    │   ├── MemberController.php
    │   ├── ProductController.php
    │   ├── OfferController.php
    │   ├── ExpenseController.php
    │   ├── CommissionController.php
    │   ├── CommissionRuleController.php
    │   └── SystemSettingController.php
    ├── api/                            ← HTTP route handlers (19 files)
    │   ├── index.php                   ← Entry + test endpoint
    │   ├── auth/
    │   │   ├── login.php              ← Customer login (email/phone)
    │   │   ├── register.php           ← Customer registration
    │   │   ├── staff-login.php        ← Staff login (multi-identifier)
    │   │   └── staff-reset-password.php
    │   ├── appointments.php
    │   ├── appointment-manage.php
    │   ├── sessions.php
    │   ├── session-feedback.php
    │   ├── services.php
    │   ├── staff.php
    │   ├── members.php
    │   ├── products.php
    │   ├── offers.php
    │   ├── expenses.php
    │   ├── commissions.php
    │   ├── commission_rules.php
    │   ├── settings.php
    │   ├── dashboard.php
    │   └── inhouse_requests.php
    ├── migrations/
    │   ├── migrate.php                 ← Migration runner (CLI)
    │   └── sql/                        ← 37+ SQL files (001-037)
    ├── scripts/                        ← Ad-hoc scripts
    └── uploads/                        ← Uploaded images (blocked PHP exec)
        └── .htaccess                   ← Deny PHP execution
```

---

## 3. DATABASE SCHEMA

### 3.1 Table Inventory (21 tables)

| Table | Purpose | Key Columns | FKs |
|---|---|---|---|
| `users` | Customer accounts | id, name, email, phone, password, points, username | — |
| `staffs` | Staff accounts | id, name, email, phone, role, password, pin, is_active, force_reset, activation_password, created_by | created_by → staffs (no FK) |
| `services` | Service catalog | id, name, description, original_price, price, duration, category, image_url, is_active, commission_rule_id | commission_rule_id → commission_rules |
| `appointments` | Customer bookings | id, user_id, staff_id, service_id, appointment_date, appointment_time, status, notes, customer_name/email/phone, management_token, feedback_token | user_id → users, staff_id → staffs, service_id → services |
| `appointment_services` | Multi-service per appointment | id, appointment_id, service_id, staff_id, quantity | appointment_id → appointments, service_id → services |
| `sessions` | Service delivery records | id, appointment_id, user_id, staff_id, service_id, session_date, start_time, end_time, status, billing_status, total_amount, discount, notes, feedback_token | appointment_id → appointments, staff_id → staffs |
| `session_services` | Multi-service lines per session | id, session_id, service_id, staff_id, quantity, unit_price, line_total, status (pending/in_progress/completed/voided) | session_id → sessions, service_id → services |
| `commissions` | Staff commission records | id, session_id, session_service_id, staff_id, service_id, gross_amount, pool_amount, tax_amount, net_amount, status, settled_at | Multiple FKs |
| `commission_rules` | Commission tier config | id, name, pool_percentage, tax_percentage, is_active | — |
| `commission_settlement_batches` | Batch payout tracking | id, batch_date, total_gross, total_pool, total_tax, total_net, status, processed_by | processed_by → staffs |
| `products` | Retail inventory | id, name, description, price, cost_price, stock_quantity, sku, category, is_active, product_type (Saleable/Internal Use), tracking_mode (Units/Level) | — |
| `product_stock_movements` | Inventory change log | id, product_id, quantity_change, movement_type, reference_type, notes | product_id → products |
| `service_offers` | Promotions/discounts | id, name, description, type (percent/amount), value, start_date, end_date, is_active | — |
| `service_offer_services` | Offer-service links | id, offer_id, service_id | offer_id → service_offers, service_id → services |
| `expenses` | Business expenses | id, description, amount, category, expense_date, payment_method, status (pending/confirmed) | created_by → staffs |
| `session_feedback` | Customer ratings | id, session_id, token_hash, service_rating, billing_rating, feedback_text, submitted_at, viewed_at | session_id → sessions |
| `members` | Loyalty membership | id, user_id, membership_number, membership_tier, points_balance, total_spent, join_date | user_id → users |
| `inhouse_service_requests` | Walk-in requests | id, session_id, service_id, staff_id, customer_name, customer_phone, status | — |
| `system_settings` | Key-value config store | id, setting_key, setting_value, description | — |
| `schema_migrations` | Migration tracking | id, migration, checksum, applied_at | — |

### 3.2 Stale / Legacy Columns

| Column | Table | Issue |
|---|---|---|
| `service_id` | `sessions` | Superseded by `session_services` (dual source of truth) |
| `service_id` | `appointments` | Superseded by `appointment_services` (dual source of truth) |
| `category` (VARCHAR) | `services` | Superseded by `service_categories` table |
| `stock_quantity` (INT) | `products` | Redundant with `quantity_remaining` (DECIMAL) |
| Entire `staff` table | — | Created in migration 001, never dropped after `staffs` table |

### 3.3 Missing Indexes

| Table | Columns |
|---|---|
| `appointments` | status, appointment_date + appointment_time |
| `sessions` | status, session_date |
| `staffs` | status |
| `products` | status |
| `services` | is_active |
| `commissions` | payment_status, session_id, staff_id |
| `session_feedback` | submitted_at, viewed_at |
| `service_offers` | status, start_date, end_date |
| `session_services` | service_id |

---

## 4. AUTHENTICATION & AUTHORIZATION

### 4.1 JWT Implementation (`utils/Security.php`)

| Detail | Value |
|---|---|
| Algorithm | HMAC-SHA256 (manual implementation, no library) |
| Secret key | `APP_KEY` from `.env` (production: static string) |
| Token payload | `{ sub, role, iat, exp }` |
| Customer expiry | 24 hours |
| Staff expiry | 12 hours |
| Base64 encoding | URL-safe (no `+/`, no padding) |
| Legacy tokens | Optional base64+pipe format, disabled in production |

### 4.2 Auth Endpoints

| Endpoint | Auth | Description |
|---|---|---|
| `POST /api/auth/login.php` | None | Customer login (email or phone) |
| `POST /api/auth/register.php` | None | Customer registration → auto-login |
| `POST /api/auth/staff-login.php` | None | Staff login (multi-identifier) |
| `POST /api/auth/staff-reset-password.php` | Reset token | Force password reset after activation |

### 4.3 Staff Activation Flow

```
Admin creates staff ──→ activation_password generated ──→ force_reset=1
                                │
                                ▼
Staff logs in with activation_password
                                │
                                ▼
Server detects force_reset → returns reset_token (not JWT)
                                │
                                ▼
Staff calls staff-reset-password.php with token + new password
                                │
                                ▼
Password hashed (bcrypt), force_reset cleared, activation_password deleted
```

### 4.4 Role Hierarchy

```
owner       → Full system access, settings, analytics, add-admins
manager     → Almost full (minus owner-specific settings + add-admin)
receptionist→ Appointments, products (add/edit), expenses (record/view)
attendant   → Dashboard (own metrics), sessions (work on assigned), commissions (view own)
```

### 4.5 Frontend Route Guards (`App.tsx`)

| Guard | Logic |
|---|---|
| `MemberProtectedRoute` | Checks `localStorage.getItem('token')` + `member_user` |
| `AdminProtectedRoute` | Checks `admin_token` + `admin_user` |
| `RoleProtectedRoute` | Admin check + role verification via `adminAccess.ts` |

**Known issue:** No token expiry validation in frontend route guards — stale tokens grant access until the first 401 response.

### 4.6 Frontend Role Permissions (`adminAccess.ts`)

```
canManageServices()       → owner, manager
canManageOffers()         → owner, manager
canAddOrEditProducts()    → owner, manager, receptionist
canDeleteProducts()       → owner, manager
canSeeCommissions()       → owner, manager, attendant
canSeeAnalytics()         → owner, manager
canCreateAdmin()          → owner, manager
canAccessExpenses()       → owner, manager, receptionist
canFullyManageExpenses()  → owner, manager
```

---

## 5. API LAYER

### 5.1 Request Lifecycle

```
HTTP Request
    │
    ▼
api/*.php file (e.g., appointments.php)
    ├── require config/db.php → $conn (MySQLi)
    ├── require utils/Security.php → CORS + security headers
    ├── require middleware/AuthMiddleware.php → token validation
    │
    ▼
Controller->handleRequest()
    ├── Parse method (GET/POST/PUT/DELETE)
    ├── Delegate to model methods
    │
    ▼
Response::json() or Response::error()
```

### 5.2 Endpoint Files & Controllers

| API File | Controller | Methods | Auth | Notes |
|---|---|---|---|---|
| `auth/login.php` | inline | POST | Public | Customer login |
| `auth/register.php` | inline | POST | Public | Customer registration |
| `auth/staff-login.php` | inline | POST | Public | Staff login (multi-identifier) |
| `auth/staff-reset-password.php` | inline | POST | Reset Token | Force password reset |
| `appointments.php` | AppointmentController | GET,POST,PUT,DELETE | **Public POST (create)**, Staff for rest | New appointments are public |
| `appointment-manage.php` | AppointmentManageController | GET,POST | Public (token) | Token-based self-service |
| `sessions.php` | SessionController | GET,POST,PUT,DELETE | Staff | 7+ sub-actions |
| `session-feedback.php` | SessionFeedbackController | GET,POST | Public (token) | Token-based feedback |
| `services.php` | ServiceController | GET,POST,PUT,DELETE | **Public GET**, Staff for write | Catalog is public |
| `staff.php` | StaffController | GET,POST,PUT,DELETE | Staff (owner/manager) | |
| `members.php` | MemberController | GET,POST,PUT,DELETE | Staff | |
| `products.php` | ProductController | GET,POST,PUT,DELETE | Staff | |
| `offers.php` | OfferController | GET,POST,PUT,DELETE | **Public GET**, Staff for write | Active offers public |
| `expenses.php` | ExpenseController | GET,POST,PUT,DELETE | Staff | |
| `commissions.php` | CommissionController | GET,POST | Staff | |
| `commission_rules.php` | CommissionRuleController | GET,POST,PUT,DELETE | Staff (owner/manager) | |
| `settings.php` | SystemSettingController | GET,POST | **Public GET**, Staff for write | Settings key-value store |
| `dashboard.php` | inline | GET | Staff | Scalar metrics + low-stock |
| `inhouse_requests.php` | inline | GET,POST,PUT | Staff | Walk-in requests |

### 5.3 Session Sub-actions (via `api/sessions.php`)

All sub-actions use `?action=` query parameter on POST:

| Action | Description |
|---|---|
| `start` | Start a session (from appointment or walk-in) |
| `complete` | Mark session as Completed |
| `add_service` | Add service line to session |
| `remove_service` | Remove service line from session |
| `request_payment` | Set billing_status → payment_requested |
| `confirm_payment` | Set billing_status → paid (requires transaction code) |
| `set_discount` | Apply discount (amount or percent) |
| `receipt` | Get session receipt data |

### 5.4 Commission Sub-actions (via `api/commissions.php`)

| Action | Description |
|---|---|
| `pending` | List pending commissions |
| `settle` | Create settlement batch |
| `batches` | List settlement batches |
| `by_staff` | Filter commissions by staff ID |

### 5.5 API Response Format

```json
// Success
{ "status": "success", "data": { ... } }

// Error
{ "status": "error", "message": "Description" }
```

### 5.6 Input Parsing Pattern

All controllers use `BaseController::getPostData()`:
1. Read `php://input` → JSON decode
2. If null, fall back to `$_POST`
3. Return empty array if both fail

---

## 6. BACKEND LAYER (MODELS & CONTROLLERS)

### 6.1 Layering Pattern

```
api/*.php (HTTP routing, auth check)
    │
    ▼
Controller (input validation, business logic orchestration)
    │
    ▼
Model (SQL queries, data access)
    │
    ▼
MySQL
```

### 6.2 Model Overview

| Model | Lines | Key Methods |
|---|---|---|
| `BaseModel` | 40 | `getAll()`, `getById()`, `delete()` |
| `Appointment` | ~300 | CRUD, token management, email notifications |
| `Session` | 1069 | CRUD, service lines, billing, discounts, feedback tokens, progress |
| `Service` | ~250 | CRUD, categories, image upload, commission visibility |
| `Staff` | ~200 | CRUD, activation flow, duplicate validation |
| `Member` | ~150 | CRUD, points adjustment, tier recalculation |
| `Product` | ~300 | CRUD, stock movements, restock/consume, velocity, cost summary |
| `Offer` | ~200 | CRUD, service-linking, active-offer resolution |
| `Expense` | ~100 | CRUD, confirmation workflow |
| `Commission` | 954 | Engine: auto-create, settlement batches, aggregation, reporting |
| `CommissionRule` | 247 | CRUD, default management, validation |
| `SystemSetting` | ~80 | Key-value CRUD with type casting |

### 6.3 Controller Overview

| Controller | Key Responsibilities |
|---|---|
| `AppointmentController` | CRUD, email triggers, appointment → session flow |
| `AppointmentManageController` | Token-based lookup, reschedule, cancel |
| `SessionController` | Session lifecycle, service lines, billing, discounts |
| `SessionFeedbackController` | Token validation, submit, mark viewed |
| `ServiceController` | CRUD, category management, image upload, commission field stripping |
| `StaffController` | CRUD, activation password, image upload, duplicate validation |
| `MemberController` | CRUD, points adjustment, tier calculation |
| `ProductController` | CRUD, restock, consume, stock movements |
| `OfferController` | CRUD, service linking, role-based visibility |
| `ExpenseController` | CRUD, confirmation workflow, role filtering |
| `CommissionController` | List, settle, batches, by-staff filtering |
| `CommissionRuleController` | CRUD, default assignment, validation |
| `SystemSettingController` | Get all, bulk update |

### 6.4 Key Pattern: Prepared Statements

Every SQL query uses prepared statements via MySQLi:

```php
$stmt = $this->conn->prepare("SELECT * FROM services WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
```

**Exceptions:** `BaseModel::getAll()` uses `$this->conn->query()` (no parameters needed). Some LIMIT clauses use string interpolation with `intval()`.

### 6.5 Key Pattern: Transaction Usage

Financial operations use transactions:

```php
$this->conn->begin_transaction();
try {
    // Multiple queries...
    $this->conn->commit();
} catch (Exception $e) {
    $this->conn->rollback();
    // Handle error
}
```

**Known gap:** Not all financial operations use row-level locking (`FOR UPDATE`), creating race condition risk.

---

## 7. FRONTEND LAYER

### 7.1 Tech Stack

| Library | Version | Purpose |
|---|---|---|
| React | 19.0.0 | UI framework |
| react-router-dom | 7.1.0 | Client-side routing |
| Bootstrap | 5.3.3 | CSS framework |
| react-bootstrap | 2.10.7 | Bootstrap components |
| axios | 1.7.9 | HTTP client |
| framer-motion | 12.4.0 | Animations |
| chart.js + react-chartjs-2 | 4.4.7 / 5.3.0 | Charts (Analytics page) |
| sweetalert2 | 11.17.2 | Alert dialogs |
| react-helmet-async | 2.0.5 | Head management |
| TypeScript | 5.7 | Type safety |
| Vite | 6.0 | Build tool |

### 7.2 Route Map

#### Public Routes

| Route | Page | Description |
|---|---|---|
| `/` | `HomePage.tsx` | Landing page |
| `/about` | `AboutPage.tsx` | About us |
| `/services` | `ServicesPage.tsx` | Service catalog |
| `/gallery` | `GalleryPage.tsx` | Photo/video gallery |
| `/book` | `BookingPage.tsx` | Booking form |
| `/manage-appointment` | `ManageAppointmentPage.tsx` | Token-based lookup |
| `/session-feedback` | `SessionFeedbackPage.tsx` | Token-based feedback |

#### Auth Routes

| Route | Page | Description |
|---|---|---|
| `/login` | `UserLoginPage.tsx` | Customer login |
| `/register` | `RegisterPage.tsx` | Customer registration |

#### Member Portal (under `/member`)

| Route | Page | Role |
|---|---|---|
| `/member/dashboard` | `MemberDashboardPage.tsx` | Customer |
| `/member/services` | `MemberServicesPage.tsx` | Customer |
| `/member/history` | `MemberHistoryPage.tsx` | Customer |
| `/member/points` | `MemberPointsPage.tsx` | Customer |
| `/member/offers` | `MemberOffersPage.tsx` | Customer |

#### Admin Portal (under `/admin`)

| Route | Page | Minimum Role |
|---|---|---|
| `/admin/login` | `AdminLoginPage.tsx` | None (public) |
| `/admin/reset-password` | `AdminResetPasswordPage.tsx` | Reset token |
| `/admin/dashboard` | `AdminDashboard.tsx` | All staff |
| `/admin/appointments` | `AppointmentsManagementPage.tsx` | All staff |
| `/admin/sessions` | `SessionsManagementPage.tsx` | All staff |
| `/admin/services` | `ServicesManagementPage.tsx` | Owner, Manager |
| `/admin/staff` | `StaffManagementPage.tsx` | Owner, Manager |
| `/admin/members` | `MembersManagementPage.tsx` | Owner, Manager |
| `/admin/products` | `ProductsManagementPage.tsx` | Owner, Manager |
| `/admin/offers` | `OffersManagementPage.tsx` | Owner, Manager |
| `/admin/expenses` | `ExpensesManagementPage.tsx` | Owner, Manager |
| `/admin/commissions` | `CommissionsManagementPage.tsx` | Owner, Manager |
| `/admin/feedback` | `FeedbackManagementPage.tsx` | Owner, Manager |
| `/admin/settings` | `SettingsPage.tsx` | Owner |
| `/admin/analytics` | `AnalyticsPage.tsx` | Owner, Manager |
| `/admin/add-admin` | `AddAdminPage.tsx` | Owner |

### 7.3 Auth Interceptor (`axiosInstance.ts`)

- **Request interceptor:** Reads token from `localStorage` (`token` or `admin_token`) and adds `Authorization: Bearer <token>` header
- **Response interceptor:** On 401/403, clears ALL auth tokens from localStorage — aggressive but simple

### 7.4 State Management

No global state library (no Redux, Zustand, Context). State is managed:
- **Component-local** via `useState`/`useReducer` in each page
- **localStorage** for auth tokens and user data
- **Custom window events** for cross-component communication (e.g., `SERVICE_CATALOG_UPDATED_EVENT`)

---

## 8. CORE FEATURES & WORKFLOWS

### 8.1 Appointment → Session → Billing Flow

```
Customer books online (public endpoint)
    │  status: pending
    ▼
Admin confirms appointment
    │  status: confirmed
    ▼
Staff starts session (30min before appointment time)
    │  status: In Progress, billing: unbilled
    ▼
Add service lines to session (one or more)
    ├── Each line: service, staff, quantity, status
    ├── Prices auto-calculated
    └── Commissions auto-created when line completed
    │
    ▼
Complete all service lines
    │
    ▼
Apply discount (optional — amount or %)
    │
    ▼
Request payment → billing: payment_requested
    │
    ▼
Confirm payment (enter transaction code) → billing: paid
    │
    ▼
Session complete → feedback token generated → email sent to customer
```

### 8.2 Walk-in (In-House) Session Flow

```
Customer walks in without appointment
    │
    ▼
Staff creates session directly (no appointment)
    ├── customer_name, customer_phone required
    └── Links to member if they exist
    │
    ▼
Same as appointment flow from "Add service lines" above
```

### 8.3 Commission Calculation

```
gross_amount = service price
    │
    ▼
pool_amount = gross × pool_percentage (from commission_rule)
    │
    ▼
tax_amount = pool × tax_percentage
    │
    ▼
net_amount = pool - tax  ← staff payout
    │
    ▼
service_profit = gross - net  ← spa retains
```

Each service can link to a `commission_rule_id`. If null, the default rule applies.

### 8.4 Settlement Batches

```
Multiple commissions marked as "paid"
    │
    ▼
Admin creates settlement batch
    ├── Groups all paid commissions
    ├── Generates batch reference
    └── Updates commission status → "settled"
```

### 8.5 Discount System

Two independent discount mechanisms that merge:

1. **Manual discount** (applied by staff):
   - Type: `amount` (fixed) or `percent`
   - Applied after session completion
   - Cannot exceed subtotal (percent capped at 100%)

2. **Offer/promotion discount** (auto-calculated):
   - Best active offer per service line selected automatically
   - Tracked separately as `offer_discount_amount`

### 8.6 Feedback System

```
Session completed
    │
    ▼
Generate SHA-256 token, store in session_feedback table
    │
    ▼
Email customer with feedback link: /session-feedback?token=...
    │
    ▼
Customer submits rating (1-5) + optional comments
    │
    ▼
Token marked as used (prevents resubmission)
    │
    ▼
Admin views feedback in FeedbackManagementPage
    ├── Unread count
    ├── Aggregate ratings
    └── Mark as viewed
```

### 8.7 Loyalty/Membership Points

```
Bronze (< 200 points)
Silver (200–500 points)
Gold (500+ points)
```

Points are **manually adjusted** by admin — no auto-earn from spending. No redemption system exists.

### 8.8 Product Inventory

| Mode | Description |
|---|---|
| **Units** | Tracked by integer count (e.g., 50 bottles) |
| **Level** | Tracked by decimal/percentage (e.g., 3.5L remaining) |

**Product types:**
| Type | Description |
|---|---|
| **Saleable** | Retail products for direct sale |
| **Internal Use** | Consumables used during services (no auto-deduction) |

Stock actions: `restock` (+), `consumption` (-), `adjustment` (+/-)

---

## 9. BUSINESS LOGIC DEEP DIVES

### 9.1 Session Status Machine

```
                ┌─────────┐
                │ In Progress │
                └─────┬───┘
                      │ all service lines completed
                      ▼
                ┌─────────┐
                │ Finalizing  │
                └─────┬───┘
                      │
                      ├── Apply discount
                      ├── Request payment
                      │
                      ▼
                ┌─────────┐
                │ Completed   │
                └─────┬───┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
        ┌─────────┐     ┌─────────┐
        │ Voided   │     │   Paid   │
        └─────────┘     └─────────┘
```

- Cannot add services to paid sessions
- Cannot modify completed/voided sessions unless reopened
- Paid sessions cannot be voided or reopened
- Discount only allowed after completion

### 9.2 Billing Status Machine

```
unbilled → payment_requested → paid
```

- `paid` is terminal — no further modifications
- Transaction code captured at `confirm_payment`

### 9.3 Service Line Status Machine

```
pending → in_progress → completed (→ voided)
```

- Each line independent
- Commission auto-created when line → completed
- Voided lines excluded from billing totals
- Price recalculated on void

### 9.4 Appointment Status Machine

```
pending → confirmed → (auto-linked to session status)
```

- Public: anyone can create `pending` appointments
- Staff: confirm, reschedule, cancel
- Customer (via token): reschedule, cancel
- When session starts/ends, appointment status auto-syncs

### 9.5 Multi-Service Resolution

**Appointments:**
- `appointment_services` table links multiple services to one appointment
- Backward compatible: `appointments.service_id` still populated with first service

**Sessions:**
- `session_services` table links multiple services to one session
- Each line has its own staff, quantity, price, and status
- Primary service comes from session creation; additional services added later

---

## 10. MIGRATION SYSTEM

### 10.1 Runner (`migrate.php`)

```
php migrations/migrate.php                          # Safe run
php migrations/migrate.php --allow-destructive       # Allow DROP/DELETE without WHERE
php migrations/migrate.php --force-replay            # Re-run on empty DB despite existing tables
```

### 10.2 Features

- **Idempotent SQL:** All files use `IF NOT EXISTS` / `IF EXISTS` patterns
- **Checksum verification:** Detects edited migration files and warns
- **Destructive protection:** Blocks `DROP TABLE`, `TRUNCATE`, `DELETE` without `WHERE` unless `--allow-destructive`
- **Baseline mode:** If DB has tables but no migration history, records current files as "applied" without executing
- **Sorting:** Natural sort (`SORT_NATURAL`) on filenames

### 10.3 Known Migration Issues

| Issue | Detail |
|---|---|
| Duplicate 007 | Two files: `007_add_created_by_to_staffs.sql` + `007_update_services.sql` |
| Duplicate 029 | Two files: `029_add_session_billing_workflow_fields.sql` + `029_commission_rules_and_service_link.sql` |
| Redundant 030/031/032 | Three files recreating `commission_rules` table (already in 029) |
| Migration 015 destructive | Deletes ALL data in `session_services`, `appointments`, `services` |
| No transaction wrapping | `runMultiQuery()` has no rollback on partial failure |
| `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` | MySQL 8.0.16+ only |

---

## 11. EMAIL SYSTEM

### 11.1 Implementation

Custom SMTP client in `utils/AppointmentMailer.php` using raw PHP sockets (`stream_socket_client`).

### 11.2 Email Types

| Method | Trigger |
|---|---|
| `sendBookingReceived()` | Customer books appointment → sends management link |
| `sendBookingConfirmed()` | Admin confirms appointment |
| `sendSessionStarted()` | Session started |
| `sendSessionCompletedWithFeedback()` | Session completed → sends feedback link |
| `sendStaffActivationEmail()` | New staff account created |
| `sendMemberWelcomeEmail()` | Customer registered |
| `sendCommissionPaidEmail()` | Commission payout processed |

### 11.3 Fallback Behavior

- Attempts SMTP with TLS/SSL
- On any failure, falls back to PHP `mail()` function
- This means emails are sent **unencrypted** if SMTP fails

### 11.4 Configuration

```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@karehspa.co.ke
MAIL_FROM_NAME=Kareh's Spa
```

---

## 12. SECURITY MODEL & KNOWN ISSUES

### 12.1 Security Strengths

- **Prepared statements everywhere** — no trivial SQL injection
- **CORS allowlist** — only known origins accepted
- **Upload validation** — file extension, MIME type, size checked
- **bcrypt password hashing** — `password_hash()` for all passwords
- **`uploads/.htaccess`** — blocks PHP execution in uploads directory
- **Security headers** — `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`
- **`.htaccess` blocks** — `config/`, `migrations/`, `migrate.php`, `scratch_*.php`

### 12.2 Critical Vulnerabilities

| # | Issue | Impact |
|---|---|---|
| C-1 | **Weak JWT secret** (`QATECHJOSONG@FIRST`) | Token forgery, full system compromise |
| C-2 | **No row-level authorization (IDOR)** | Any staff can view/modify ANY record |
| C-3 | **No rate limiting** | Brute-force, spam, DoS |
| C-4 | **`.env` not blocked by `.htaccess`** | DB creds, JWT secret, SMTP creds exposed |
| C-5 | **Plaintext password fallback** in staff login | Privilege escalation via legacy passwords |
| C-6 | **SMTP credentials in base64** + TLS fallback to `mail()` | Credential interception |
| C-7 | **Activation password sent in plaintext via email** | Staff account compromise |
| C-8 | **No audit logging** | Zero forensic capability |

### 12.3 High Vulnerabilities

| # | Issue |
|---|---|
| H-1 | Public appointment creation (no CAPTCHA) |
| H-2 | Session status accepted from user input (no allowlist) |
| H-3 | Token-based management links in URL query string |
| H-4 | No token revocation/blacklist |
| H-5 | Weak password policy (6-char minimum) |
| H-6 | Internal error messages leaked to API responses |

---

## 13. PENDING WORK & TECH DEBT

### 13.1 Security (immediate)

- [ ] Rotate JWT secret to cryptographically random 256-bit key
- [ ] Add `.env` to `.htaccess` block rules
- [ ] Implement rate limiting (especially on auth endpoints)
- [ ] Add row-level authorization checks to all models
- [ ] Add audit logging for all mutations
- [ ] Remove plaintext password fallback in staff login
- [ ] Implement token blacklist/revocation
- [ ] Enforce strong password policy (8+ chars, complexity)

### 13.2 Features (not implemented at all)

- [ ] Recurring appointments
- [ ] Multi-branch support
- [ ] Supplier/vendor management
- [ ] Purchase orders
- [ ] Tax configuration per service/product
- [ ] Staff leave request/approval
- [ ] Payment gateway integration (M-Pesa, Stripe) — PesaPal is partially wired

### 13.3 Feature Enhancements (partially implemented)

- [ ] **Sessions:** Row-level locking for financial operations
- [ ] **Audit log:** UI for browsing/searching audit logs
- [ ] **Rewards:** Admin CRUD UI for rewards management
- [ ] **Customer self-service:** Forgot password flow, full profile editing from member portal

### 13.4 Recently Implemented (2026-06)

The following features were previously listed as pending and are now complete:

- **Invoice/Receipt PDF generation** — jsPDF-based invoice download from receipt modal and sessions page
- **SMS notifications** — via SmsSender utility, triggered on payment, appointment creation
- **Customer profile editing** — Edit Member modal on admin MembersManagementPage
- **Calendar/grid view for appointments** — FullCalendar integration on AppointmentsManagementPage
- **Time-slot availability / conflict detection** — Available slots on BookingPage, HTTP 409 on conflicts
- **Product auto-consumption during sessions** — service_products linking table, consumeStock on payment
- **Reward redemption (points spending)** — rewards + redemptions tables, catalog + redeem UI on MemberPointsPage
- **Analytics CSV/PDF export** — Client-side exportAnalytics utility with both formats
- **Per-staff commission rate overrides** — commission_rate column on staffs, checked by Commission model
- **Loyalty auto-earn from spending** — Points awarded on session payment via Member::adjustPoints()
- **Admin/Staff profile page** — Editable profile at /admin/profile with image upload
- **Activity log display UI** — /admin/activity-logs route and page existing

### 13.5 Tech Debt

- [ ] Consolidate migrations 029/030/031/032 into one
- [ ] Drop legacy `staff` table
- [ ] Deprecate `sessions.service_id`, `appointments.service_id`, `services.category`, `products.stock_quantity`
- [ ] Remove runtime table-existence checks (`sessionHasOfferDiscountColumn()`, `hasAppointmentServicesTable()`)
- [ ] Rename duplicate-prefix migration files (`007a_`/`007b_`, `029a_`/`029b_`)
- [ ] Add missing indexes (status, date columns across 8+ tables)
- [ ] Add foreign key on `staffs.created_by`
- [ ] Add CHECK constraints on `session_feedback` ratings (1-5)
- [ ] Add global exception handler
- [ ] Remove redundant `any` types in frontend, add proper interfaces
- [ ] Extract shared patterns to custom hooks (`useMemberUser()`, etc.)
- [ ] Replace polling with push-based updates in Sessions page
- [ ] Add proper 404 page

---

## 14. CONVENTIONS & PATTERNS

### 14.1 Backend Patterns

- **File naming:** Lowercase with underscores (`appointment_manage.php`)
- **Class naming:** PascalCase (`AppointmentController`, `Session`)
- **Method naming:** camelCase (`getAll()`, `getById()`, `createOrUpdate()`)
- **Routing:** Manual — each `api/*.php` file handles its own routing via `$method` + `$id`
- **Auth:** Each API file decides auth at the top before calling controller
- **Input:** `BaseController::getPostData()` for unified JSON + `$_POST` parsing
- **Response:** `Response::json()` or `Response::error()` everywhere
- **SQL:** Prepared statements with `bind_param()`, transactions for financial ops
- **Error handling:** Models return `false` or `null` on error; controllers check and call `Response::error()`

### 14.2 Frontend Patterns

- **File naming:** PascalCase for components (`AdminDashboard.tsx`)
- **API modules:** Named exports with `Api` suffix (`appointmentsApi`, `sessionsApi`)
- **Storage:** JWT in `localStorage` (keys: `token`, `admin_token`, `member_user`, `admin_user`)
- **Routing:** React Router v7 with nested routes, lazy-loaded `AdminLayout` and `MemberLayout`
- **Modals:** Shared `AdminModal` component with `onClose`, `title`, `children` props
- **Tables:** Shared `AdminTable` component with pagination, sorting, loading state
- **API calls:** Axios instance with auth interceptor, per-module API functions
- **Error handling:** Modal-based feedback via `FeedbackModal` / `SuccessModal`

### 14.3 Database Naming

- **Tables:** Lowercase, plural (`appointments`, `session_services`, `staffs`)
- **Columns:** Lowercase, snake_case (`appointment_date`, `billing_status`)
- **FK columns:** `{referenced_table_singular}_id` (`service_id`, `staff_id`)
- **Junction tables:** `{table1}_{table2}` (`appointment_services`, `service_offer_services`)

### 14.4 API URL Conventions

- Base: `https://karehspa.co.ke/api/`
- Resource endpoints: `/api/{resource}.php` (e.g., `/api/appointments.php`)
- Sub-resources: `/api/{resource}.php?action={action}` (e.g., `/api/sessions.php?action=start`)
- Auth endpoints: `/api/auth/{action}.php` (e.g., `/api/auth/login.php`)

### 14.5 Making Changes

**Backend:**
1. Add migration file in `php_backend/migrations/sql/` (follow `NNN_description.sql` naming)
2. Run `php php_backend/migrations/migrate.php` to apply
3. If model changes needed, update the corresponding model file
4. If new API endpoint, create `api/{name}.php` + controller + model files

**Frontend:**
1. If new API call, add function to existing or new `src/api/{module}.ts`
2. If new page, add to `src/pages/` and register route in `App.tsx`
3. Update `adminAccess.ts` if new role-based permissions needed

**Never:**
- Edit an already-applied migration file — create a new one
- Hard-delete data without a backup
- Store secrets in tracked files
- Skip prepared statements for SQL queries
