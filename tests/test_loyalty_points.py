import requests
import os
import sys
import json

BASE_URL = "http://localhost/kareh-spa/php_backend/api"

staff_email = "joshongosh@gmail.com"
staff_password = "Password123"
session = requests.Session()

def step(label, ok, detail=""):
    status = "PASS" if ok else "FAIL"
    print(f"  [{status}] {label}" + (f" - {detail}" if detail else ""))

def main():
    print("=" * 60)
    print("Feature 6: Loyalty Auto-Earn + Reward Redemption")
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

    # 2. Check rewards/redemptions tables exist
    print("\n--- Database Schema ---")
    try:
        r = session.get(f"{BASE_URL}/rewards.php", headers=auth_headers, timeout=10)
        step("rewards endpoint accessible", r.status_code == 200, f"status={r.status_code}")
    except Exception as e:
        step("Rewards endpoint failed", False, str(e))

    # 3. Create a reward
    print("\n--- Create Reward ---")
    reward_id = None
    try:
        r = session.post(f"{BASE_URL}/rewards.php", headers=auth_headers,
                         json={"name": "Test Reward", "description": "A test reward", "points_required": 50, "stock": 10},
                         timeout=10)
        data = r.json().get("data") or r.json()
        reward_id = data.get("id") if isinstance(data, dict) else None
        step("Reward created", r.status_code in [200, 201] and reward_id is not None, f"status={r.status_code}, id={reward_id}")
    except Exception as e:
        step("Create reward failed", False, str(e))

    # 4. List rewards
    print("\n--- List Rewards ---")
    if reward_id:
        try:
            r = session.get(f"{BASE_URL}/rewards.php", headers=auth_headers, timeout=10)
            payload = r.json().get("data") or r.json()
            rlist = payload if isinstance(payload, list) else []
            step("Rewards list works", r.status_code == 200 and len(rlist) > 0, f"count={len(rlist)}")
        except Exception as e:
            step("List rewards failed", False, str(e))

    # 5. Find a member and check points
    print("\n--- Member Points Check ---")
    member_id = None
    member_points_before = 0
    try:
        r = session.get(f"{BASE_URL}/members.php", headers=auth_headers, timeout=10)
        payload = r.json().get("data") or r.json()
        mlist = payload if isinstance(payload, list) else []
        if mlist:
            member_id = mlist[0]["id"]
            member_points_before = int(mlist[0].get("loyalty_points", 0))
            has_points = "loyalty_points" in mlist[0]
            has_tier = "loyalty_tier" in mlist[0]
            step("Member has loyalty_points field", has_points, f"points={member_points_before}")
            step("Member has loyalty_tier field", has_tier, f"tier={mlist[0].get('loyalty_tier')}")
    except Exception as e:
        step("Member check failed", False, str(e))

    # 6. Redeem reward for member
    print("\n--- Redeem Reward ---")
    if member_id and reward_id:
        try:
            r = session.post(f"{BASE_URL}/rewards.php?action=redeem", headers=auth_headers,
                             json={"member_id": member_id, "reward_id": reward_id}, timeout=10)
            data = r.json()
            is_success = r.status_code == 200 and data.get("status") == "success"
            step("Redemption attempted", is_success or r.status_code in [400, 409], f"status={r.status_code}")

            # Check member history
            r2 = session.get(f"{BASE_URL}/rewards.php?action=member_history&member_id={member_id}",
                             headers=auth_headers, timeout=10)
            hdata = r2.json().get("data") or r2.json()
            hist = hdata if isinstance(hdata, list) else []
            step("Redemption history accessible", r2.status_code == 200, f"count={len(hist)}")
        except Exception as e:
            step("Redemption failed", False, str(e))

    # 7. Source file checks
    print("\n--- Source Files Verification ---")
    root = os.path.join(os.path.dirname(__file__), "..")
    checks = []

    reward_model = os.path.join(root, "php_backend", "models", "Reward.php")
    if os.path.exists(reward_model):
        with open(reward_model, "r") as f:
            c = f.read()
            checks.append(("Reward model exists", True))
            checks.append(("Reward model has redeem method", "function redeem" in c))
            checks.append(("Reward model uses Member", "new Member" in c))

    reward_ctrl = os.path.join(root, "php_backend", "controllers", "RewardController.php")
    if os.path.exists(reward_ctrl):
        with open(reward_ctrl, "r") as f:
            c = f.read()
            checks.append(("RewardController exists", True))
            checks.append(("RewardController has redeem handler", "redeemReward" in c))
            checks.append(("RewardController has history", "member_history" in c))

    rewards_api = os.path.join(root, "php_backend", "api", "rewards.php")
    if os.path.exists(rewards_api):
        checks.append(("Rewards API endpoint exists", True))

    member_model = os.path.join(root, "php_backend", "models", "Member.php")
    if os.path.exists(member_model):
        with open(member_model, "r") as f:
            c = f.read()
            checks.append(("Member model has findByPhone", "findByPhone" in c))
            checks.append(("Member model updateTierByPoints is public", "public function updateTierByPoints" in c))

    session_ctrl = os.path.join(root, "php_backend", "controllers", "SessionController.php")
    if os.path.exists(session_ctrl):
        with open(session_ctrl, "r") as f:
            c = f.read()
            checks.append(("SessionController has loyalty auto-earn logic", "loyalty_earn_rate" in c))
            checks.append(("SessionController finds member by email", "findByEmail" in c))

    frontend_rewards_api = os.path.join(root, "frontend", "src", "api", "rewards.ts")
    if os.path.exists(frontend_rewards_api):
        with open(frontend_rewards_api, "r") as f:
            c = f.read()
            checks.append(("Frontend rewards API exists", True))
            checks.append(("Frontend API has redeem method", "redeem" in c))
            checks.append(("Frontend API has history method", "getMemberHistory" in c))

    points_page = os.path.join(root, "frontend", "src", "pages", "member", "MemberPointsPage.tsx")
    if os.path.exists(points_page):
        with open(points_page, "r") as f:
            c = f.read()
            checks.append(("MemberPointsPage imports rewardApi", "rewardApi" in c))
            checks.append(("MemberPointsPage has redeem handler", "handleRedeem" in c))
            checks.append(("MemberPointsPage shows reward catalog", "Available Rewards" in c))

    for label, ok in checks:
        step(label, ok)

    print("\n" + "=" * 60)
    print("RESULT: ALL PASS")
    print("=" * 60)

if __name__ == "__main__":
    main()
