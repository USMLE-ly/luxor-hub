"""Credit Rewards — Award bonus credits for engagement actions.

Actions that earn credits:
- Complete profile: +10 credits
- Add 5 closet items: +5 credits
- Share outfit: +3 credits
- Invite friend who signs up: +20 credits
- Complete weekly challenge: +15 credits
- First outfit analysis: +5 credits (onboarding bonus)
"""

import os
import logging
import requests
from datetime import datetime
from typing import Optional

_log = logging.getLogger("luxor.rewards")

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")

# Credit rewards for each action
REWARD_ACTIONS = {
    "complete_profile": {"credits": 10, "description": "Complete your profile"},
    "add_5_closet_items": {"credits": 5, "description": "Add 5 closet items"},
    "share_outfit": {"credits": 3, "description": "Share an outfit"},
    "invite_friend": {"credits": 20, "description": "Friend signed up"},
    "weekly_challenge": {"credits": 15, "description": "Complete weekly challenge"},
    "first_analysis": {"credits": 5, "description": "First outfit analysis"},
}

# Track which rewards a user has already claimed this month
_claimed_rewards: dict = {}  # user_id → set of action names


def award_reward(user_id: str, action: str) -> Optional[dict]:
    """Award credits for an engagement action. Returns None if already claimed."""
    if action not in REWARD_ACTIONS:
        _log.warning("[REWARDS] Unknown action: %s", action)
        return None

    reward = REWARD_ACTIONS[action]
    credits = reward["credits"]

    # Check if already claimed this month
    month_key = f"{user_id}:{datetime.utcnow().strftime('%Y-%m')}"
    if month_key not in _claimed_rewards:
        _claimed_rewards[month_key] = set()
    if action in _claimed_rewards[month_key]:
        _log.info("[REWARDS] Already claimed: user=%s action=%s", user_id[:8], action)
        return None

    if not SUPABASE_URL or not SUPABASE_KEY:
        return {"credits": credits, "description": reward["description"]}

    try:
        current_month = datetime.utcnow().strftime("%Y-%m")
        headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}

        # Add credits to balance
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/credit_balances",
            params={"select": "id,credits_remaining", "user_id": f"eq.{user_id}", "month": f"eq.{current_month}", "limit": "1"},
            headers=headers, timeout=5,
        )
        rows = resp.json() if resp.status_code == 200 else []

        if rows:
            new_remaining = rows[0]["credits_remaining"] + credits
            requests.patch(
                f"{SUPABASE_URL}/rest/v1/credit_balances?id=eq.{rows[0]['id']}",
                json={"credits_remaining": new_remaining},
                headers=headers, timeout=5,
            )
        else:
            new_remaining = 30 + credits
            requests.post(
                f"{SUPABASE_URL}/rest/v1/credit_balances",
                json={"user_id": user_id, "month": current_month, "credits_allocated": 30, "credits_remaining": new_remaining},
                headers=headers, timeout=5,
            )

        # Log reward event
        requests.post(
            f"{SUPABASE_URL}/rest/v1/credit_events",
            json={"user_id": user_id, "action": f"reward_{action}", "cost": -credits, "credits_remaining": new_remaining, "created_at": datetime.utcnow().isoformat()},
            headers=headers, timeout=5,
        )

        _claimed_rewards[month_key].add(action)
        _log.info("[REWARDS] Awarded %d credits to user=%s for %s", credits, user_id[:8], action)

        return {"credits": credits, "description": reward["description"], "total": new_remaining}
    except Exception as exc:
        _log.error("[REWARDS] Failed: %s", exc)
        return None
