# Security Deployment Checklist

## 1) Configure secrets via environment
- Create backend environment values from `php_backend/.env.example`:
  - `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - `APP_KEY` (long random secret)
  - `APP_ALLOWED_ORIGINS` (comma-separated trusted frontend origins)
  - `APP_ALLOW_LEGACY_TOKENS=false` in production
- Create frontend build env values from `frontend/.env.example`:
  - `VITE_API_BASE_URL`
  - `VITE_BACKEND_BASE_URL`

## 2) Apache/XAMPP hardening
- Keep `php_backend/.htaccess` enabled to block direct access to `config/` and `migrations/`.
- Keep `php_backend/uploads/.htaccess` enabled to disable script execution.
- Disable directory listing for the site.
- Enforce HTTPS at virtual host/reverse proxy level.

## 3) Authentication and session policy
- Use only signed bearer tokens issued by backend auth endpoints.
- Keep `APP_KEY` private and rotate it if leaked.
- Do not trust frontend role checks for security decisions; backend role checks are authoritative.

## 4) Production operational checks
- Ensure database user has least privileges required for the app.
- Confirm CORS accepts only trusted origins.
- Verify protected APIs return `401/403` without valid token.
- Confirm no credentials are hardcoded in tracked files.

## 5) Pre-go-live smoke tests
- Member login and booking flow.
- Admin login and CRUD flows (staff, members, products, sessions, commissions).
- File upload rejects invalid extension/MIME and files larger than 5MB.
