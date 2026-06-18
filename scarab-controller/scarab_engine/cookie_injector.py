"""
Cookie injector — async-compatible version.
Loads cookies_quora.json and cookies_x.json, injects into Playwright session.
"""
import os, json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class CookieInjector:
    """Async cookie injector for Quora and X sessions."""

    def __init__(self, session_manager):
        self.mgr = session_manager
        self.quora_file = PROJECT_ROOT / "cookies_quora.json"
        self.x_file = PROJECT_ROOT / "cookies_x.json"

    def _normalize(self, cookies: list) -> list:
        """Normalize Cookie-Editor format to Playwright format."""
        if isinstance(cookies, dict) and "cookies" in cookies:
            cookies = cookies["cookies"]
        pw = []
        for c in cookies:
            entry = {"name": c["name"], "value": c["value"], "domain": c["domain"], "path": c.get("path", "/")}
            if "httpOnly" in c: entry["httpOnly"] = c["httpOnly"]
            if "secure" in c: entry["secure"] = c["secure"]
            if "sameSite" in c:
                ss = c["sameSite"].lower()
                if ss == "no_restriction": entry["sameSite"] = "None"
                elif ss == "lax": entry["sameSite"] = "Lax"
            if "expirationDate" in c: entry["expires"] = int(c["expirationDate"])
            pw.append(entry)
        return pw

    def _load(self, path: Path) -> list:
        if not path.exists():
            return []
        with open(path) as f:
            data = json.load(f)
        return data if isinstance(data, list) else data.get("cookies", [])

    async def inject_quora(self) -> bool:
        """Inject Quora cookies - await from async context."""
        return await self._inject(self.quora_file, "Quora")

    async def inject_x(self) -> bool:
        """Inject X cookies - await from async context."""
        return await self._inject(self.x_file, "X")

    async def _inject(self, path: Path, name: str) -> bool:
        cookies = self._load(path)
        if not cookies:
            print(f"[-] No {name} cookies found")
            return False
        pw = self._normalize(cookies)
        await self.mgr.browser.add_cookies(pw)
        print(f"[+] Injected {len(pw)} {name} cookies")
        return True
