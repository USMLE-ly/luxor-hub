"""
Playwright session manager with persistent context, cookie injection,
and session persistence via cookie_bridge.
"""
import os, sys, json, asyncio
from pathlib import Path
from playwright.async_api import async_playwright

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "media-tools" / "scripts" / "lib"))

try:
    from cookie_bridge import load_cookie_file, format_for_playwright
    COOKIE_BRIDGE_AVAILABLE = True
except ImportError:
    COOKIE_BRIDGE_AVAILABLE = False
    print("[*] cookie_bridge not found, using inline converter")


class SessionManager:
    """Manages Playwright browser lifecycle with persistent context and cookies."""

    def __init__(self, headless=True, user_data_dir=None):
        self.headless = headless
        self.user_data_dir = user_data_dir or str(PROJECT_ROOT / ".scarab_session")
        self.browser = None
        self.context = None
        self.playwright = None

    async def start(self):
        """Launch browser with persistent context."""
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch_persistent_context(
            user_data_dir=self.user_data_dir,
            headless=self.headless,
            viewport={"width": 1280, "height": 720},
            user_agent=(
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            ),
            locale="en-US",
            timezone_id="America/New_York",
            permissions=[],
            bypass_csp=True,
            ignore_https_errors=True,
        )
        print(f"[+] Browser started (headless={self.headless})")

    async def get_page(self):
        """Get a new page from the persistent context."""
        page = await self.browser.new_page()
        page.set_default_timeout(30000)
        return page

    async def inject_cookies(self, cookie_file: str):
        """Load cookies from Cookie-Editor export and inject into context."""
        if not os.path.exists(cookie_file):
            print(f"[-] Cookie file not found: {cookie_file}")
            return False

        with open(cookie_file) as f:
            cookies = json.load(f)

        if isinstance(cookies, dict) and "cookies" in cookies:
            cookies = cookies["cookies"]

        pw_cookies = []
        for c in cookies:
            entry = {
                "name": c.get("name", ""),
                "value": c.get("value", ""),
                "domain": c.get("domain", ""),
                "path": c.get("path", "/"),
            }
            if "httpOnly" in c:
                entry["httpOnly"] = c["httpOnly"]
            if "secure" in c:
                entry["secure"] = c["secure"]
            if "sameSite" in c:
                ss = c["sameSite"].lower()
                if ss == "no_restriction":
                    entry["sameSite"] = "None"
                elif ss == "lax":
                    entry["sameSite"] = "Lax"
                elif ss == "strict":
                    entry["sameSite"] = "Strict"
            if "expirationDate" in c:
                entry["expires"] = int(c["expirationDate"])
            pw_cookies.append(entry)

        await self.browser.add_cookies(pw_cookies)
        domains = set(c.get("domain", "?") for c in cookies)
        print(f"[+] Injected {len(pw_cookies)} cookies for: {', '.join(list(domains)[:5])}")
        return True

    def save_cookies(self, platform: str):
        """Save current cookies to a JSON file."""
        cookies = self.browser.cookies()
        out_file = PROJECT_ROOT / f"cookies_{platform}_refreshed.json"
        with open(out_file, "w") as f:
            json.dump(cookies, f, indent=2)
        print(f"[+] Saved {len(cookies)} cookies to {out_file}")

    async def close(self):
        """Close browser and cleanup."""
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        print("[+] Browser closed")
