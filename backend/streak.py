"""Streak Manager — Daily login tracking + bonus credits."""

import os
import logging
from datetime import datetime

import requests

_log = logging.getLogger("luxor.streak")

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")


class StreakManager:
    """Track and manage daily login streaks."""

    def record_login(self, user_id: str) -> dict:
        """Record daily login and return streak info with optional bonus."""
        if not SUPABASE_URL or not SUPABASE_KEY:
            return {"current_streak": 0, "error": "Supabase not configured"}

        try:
            resp = requests.post(
                f"{SUPABASE_URL}/rest/v1/rpc/record_daily_login",
                json={"p_user_id": user_id},
                headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"},
                timeout=10,
            )
            if resp.status_code == 200:
                rows = resp.json()
                if rows and isinstance(rows, list) and len(rows) > 0:
                    return rows[0]
            _log.warning("[STREAK] record_login failed: %s %s", resp.status_code, resp.text[:200])
            return {"current_streak": 0, "error": "Failed to record login"}
        except Exception as exc:
            _log.error("[STREAK] record_login exception: %s", exc)
            return {"current_streak": 0, "error": str(exc)}

    def get_info(self, user_id: str) -> dict:
        """Get current streak info for a user."""
        if not SUPABASE_URL or not SUPABASE_KEY:
            return {"current_streak": 0, "longest_streak": 0, "total_login_days": 0}

        try:
            resp = requests.post(
                f"{SUPABASE_URL}/rest/v1/rpc/get_streak_info",
                json={"p_user_id": user_id},
                headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"},
                timeout=10,
            )
            if resp.status_code == 200:
                rows = resp.json()
                if rows and isinstance(rows, list) and len(rows) > 0:
                    return rows[0]
            return {"current_streak": 0, "longest_streak": 0, "total_login_days": 0}
        except Exception as exc:
            _log.error("[STREAK] get_info exception: %s", exc)
            return {"current_streak": 0, "longest_streak": 0, "total_login_days": 0}

    def claim_bonus(self, user_id: str, streak_days: int) -> dict:
        """Claim a streak milestone bonus."""
        if not SUPABASE_URL or not SUPABASE_KEY:
            return {"error": "Supabase not configured"}

        try:
            resp = requests.post(
                f"{SUPABASE_URL}/rest/v1/rpc/claim_streak_bonus",
                json={"p_user_id": user_id, "p_streak_days": streak_days},
                headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"},
                timeout=10,
            )
            if resp.status_code == 200:
                rows = resp.json()
                if rows and isinstance(rows, list) and len(rows) > 0:
                    result = rows[0]
                    if result.get("success"):
                        return {"bonus_credits": result.get("bonus_credits", 0), "new_balance": result.get("new_balance", 0)}
                    return {"error": "Already claimed or invalid streak"}
            return {"error": "Failed to claim bonus"}
        except Exception as exc:
            _log.error("[STREAK] claim_bonus exception: %s", exc)
            return {"error": str(exc)}


streak_manager = StreakManager()
