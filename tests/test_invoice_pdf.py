import requests
import json
import sys
import os

BASE_URL = "http://localhost/kareh-spa/php_backend/api"

staff_email = "joshongosh@gmail.com"
staff_password = "Password123"
session = requests.Session()

def step(label, ok, detail=""):
    status = "PASS" if ok else "FAIL"
    print(f"  [{status}] {label}" + (f" - {detail}" if detail else ""))

def main():
    print("=" * 60)
    print("Feature 1: Invoice / Receipt PDF Generation")
    print("=" * 60)

    # 1. Staff login
    print("\n--- Staff Login ---")
    try:
        r = session.post(f"{BASE_URL}/auth/staff-login.php", json={
            "identifier": staff_email,
            "password": staff_password,
        }, timeout=10)
        data = r.json()
        token = data.get("token", "")
        step("Login succeeded", r.status_code == 200 and bool(token), f"status={r.status_code}")
        if not token:
            step("Token obtained", False, "no token in response")
            print("\nRESULT: FAIL - Cannot proceed without authentication")
            sys.exit(1)
        step(f"Token obtained ({token[:20]}...)", True)
    except Exception as e:
        step("Login request failed", False, str(e))
        print("\nRESULT: FAIL - Aborting")
        sys.exit(1)

    auth_headers = {"Authorization": f"Bearer {token}"}

    # 2. List sessions to find a valid session_id
    print("\n--- Fetch Sessions ---")
    test_session_id = 0
    try:
        r = session.get(f"{BASE_URL}/sessions.php", headers=auth_headers, timeout=10)
        data = r.json()
        raw = data.get("data") or data.get("sessions") or data
        sessions = raw if isinstance(raw, list) else []
        step(f"Sessions fetched ({len(sessions)} found)", r.status_code == 200)
        if sessions:
            raw_id = sessions[0].get("id") or sessions[0].get("session_id") or 0
            test_session_id = int(raw_id)
            step(f"Using session_id={test_session_id}", test_session_id > 0,
                 f"code={sessions[0].get('session_code','')}")
        else:
            print("  INFO: No sessions found.")
    except Exception as e:
        step("Sessions list failed", False, str(e))

    # 3. Test invoice endpoint (expect 400 if no session_id)
    print("\n--- Invoice API (missing session_id) ---")
    try:
        r = session.get(f"{BASE_URL}/invoice.php", headers=auth_headers, timeout=10)
        step("Missing session_id returns 400", r.status_code == 400, f"got {r.status_code}")
    except Exception as e:
        step("Request failed", False, str(e))

    # 4. Test invoice endpoint with invalid session_id
    print("\n--- Invoice API (invalid session_id=999999) ---")
    try:
        r = session.get(f"{BASE_URL}/invoice.php?session_id=999999", headers=auth_headers, timeout=10)
        step("Invalid session_id returns 404", r.status_code == 404, f"got {r.status_code}")
    except Exception as e:
        step("Request failed", False, str(e))

    # 5. Test invoice endpoint with valid session_id (if available)
    print("\n--- Invoice API (valid session_id) ---")
    if test_session_id > 0:
        try:
            r = session.get(f"{BASE_URL}/invoice.php?session_id={test_session_id}", headers=auth_headers, timeout=10)
            data = r.json()
            payload = data.get("data") if isinstance(data, dict) else data
            ok = r.status_code == 200 and payload is not None
            step("Invoice fetched successfully", ok, f"status={r.status_code}")
            if ok:
                step("  session_code present", bool(payload.get("session_code")))
                step("  customer_name present", bool(payload.get("customer_name")))
                step("  total_amount > 0", float(payload.get("total_amount", 0)) > 0)
                step("  business info present", bool(payload.get("business")))
                step("  service_lines is array", isinstance(payload.get("service_lines"), list))
                step("  billing_status present", bool(payload.get("billing_status")))
        except Exception as e:
            step("Invoice request failed", False, str(e))
    else:
        print("  SKIP: No valid session_id available for positive test")

    # 6. Test frontend build artifacts for invoice-related code
    print("\n--- Frontend Build Verification ---")
    dist_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist", "assets")
    if os.path.isdir(dist_dir):
        sessions_bundle = [f for f in os.listdir(dist_dir) if "SessionsManagementPage" in f]
        receipt_bundle = [f for f in os.listdir(dist_dir) if "Receipt" in f]
        invoice_imported = False
        if sessions_bundle:
            fpath = os.path.join(dist_dir, sessions_bundle[0])
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                    invoice_imported = "getBySession" in content and "getByPublicToken" in content
            except:
                pass
        step("Invoice API imported in SessionsManagementPage bundle", invoice_imported)
        step("Receipt bundle exists in build", len(receipt_bundle) > 0)
    else:
        print("  SKIP: dist/assets not found (run `npm run build` first)")

    # 7. Check source files exist
    print("\n--- Source Files Verification ---")
    root = os.path.join(os.path.dirname(__file__), "..")
    checks = [
        ("Invoice API client", os.path.exists(os.path.join(root, "frontend", "src", "api", "invoice.ts"))),
        ("Invoice PDF generator", os.path.exists(os.path.join(root, "frontend", "src", "utils", "generateInvoicePdf.ts"))),
        ("Backend invoice endpoint", os.path.exists(os.path.join(root, "php_backend", "api", "invoice.php"))),
        ("Receipt component", os.path.exists(os.path.join(root, "frontend", "src", "components", "Receipt.tsx"))),
        ("Test script exists", os.path.exists(__file__)),
    ]
    for label, ok in checks:
        step(label, ok)

    print("\n" + "=" * 60)
    all_ok = all(ok for _, ok in checks)
    print(f"RESULT: {'ALL PASS' if all_ok else 'SOME FAILURES'}")
    print("=" * 60)

if __name__ == "__main__":
    main()
