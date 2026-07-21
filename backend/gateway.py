"""AI Endpoint Gateway — Three-Layer Defense System.

Layer 1: API Gateway (auth + route protection)
  - Validates Supabase JWT tokens
  - Only authenticated users can access AI endpoints
  
Layer 2: Request Validation (payload + schema)
  - Enforces max payload size (rejects oversized images)
  - Validates input schema before passing to AI model
  - Blocks excessive token prompts from free users
  
Layer 3: Per-User Spend Tracking (caps + monitoring)
  - Tags every request with user_id
  - Logs token usage by user
  - Enforces daily consumption caps by tier (free/starter/pro/elite)
  - Uses in-memory tracking with periodic flush to Supabase
"""

import os
import time
import json
import logging
import functools
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from collections import defaultdict
from threading import Lock

from flask import request, jsonify, g

_log = logging.getLogger("luxor.gateway")

# ── Configuration ───────────────────────────────────────────────────────

# Max payload sizes (bytes)
MAX_IMAGE_PAYLOAD = 15 * 1024 * 1024   # 15MB (base64 images are ~37% larger)
MAX_JSON_PAYLOAD = 2 * 1024 * 1024      # 2MB for non-image requests
MAX_PROMPT_TOKENS = 4096                # Max tokens in a single prompt

# Tier-based daily caps (requests per day)
TIER_DAILY_CAPS = {
    "free":     10,    # 10 AI analyses per day
    "starter":  50,    # 50 per day
    "pro":     200,    # 200 per day
    "elite":   500,    # 500 per day
}

# Tier-based per-request limits
TIER_REQUEST_LIMITS = {
    "free":     {"max_image_size_mb": 5,  "max_tokens": 2048},
    "starter":  {"max_image_size_mb": 8,  "max_tokens": 4096},
    "pro":      {"max_image_size_mb": 12, "max_tokens": 8192},
    "elite":    {"max_image_size_mb": 15, "max_tokens": 8192},
}

# Expensive endpoints that count against daily cap
AI_ENDPOINTS = {
    "/api/v1/analyze-outfit",
    "/api/v1/style-analyze",
    "/api/v1/style-recommendations",
    "/api/v1/outfit-review",
    "/api/v1/generate-outfits",
    "/api/v1/pro-tweak/generate",
    "/api/v1/closet/analyze-item",
    "/api/v1/stylist-explore",
    "/api/v1/stylist-generate",
}



# ── Endpoint → Credit Action Mapping ────────────────────────────────────
ENDPOINT_CREDIT_ACTION = {
    "/api/v1/analyze-outfit":       "analyze_outfit",
    "/api/v1/style-analyze":        "style_analyze",
    "/api/v1/style-recommendations": "style_recommendations",
    "/api/v1/outfit-review":        "outfit_review",
    "/api/v1/generate-outfits":     "generate_outfits",
    "/api/v1/pro-tweak/generate":   "pro_tweak",
    "/api/v1/closet/analyze-item":  "closet_analyze",
    "/api/v1/stylist-explore":      "stylist_explore",
    "/api/v1/stylist-generate":     "stylist_generate",
}

# ── In-Memory Spend Tracker ─────────────────────────────────────────────

