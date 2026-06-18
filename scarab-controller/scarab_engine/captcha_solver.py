"""
reCaptcha solver — uses reCaptcha_hub directory tools with API fallback.
Tries local solver first, falls back to 2Captcha/Anti-Captcha.
"""
import os, sys, json, asyncio
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

HUB_DIR = PROJECT_ROOT / "reCaptcha_hub"

# Try importing from reCaptcha_hub
_HUB_AVAILABLE = False
_hub_solve = None

# Look for solver modules in reCaptcha_hub
for _solver_path in [
    HUB_DIR / "solver.py",
    HUB_DIR / "captcha_solver.py",
    HUB_DIR / "recaptcha_solver.py",
    HUB_DIR / "v3_solver.py",
]:
    if _solver_path.exists():
        try:
            _mod_name = f"reCaptcha_hub.{_solver_path.stem}"
            import importlib
            _mod = importlib.import_module(_mod_name.replace(".py", ""))
            if hasattr(_mod, "solve"):
                _hub_solve = _mod.solve
                _HUB_AVAILABLE = True
                break
            for _attr in ["solve_recaptcha", "get_token", "bypass"]:
                if hasattr(_mod, _attr):
                    _hub_solve = getattr(_mod, _attr)
                    _HUB_AVAILABLE = True
                    break
        except Exception:
            continue


class CaptchaSolver:
    """
    Solve reCaptcha challenges using local reCaptcha_hub tools.
    Falls back to 2Captcha API if hub is unavailable.
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("CAPTCHA_API_KEY", "")
        self.hub_available = _HUB_AVAILABLE

    async def solve(self, site_url: str, site_key: str, action: str = "verify") -> str:
        """Attempt to solve reCaptcha. Returns token string."""
        if self.hub_available:
            try:
                return await self._solve_via_hub(site_url, site_key, action)
            except Exception as e:
                print(f"[-] Hub solver failed ({e}), trying API fallback...")
        return await self._solve_via_fallback(site_url, site_key)

    async def get_token(self, site_url: str, site_key: str, action: str = "verify") -> str:
        """Alias for solve()."""
        return await self.solve(site_url, site_key, action)

    async def _solve_via_hub(self, site_url: str, site_key: str, action: str) -> str:
        """Delegate to reCaptcha_hub solver."""
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _hub_solve, site_url, site_key, action)
        if not result:
            raise RuntimeError("Hub solver returned empty result")
        return result

    async def _solve_via_fallback(self, site_url: str, site_key: str) -> str:
        """Fallback using 2Captcha API."""
        if not self.api_key:
            raise RuntimeError(
                "No CAPTCHA_API_KEY set. Set env var or pass api_key to constructor."
            )

        import requests
        loop = asyncio.get_event_loop()

        # Submit
        submit = await loop.run_in_executor(
            None,
            lambda: requests.post(
                "https://2captcha.com/in.php",
                data={
                    "key": self.api_key,
                    "method": "userrecaptcha",
                    "googlekey": site_key,
                    "pageurl": site_url,
                    "json": 1,
                },
                timeout=30,
            ),
        )
        result = submit.json()
        if result.get("status") != 1:
            raise RuntimeError(f"2Captcha submission failed: {result}")

        request_id = result["request"]
        print(f"[+] Captcha submitted, ID: {request_id}")

        # Poll
        for attempt in range(60):
            await asyncio.sleep(5)
            poll = await loop.run_in_executor(
                None,
                lambda: requests.get(
                    "https://2captcha.com/res.php",
                    params={
                        "key": self.api_key,
                        "action": "get",
                        "id": request_id,
                        "json": 1,
                    },
                    timeout=30,
                ),
            )
            poll_result = poll.json()
            if poll_result.get("status") == 1:
                print(f"[+] Captcha solved (attempt {attempt + 1})")
                return poll_result["request"]
            if poll_result.get("request") == "ERROR_CAPTCHA_UNSOLVABLE":
                raise RuntimeError("Captcha unsolvable")

        raise TimeoutError("Captcha polling timed out after 5 minutes")
