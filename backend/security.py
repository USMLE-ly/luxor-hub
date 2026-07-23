"""
Luxor Hub — Security Layer
Console injection protection, fraud detection, user banning,
input sanitization, and abuse monitoring.
"""

import os
import re
import time
import logging
import hashlib
import threading
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple, List
from functools import wraps

import requests
from flask import request, jsonify, g

_log = logging.getLogger("luxor.security")

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")

# ── In-Memory Threat Intelligence ───────────────────────────
# These reset on server restart — persistent data lives in Supabase

_banned_users: Dict[str, Dict[str, Any]] = {}  # user_id → {reason, banned_at, expires_at}
_suspicious_ips: Dict[str, List[float]] = {}   # ip → [timestamps of suspicious requests]
_user_request_counts: Dict[str, List[float]] = {}  # user_id → [timestamps]
_abuse_scores: Dict[str, float] = {}  # user_id → abuse score (0-100)

_lock = threading.Lock()

# ── Configuration ───────────────────────────────────────────
MAX_REQUESTS_PER_MINUTE = 30  # per user (AI endpoints)
MAX_REQUESTS_PER_HOUR = 200   # per user (all endpoints)
ABUSE_THRESHOLD = 50          # score to trigger auto-ban
BAN_DURATION_HOURS = 24       # default ban length
CRITICAL_BAN_DURATION_HOURS = 168  # 7 days for severe abuse

# ── Dangerous Patterns (Console Injection Detection) ───────
SCRIPT_INJECTION_PATTERNS = [
    r"<script[^>]*>",           # HTML script tags
    r"javascript:",             # javascript: URIs
    r"on\w+\s*=",             # inline event handlers (onclick, onerror, etc.)
    r"eval\s*\(",             # eval() calls
    r"Function\s*\(",         # Function() constructor
    r"document\.(cookie|write|location)",  # DOM manipulation
    r"window\.(location|open)",            # Window manipulation
    r"\$\{.*\}",             # Template literal injection
    r"\bexec\s*\(",          # exec() calls
    r"__proto__",               # Prototype pollution
    r"constructor\s*\[",      # Constructor access
    r"\b(import|require)\s*\(",  # Module injection
    r"fetch\s*\(.*https?://", # Direct fetch to external URLs
    r"XMLHttpRequest",          # XHR injection
    r"<img[^>]+onerror",        # Image onerror injection
    r"<svg[^>]+onload",         # SVG onload injection
]

# ── SQL Injection Patterns ─────────────────────────────────
SQL_INJECTION_PATTERNS = [
    r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b.*\b(FROM|INTO|SET|WHERE|TABLE)\b)",
    r"(--|;|/\*|\*/)",         # SQL comment/terminator sequences
    r"(\bOR\b\s+\d+\s*=\s*\d+)",  # OR 1=1 style
    r"(\bAND\b\s+\d+\s*=\s+\d+)", # AND 1=1 style
    r"(CHAR\(|CONCAT\(|0x[0-9a-fA-F]+)",  # SQL functions/hex encoding
]

# ── Sanitization ───────────────────────────────────────────
def sanitize_input(value: Any, max_length: int = 500) -> Any:
    """Sanitize any input value. Returns safe string or original type."""
    if value is None or isinstance(value, (int, float, bool)):
        return value
    if isinstance(value, list):
        return [sanitize_input(item, max_length) for item in value[:50]]  # Max 50 items
    if isinstance(value, dict):
        return {k: sanitize_input(v, max_length) for k, v in list(value.items())[:30]}  # Max 30 keys
    if isinstance(value, str):
        # Truncate
        value = value[:max_length]
        # Remove null bytes
        value = value.replace("\x00", "")
        # Strip HTML tags
        value = re.sub(r"<[^>]+>", "", value)
        # Remove script patterns
        for pattern in SCRIPT_INJECTION_PATTERNS:
            value = re.sub(pattern, "", value, flags=re.IGNORECASE)
        return value.strip()
    return str(value)[:max_length]


def detect_injection(value: str) -> Optional[str]:
    """Detect script/SQL injection in a string. Returns attack type or None."""
    if not isinstance(value, str):
        return None
    for pattern in SCRIPT_INJECTION_PATTERNS:
        if re.search(pattern, value, re.IGNORECASE):
            return "script_injection"
    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, value, re.IGNORECASE):
            return "sql_injection"
    return None


