"""Sentry Error Tracking — Captures production errors.

Setup:
1. Create free account at https://sentry.io
2. Create a new Python project
3. Copy the DSN and set in env: SENTRY_DSN
4. That's it — errors auto-report after initialization
"""

import os
import logging

_log = logging.getLogger("luxor.monitoring")


def init_sentry(app):
    """Initialize Sentry for Flask error tracking.
    
    Only activates when SENTRY_DSN env var is set.
    In development, errors stay local (no network calls).
    """
    sentry_dsn = os.environ.get("SENTRY_DSN", "")
    if not sentry_dsn:
        _log.info("[SENTRY] No DSN configured — error tracking disabled")
        return

    try:
        import sentry_sdk
        from sentry_sdk.integrations.flask import FlaskIntegration

        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[FlaskIntegration()],
            traces_sample_rate=0.1,  # 10% of transactions for performance
            send_default_pii=False,  # Don't send user PII (GDPR)
            environment=os.environ.get("FLASK_ENV", "production"),
            release="luxor-backend@1.0.0",
        )
        _log.info("[SENTRY] Initialized — errors will be reported to Sentry")
    except ImportError:
        _log.warning("[SENTRY] sentry-sdk not installed. Run: pip install sentry-sdk[flask]")
    except Exception as exc:
        _log.warning("[SENTRY] Failed to initialize: %s", exc)
