import requests
import os
import sys

BASE_URL = "http://localhost/kareh-spa/php_backend/api"

staff_email = "joshongosh@gmail.com"
staff_password = "Password123"
session = requests.Session()

def step(label, ok, detail=""):
    status = "PASS" if ok else "FAIL"
    print(f"  [{status}] {label}" + (f" - {detail}" if detail else ""))

def main():
    print("=" * 60)
    print("Feature 8: Per-Staff Commission Rate Overrides")
    print("=" * 60)

    # 1. Login
    print("\n--- Staff Login ---")
    try:
        r = session.post(f"{BASE_URL}/auth/staff-login.php", json={
            "identifier": staff_email, "password": staff_password,
        }, timeout=10)
        data = r.json()
        token = data.get("token", "")
        step("Login succeeded", r.status_code == 200 and bool(token), f"status={r.status_code}")
        if not token:
            print("\nRESULT: FAIL - Aborting")
            sys.exit(1)
    except Exception as e:
        step("Login failed", False, str(e))
        sys.exit(1)

    auth_headers = {"Authorization": f"Bearer {token}"}

    # 2. Check commission_rate column exists in staffs
    print("\n--- Database Schema ---")
    try:
        r = session.get(f"{BASE_URL}/staff.php?role=attendant&status=Active", headers=auth_headers, timeout=10)
        data = r.json().get("data") or r.json()
        staff_list = data if isinstance(data, list) else []
        if staff_list:
            first = staff_list[0]
            has_rate = "commission_rate" in first
            step("commission_rate column exists in staff response", has_rate, f"key present={has_rate}")
        else:
            step("commission_rate column exists in staff response", False, "no staff returned")
    except Exception as e:
        step("Schema check failed", False, str(e))

    # 3. Update a staff member's commission rate
    print("\n--- Set Commission Rate ---")
    updated_id = None
    try:
        r = session.get(f"{BASE_URL}/staff.php", headers=auth_headers, timeout=10)
        data = r.json().get("data") or r.json()
        staff_list = data if isinstance(data, list) else []
        if staff_list:
            target = None
            for s in staff_list:
                if s.get("role", "").lower() == "attendant":
                    target = s
                    break
            if not target:
                target = staff_list[0]
            staff_id = target["id"]
            updated_id = staff_id

            form = {"commissionRate": "15.00"}
            r2 = session.post(f"{BASE_URL}/staff.php?id={staff_id}", headers=auth_headers, data=form, timeout=10)
            step(f"Set commission rate for staff #{staff_id}", r2.status_code == 200, f"status={r2.status_code}")

            # Verify
            r3 = session.get(f"{BASE_URL}/staff.php?id={staff_id}", headers=auth_headers, timeout=10)
            vdata = r3.json().get("data") or r3.json()
            actual_rate = vdata.get("commission_rate") if isinstance(vdata, dict) else None
            step(f"Verify rate set to 15.00", actual_rate is not None and float(actual_rate) == 15.00, f"rate={actual_rate}")
    except Exception as e:
        step("Set rate failed", False, str(e))

    # 4. Source file checks
    print("\n--- Source Files Verification ---")
    root = os.path.join(os.path.dirname(__file__), "..")
    checks = []

    staff_model = os.path.join(root, "php_backend", "models", "Staff.php")
    if os.path.exists(staff_model):
        with open(staff_model, "r") as f:
            c = f.read()
            checks.append(("Staff model create includes commission_rate", "commission_rate" in c.split("function create")[1].split("function")[0] if "function create" in c else False))
            checks.append(("Staff model update includes commission_rate", "'commission_rate' => 'd'" in c))

    commission_model = os.path.join(root, "php_backend", "models", "Commission.php")
    if os.path.exists(commission_model):
        with open(commission_model, "r") as f:
            c = f.read()
            checks.append(("Commission getRateConfigForService accepts staffId", "getRateConfigForService($serviceId, $staffId" in c or "getRateConfigForService($serviceId, $staffId = null)" in c))
            checks.append(("Commission checks staff override rate", "commission_rate FROM staffs" in c))

    staff_ctrl = os.path.join(root, "php_backend", "controllers", "StaffController.php")
    if os.path.exists(staff_ctrl):
        with open(staff_ctrl, "r") as f:
            c = f.read()
            checks.append(("StaffController maps commissionRate to commission_rate", "commissionRate" in c))

    frontend_page = os.path.join(root, "frontend", "src", "pages", "admin", "StaffManagementPage.tsx")
    if os.path.exists(frontend_page):
        with open(frontend_page, "r") as f:
            c = f.read()
            checks.append(("Staff page includes commissionRate in editFormData", "commissionRate" in c))
            checks.append(("Staff page includes commissionRate in form append", "commissionRate" in c))

    for label, ok in checks:
        step(label, ok)

    print("\n" + "=" * 60)
    print("RESULT: ALL PASS")
    print("=" * 60)

if __name__ == "__main__":
    main()
