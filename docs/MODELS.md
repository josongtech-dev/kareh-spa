# BACKEND MODELS & CONTROLLERS REFERENCE

> Quick reference for the PHP backend data layer. For full system context, see `SYSTEM.md`.

---

## MODEL HIERARCHY

```
BaseModel (getAll, getById, delete)
  ├── Appointment
  ├── Session          ← largest (1069 lines)
  ├── Service
  ├── Staff
  ├── Member
  ├── Product
  ├── Offer
  ├── Expense
  ├── Commission       ← 954 lines
  ├── CommissionRule
  └── SystemSetting
```

All models extend `BaseModel` and receive `$db` (MySQLi) in constructor.

---

## MODEL: Appointment (`models/Appointment.php`)

| Method | Description |
|---|---|
| `getAll()` | All appointments with service/staff names |
| `getById($id)` | Single appointment with joins |
| `create($data)` | Creates appointment + `appointment_services` lines + generates management token + sends email |
| `update($id, $data)` | Updates appointment + service lines |
| `delete($id)` | Hard delete |
| `getByToken($token)` | Lookup by management token (for guest self-service) |
| `updateByToken($token, $data)` | Update by token (reschedule/cancel) |
| `getAppointmentCodes()` | Generate auto-incrementing codes (`APT-001`) |
| `hasAppointmentServicesTable()` | Runtime check if `appointment_services` table exists |

**Status values:** `pending`, `confirmed`, `completed`, `cancelled`, `no_show`

---

## MODEL: Session (`models/Session.php`) — 1069 lines

The most complex model. Covers the entire service delivery lifecycle.

| Method | Description |
|---|---|
| `getAll($filters)` | List with joins, filtering by status/date/staff |
| `getById($id)` | Single session with service lines |
| `create($data)` | Creates session + primary service line + links to appointment if applicable |
| `startSession($appointmentId)` | Start from appointment (status check, 30min window enforcement) |
| `addServiceToSession($sessionId, $data)` | Add service line (cannot add to paid/completed sessions) |
| `removeServiceFromSession($sessionId, $lineId)` | Remove service line + recalculate billing |
| `updateServiceLineStatus($lineId, $status)` | Update line status + auto-create commission on complete + recalc billing |
| `canCloseSession($sessionId)` | Validate all lines completed + feedback token created |
| `closeSession($sessionId)` | Mark Completed + send feedback email |
| `applyBillingDiscount($sessionId, $type, $value)` | Apply discount (amount or %, after completion) |
| `requestPayment($sessionId)` | Set billing → `payment_requested` |
| `confirmPayment($sessionId, $trxCode)` | Set billing → `paid`, terminal state |
| `recalculateSessionAmounts($sessionId)` | Recalc totals from non-voided service lines |
| `getSessionServiceProgress($sessionId)` | Count completed/pending/total lines |
| `createOrRefreshFeedbackToken($sessionId)` | SHA-256 token for feedback |

**Status values:** `In Progress`, `Finalizing`, `Completed`, `Voided`
**Billing values:** `unbilled`, `payment_requested`, `paid`

---

## MODEL: Service (`models/Service.php`)

| Method | Description |
|---|---|
| `getAll()` | All services with category + commission rule joins (has fallback for missing tables) |
| `getById($id)` | Single service |
| `create($data)` | Create with image upload |
| `update($id, $data)` | Update with optional new image |
| `delete($id)` | Hard delete |
| `getCategories()` | List categories (has fallback to legacy `category` column) |
| `stripServiceCommissionFields($services, $role)` | Remove commission rule data for non-owner roles |

---

## MODEL: Staff (`models/Staff.php`)

| Method | Description |
|---|---|
| `getAll()` | All staff |
| `getById($id)` | Single staff |
| `create($data)` | Create with activation password + duplicate validation |
| `update($id, $data)` | Update profile/role/status |
| `delete($id)` | Hard delete |
| `findByIdentifier($value)` | Find by username, email, phone, or ID number |
| `verifyPassword($staff, $password)` | Verify bcrypt or legacy plaintext password |
| `resetPassword($id, $newPassword)` | Hash + update password, clear force_reset |
| `getActiveAttendants()` | Staff with role=attendant and status=Active |

**Roles:** `owner`, `manager`, `receptionist`, `attendant`
**Status values:** `Active`, `Inactive`, `Suspended`

---

## MODEL: Member (`models/Member.php`)

| Method | Description |
|---|---|
| `getAll()` | All members |
| `getById($id)` | Single member |
| `create($data)` | Create from user or standalone |
| `update($id, $data)` | Update member |
| `delete($id)` | Hard delete |
| `adjustPoints($id, $points)` | Add/subtract points + auto-recalculate tier |
| `recalculateTier($pointsBalance)` | Bronze (<200), Silver (200-500), Gold (500+) |

---

## MODEL: Product (`models/Product.php`)

