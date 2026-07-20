#!/usr/bin/env python3
"""Daily Spend Aggregation — Run once per day via cron.

Queries Supabase spend_logs table, computes per-user and per-tier summaries,
and stores results in a spend_summary table for the admin dashboard.

Usage:
    python3 backend/scripts/daily_spend_aggregation.py
    
Or add to Replit cron:
    0 1 * * * cd /path/to/repo && python3 backend/scripts/daily_spend_aggregation.py
"""

import os
import json
import logging
from datetime import datetime, timedelta
from collections import defaultdict

import requests
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
_log = logging.getLogger("spend.agg")

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")

# Approximate MiMo API costs per 1K tokens (update from billing dashboard)
COST_PER_1K_TOKENS = {
    "lightweight": 0.002,
    "mid": 0.010,
    "heavy": 0.030,
    "vision": 0.050,
}


def query_spend_logs(date_str: str) -> list:
    """Query spend_logs for a specific date."""
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/spend_logs",
        params={
            "select": "*",
            "flushed_at": f"gte.{date_str}T00:00:00",
            "flushed_at": f"lte.{date_str}T23:59:59",
        },
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        },
        timeout=10,
    )
    if resp.status_code == 200:
        return resp.json()
    _log.warning("Failed to query spend_logs: %s", resp.status_code)
    return []


def aggregate_and_store(date_str: str):
    """Aggregate spend data for a given date and store summary."""
    _log.info("Aggregating spend for %s", date_str)
    
    logs = query_spend_logs(date_str)
    if not logs:
        _log.info("No spend logs found for %s", date_str)
        return
    
    # Aggregate by user
    user_stats = defaultdict(lambda: {"requests": 0, "tokens": 0, "tier": "free"})
    for log in logs:
        uid = log.get("user_id", "unknown")
        user_stats[uid]["requests"] += log.get("daily_count", 0)
        user_stats[uid]["tokens"] += log.get("daily_tokens", 0)
        user_stats[uid]["tier"] = log.get("tier", "free")
    
    # Aggregate by tier
    tier_stats = defaultdict(lambda: {"users": 0, "requests": 0, "tokens": 0})
    for uid, stats in user_stats.items():
        tier = stats["tier"]
        tier_stats[tier]["users"] += 1
        tier_stats[tier]["requests"] += stats["requests"]
        tier_stats[tier]["tokens"] += stats["tokens"]
    
    # Estimate costs
    total_cost = 0.0
    for tier, stats in tier_stats.items():
        cost_per_1k = COST_PER_1K_TOKENS.get(tier, COST_PER_1K_TOKENS["mid"])
        tier_cost = (stats["tokens"] / 1000) * cost_per_1k
        total_cost += tier_cost
        _log.info("  Tier %s: %d users, %d requests, %d tokens, ~$%.4f",
                  tier, stats["users"], stats["requests"], stats["tokens"], tier_cost)
    
    # Build summary
    summary = {
        "date": date_str,
        "total_requests": sum(s["requests"] for s in tier_stats.values()),
        "total_tokens": sum(s["tokens"] for s in tier_stats.values()),
        "total_users": len(user_stats),
        "estimated_cost_usd": round(total_cost, 4),
        "tier_breakdown": dict(tier_stats),
        "top_users": sorted(
            [{"user_id": uid[:8] + "...", **stats} for uid, stats in user_stats.items()],
            key=lambda x: x["requests"], reverse=True
        )[:10],
        "aggregated_at": datetime.utcnow().isoformat(),
    }
    
    # Store in Supabase
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/spend_summary",
        json=summary,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
        },
        timeout=10,
    )
    
    if resp.status_code in (200, 201):
        _log.info("Summary stored: %d requests, %d tokens, ~$%.4f",
                  summary["total_requests"], summary["total_tokens"], total_cost)
    else:
        _log.warning("Failed to store summary: %s %s", resp.status_code, resp.text[:200])


if __name__ == "__main__":
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    aggregate_and_store(yesterday)
