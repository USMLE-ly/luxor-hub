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


if __name__ == "__main__":
    reset_credits()
