# FRONTEND REFERENCE

> Quick reference for the React SPA. For full system context, see `SYSTEM.md`.

---

## TECH STACK

| Library | Version | Purpose |
|---|---|---|
| React | 19.0.0 | UI framework |
| react-router-dom | 7.1.0 | Client-side routing |
| Bootstrap 5 | 5.3.3 | CSS framework |
| react-bootstrap | 2.10.7 | Bootstrap React components |
| axios | 1.7.9 | HTTP client |
| framer-motion | 12.4.0 | Animations |
| chart.js + react-chartjs-2 | 4.4.7 / 5.3.0 | Charts |
| sweetalert2 | 11.17.2 | Alert dialogs |
| react-helmet-async | 2.0.5 | Document head |
| TypeScript | 5.7 | Type safety |
| Vite | 6.0 | Build tool |

---

## DIRECTORY STRUCTURE

```
frontend/src/
├── main.tsx                  ← Entry point
├── App.tsx                   ← Router with route guards
├── adminAccess.ts            ← Role definitions & permission helpers
├── adminReporting.ts         ← Analytics utilities
├── api/                      ← 18 API client modules (one per resource)
│   ├── axiosInstance.ts      ← Axios + auth interceptor
│   ├── config.ts             ← API base URL
│   ├── invoice.ts            ← Invoice data + API
│   ├── rewards.ts            ← Loyalty rewards + redemption
│   └── *.ts                  ← Per-resource API functions
├── components/               ← Shared UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── BrandedLoader.tsx
│   ├── MediaLightbox.tsx
│   ├── ServiceImageThumb.tsx
│   └── admin/
│       ├── AdminModal.tsx
│       ├── AdminTable.tsx
│       ├── ConfirmModal.tsx
│       ├── FeedbackModal.tsx
│       └── SuccessModal.tsx
├── pages/                    ← Route page components (29)
│   ├── HomePage.tsx          ← /
│   ├── AboutPage.tsx         ← /about
│   ├── ServicesPage.tsx      ← /services
│   ├── GalleryPage.tsx       ← /gallery
│   ├── BookingPage.tsx       ← /book (includes availability slot picker)
│   ├── ManageAppointmentPage.tsx  ← /manage-appointment?token=
│   ├── SessionFeedbackPage.tsx    ← /session-feedback?token=
│   ├── RegisterPage.tsx      ← /register
│   ├── UserLoginPage.tsx     ← /login
│   ├── member/               ← /member/* (5 pages)
│   └── admin/                ← /admin/* (17 pages incl. ProfilePage)
└── assets/                   ← Media files
```

---

## ROUTE MAP

### Public (`/`)
| Path | Page | Description |
|---|---|---|
| `/` | HomePage | Landing page |
| `/about` | AboutPage | About us |
| `/services` | ServicesPage | Service catalog |
| `/gallery` | GalleryPage | Photo/video |
| `/book` | BookingPage | Book appointment |
| `/manage-appointment` | ManageAppointmentPage | Token-based management |
| `/session-feedback` | SessionFeedbackPage | Token-based feedback |

### Auth (`/`)
| Path | Page | Description |
|---|---|---|
| `/login` | UserLoginPage | Customer login |
| `/register` | RegisterPage | Customer reg |

### Member (`/member/*`)
| Path | Page | Role |
|---|---|---|
| `/member/dashboard` | MemberDashboardPage | Customer |
| `/member/services` | MemberServicesPage | Customer |
| `/member/history` | MemberHistoryPage | Customer |
| `/member/points` | MemberPointsPage | Customer |
| `/member/offers` | MemberOffersPage | Customer |

### Admin (`/admin/*`)
| Path | Page | Min Role |
|---|---|---|
| `/admin/login` | AdminLoginPage | Public |
| `/admin/reset-password` | AdminResetPasswordPage | Reset token |
| `/admin/dashboard` | AdminDashboard | All staff |
| `/admin/appointments` | AppointmentsManagementPage | All staff |
| `/admin/sessions` | SessionsManagementPage | All staff |
| `/admin/services` | ServicesManagementPage | Owner, Manager |
| `/admin/staff` | StaffManagementPage | Owner, Manager |
| `/admin/members` | MembersManagementPage | Owner, Manager |
| `/admin/products` | ProductsManagementPage | Owner, Manager |
| `/admin/offers` | OffersManagementPage | Owner, Manager |
| `/admin/expenses` | ExpensesManagementPage | Owner, Manager |
| `/admin/commissions` | CommissionsManagementPage | Owner, Manager |
| `/admin/feedback` | FeedbackManagementPage | Owner, Manager |
| `/admin/settings` | SettingsPage | Owner |
| `/admin/analytics` | AnalyticsPage | Owner, Manager |
| `/admin/profile` | ProfilePage | All staff |
| `/admin/add-admin` | AddAdminPage | Owner |

