"""Credit System — Usage-based billing with credits.

Each tier gets a monthly credit allocation.
Every AI action costs a specific number of credits.
Credits reset on the 1st of each month.

Credit Costs:
  - AI outfit analysis (image)     = 5 credits
  - AI style analysis              = 3 credits
  - AI outfit recommendation       = 3 credits
  - AI outfit review               = 2 credits
  - AI generate outfits            = 4 credits
  - AI pro tweak                   = 8 credits
  - AI closet analyze              = 3 credits
  - AI stylist explore             = 2 credits
  - AI stylist generate            = 4 credits
"""

import os
import time
import logging
from datetime import datetime
from typing import Optional, Dict, Any

import requests

_log = logging.getLogger("luxor.credits")

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")

# ── Tier Credit Allocations (per month) ─────────────────────
TIER_MONTHLY_CREDITS = {
    "free":     30,    # 30 credits/month (~6 analyses)
    "starter":  200,   # 200 credits/month (~40 analyses)
    "pro":     1000,   # 1000 credits/month (~200 analyses)
    "elite":   5000,   # 5000 credits/month (~1000 analyses)
}

# ── Credit Costs per Action ─────────────────────────────────
CREDIT_COSTS = {
    "analyze_outfit":       5,   # Image analysis (expensive)
    "style_analyze":        3,   # Body/face analysis
    "style_recommendations": 3,  # Personalized recs
    "outfit_review":        2,   # Score + feedback
    "generate_outfits":     4,   # Outfit generation
    "pro_tweak":            8,   # Pro styling tweak (most expensive)
    "closet_analyze":       3,   # Closet item analysis
    "stylist_explore":      2,   # Stylist quiz
    "stylist_generate":     4,   # Stylist output
}


