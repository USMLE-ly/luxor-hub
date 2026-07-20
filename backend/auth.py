"""Authentication middleware for Luxor API endpoints.

Provides a @require_auth decorator that validates Supabase JWT tokens.
Destructive endpoints MUST use this decorator to prevent anonymous abuse.
"""

import os
import logging
import functools
from typing import Optional, Tuple

import requests
from flask import request, jsonify, g

_log = logging.getLogger("luxor.auth")

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")


def _extract_token() -> Optional[str]:
    """Extract Bearer token from Authorization header."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


def _validate_supabase_token(token: str) -> Optional[dict]:
    """Validate a Supabase JWT and return the payload, or None if invalid.
    
    Uses Supabase's /auth/v1/user endpoint to verify the token.
    Caches the result for the duration of the request.
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        _log.warning("[AUTH] Supabase not configured — skipping auth")
        return {"sub": "anonymous", "role": "anon"}

    try:
        resp = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_ANON_KEY,
            },
            timeout=5,
        )
        if resp.status_code == 200:
            user_data = resp.json()
            return {
                "sub": user_data.get("id", ""),
                "email": user_data.get("email", ""),
                "role": "authenticated",
            }
        else:
            _log.warning("[AUTH] Token validation failed: HTTP %s", resp.status_code)
            return None
    except Exception as exc:
        _log.error("[AUTH] Token validation error: %s", exc)
        return None


def get_current_user() -> Optional[dict]:
    """Get the current authenticated user from the request context.
    
    Returns None if not authenticated. Caches result per-request.
    """
    if hasattr(g, "_auth_user"):
        return g._auth_user

    token = _extract_token()
    if not token:
        g._auth_user = None
        return None

    user = _validate_supabase_token(token)
    g._auth_user = user
    return user


def require_auth(f):
    """Decorator: requires a valid Supabase JWT token.
    
    Returns 401 if no valid token is provided.
    Sets g.current_user with the validated user payload.
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user or user.get("role") != "authenticated":
            return jsonify({
                "error": "Authentication required",
                "message": "Please sign in to access this resource",
            }), 401
        g.current_user = user
        return f(*args, **kwargs)
    return decorated


def optional_auth(f):
    """Decorator: extracts user if token present, but doesn't require it.
    
    Sets g.current_user to the user dict or None.
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        g.current_user = get_current_user()
        return f(*args, **kwargs)
    return decorated