# ── User Banning ───────────────────────────────────────────
def is_user_banned(user_id: str) -> bool:
    """Check if a user is currently banned (in-memory + Supabase persistent)."""
    # 1. Check in-memory cache first (fast)
    with _lock:
        ban_info = _banned_users.get(user_id)
        if ban_info:
            expires = ban_info.get("expires_at")
            if expires and datetime.utcnow() > expires:
                del _banned_users[user_id]
            else:
                return True
    
    # 2. Check Supabase persistent bans (survives restarts)
    if SUPABASE_URL and SUPABASE_SERVICE_KEY:
        try:
            resp = requests.get(
                f"{SUPABASE_URL}/rest/v1/banned_users",
                params={
                    "select": "reason,severity,expires_at",
                    "user_id": f"eq.{user_id}",
                    "limit": "1",
                },
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                },
                timeout=3,
            )
            if resp.status_code == 200:
                rows = resp.json()
                if rows:
                    row = rows[0]
                    expires_str = row.get("expires_at")
                    if expires_str:
                        expires = datetime.fromisoformat(expires_str.replace("Z", "+00:00")).replace(tzinfo=None)
                        if datetime.utcnow() > expires:
                            # Ban expired in DB — clean up
                            _cleanup_expired_ban(user_id)
                            return False
                    # Cache in memory
                    with _lock:
                        _banned_users[user_id] = {
                            "reason": row.get("reason", ""),
                            "severity": row.get("severity", "medium"),
                            "banned_at": datetime.utcnow(),
                            "expires": expires if expires_str else None,
                        }
                    return True
        except Exception as exc:
            _log.warning("[SECURITY] Supabase ban check failed: %s", exc)
    
    return False


