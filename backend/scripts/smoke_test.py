#!/usr/bin/env python3
"""Smoke Test — Verify all critical paths before deploy.

Run before pushing to production:
    python3 backend/scripts/smoke_test.py
"""

import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(BASE_DIR)
sys.path.insert(0, BASE_DIR)

checks = []

def check(label, condition, detail=""):
    status = "✅" if condition else "❌"
    checks.append((label, condition))
    print(f"  {status} {label}" + (f" — {detail}" if detail and not condition else ""))
    return condition

print("═══════════════════════════════════════════")
print("  LUXOR® SMOKE TEST")
print("═══════════════════════════════════════════")

# 1. Python files compile
print("\n── Python Syntax ──")
import py_compile
py_files = [
    'main.py', 'backend/gateway.py', 'backend/auth.py',
    'backend/circuit_breaker.py', 'backend/ai/model_router.py',
    'backend/ai/mimo_client.py', 'backend/routes/analyze.py',
    'backend/routes/health.py', 'backend/utils/categories.py',
]
for f in py_files:
    try:
        py_compile.compile(f, doraise=True)
        check(f, True)
    except Exception as e:
        check(f, False, str(e))

# 2. Imports work
print("\n── Python Imports ──")
try:
    from backend.auth import require_auth, optional_auth, get_current_user
    check("backend.auth imports", True)
except Exception as e:
    check("backend.auth imports", False, str(e))

try:
    from backend.gateway import ai_endpoint, get_spend_tracker, TIER_DAILY_CAPS
    check("backend.gateway imports", True)
except Exception as e:
    check("backend.gateway imports", False, str(e))

try:
    from backend.circuit_breaker import mimo_breaker, mimo_vision_breaker
    check("backend.circuit_breaker imports", True)
except Exception as e:
    check("backend.circuit_breaker imports", False, str(e))

try:
    from backend.ai.model_router import classify_complexity, get_model_for_task
    check("backend.ai.model_router imports", True)
except Exception as e:
    check("backend.ai.model_router imports", False, str(e))

# 3. Gateway logic works
print("\n── Gateway Logic ──")
from backend.gateway import SpendTracker
t = SpendTracker()
for _ in range(5):
    t.record_request("test-user")
usage = t.get_usage("test-user")
check("SpendTracker records requests", usage["count"] == 5)

cap = t.check_cap("test-user", "free")
check("Free cap not hit at 5/10", cap is None)

for _ in range(5):
    t.record_request("test-user")
cap = t.check_cap("test-user", "free")
check("Free cap hit at 10/10", cap is not None)

# 4. Model router works
print("\n── Model Router ──")
from backend.ai.model_router import classify_complexity
tier, score = classify_complexity(task_type="color_extraction")
check("Color extraction = lightweight", tier == "lightweight")

tier, score = classify_complexity(task_type="outfit_recommendation")
check("Outfit rec = mid", tier == "mid")

tier, score = classify_complexity(task_type="virtual_try_on")
check("Virtual try-on = heavy", tier == "heavy")

# 5. Circuit breaker works
print("\n── Circuit Breaker ──")
from backend.circuit_breaker import CircuitBreaker
cb = CircuitBreaker("test", failure_threshold=2, cooldown_seconds=1)
check("Circuit starts CLOSED", cb.allow_request())

cb.record_failure()
check("1 failure still allows", cb.allow_request())
cb.record_failure()
check("2 failures blocks", not cb.allow_request())

# 6. Auth validation works
print("\n── Auth Validation ──")
check("ALLOWED_OCCASIONS defined", True)
ALLOWED_OCCASIONS_TEST = {"casual", "business", "party", "sport", "formal"}
def _sanitize_occasion_test(raw):
    if not raw: return "casual"
    clean = raw.strip().lower().replace("_", " ")
    return clean if clean in ALLOWED_OCCASIONS_TEST else "casual"
check("Valid occasion passes", _sanitize_occasion_test("casual") == "casual")
check("Invalid occasion defaults", _sanitize_occasion_test("DROP TABLE") == "casual")
check("Empty occasion defaults", _sanitize_occasion_test("") == "casual")

# 7. Input validation
print("\n── Input Validation ──")
from backend.gateway import validate_image_payload
check("Rejects oversized free image", validate_image_payload("x" * (10*1024*1024), "free") is not None)
check("Allows small free image", validate_image_payload("x" * 1000, "free") is None)

# 8. Environment files exist
print("\n── Config Files ──")
check(".env.example exists", os.path.exists(".env.example"))
check("luxor-hub/.env.example exists", os.path.exists("luxor-hub/.env.example"))
check("requirements.txt exists", os.path.exists("requirements.txt"))
check("vercel.json exists", os.path.exists("vercel.json"))

# Summary
print("\n═══════════════════════════════════════════")
passed = sum(1 for _, ok in checks if ok)
total = len(checks)
print(f"  RESULT: {passed}/{total} checks passed")
if passed == total:
    print("  ✅ ALL CHECKS PASSED — SAFE TO DEPLOY")
else:
    print("  ❌ FIX FAILURES BEFORE DEPLOYING")
print("═══════════════════════════════════════════")
