"""Email Service — Send transactional emails for credit alerts.

Uses Resend API (free tier: 100 emails/day).
Set RESEND_API_KEY in Replit env to activate.
"""

import os
import logging
import requests
from typing import Optional

_log = logging.getLogger("luxor.email")

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL = os.environ.get("EMAIL_FROM", "LUXOR <noreply@luxor.ly>")


def send_credit_alert(user_email: str, user_name: str, credits_remaining: int, tier: str) -> bool:
    """Send low-credit alert email."""
    if not RESEND_API_KEY:
        _log.info("[EMAIL] RESEND_API_KEY not set — skipping credit alert to %s", user_email)
        return False

    tier_credits = {"free": 30, "starter": 200, "pro": 1000, "elite": 5000}
    allocated = tier_credits.get(tier, 30)
    percentage = int((credits_remaining / allocated) * 100) if allocated > 0 else 0

    subject = f"⚠️ You have {credits_remaining} credits left"
    
    # Tailored message based on tier
    if tier == "free":
        upgrade_text = "Upgrade to Starter for 200 credits/month — just $9."
        upgrade_cta = "https://luxor.ly/pricing"
    elif tier == "starter":
        upgrade_text = "Upgrade to Pro for 1,000 credits/month — the best value."
        upgrade_cta = "https://luxor.ly/pricing"
    else:
        upgrade_text = "Consider upgrading for more credits."
        upgrade_cta = "https://luxor.ly/pricing"

    html = f"""
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; color: #1a2a1f;">LUXOR® — Low Credits Alert</h1>
        <p style="font-size: 16px; color: #333;">Hi {user_name},</p>
        <p style="font-size: 14px; color: #666;">
            You have <strong>{credits_remaining} credits</strong> remaining this month 
            ({percentage}% of your {tier} allocation).
        </p>
        <p style="font-size: 14px; color: #666;">
            {upgrade_text}
        </p>
        <a href="{upgrade_cta}" 
           style="display: inline-block; padding: 12px 24px; background: #2d5a3d; color: white; 
                  text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
            Upgrade Now
        </a>
        <p style="font-size: 12px; color: #999; margin-top: 32px;">
            — The LUXOR® Team
        </p>
    </div>
    """

    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            json={
                "from": FROM_EMAIL,
                "to": [user_email],
                "subject": subject,
                "html": html,
            },
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            timeout=10,
        )
        if resp.status_code == 200:
            _log.info("[EMAIL] Credit alert sent to %s", user_email)
            return True
        _log.warning("[EMAIL] Failed to send: %s %s", resp.status_code, resp.text[:200])
        return False
    except Exception as exc:
        _log.error("[EMAIL] Send failed: %s", exc)
        return False


def send_welcome_email(user_email: str, user_name: str, tier: str) -> bool:
    """Send welcome email after subscription."""
    if not RESEND_API_KEY:
        return False

    tier_credits = {"starter": 200, "pro": 1000, "elite": 5000}
    credits = tier_credits.get(tier, 30)

    html = f"""
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; color: #1a2a1f;">Welcome to LUXOR® {tier.title()}! 🎉</h1>
        <p style="font-size: 16px; color: #333;">Hi {user_name},</p>
        <p style="font-size: 14px; color: #666;">
            Your {tier} subscription is active. You have <strong>{credits} credits</strong> this month.
        </p>
        <a href="https://luxor.ly/closet"
           style="display: inline-block; padding: 12px 24px; background: #2d5a3d; color: white; 
                  text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
            Start Styling
        </a>
        <p style="font-size: 12px; color: #999; margin-top: 32px;">
            — The LUXOR® Team
        </p>
    </div>
    """

    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            json={"from": FROM_EMAIL, "to": [user_email], "subject": "Welcome to LUXOR®!", "html": html},
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            timeout=10,
        )
        return resp.status_code == 200
    except Exception:
        return False


def send_subscription_confirmed_email(user_email: str, user_name: str, tier: str) -> bool:
    """Send subscription confirmed email (safety net after payment)."""
    if not RESEND_API_KEY:
        return False

    html = f"""
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; color: #1a2a1f;">LUXOR® — Payment Confirmed ✓</h1>
        <p style="font-size: 16px; color: #333;">Hi {user_name},</p>
        <p style="font-size: 14px; color: #666;">
            Your {tier} subscription is confirmed and your credits have been allocated.
        </p>
        <p style="font-size: 14px; color: #666;">
            If you didn't make this purchase, please contact support@luxor.ly immediately.
        </p>
        <a href="https://luxor.ly/credits"
           style="display: inline-block; padding: 12px 24px; background: #2d5a3d; color: white; 
                  text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
            View Your Credits
        </a>
        <p style="font-size: 12px; color: #999; margin-top: 32px;">
            — The LUXOR® Team
        </p>
    </div>
    """

    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            json={"from": FROM_EMAIL, "to": [user_email], "subject": f"LUXOR® — {tier.title()} Confirmed", "html": html},
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            timeout=10,
        )
        return resp.status_code == 200
    except Exception:
        return False