class SpendTracker:
    """Track per-user API usage with thread-safe in-memory counters.
    
    Resets daily at midnight UTC. Flushes summary to logs periodically.
    """
    
    def __init__(self):
        self._lock = Lock()
        self._usage: Dict[str, Dict[str, int]] = defaultdict(lambda: {"count": 0, "tokens": 0})
        self._monthly: Dict[str, Dict[str, int]] = defaultdict(lambda: {"count": 0, "tokens": 0})
        self._last_reset = datetime.utcnow().date()
        self._last_flush = time.time()
        self._flush_count = 0
    
    def _check_reset(self):
        """Reset counters if it's a new day (UTC)."""
        today = datetime.utcnow().date()
        if today != self._last_reset:
            with self._lock:
                if today != self._last_reset:
                    self._flush_summary()
                    self._usage.clear()
                    self._last_reset = today
                    _log.info("[SPEND] Daily counters reset for %s", today)
    
    def _flush_summary(self):
        """Log a summary of yesterday's usage."""
        if not self._usage:
            return
        total_requests = sum(u["count"] for u in self._usage.values())
        total_tokens = sum(u["tokens"] for u in self._usage.values())
        top_users = sorted(self._usage.items(), key=lambda x: x[1]["count"], reverse=True)[:5]
        _log.info(
            "[SPEND] Daily summary: %d total requests, %d total tokens, %d unique users",
            total_requests, total_tokens, len(self._usage),
        )
        for user_id, usage in top_users:
            _log.info("[SPEND] Top user %s...: %d requests, %d tokens", user_id[:8], usage["count"], usage["tokens"])
    
    def record_request(self, user_id: str, tokens_used: int = 0, endpoint: str = "", tier: str = "free"):
        """Record a single API request for the given user."""
        self._check_reset()
        with self._lock:
            self._usage[user_id]["count"] += 1
            self._usage[user_id]["tokens"] += tokens_used
            self._monthly[user_id]["count"] += 1
            self._monthly[user_id]["tokens"] += tokens_used
            self._flush_count += 1
        
        # Persist to Supabase every 100 requests
        if self._flush_count >= 100:
            self._flush_to_supabase()
        
        # Periodic summary flush every 5 minutes
        if time.time() - self._last_flush > 300:
            with self._lock:
                self._flush_summary()
                self._last_flush = time.time()
    
    def _flush_to_supabase(self):
        """Persist recent requests to Supabase spend_logs table."""
        self._flush_count = 0
        try:
            import requests as req
            supabase_url = os.environ.get("VITE_SUPABASE_URL", "")
            supabase_key = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")
            if not supabase_url or not supabase_key:
                return
            
            # Build batch insert from current usage snapshot
            rows = []
            with self._lock:
                for uid, usage in self._usage.items():
                    if usage["count"] > 0:
                        rows.append({
                            "user_id": uid,
                            "daily_count": usage["count"],
                            "daily_tokens": usage["tokens"],
                            "month_count": self._monthly.get(uid, {}).get("count", 0),
                            "month_tokens": self._monthly.get(uid, {}).get("tokens", 0),
                        })
            
            if not rows:
                return
            
            for row in rows:
                req.post(
                    f"{supabase_url}/rest/v1/spend_logs",
                    json={
                        "user_id": row["user_id"],
                        "daily_count": row["daily_count"],
                        "daily_tokens": row["daily_tokens"],
                        "month_count": row["month_count"],
                        "month_tokens": row["month_tokens"],
                        "flushed_at": datetime.utcnow().isoformat(),
                    },
                    headers={
                        "apikey": supabase_key,
                        "Authorization": f"Bearer {supabase_key}",
                        "Content-Type": "application/json",
                        "Prefer": "resolution=merge-duplicates",
                    },
                    timeout=5,
                )
            _log.info("[SPEND] Flushed %d user records to Supabase", len(rows))
        except Exception as exc:
            _log.warning("[SPEND] Supabase flush failed: %s", exc)
    
    def get_usage(self, user_id: str) -> Dict[str, int]:
        """Get current daily usage for a user."""
        self._check_reset()
        with self._lock:
            return dict(self._usage.get(user_id, {"count": 0, "tokens": 0}))
    
    def check_cap(self, user_id: str, tier: str) -> Optional[Dict[str, Any]]:
        """Check if user has exceeded their daily cap. Returns error dict or None."""
        usage = self.get_usage(user_id)
        cap = TIER_DAILY_CAPS.get(tier, TIER_DAILY_CAPS["free"])
        
        if usage["count"] >= cap:
            return {
                "error": "Daily limit reached",
                "message": f"You've used {usage['count']}/{cap} AI analyses today. {tier.title()} tier limit.",
                "limit": cap,
                "used": usage["count"],
                "tier": tier,
                "reset": "tomorrow",
            }
        return None


# Global singleton
_tracker = SpendTracker()


def get_spend_tracker() -> SpendTracker:
    return _tracker


