"""A/B Testing Framework for Model Tiers.

Track whether upgrading a user's model (e.g., giving them mid-tier for one request)
increases conversion to paid plans.

Usage:
    from backend.ab_testing import AbTestManager
    
    ab = AbTestManager()
    # Override tier for a test group
    effective_tier = ab.get_effective_tier(user_id, original_tier="free")
    # Log the result
    ab.log_experiment(user_id, "upgrade_test", original_tier="free", effective_tier="mid")
"""

import os
import time
import hashlib
import logging
from typing import Optional, Dict, Any

import requests

_log = logging.getLogger("luxor.ab")

# Experiment definitions
EXPERIMENTS = {
    "upgrade_test": {
        "description": "Give free users mid-tier model for one analysis",
        "control_tier": "free",
        "treatment_tier": "mid",
        "traffic_pct": 20,  # 20% of free users get upgraded
        "duration_days": 14,
        "start_date": "2026-07-20",
    },
    "elite_preview": {
        "description": "Show pro users what elite feels like",
        "control_tier": "pro",
        "treatment_tier": "elite",
        "traffic_pct": 10,
        "duration_days": 7,
        "start_date": "2026-07-20",
    },
}


def _deterministic_bucket(user_id: str, experiment: str) -> int:
    """Deterministic bucket assignment (0-99) based on user_id + experiment.
    
    Same user always gets the same bucket for the same experiment.
    This ensures consistent treatment across requests.
    """
    seed = f"{user_id}:{experiment}"
    hash_val = int(hashlib.md5(seed.encode()).hexdigest()[:8], 16)
    return hash_val % 100


class AbTestManager:
    """Manage A/B test assignments and logging."""
    
    def __init__(self):
        self._assignments: Dict[str, Dict[str, str]] = {}  # user_id → {experiment: tier}
    
    def is_experiment_active(self, experiment: str) -> bool:
        """Check if an experiment is currently running."""
        config = EXPERIMENTS.get(experiment)
        if not config:
            return False
        
        from datetime import datetime, timedelta
        start = datetime.strptime(config["start_date"], "%Y-%m-%d")
        end = start + timedelta(days=config["duration_days"])
        return start <= datetime.utcnow() <= end
    
    def get_effective_tier(self, user_id: str, original_tier: str) -> str:
        """Get the effective tier for a user, considering A/B test assignments.
        
        If the user is in a treatment group, return the upgraded tier.
        Otherwise, return their original tier.
        """
        for experiment, config in EXPERIMENTS.items():
            if not self.is_experiment_active(experiment):
                continue
            
            # Only run experiments on the control tier
            if original_tier != config["control_tier"]:
                continue
            
            bucket = _deterministic_bucket(user_id, experiment)
            if bucket < config["traffic_pct"]:
                _log.info(
                    "[AB] %s in treatment group for '%s' (%s → %s)",
                    user_id[:8], experiment, original_tier, config["treatment_tier"],
                )
                return config["treatment_tier"]
        
        return original_tier
    
    def log_experiment(
        self,
        user_id: str,
        experiment: str,
        original_tier: str,
        effective_tier: str,
        result: Optional[Dict[str, Any]] = None,
    ):
        """Log an experiment observation to Supabase for analysis."""
        if original_tier == effective_tier:
            return  # Not in treatment group
        
        try:
            supabase_url = os.environ.get("VITE_SUPABASE_URL", "")
            supabase_key = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")
            if not supabase_url or not supabase_key:
                return
            
            requests.post(
                f"{supabase_url}/rest/v1/ab_experiments",
                json={
                    "user_id": user_id,
                    "experiment": experiment,
                    "original_tier": original_tier,
                    "effective_tier": effective_tier,
                    "observed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "metadata": result or {},
                },
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json",
                },
                timeout=5,
            )
        except Exception as exc:
            _log.warning("[AB] Failed to log experiment: %s", exc)
    
    def get_conversion_rate(self, experiment: str) -> Dict[str, Any]:
        """Calculate conversion rate for an experiment from Supabase data."""
        try:
            supabase_url = os.environ.get("VITE_SUPABASE_URL", "")
            supabase_key = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")
            if not supabase_url or not supabase_key:
                return {"error": "Supabase not configured"}
            
            resp = requests.get(
                f"{supabase_url}/rest/v1/ab_experiments",
                params={
                    "select": "*",
                    "experiment": f"eq.{experiment}",
                },
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                },
                timeout=10,
            )
            
            if resp.status_code != 200:
                return {"error": f"Query failed: {resp.status_code}"}
            
            rows = resp.json()
            return {
                "experiment": experiment,
                "total_observations": len(rows),
                "config": EXPERIMENTS.get(experiment, {}),
            }
        except Exception as exc:
            return {"error": str(exc)}


# Global instance
ab_manager = AbTestManager()