---

## AUTH INTERCEPTOR (`api/axiosInstance.ts`)

```typescript
// Request interceptor: attaches Bearer token
const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
config.headers.Authorization = `Bearer ${token}`;

// Response interceptor: on 401/403, clears ALL tokens
if (status === 401 || status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('member_user');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
}
```

---

## STORAGE KEYS

| Key | Type | Purpose |
|---|---|---|
| `token` | string | Customer JWT |
| `member_user` | JSON | Customer user object |
| `admin_token` | string | Staff JWT |
| `admin_user` | JSON | Staff user object |

---

## SHARED COMPONENTS

### AdminModal
```tsx
<AdminModal show={show} onClose={handleClose} title="Modal Title">
  {/* children */}
</AdminModal>
```
Features: backdrop click to close, header with close button, body with `p-4 p-md-5` padding.

### AdminTable
```tsx
<AdminTable
  columns={columns}        // { key: string, label: string }[]
  data={rows}
  loading={isLoading}
  renderRow={(row) => ...}
  onPageChange={(p) => ...}
/>
```
Features: pagination, loading spinner, "No records found" empty state.

### ConfirmModal / FeedbackModal / SuccessModal
```
ConfirmModal  → "Are you sure?" with confirm/cancel callbacks
FeedbackModal → Error/success messages
SuccessModal  → Success checkmark overlay
```

---

## API MODULE PATTERN

All API modules follow this pattern:

```typescript
// src/api/sessions.ts
import api from './axiosInstance';

export const sessionsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/sessions.php', { params }),

  getById: (id: number) =>
    api.get(`/sessions.php?id=${id}`),

  create: (data: any) =>
    api.post('/sessions.php', data),

  update: (id: number, data: any) =>
    api.put(`/sessions.php?id=${id}`, data),

  delete: (id: number) =>
    api.delete(`/sessions.php?id=${id}`),
};
```

**Known pattern:** Most modules lack typed interfaces — returns `any`.
**Notable exceptions:** `commissionRules.ts`, `dashboard.ts`, `invoice.ts`, `rewards.ts`

---

## ROLE-BASED ACCESS CONTROL (`adminAccess.ts`)

```typescript
type AdminRole = 'owner' | 'manager' | 'receptionist' | 'attendant' | 'unknown';

canManageServices(role)      → owner, manager
canManageOffers(role)        → owner, manager
canAddOrEditProducts(role)   → owner, manager, receptionist
canDeleteProducts(role)      → owner, manager
canSeeCommissions(role)      → owner, manager, attendant
canSeeAnalytics(role)        → owner, manager
canAccessExpenses(role)      → owner, manager, receptionist
canFullyManageExpenses(role) → owner, manager
```

**Usage in pages:**

```tsx
const role = getCurrentAdminRole();
if (!canManageServices(role)) return <Navigate to="/admin/dashboard" />;
```

---

## ROUTE GUARDS (`App.tsx`)

| Guard | Logic |
|---|---|
| `MemberProtectedRoute` | Checks `token` + `member_user` in localStorage |
| `AdminProtectedRoute` | Checks `admin_token` + `admin_user` |
| `RoleProtectedRoute` | Admin check + `canAccess` prop → redirect to `/admin/dashboard` |

**Known gap:** No token expiry validation — stale tokens still pass the guard until the first API 401.

---

## CROSS-COMPONENT COMMUNICATION

Uses custom window events (fragile pattern):

```typescript
// Fire event
window.dispatchEvent(new CustomEvent('SERVICE_CATALOG_UPDATED_EVENT'));

// Listen
window.addEventListener('SERVICE_CATALOG_UPDATED_EVENT', handler);
```

---

## KNOWN FRONTEND ISSUES

| Issue | Severity |
|---|---|
| No token expiry validation in route guards | High |
| `any` types everywhere — minimal TS safety | High |
| Token/user data in localStorage (XSS-vulnerable) | High |
| 401 clears ALL tokens (no isolation) | High |
| Products page silently swallows API errors | High |
| No 404 page (unrecognized routes → HomePage) | Medium |
| 2-second polling for service catalog in Sessions page | Medium |
| Duplicated service selection UI across Booking + Appointments | Medium |
| No loading skeletons for data fetches | Medium |
| "Remember Me" and "Forgot Password" are non-functional | Medium |
| `window.location.href` used instead of `useNavigate` in some places | Medium |
| No Escape key handler / focus trap in AdminModal | Medium |