class CreditManager:
    """Manage user credit balances and consumption."""
    
    def __init__(self):
        self._balances: Dict[str, Dict[str, Any]] = {}  # user_id → {credits, month, tier}
    
    def get_balance(self, user_id: str) -> Dict[str, Any]:
        """Get current credit balance for a user."""
        now = datetime.utcnow()
        current_month = now.strftime("%Y-%m")
        
        # Check cache first
        if user_id in self._balances:
            cached = self._balances[user_id]
            if cached.get("month") == current_month:
                return cached
        
        # Query Supabase
        balance = self._query_balance(user_id, current_month)
        if balance is None:
            # HIGH #6: Try rollover first (20% of previous month for paid tiers)
            self._try_rollover(user_id, current_month)
            balance = self._query_balance(user_id, current_month)
            if balance is None:
                # Still no record — create with default allocation
                balance = self._create_balance(user_id, current_month)
        
        self._balances[user_id] = balance
        return balance
    
    def consume(self, user_id: str, action: str, tier: str) -> Dict[str, Any]:
        """Consume credits for an action. Returns success/error."""
        cost = CREDIT_COSTS.get(action)
        if cost is None:
            _log.warning("[CREDITS] Unknown action: %s", action)
            return {"error": f"Unknown action: {action}"}
        
        balance = self.get_balance(user_id)
        remaining = balance.get("credits_remaining", 0)
        
        if remaining < cost:
            allocated = TIER_MONTHLY_CREDITS.get(tier, TIER_MONTHLY_CREDITS["free"])
            return {
                "error": "Not enough credits",
                "message": f"You need {cost} credits but only have {remaining}. Upgrade for more credits.",
                "credits_needed": cost,
                "credits_remaining": remaining,
                "credits_allocated": allocated,
                "tier": tier,
                "upgrade_url": "/pricing",
            }
        
        # Deduct credits
        new_remaining = remaining - cost
        self._update_balance(user_id, new_remaining)
        
        # Log the event
        self._log_event(user_id, action, cost, new_remaining)
        
        _log.info(
            "[CREDITS] %s consumed %d for %s — remaining: %d/%d (tier=%s)",
            user_id[:8], cost, action, new_remaining,
            TIER_MONTHLY_CREDITS.get(tier, 0), tier,
        )
        
        return {
            "success": True,
            "action": action,
            "cost": cost,
            "credits_remaining": new_remaining,
            "credits_allocated": TIER_MONTHLY_CREDITS.get(tier, TIER_MONTHLY_CREDITS["free"]),
        }
    
    def get_tier_allocation(self, tier: str) -> int:
        return TIER_MONTHLY_CREDITS.get(tier, TIER_MONTHLY_CREDITS["free"])
    
    def get_action_cost(self, action: str) -> Optional[int]:
        return CREDIT_COSTS.get(action)
    
    def get_all_costs(self) -> Dict[str, int]:
        return dict(CREDIT_COSTS)
    
    def _query_balance(self, user_id: str, month: str) -> Optional[Dict[str, Any]]:
        """Query credit balance from Supabase."""
        if not SUPABASE_URL or not SUPABASE_KEY:
            return None
        
        try:
            resp = requests.get(
                f"{SUPABASE_URL}/rest/v1/credit_balances",
                params={
                    "select": "*",
                    "user_id": f"eq.{user_id}",
                    "month": f"eq.{month}",
                    "limit": "1",
                },
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                },
                timeout=5,
            )
            if resp.status_code == 200:
                rows = resp.json()
                if rows:
                    return rows[0]
        except Exception as exc:
            _log.warning("[CREDITS] Query failed: %s", exc)
        return None
    
    def _create_balance(self, user_id: str, month: str) -> Dict[str, Any]:
        """Create a new monthly credit balance."""
        allocated = TIER_MONTHLY_CREDITS["free"]  # Default to free
        
        if not SUPABASE_URL or not SUPABASE_KEY:
            return {"credits_remaining": allocated, "credits_allocated": allocated, "month": month}
        
        try:
            # Look up user's tier
            tier_resp = requests.get(
                f"{SUPABASE_URL}/rest/v1/subscriptions",
                params={
                    "select": "plan_tier",
                    "user_id": f"eq.{user_id}",
                    "status": f"eq.active",
                    "limit": "1",
                },
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                },
                timeout=5,
            )
            if tier_resp.status_code == 200:
                rows = tier_resp.json()
                if rows and rows[0].get("plan_tier"):
                    allocated = TIER_MONTHLY_CREDITS.get(rows[0]["plan_tier"], allocated)
            
            # Insert balance
            requests.post(
                f"{SUPABASE_URL}/rest/v1/credit_balances",
                json={
                    "user_id": user_id,
                    "month": month,
                    "credits_allocated": allocated,
                    "credits_remaining": allocated,
                },
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                },
                timeout=5,
            )
            
            return {"credits_remaining": allocated, "credits_allocated": allocated, "month": month}
        except Exception as exc:
            _log.warning("[CREDITS] Create balance failed: %s", exc)
            return {"credits_remaining": allocated, "credits_allocated": allocated, "month": month}
    
    def _update_balance(self, user_id: str, new_remaining: int):
        """Update remaining credits in Supabase."""
        if not SUPABASE_URL or not SUPABASE_KEY:
            return
        
        current_month = datetime.utcnow().strftime("%Y-%m")
        try:
            requests.patch(
                f"{SUPABASE_URL}/rest/v1/credit_balances?user_id=eq.{user_id}&month=eq.{current_month}",
                json={"credits_remaining": new_remaining},
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                },
                timeout=5,
            )
        except Exception as exc:
            _log.warning("[CREDITS] Update failed: %s", exc)
    
    def _log_event(self, user_id: str, action: str, cost: int, remaining: int):
        """Log a billable event for analytics and billing."""
        if not SUPABASE_URL or not SUPABASE_KEY:
            return
        
        try:
            requests.post(
                f"{SUPABASE_URL}/rest/v1/credit_events",
                json={
                    "user_id": user_id,
                    "action": action,
                    "cost": cost,
                    "credits_remaining": remaining,
                    "created_at": datetime.utcnow().isoformat(),
                },
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                },
                timeout=5,
            )
        except Exception as exc:
            _log.warning("[CREDITS] Event log failed: %s", exc)

    def _try_rollover(self, user_id: str, current_month: str):
        """Attempt to roll over credits from previous month (paid tiers only)."""
        if not SUPABASE_URL or not SUPABASE_KEY:
            return
        try:
            resp = requests.post(
                f"{SUPABASE_URL}/rest/v1/rpc/rollover_credits",
                json={"p_user_id": user_id},
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                },
                timeout=5,
            )
            if resp.status_code == 200:
                _log.info("[CREDITS] Rollover attempted for user=%s", user_id[:8])
        except Exception as exc:
            _log.warning("[CREDITS] Rollover failed: %s", exc)


# Global singleton
credit_manager = CreditManager()