def _cleanup_expired_ban(user_id: str):
    """Remove expired ban from Supabase."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return
    try:
        requests.delete(
            f"{SUPABASE_URL}/rest/v1/banned_users?user_id=eq.{user_id}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            },
            timeout=3,
        )
    except Exception:
        pass


def ban_user(user_id: str, reason: str, hours: int = BAN_DURATION_HOURS, severity: str = "medium"):
    """Ban a user for a specified duration (in-memory + persistent)."""
    expires_at = datetime.utcnow() + timedelta(hours=hours)
    
    with _lock:
        _banned_users[user_id] = {
            "reason": reason,
            "severity": severity,
            "banned_at": datetime.utcnow(),
            "expires_at": expires_at,
        }
    
    # Persist to Supabase
    if SUPABASE_URL and SUPABASE_SERVICE_KEY:
        try:
            requests.post(
                f"{SUPABASE_URL}/rest/v1/banned_users",
                json={
                    "user_id": user_id,
                    "reason": reason,
                    "severity": severity,
                    "expires_at": expires_at.isoformat() + "Z",
                },
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "resolution=merge-duplicates",
                },
                timeout=5,
            )
        except Exception as exc:
            _log.warning("[SECURITY] Failed to persist ban: %s", exc)
    
    _log.warning("[SECURITY] BANNED user=%s reason=%s severity=%s duration=%dh", user_id[:8], reason, severity, hours)
    _log_to_supabase("user_banned", user_id, {"reason": reason, "severity": severity, "hours": hours})


def get_ban_info(user_id: str) -> Optional[Dict[str, Any]]:
    """Get ban information for a user."""
    with _lock:
        return _banned_users.get(user_id)


# ── Abuse Scoring ──────────────────────────────────────────
def record_suspicious_activity(user_id: str, ip: str, activity_type: str, details: str = ""):
    """Record suspicious activity and potentially auto-ban."""
    now = time.time()
    
    with _lock:
        # Track by IP
        if ip not in _suspicious_ips:
            _suspicious_ips[ip] = []
        _suspicious_ips[ip].append(now)
        # Clean old entries (keep last hour)
        _suspicious_ips[ip] = [t for t in _suspicious_ips[ip] if now - t < 3600]
        
        # Update abuse score
        score = _abuse_scores.get(user_id, 0)
        
        # Score weights by activity type
        score_weights = {
            "script_injection": 30,
            "sql_injection": 40,
            "rapid_fire": 10,
            "invalid_action": 5,
            "forged_token": 50,
            "console_bypass_attempt": 20,
            "rate_limit_exceeded": 15,
            "unusual_pattern": 10,
        }
        score += score_weights.get(activity_type, 10)
        _abuse_scores[user_id] = score
        
        # Auto-ban if threshold exceeded
        if score >= ABUSE_THRESHOLD:
            severity = "critical" if score >= 80 else "high" if score >= 60 else "medium"
            ban_hours = CRITICAL_BAN_DURATION_HOURS if severity == "critical" else BAN_DURATION_HOURS
            ban_user(user_id, f"Auto-banned: {activity_type} (score={score})", hours=ban_hours, severity=severity)
    
    _log.warning("[SECURITY] Suspicious: user=%s ip=%s type=%s score=%.0f details=%s",
                 user_id[:8], ip, activity_type, _abuse_scores.get(user_id, 0), details)


def check_rate_limit(user_id: str) -> bool:
    """Check if user has exceeded per-user rate limit. Returns True if OK."""
    now = time.time()
    with _lock:
        if user_id not in _user_request_counts:
            _user_request_counts[user_id] = []
        timestamps = _user_request_counts[user_id]
        # Clean old entries
        timestamps = [t for t in timestamps if now - t < 3600]
        _user_request_counts[user_id] = timestamps
        
        # Check per-minute
        minute_count = sum(1 for t in timestamps if now - t < 60)
        if minute_count >= MAX_REQUESTS_PER_MINUTE:
            return False
        
        # Check per-hour
        if len(timestamps) >= MAX_REQUESTS_PER_HOUR:
            return False
        
        timestamps.append(now)
        return True


# ── Request Validation ─────────────────────────────────────
def validate_request_origin() -> Tuple[bool, str]:
    """Validate that the request comes from an allowed origin."""
    origin = request.headers.get("Origin", "")
    referer = request.headers.get("Referer", "")
    allowed_origins = ["https://luxor.ly", "https://www.luxor.ly", "http://localhost:5173", "http://localhost:3000"]
    
    # Check Origin header
    if origin and origin not in allowed_origins:
        return False, f"Blocked origin: {origin}"
    
    # Check Referer header (fallback)
    if referer and not any(referer.startswith(o) for o in allowed_origins):
        # Allow missing referer (direct API calls from the app)
        if origin:  # If origin was present but invalid, it's suspicious
            return False, f"Blocked referer: {referer}"
    
    return True, ""


def validate_request_fingerprint() -> Tuple[bool, str]:
    """Basic fingerprint validation — detect obvious bot/script requests."""
    user_agent = request.headers.get("User-Agent", "")
    
    # Block empty user agent (scripts often omit it)
    if not user_agent:
        return False, "Missing User-Agent"
    
    # Block known bot/scraper user agents
    bot_patterns = ["curl", "wget", "python-requests", "postman", "insomnia", "httpie"]
    ua_lower = user_agent.lower()
    for bot in bot_patterns:
        if bot in ua_lower:
            return False, f"Bot user agent detected: {bot}"
    
    return True, ""


# ── Input Scanning Middleware ───────────────────────────────
def scan_request_inputs() -> Optional[Tuple]:
    """Scan all request inputs for injection attempts. Returns error response or None."""
    user_id = getattr(g, "current_user", {}).get("sub", "") if hasattr(g, "current_user") and g.current_user else ""
    ip = request.remote_addr or "unknown"
    
    # Scan JSON body
    if request.is_json:
        data = request.get_json(silent=True) or {}
        for key, value in data.items():
            if isinstance(value, str):
                attack = detect_injection(value)
                if attack:
                    record_suspicious_activity(user_id, ip, attack, f"field={key} value={value[:100]}")
                    return (jsonify({
                        "error": "Request blocked",
                        "message": "Potentially malicious input detected.",
                    }), 403)
    
    # Scan query parameters
    for key, value in request.args.items():
        if isinstance(value, str):
            attack = detect_injection(value)
            if attack:
                record_suspicious_activity(user_id, ip, attack, f"query={key} value={value[:100]}")
                return (jsonify({
                    "error": "Request blocked",
                    "message": "Potentially malicious input detected.",
                }), 403)
    
    return None


# ── Main Security Check (called as middleware) ──────────────
def security_check() -> Optional[Tuple]:
    """Run all security checks. Returns error response or None if OK."""
    user_id = ""
    if hasattr(g, "current_user") and g.current_user:
        user_id = g.current_user.get("sub", "")
    ip = request.remote_addr or "unknown"
    
    # 1. Check if user is banned
    if user_id and is_user_banned(user_id):
        ban_info = get_ban_info(user_id)
        return (jsonify({
            "error": "Account suspended",
            "message": f"Your account has been temporarily suspended due to: {ban_info.get('reason', 'policy violation')}. Contact support if you believe this is an error.",
            "expires_at": ban_info.get("expires_at", "").isoformat() if isinstance(ban_info.get("expires_at"), datetime) else "",
        }), 403)
    
    # 2. Validate request origin
    origin_ok, origin_reason = validate_request_origin()
    if not origin_ok:
        record_suspicious_activity(user_id or "anonymous", ip, "unusual_pattern", origin_reason)
        return (jsonify({"error": "Request blocked"}), 403)
    
    # 3. Validate request fingerprint (non-AI endpoints only — AI endpoints need custom UAs)
    if request.endpoint and "credits" in (request.endpoint or ""):
        fp_ok, fp_reason = validate_request_fingerprint()
        if not fp_ok:
            record_suspicious_activity(user_id or "anonymous", ip, "console_bypass_attempt", fp_reason)
            # Don't block — just log. Some valid clients have unusual UAs.
            _log.warning("[SECURITY] Fingerprint warning: %s — %s", ip, fp_reason)
    
    # 4. Rate limit check (per-user)
    if user_id and not check_rate_limit(user_id):
        record_suspicious_activity(user_id, ip, "rate_limit_exceeded")
        return (jsonify({
            "error": "Rate limit exceeded",
            "message": "Too many requests. Please wait a moment and try again.",
        }), 429)
    
    # 5. Input injection scan
    injection_result = scan_request_inputs()
    if injection_result:
        return injection_result
    
    return None


# ── Supabase Logging ───────────────────────────────────────
def _log_to_supabase(action: str, user_id: str, metadata: Dict[str, Any]):
    """Log security event to Supabase audit_logs + security_alerts."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return
    
    try:
        ip = request.remote_addr or "unknown"
        user_agent = request.headers.get("User-Agent", "")[:200]
        page_url = request.headers.get("Referer", "")[:500]
        
        # Insert into audit_logs
        requests.post(
            f"{SUPABASE_URL}/rest/v1/audit_logs",
            json={
                "user_id": user_id if user_id else None,
                "action": action,
                "table_name": "credit_system",
                "metadata": metadata,
                "page_url": page_url,
                "user_agent": user_agent,
                "ip_address": ip,
            },
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
            },
            timeout=5,
        )
        
        # If high severity, also create security_alert
        severity = metadata.get("severity", "low")
        if severity in ("high", "critical"):
            requests.post(
                f"{SUPABASE_URL}/rest/v1/security_alerts",
                json={
                    "severity": severity,
                    "event_type": action,
                    "user_id": user_id if user_id else None,
                    "details": metadata.get("reason", metadata.get("details", action)),
                    "metadata": metadata,
                },
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                },
                timeout=5,
            )
    except Exception as exc:
        _log.warning("[SECURITY] Supabase log failed: %s", exc)


# ── Security Status (for admin endpoint) ───────────────────
def get_security_status() -> Dict[str, Any]:
    """Get current security status for admin dashboard."""
    with _lock:
        return {
            "banned_users": len(_banned_users),
            "suspicious_ips": len(_suspicious_ips),
            "active_abuse_scores": len([s for s in _abuse_scores.values() if s > 20]),
            "total_tracked_users": len(_user_request_counts),
            "recent_bans": [
                {
                    "user_id": uid[:8] + "...",
                    "reason": info.get("reason", ""),
                    "severity": info.get("severity", ""),
                    "expires_at": info.get("expires_at", "").isoformat() if isinstance(info.get("expires_at"), datetime) else "",
                }
                for uid, info in list(_banned_users.items())[:10]
            ],
        }