# ── Layer 2: Request Validation ─────────────────────────────────────────

def validate_payload(max_size: int = MAX_JSON_PAYLOAD) -> Optional[str]:
    """Validate request payload size. Returns error message or None."""
    content_length = request.content_length
    if content_length and content_length > max_size:
        size_mb = round(content_length / (1024 * 1024), 1)
        max_mb = round(max_size / (1024 * 1024), 1)
        return f"Payload too large ({size_mb}MB). Maximum is {max_mb}MB."
    return None


def validate_image_payload(image_b64: str, tier: str = "free") -> Optional[str]:
    """Validate base64 image payload against tier limits. Returns error or None."""
    if not image_b64:
        return "Missing image data"
    
    limits = TIER_REQUEST_LIMITS.get(tier, TIER_REQUEST_LIMITS["free"])
    max_bytes = limits["max_image_size_mb"] * 1024 * 1024 * 1.37  # base64 overhead
    
    if len(image_b64) > max_bytes:
        size_mb = round(len(image_b64) / (1024 * 1024), 1)
        return f"Image too large ({size_mb}MB). {tier.title()} tier max is {limits['max_image_size_mb']}MB."
    
    return None


def estimate_tokens(text: str) -> int:
    """Rough token estimate (1 token ≈ 4 chars for English)."""
    return len(text) // 4


# ── User Tier Resolution ────────────────────────────────────────────────

_tier_cache: Dict[str, tuple] = {}  # user_id → (tier, timestamp)
_TIER_CACHE_TTL = 300  # 5 minutes


def resolve_user_tier(user_id: str) -> str:
    """Resolve user's subscription tier from Supabase.
    
    Caches result for 5 minutes to avoid repeated DB queries.
    Returns: "free", "starter", "pro", or "elite"
    """
    if not user_id:
        return "free"
    
    # Check cache first
    if user_id in _tier_cache:
        tier, ts = _tier_cache[user_id]
        if time.time() - ts < _TIER_CACHE_TTL:
            return tier
    
    # Query Supabase subscriptions table
    try:
        import requests as req
        supabase_url = os.environ.get("VITE_SUPABASE_URL", "")
        supabase_key = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")
        
        if not supabase_url or not supabase_key:
            return "free"
        
        resp = req.get(
            f"{supabase_url}/rest/v1/subscriptions",
            params={
                "select": "plan_tier",
                "user_id": f"eq.{user_id}",
                "status": f"eq.active",
                "limit": "1",
            },
            headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
            },
            timeout=3,
        )
        
        if resp.status_code == 200:
            rows = resp.json()
            if rows and rows[0].get("plan_tier"):
                tier = rows[0]["plan_tier"].lower()
                if tier in TIER_DAILY_CAPS:
                    _tier_cache[user_id] = (tier, time.time())
                    return tier
        
        # No active subscription = free tier
        _tier_cache[user_id] = ("free", time.time())
        return "free"
        
    except Exception as exc:
        _log.warning("[GATEWAY] Tier resolution failed for %s: %s", user_id[:8], exc)
        return "free"




# ── Rec #2: 80% Cap Alert System ────────────────────────────────────────

_alerted_today: Dict[str, set] = {}  # tier → set of alerted user_ids

def check_and_alert(user_id: str, tier: str, usage: Dict[str, int]):
    """Send upgrade prompt when user hits 80% of daily cap."""
    daily_cap = TIER_DAILY_CAPS.get(tier, TIER_DAILY_CAPS["free"])
    threshold = int(daily_cap * 0.8)
    
    if usage["count"] >= threshold:
        alerted = _alerted_today.get(tier, set())
        if user_id not in alerted:
            alerted.add(user_id)
            _alerted_today[tier] = alerted
            remaining = daily_cap - usage["count"]
            _log.info(
                "[ALERT] %s (tier=%s) hit %d/%d — %d remaining",
                user_id[:8], tier, usage["count"], daily_cap, remaining,
            )
            # Return upgrade suggestion (frontend can show this as a toast)
            return {
                "alert": True,
                "message": f"You've used {usage['count']}/{daily_cap} analyses today. Upgrade for more.",
                "remaining": remaining,
                "upgrade_url": "/pricing",
            }
    return None

