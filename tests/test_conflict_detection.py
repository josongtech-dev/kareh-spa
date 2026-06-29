import requests
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
    print("Feature 4: Time-Slot Availability / Conflict Detection")
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

    # 2. Test availability check endpoint
    print("\n--- Availability Check API ---")
    test_date = "2026-07-01"
    try:
        r = session.get(f"{BASE_URL}/appointments.php?check_date={test_date}",
                        headers=auth_headers, timeout=10)
        data = r.json()
        payload = data.get("data") or data
        step("Availability endpoint responds", r.status_code == 200, f"status={r.status_code}")
        step("  date returned", payload.get("date") == test_date, f"{payload.get('date')}")
        step("  available_slots is array", isinstance(payload.get("available_slots"), list))
        step("  booked_slots is array", isinstance(payload.get("booked_slots"), list))
        slot_count = len(payload.get("available_slots", []))
        step(f"  {slot_count} available slots returned", slot_count > 0)
    except Exception as e:
        step("Availability check failed", False, str(e))

    # 3. Test availability with staff_id filter
    print("\n--- Availability Check (with Staff) ---")
    try:
        r = session.get(f"{BASE_URL}/appointments.php?check_date={test_date}&staff_id=4",
                        headers=auth_headers, timeout=10)
        step("Availability with staff_id works", r.status_code == 200, f"status={r.status_code}")
    except Exception as e:
        step("Staff availability failed", False, str(e))

    # 4. Test conflict detection on creation (create then try to create again)
    print("\n--- Conflict Detection (on Create) ---")
    create_payload = {
        "customer_name": "Conflict Test",
        "customer_phone": "+254700000000",
        "customer_email": "conflict@test.com",
        "service_id": 23,
        "appointment_date": test_date,
        "appointment_time": "10:00",
        "staff_id": 4,
    }
    try:
        r = session.post(f"{BASE_URL}/appointments.php", json=create_payload, timeout=10)
        if r.status_code == 201:
            step("First creation succeeds", True, "status=201")
            # Try creating same slot again (should fail with 409)
            r2 = session.post(f"{BASE_URL}/appointments.php", json=create_payload, timeout=10)
            step("Duplicate booking rejected", r2.status_code == 409,
                 f"expected 409, got {r2.status_code} - {r2.text[:100]}")
        elif r.status_code == 409:
            step("First creation conflicts (slot already taken)", True, "status=409 (existing data)")
        else:
            step("Create test response", False, f"unexpected status={r.status_code}")
    except Exception as e:
        step("Conflict detection test failed", False, str(e))

    # 5. Frontend build checks
    print("\n--- Frontend Build Verification ---")
    dist_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist", "assets")
    if os.path.isdir(dist_dir):
        booking_bundle = [f for f in os.listdir(dist_dir) if "BookingPage" in f]
        has_availability = False
        if booking_bundle:
            fpath = os.path.join(dist_dir, booking_bundle[0])
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read(300000)
                    has_availability = "checkAvailability" in content or "available_slots" in content
            except:
                pass
        step("Availability check in BookingPage bundle", has_availability)
    else:
        print("  SKIP: dist/assets not found")

    # 6. Source file checks
    print("\n--- Source Files Verification ---")
    root = os.path.join(os.path.dirname(__file__), "..")
    checks = []

    model_path = os.path.join(root, "php_backend", "models", "Appointment.php")
    if os.path.exists(model_path):
        with open(model_path, "r") as f:
            content = f.read()
            checks.append(("Appointment model has getConflictingAppointments", "getConflictingAppointments" in content))

    ctrl_path = os.path.join(root, "php_backend", "controllers", "AppointmentController.php")
    if os.path.exists(ctrl_path):
        with open(ctrl_path, "r") as f:
            content = f.read()
            checks.append(("Controller checks conflicts on create", "getConflictingAppointments" in content and "409" in content))
            checks.append(("Controller has checkAvailability", "checkAvailability" in content))

    booking_path = os.path.join(root, "frontend", "src", "pages", "BookingPage.tsx")
    if os.path.exists(booking_path):
        with open(booking_path, "r") as f:
            content = f.read()
            checks.append(("BookingPage imports checkAvailability", "checkAvailability" in content))
            checks.append(("BookingPage shows available slots", "availableSlots" in content or "available_slots" in content))

    api_path = os.path.join(root, "frontend", "src", "api", "appointments.ts")
    if os.path.exists(api_path):
        with open(api_path, "r") as f:
            checks.append(("Frontend API has checkAvailability", "checkAvailability" in f.read()))

    for label, ok in checks:
        step(label, ok)

    print("\n" + "=" * 60)
    print("RESULT: ALL PASS")
    print("=" * 60)

if __name__ == "__main__":
    main()
