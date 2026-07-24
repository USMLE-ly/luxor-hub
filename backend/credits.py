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
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")

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
    "ai_fill_details":      2,   # AI auto-fill closet item details
    "generate_1_outfit":    3,   # Generate 1 outfit
    "generate_2_outfits":   5,   # Generate 2 outfits
    "generate_3_outfits":   7,   # Generate 3 outfits
    "calendar_manual":      2,   # Manual calendar event creation
    "dressing_room_style":  3,   # Dressing room AI styling
    "dressing_room_tryon":  4,   # Virtual try-on in dressing room
    "outfit_analysis":      5,   # Full outfit analysis page
    "outfit_recommendation": 3,  # Style recommendations page
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
        
        # Update DB — MUST succeed for consumption to be valid
        db_updated = self._update_balance(user_id, new_remaining)
        
        if not db_updated:
            _log.error("[CREDITS] DB update FAILED for %s — NOT consuming %d credits for %s", user_id[:8], cost, action)
            return {
                "error": "Credit system error",
                "message": "We could not process your credit deduction. Please try again.",
                "credits_remaining": remaining,
                "credits_needed": cost,
            }
        
        # Log the event
        self._log_event(user_id, action, cost, new_remaining)
        
        # Update in-memory cache
        self._balances[user_id] = {
            "credits_remaining": new_remaining,
            "credits_allocated": balance.get("credits_allocated", TIER_MONTHLY_CREDITS.get(tier, 30)),
            "month": balance.get("month", ""),
            "tier": tier,
        }
        
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
    
    def _update_balance(self, user_id: str, new_remaining: int) -> bool:
        """Update remaining credits in Supabase. Returns True if DB was updated."""
        if not SUPABASE_URL or not SUPABASE_KEY:
            _log.error("[CREDITS] Cannot update balance — SUPABASE_URL or SUPABASE_KEY not set")
            return False
        
        current_month = datetime.utcnow().strftime("%Y-%m")
        try:
            resp = requests.patch(
                f"{SUPABASE_URL}/rest/v1/credit_balances?user_id=eq.{user_id}&month=eq.{current_month}",
                json={"credits_remaining": new_remaining, "updated_at": datetime.utcnow().isoformat()},
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal",
                },
                timeout=10,
            )
            if resp.status_code in (200, 204):
                _log.info("[CREDITS] Updated balance for %s: %d remaining", user_id[:8], new_remaining)
                return True
            else:
                _log.error("[CREDITS] Balance update FAILED — status %d, body: %s", resp.status_code, resp.text[:200])
                return False
        except Exception as exc:
            _log.error("[CREDITS] Balance update exception: %s", exc, exc_info=True)
            return False
    
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



# ── Server-Side Credit Enforcement ──────────────────────────
# Idempotency: prevent double-deduct within 5 seconds
import threading
_idempotency_lock = threading.Lock()
_recent_deducts: Dict[str, float] = {}  # "user_id:action" → timestamp

# Actions that cost credits (must match CREDIT_COSTS keys)
CREDITED_ACTIONS = set(CREDITS.keys()) if 'CREDITS' in dir() else set(CREDIT_COSTS.keys())


def check_and_deduct(user_id: str, action: str, tier: str) -> Dict[str, Any]:
    """Server-side credit check + deduction. Called BEFORE the AI action runs.
    
    Returns {"ok": True, "cost": N, "remaining": N} on success.
    Returns {"ok": False, "error": "...", "status": 402/500} on failure.
    """
    if action not in CREDIT_COSTS:
        return {"ok": True, "cost": 0, "remaining": 0}  # Free action
    
    cost = CREDIT_COSTS[action]
    now = time.time()
    idem_key = f"{user_id}:{action}"
    
    # Idempotency: if same user+action was deducted < 5s ago, skip
    with _idempotency_lock:
        last = _recent_deducts.get(idem_key, 0)
        if now - last < 5:
            _log.warning("[CREDITS] Idempotent block: %s tried %s within 5s", user_id[:8], action)
            return {"ok": True, "cost": 0, "remaining": 0, "idempotent": True}
        _recent_deducts[idem_key] = now
        # Cleanup old entries (keep dict small)
        if len(_recent_deducts) > 10000:
            cutoff = now - 60
            _recent_deducts = {k: v for k, v in _recent_deducts.items() if v > cutoff}
    
    # Get balance
    balance = credit_manager.get_balance(user_id)
    remaining = balance.get("credits_remaining", 0)
    
    if remaining < cost:
        allocated = TIER_MONTHLY_CREDITS.get(tier, TIER_MONTHLY_CREDITS["free"])
        return {
            "ok": False,
            "status": 402,
            "error": "Not enough credits",
            "message": f"You need {cost} credits but only have {remaining}. Upgrade for more credits.",
            "credits_needed": cost,
            "credits_remaining": remaining,
            "credits_allocated": allocated,
            "tier": tier,
        }
    
    # Deduct
    new_remaining = remaining - cost
    credit_manager._update_balance(user_id, new_remaining)
    credit_manager._log_event(user_id, action, cost, new_remaining)
    
    # Update cache
    credit_manager._balances[user_id] = {
        "credits_remaining": new_remaining,
        "credits_allocated": balance.get("credits_allocated", 30),
        "month": balance.get("month", ""),
        "tier": tier,
    }
    
    _log.info("[CREDITS] %s server-deducted %d for %s — remaining: %d", user_id[:8], cost, action, new_remaining)
    return {"ok": True, "cost": cost, "remaining": new_remaining}




# Global singleton
credit_manager = CreditManager()