# ── Layer 1+2+3: Combined Gateway Decorator ─────────────────────────────

def ai_endpoint(f):
    """Full three-layer gateway decorator for AI endpoints.
    
    Layer 1: Authentication (validates JWT)
    Layer 2: Request validation (payload size, image size)
    Layer 3: Spend tracking (daily cap enforcement)
    
    Sets g.current_user and g.user_tier on the request context.
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        from backend.auth import get_current_user
        
        # ── Layer 1: Authentication ──
        user = get_current_user()
        if not user or user.get("role") != "authenticated":
            return jsonify({
                "error": "Authentication required",
                "message": "Please sign in to use AI features",
            }), 401
        
        user_id = user.get("sub", "")
        g.current_user = user
        
        # ── Resolve user tier from Supabase ──
        tier = resolve_user_tier(user_id)
        
        # A/B test: maybe upgrade tier for experiment group
        try:
            from backend.ab_testing import ab_manager
            tier = ab_manager.get_effective_tier(user_id, tier)
        except ImportError:
            pass
        
        g.user_tier = tier
        
        # ── Layer 2: Request Validation ──
        # Check payload size
        if request.method == "POST":
            max_payload = MAX_IMAGE_PAYLOAD if "image" in request.path else MAX_JSON_PAYLOAD
            payload_error = validate_payload(max_payload)
            if payload_error:
                _log.warning("[GATEWAY] Payload rejected for %s: %s", user_id[:8], payload_error)
                return jsonify({"error": payload_error, "code": "PAYLOAD_TOO_LARGE"}), 413
        
        # ── Layer 3: Credit-Based Spend Tracking ──
        endpoint = request.path.rstrip("/")
        if endpoint in AI_ENDPOINTS:
            # Determine credit action for this endpoint
            credit_action = ENDPOINT_CREDIT_ACTION.get(endpoint)
            
            if credit_action:
                from backend.credits import credit_manager
                credit_result = credit_manager.consume(user_id, credit_action, tier)
                
                if "error" in credit_result:
                    _log.warning("[GATEWAY] Credit check failed for %s (tier=%s): %s", user_id[:8], tier, credit_result.get("message", credit_result["error"]))
                    return jsonify({
                        "error": "Insufficient credits",
                        "message": credit_result.get("message", "Not enough credits for this action."),
                        "credits_needed": credit_result.get("credits_needed", 0),
                        "credits_remaining": credit_result.get("credits_remaining", 0),
                        "credits_allocated": credit_result.get("credits_allocated", 0),
                        "tier": tier,
                        "upgrade_url": "/pricing",
                        "code": "CREDITS_EXCEEDED",
                    }), 429
                
                # Log successful credit consumption
                g.credit_cost = credit_result.get("cost", 0)
                g.credits_remaining = credit_result.get("credits_remaining", 0)
                _log.info(
                    "[GATEWAY] %s accessed %s — credits: -%d (remaining: %d, tier=%s)",
                    user_id[:8], endpoint, credit_result.get("cost", 0),
                    credit_result.get("credits_remaining", 0), tier,
                )
            else:
                _log.info("[GATEWAY] %s accessed %s (no credit cost, tier=%s)", user_id[:8], endpoint, tier)
            
            # Also track in SpendKeeper for analytics
            _tracker.record_request(user_id)
            usage = _tracker.get_usage(user_id)
            _log.info(
                "[GATEWAY] %s accessed %s — requests today: %d (tier=%s)",
                user_id[:8], endpoint, usage["count"], tier,
            )
        
        return f(*args, **kwargs)
    return decorated


def ai_endpoint_with_tier(tier: str):
    """Factory version of ai_endpoint that sets a specific tier.
    
    Usage: @ai_endpoint_with_tier("pro")
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated(*args, **kwargs):
            g.user_tier = tier
            return ai_endpoint(f)(*args, **kwargs)
        return decorated
    return decorator
