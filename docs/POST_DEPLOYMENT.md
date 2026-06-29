# Post-Deployment Roadmap

## Immediate Attention (next sprint)

| Issue | Impact | Fix |
|-------|--------|-----|
| No CAPTCHA on public booking/registration | Bot submissions, spam | Add Google reCAPTCHA v3 to BookingPage + RegisterPage |
| Weak password policy (6-char minimum) | Weak account security | Enforce 8+ chars with complexity in auth endpoints + frontend validation |
| Forgot password flow non-functional | Customer cannot self-recover accounts | Wire member-forgot-password.php + reset flow end-to-end |
| Rewards have no admin CRUD UI | Staff must use raw API calls | Create RewardsManagementPage in admin with create/edit/delete/stock tracking |
| Dashboard dead action buttons | Confusing UX | Wire onClick handlers or remove buttons |

## Medium Priority

| Issue | Impact | Fix |
|-------|--------|-----|
| No 404 page | Poor UX on unknown routes | Create NotFoundPage for admin routes too |
| `window.location.href` used in some places | Breaks SPA navigation | Replace with `useNavigate()` |
| No loading skeletons | Blank screen during fetches | Add skeleton placeholders for tables/cards |
| 2-second polling on Sessions page | Unnecessary network traffic | Replace with event-driven or WebSocket push |

## Future Enhancement

| Issue | Impact | Fix |
|-------|--------|-----|
| `any` types everywhere | No type safety | Add proper TypeScript interfaces to all API modules |
| Tokens in localStorage | XSS-vulnerable | Migrate to httpOnly cookies |
| 401 clears ALL tokens (no isolation) | Logs both sessions out on one expiry | Separate member/staff token storage + interceptor |
| No token expiry check in route guards | Stale UI state | Check JWT `exp` claim client-side before rendering |
| Row-level locking on financial ops | Race condition risk on concurrent payments | Add `SELECT ... FOR UPDATE` in Session paySession |
| Recurring appointments | Missing feature | Schema + calendar recurrence UI |
| Multi-branch support | Missing feature | Out of current scope |
