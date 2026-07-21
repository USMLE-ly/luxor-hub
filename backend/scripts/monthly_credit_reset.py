#!/usr/bin/env python3
"""Monthly Credit Reset — Run on the 1st of each month via Replit Cron.

Allocates fresh credits to all active subscribers and handles rollover.
Set up as a cron job: 0 0 1 * * python3 backend/scripts/monthly_credit_reset.py

Usage:
  python3 backend/scripts/monthly_credit_reset.py
"""

import os
import sys
import logging
import requests
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
_log = logging.getLogger("luxor.credit_reset")

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")

TIER_CREDITS = {"free": 30, "starter": 200, "pro": 1000, "elite": 5000}


def reset_credits():
    if not SUPABASE_URL or not SUPABASE_KEY:
        _log.error("Supabase not configured — aborting")
        return

    current_month = datetime.utcnow().strftime("%Y-%m")
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}

    # 1. Get all active subscriptions
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/subscriptions",
        params={"select": "user_id,plan_tier", "status": "eq.active", "limit": "10000"},
        headers=headers, timeout=10,
    )

    if resp.status_code != 200:
        _log.error("Failed to fetch subscriptions: %s", resp.status_code)
        return

    subscriptions = resp.json()
    _log.info("Found %d active subscriptions", len(subscriptions))

    allocated_count = 0
    for sub in subscriptions:
        user_id = sub["user_id"]
        tier = sub.get("plan_tier", "free")
        credits = TIER_CREDITS.get(tier, 30)

        # Try rollover first
        try:
            requests.post(
                f"{SUPABASE_URL}/rest/v1/rpc/rollover_credits",
                json={"p_user_id": user_id}, headers=headers, timeout=5,
            )
        except Exception:
            pass

        # Check if balance already exists this month
        existing = requests.get(
            f"{SUPABASE_URL}/rest/v1/credit_balances",
            params={"select": "id", "user_id": f"eq.{user_id}", "month": f"eq.{current_month}", "limit": "1"},
            headers=headers, timeout=5,
        )

        rows = existing.json() if existing.status_code == 200 else []

        if rows:
            requests.patch(
                f"{SUPABASE_URL}/rest/v1/credit_balances?id=eq.{rows[0]['id']}",
                json={"credits_allocated": credits, "credits_remaining": credits},
                headers=headers, timeout=5,
            )
        else:
            requests.post(
                f"{SUPABASE_URL}/rest/v1/credit_balances",
                json={"user_id": user_id, "month": current_month, "credits_allocated": credits, "credits_remaining": credits},
                headers=headers, timeout=5,
            )

        allocated_count += 1

    _log.info("Credit reset complete: %d users allocated for %s", allocated_count, current_month)

    # Low-credit email scan
    try:
        from backend.services.email_service import send_credit_alert
        low_resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/credit_balances",
            params={
                "select": "user_id,credits_remaining,credits_allocated",
                "month": f"eq.{current_month}",
                "limit": "10000",
            },
            headers=headers, timeout=10,
        )
        if low_resp.status_code == 200:
            low_users = low_resp.json()
            emails_sent = 0
            for u in low_users:
                remaining = u.get("credits_remaining", 0)
                allocated = u.get("credits_allocated", 30)
                if allocated > 0 and remaining / allocated < 0.2:
                    # Get user email from profiles
                    profile_resp = requests.get(
                        f"{SUPABASE_URL}/rest/v1/profiles",
                        params={"select": "display_name", "id": f"eq.{u['user_id']}", "limit": "1"},
                        headers=headers, timeout=5,
                    )
                    # Get email from auth
                    auth_resp = requests.get(
                        f"{SUPABASE_URL}/rest/v1/auth.users",
                        params={"select": "email", "id": f"eq.{u['user_id']}", "limit": "1"},
                        headers=headers, timeout=5,
                    )
                    if auth_resp.status_code == 200:
                        users = auth_resp.json()
                        if users and users[0].get("email"):
                            name = ""
                            if profile_resp.status_code == 200:
                                profiles = profile_resp.json()
                                if profiles:
                                    name = profiles[0].get("display_name", "")
                            send_credit_alert(users[0]["email"], name, remaining, "free")
                            emails_sent += 1
            _log.info("Low-credit emails sent: %d", emails_sent)
    except Exception as exc:
        _log.warning("Low-credit scan failed: %s", exc)


if __name__ == "__main__":
    reset_credits()