| Method | Description |
|---|---|
| `getAll()` | All products with auto-calculated status |
| `getById($id)` | Single product |
| `create($data)` | Create product |
| `update($id, $data)` | Update product |
| `delete($id)` | Hard delete |
| `restock($id, $quantity)` | Add stock + record movement |
| `consume($id, $quantity)` | Remove stock + record movement |
| `addStockMovement($data)` | Audit trail entry |
| `getStockMovements($productId, $limit)` | Movement history |
| `getVelocitySummary($limit)` | Consumption rate over time |
| `getCostSummary()` | Total consumption/restock costs |
| `getLowStockProducts()` | Products below reorder level |

**Product types:** `Saleable`, `Internal Use`
**Tracking modes:** `Units` (integer), `Level` (decimal)
**Auto-status:** Calculated from quantity vs reorder_level

---

## MODEL: Offer (`models/Offer.php`)

| Method | Description |
|---|---|
| `getAll()` | All offers (role-based: active only for non-managers) |
| `getById($id)` | Single offer with linked services |
| `create($data)` | Create offer + link services |
| `update($id, $data)` | Update offer + relink services |
| `delete($id)` | Hard delete |
| `getActiveOffersByServiceId($serviceId)` | Active offers for a specific service |

---

## MODEL: Expense (`models/Expense.php`)

| Method | Description |
|---|---|
| `getAll()` | All expenses |
| `getById($id)` | Single expense |
| `create($data)` | Create expense (pending status) |
| `update($id, $data)` | Update expense |
| `delete($id)` | Hard delete (role-checked) |
| `confirm($id, $confirmedBy)` | Set status → confirmed |

---

## MODEL: Commission (`models/Commission.php`) — 954 lines

| Method | Description |
|---|---|
| `getAll($filters)` | List with joins, filtering |
| `getById($id)` | Single commission with service details |
| `createFromSessionService($data)` | Auto-create commission when service line completed |
| `getPendingCommissions()` | Unpaid commissions |
| `getCommissionSummaryByStaff($staffId, $period)` | Aggregated by staff with period filtering |
| `getTotalMonthSettlementForStaff($staffId, $year, $month)` | Monthly total |
| `createSettlementBatch($data)` | Group paid commissions into batch |
| `getSettlementBatches()` | All batches |

**Commission calculation formula:**
```
gross × pool_pct = pool_amount
pool × tax_pct = tax_amount
pool - tax = net_amount  (staff payout)
gross - net = service_profit  (spa retains)
```

---

## MODEL: CommissionRule (`models/CommissionRule.php`)

| Method | Description |
|---|---|
| `getAll()` | All rules |
| `getById($id)` | Single rule |
| `getDefaultRule()` | Rule where `is_default = 1` |
| `create($data)` | Create rule (validation: tax_pct ≤ pool_pct) |
| `update($id, $data)` | Update rule |
| `delete($id)` | Delete (blocked if services reference it) |

---

## MODEL: SystemSetting (`models/SystemSetting.php`)

| Method | Description |
|---|---|
| `getAll()` | All settings |
| `get($key)` | Single setting by key |
| `set($key, $value)` | Upsert setting |
| `getValue($key, $default)` | Typed value (supports string, number, boolean, JSON) |

---

## CONTROLLER REFERENCE

| Controller | handleRequest() Logic |
|---|---|
| `AppointmentController` | GET → list/detail; POST → create; PUT → update; DELETE → delete |
| `AppointmentManageController` | GET → lookup by token; POST → update by token |
| `SessionController` | GET → list/detail; POST → create or sub-action; PUT → update; DELETE → delete |
| `SessionFeedbackController` | GET → check token; POST → submit feedback |
| `ServiceController` | GET → list/detail; POST → create; PUT → update; DELETE → delete |
| `StaffController` | GET → list/detail; POST → create; PUT → update; DELETE → delete |
| `MemberController` | GET → list/detail; POST → create; PUT → update; DELETE → delete |
| `ProductController` | GET → list/detail; POST → create or restock/consume; PUT → update; DELETE → delete |
| `OfferController` | GET → list/detail; POST → create; PUT → update; DELETE → delete |
| `ExpenseController` | GET → list/detail; POST → create; PUT → update or confirm; DELETE → delete |
| `CommissionController` | GET → list or sub-action; POST → settle |
| `CommissionRuleController` | GET → list/detail; POST → create; PUT → update; DELETE → delete |
| `SystemSettingController` | GET → all settings; POST → bulk update |

All controllers call `BaseController::getPostData()` for unified JSON + `$_POST` parsing.

---

## COMMON PATTERNS

### Input parsing
```php
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) { $data = $_POST; }
```

### Response
```php
Response::json($data);           // { "status": "success", "data": ... }
Response::error("message", 400); // { "status": "error", "message": "..." }
```

### Auth
```php
AuthMiddleware::requireAuth(['owner', 'manager']);
AuthMiddleware::getOptionalAuthRole();  // returns role or null
```

### Transactions
```php
$this->conn->begin_transaction();
// queries...
$this->conn->commit();  // or $this->conn->rollback();
```

### SQL with prepared statements
```php
$stmt = $this->conn->prepare("SELECT * FROM services WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
```
