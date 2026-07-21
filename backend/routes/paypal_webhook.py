"""PayPal Webhook — Sync subscription status with Supabase.

When a user subscribes, upgrades, or cancels via PayPal, this webhook
updates the subscriptions table in Supabase automatically.

Setup:
1. Go to PayPal Developer Dashboard → Webhooks
2. Add webhook URL: https://your-replit.replit.app/api/v1/webhooks/paypal
3. Subscribe to these events:
   - BILLING.SUBSCRIPTION.ACTIVATED
   - BILLING.SUBSCRIPTION.UPDATED
   - BILLING.SUBSCRIPTION.CANCELLED
   - BILLING.SUBSCRIPTION.EXPIRED
   - BILLING.PAYMENT.COMPLETED
4. Set the webhook ID in env var: PAYPAL_WEBHOOK_ID
"""

import os
import hmac
import hashlib
import json
import logging
import time
from typing import Optional, Dict

import requests
from flask import request, jsonify

_log = logging.getLogger("luxor.paypal_webhook")

PAYPAL_WEBHOOK_ID = os.environ.get("PAYPAL_WEBHOOK_ID", "")
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")


# Map PayPal plan IDs to our tiers
PLAN_ID_TO_TIER = {
    os.environ.get("VITE_PAYPAL_STARTER_PLAN_ID", ""): "starter",
    os.environ.get("VITE_PAYPAL_PRO_PLAN_ID", ""): "pro",
    os.environ.get("VITE_PAYPAL_ELITE_PLAN_ID", ""): "elite",
}


def init_routes(app):
    @app.route("/api/v1/webhooks/paypal", methods=["POST", "OPTIONS"], strict_slashes=False)
    def paypal_webhook():
        """Handle PayPal webhook events and sync to Supabase."""
        if request.method == "OPTIONS":
            return "", 204

        # Verify webhook signature (simplified — PayPal docs recommend full verification)
        # For now, we check the webhook ID header
        webhook_id = request.headers.get("paypal-webhook-id", "")
        if PAYPAL_WEBHOOK_ID and webhook_id != PAYPAL_WEBHOOK_ID:
            _log.warning("[PAYPAL-WEBHOOK] Invalid webhook ID: %s", webhook_id[:20])
            return jsonify({"error": "Invalid webhook"}), 401

        try:
            event = request.get_json(silent=True) or {}
            event_type = event.get("event_type", "")
            resource = event.get("resource", {})

            _log.info("[PAYPAL-WEBHOOK] Event: %s", event_type)

            if event_type == "BILLING.SUBSCRIPTION.ACTIVATED":
                _handle_subscription_activated(resource)
            elif event_type == "BILLING.SUBSCRIPTION.UPDATED":
                _handle_subscription_updated(resource)
            elif event_type in ("BILLING.SUBSCRIPTION.CANCELLED", "BILLING.SUBSCRIPTION.EXPIRED"):
                _handle_subscription_cancelled(resource)
            elif event_type == "BILLING.PAYMENT.COMPLETED":
                _handle_payment_completed(resource)
            else:
                _log.info("[PAYPAL-WEBHOOK] Unhandled event type: %s", event_type)

            return jsonify({"status": "ok"}), 200

        except Exception as exc:
            _log.error("[PAYPAL-WEBHOOK] Error processing webhook: %s", exc)
            return jsonify({"error": "Webhook processing failed"}), 500


def _handle_subscription_activated(resource):
    """User subscribed — create or update their Supabase subscription."""
    subscription_id = resource.get("id", "")
    plan_id = resource.get("plan_id", "")
    user_id = _extract_user_id(resource)
    tier = PLAN_ID_TO_TIER.get(plan_id, "free")

    if not user_id:
        _log.warning("[PAYPAL-WEBHOOK] No user_id in activated event")
        return

    _upsert_subscription(user_id, tier, "active", subscription_id)

    # Allocate credits for the new tier
    _allocate_credits_for_tier(user_id, tier)

    _log.info("[PAYPAL-WEBHOOK] Activated: user=%s tier=%s", user_id[:8], tier)

    # Send confirmation email
    try:
        from backend.services.email_service import send_subscription_confirmed_email
        user_email = resource.get("subscriber", {}).get("email_address", "")
        if user_email:
            send_subscription_confirmed_email(user_email, "", tier)
    except Exception:
        pass


def _handle_subscription_updated(resource):
    """Subscription changed (upgrade/downgrade)."""
    subscription_id = resource.get("id", "")
    plan_id = resource.get("plan_id", "")
    user_id = _extract_user_id(resource)
    tier = PLAN_ID_TO_TIER.get(plan_id, "free")

    if user_id:
        _upsert_subscription(user_id, tier, "active", subscription_id)
        # Re-allocate credits for new tier on upgrade
        _allocate_credits_for_tier(user_id, tier)
        _log.info("[PAYPAL-WEBHOOK] Updated: user=%s tier=%s", user_id[:8], tier)


def _handle_subscription_cancelled(resource):
    """Subscription cancelled or expired — downgrade to free."""
    subscription_id = resource.get("id", "")
    user_id = _extract_user_id(resource)

    if user_id:
        _upsert_subscription(user_id, "free", "cancelled", subscription_id)
        _log.info("[PAYPAL-WEBHOOK] Cancelled: user=%s", user_id[:8])


def _handle_payment_completed(resource):
    """Payment received — log for auditing."""
    subscription_id = resource.get("subscription_id", "")
    amount = resource.get("amount", {}).get("total", "0")
    _log.info("[PAYPAL-WEBHOOK] Payment: sub=%s amount=%s", subscription_id[:20], amount)


def _allocate_credits_for_tier(user_id: str, tier: str):
    """Allocate credits when subscription activates or upgrades."""
    from backend.credits import TIER_MONTHLY_CREDITS
    from datetime import datetime

    allocated = TIER_MONTHLY_CREDITS.get(tier, 30)
    current_month = datetime.utcnow().strftime("%Y-%m")

    if not SUPABASE_URL or not SUPABASE_KEY:
        _log.warning("[PAYPAL-WEBHOOK] Cannot allocate credits - Supabase not configured")
        return

    try:
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/credit_balances",
            params={"select": "id", "user_id": f"eq.{user_id}", "month": f"eq.{current_month}", "limit": "1"},
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
            timeout=5,
        )

        rows = resp.json() if resp.status_code == 200 else []
        headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}

        if rows:
            requests.patch(
                f"{SUPABASE_URL}/rest/v1/credit_balances?id=eq.{rows[0]['id']}",
                json={"credits_allocated": allocated, "credits_remaining": allocated},
                headers=headers, timeout=5,
            )
        else:
            requests.post(
                f"{SUPABASE_URL}/rest/v1/credit_balances",
                json={"user_id": user_id, "month": current_month, "credits_allocated": allocated, "credits_remaining": allocated},
                headers=headers, timeout=5,
            )

        _log.info("[PAYPAL-WEBHOOK] Credits %s for user=%s tier=%s alloc=%d",
                  "updated" if rows else "allocated", user_id[:8], tier, allocated)
    except Exception as exc:
        _log.error("[PAYPAL-WEBHOOK] Credit allocation failed: %s", exc)


def _extract_user_id(resource) -> Optional[str]:
    """Extract user_id from PayPal webhook resource.
    
    PayPal includes custom_id in the subscription which we set during checkout.
    """
    return resource.get("custom_id") or resource.get("subscriber", {}).get("email_address", "")


def _upsert_subscription(user_id: str, tier: str, status: str, subscription_id: str):
    """Create or update subscription in Supabase."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        _log.warning("[PAYPAL-WEBHOOK] Supabase not configured")
        return

    try:
        # Check if subscription exists
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/subscriptions",
            params={
                "select": "id",
                "user_id": f"eq.{user_id}",
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
                # Update existing
                requests.patch(
                    f"{SUPABASE_URL}/rest/v1/subscriptions?id=eq.{rows[0]['id']}",
                    json={
                        "plan_tier": tier,
                        "status": status,
                        "paypal_subscription_id": subscription_id,
                        "current_period_start": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    },
                    headers={
                        "apikey": SUPABASE_KEY,
                        "Authorization": f"Bearer {SUPABASE_KEY}",
                        "Content-Type": "application/json",
                    },
                    timeout=5,
                )
            else:
                # Insert new
                requests.post(
                    f"{SUPABASE_URL}/rest/v1/subscriptions",
                    json={
                        "user_id": user_id,
                        "plan_tier": tier,
                        "status": status,
                        "paypal_subscription_id": subscription_id,
                    },
                    headers={
                        "apikey": SUPABASE_KEY,
                        "Authorization": f"Bearer {SUPABASE_KEY}",
                        "Content-Type": "application/json",
                    },
                    timeout=5,
                )
    except Exception as exc:
        _log.error("[PAYPAL-WEBHOOK] Supabase upsert failed: %s", exc)
