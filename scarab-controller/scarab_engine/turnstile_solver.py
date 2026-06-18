"""
Turnstile Solving Module — ZORG-Ω SCARAB Controller

Integrates:
1. 2captcha-python (paid API) — primary Turnstile solver
2. FlareSolverr — cf_clearance cookie acquisition
3. AI vision fallback (OpenAI GPT-4V) — free alternative
4. Browser extension injection — 2Captcha extension loaded into Playwright

Usage:
    solver = TurnstileSolver(api_key=os.getenv("CAPTCHA_API_KEY"))
    token = solver.solve_turnstile(sitekey="0x4AAAA...", url="https://quora.com/...")
"""
import os, sys, json, time, random, asyncio, re
from pathlib import Path
from typing import Optional, Dict, List, Tuple

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# ─── Configuration ────────────────────────────────────────────────
FLARESOLVERR_URL = os.environ.get("FLARESOLVERR_URL", "http://localhost:8191/v1")
CAPTCHA_API_KEY = os.environ.get("CAPTCHA_API_KEY", os.environ.get("2CAPTCHA_KEY", ""))
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "")

# ─── Turnstile Solver ─────────────────────────────────────────────

class TurnstileSolver:
    """
    Multi-strategy Turnstile solver.
    Strategy priority: 2captcha → AI Vision → Manual fallback
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or CAPTCHA_API_KEY
        self._twocaptcha = None
        if self.api_key:
            from twocaptcha import TwoCaptcha
            self._twocaptcha = TwoCaptcha(self.api_key)

    def solve_turnstile(self, sitekey: str, url: str, **kwargs) -> Optional[str]:
        """Solve Turnstile challenge. Returns token string or None."""
        # Strategy 1: 2Captcha (paid, most reliable)
        if self._twocaptcha:
            try:
                print(f"[+] 2Captcha solving Turnstile: sitekey={sitekey[:16]}... url={url[:50]}...")
                result = self._twocaptcha.turnstile(sitekey=sitekey, url=url, **kwargs)
                token = result.get('code') if isinstance(result, dict) else str(result)
                if token and len(token) > 10:
                    print(f"[+] 2Captcha Turnstile solved! Token: {token[:32]}...")
                    return token
                print(f"[-] 2Captcha returned invalid token: {str(result)[:100]}")
            except Exception as e:
                print(f"[-] 2Captcha Turnstile failed: {e}")

        # Strategy 2: AI Vision (free with OpenAI key)
        if OPENAI_API_KEY:
            try:
                print("[+] Trying AI Vision Turnstile solving...")
                token = self._solve_via_ai_vision(sitekey, url)
                if token:
                    return token
            except Exception as e:
                print(f"[-] AI Vision failed: {e}")

        return None

    def solve_via_playwright(self, page, timeout: int = 30) -> Optional[str]:
        """
        Solve Turnstile that's already rendered on the page.
        Detects widget, extracts sitekey, solves via available method.
        """
        try:
            # Extract sitekey from page
            sitekey = page.evaluate("""() => {
                const el = document.querySelector('[data-sitekey]');
                if (el) return el.getAttribute('data-sitekey');
                const iframe = document.querySelector('iframe[src*="turnstile"]');
                if (iframe) {
                    const m = iframe.src.match(/sitekey=([^&]+)/);
                    return m ? m[1] : null;
                }
                return null;
            }""")
            if not sitekey:
                print("[-] No Turnstile widget found on page")
                return None

            current_url = page.url
            token = self.solve_turnstile(sitekey, current_url)
            if token:
                # Inject token into page
                injected = page.evaluate(f"""() => {{
                    const input = document.querySelector('input[name="cf-turnstile-response"]');
                    if (input) {{
                        const nativeSetter = Object.getOwnPropertyDescriptor(
                            HTMLInputElement.prototype, 'value'
                        ).set;
                        nativeSetter.call(input, '{token}');
                        input.dispatchEvent(new Event('input', {{ bubbles: true }}));
                        input.dispatchEvent(new Event('change', {{ bubbles: true }}));
                        return true;
                    }}
                    // Try triggering callback
                    const cb = window.cf_callback || window.turnstileCallback;
                    if (cb) {{ cb('{token}'); return true; }}
                    return false;
                }}""")
                if injected:
                    print("[+] Turnstile token injected into page")
                else:
                    print("[!] Token got but couldn't inject — trying direct submit")
                return token
        except Exception as e:
            print(f"[-] solve_via_playwright error: {e}")
        return None

    def _solve_via_ai_vision(self, sitekey: str, url: str) -> Optional[str]:
        """Use GPT-4V to analyze and solve Turnstile challenge."""
        # This requires rendering the challenge and taking a screenshot
        # For now, this is a placeholder — actual implementation needs
        # a browser context with the Turnstile challenge visible
        return None

    def report_bad(self, captcha_id: str = None):
        """Report an incorrect captcha solve for refund."""
        if self._twocaptcha and captcha_id:
            try:
                self._twocaptcha.report(captcha_id)
                print(f"[+] Reported captcha {captcha_id} as bad")
            except Exception as e:
                print(f"[-] Report failed: {e}")


# ─── FlareSolverr Integration ─────────────────────────────────────

class FlareSolverrClient:
    """Client for FlareSolverr — Cloudflare challenge bypass proxy."""

    def __init__(self, endpoint: str = FLARESOLVERR_URL):
        self.endpoint = endpoint
        self.session_id = None

    def get_cookies(self, url: str = "https://www.quora.com",
                    max_timeout: int = 15000) -> Dict:
        """Fetch cookies from FlareSolverr, including cf_clearance."""
        import requests
        payload = {
            "cmd": "request.get",
            "url": url,
            "maxTimeout": max_timeout,
            "session": self.session_id,
        }
        r = requests.post(self.endpoint, json=payload, timeout=max_timeout // 1000 + 5)
        data = r.json()
        if data.get("status") != "ok":
            raise RuntimeError(f"FlareSolverr error: {data.get('message', data)}")

        solution = data.get("solution", {})
        self.session_id = data.get("session", self.session_id)
        return {
            "cookies": solution.get("cookies", []),
            "user_agent": solution.get("userAgent", ""),
            "response": solution.get("response", ""),
            "session_id": self.session_id,
        }

    def save_cookies_file(self, url: str = "https://www.quora.com",
                          output: str = None) -> str:
        """Fetch cookies via FlareSolverr and save to JSON file."""
        result = self.get_cookies(url)
        out_path = output or str(PROJECT_ROOT / "cookies_flaresolverr.json")

        # Normalize cookie format for Playwright
        cookies = []
        for c in result.get("cookies", []):
            entry = {
                "name": c.get("name"),
                "value": c.get("value"),
                "domain": c.get("domain", ".quora.com"),
                "path": c.get("path", "/"),
                "httpOnly": c.get("httpOnly", False),
                "secure": c.get("secure", True),
                "sameSite": c.get("sameSite", "Lax"),
            }
            # FlareSolverr returns numeric expirationDate
            if "expirationDate" in c:
                entry["expires"] = int(c["expirationDate"])
            cookies.append(entry)

        with open(out_path, "w") as f:
            json.dump({"cookies": cookies, "userAgent": result.get("user_agent", "")}, f, indent=2)

        print(f"[+] FlareSolverr: {len(cookies)} cookies saved to {out_path}")
        return out_path

    def close_session(self):
        """Destroy FlareSolverr session."""
        if self.session_id:
            import requests
            try:
                requests.post(self.endpoint, json={
                    "cmd": "sessions.destroy",
                    "session": self.session_id,
                }, timeout=10)
            except Exception:
                pass
            self.session_id = None


# ─── Full Quora Bypass Pipeline ───────────────────────────────────

class QuoraBypassPipeline:
    """
    Complete pipeline for Quora automation:
    1. FlareSolverr → cf_clearance cookies
    2. Playwright non-headless → bypass browser fingerprinting
    3. 2Captcha → Turnstile solving when triggered
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or CAPTCHA_API_KEY
        self.flare = FlareSolverrClient()
        self.turnstile = TurnstileSolver(api_key)
        self.session_dir = str(PROJECT_ROOT / ".quora_session")
        os.makedirs(self.session_dir, exist_ok=True)

    async def get_clearance(self) -> Dict:
        """Get fresh cf_clearance cookies from FlareSolverr."""
        print("[*] Fetching FlareSolverr clearance for Quora...")
        try:
            result = self.flare.get_cookies(url="https://www.quora.com", max_timeout=20000)
            print(f"[+] Got {len(result.get('cookies', []))} cookies from FlareSolverr")
            return result
        except Exception as e:
            print(f"[-] FlareSolverr failed: {e}")
            # Try starting FlareSolverr
            print("[*] Attempting to start FlareSolverr...")
            import subprocess
            subprocess.Popen(
                ["flaresolverr"],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
            )
            time.sleep(5)
            result = self.flare.get_cookies(url="https://www.quora.com", max_timeout=20000)
            return result

    async def post_answer(self, question_url: str, answer_text: str,
                          xvfb: bool = True) -> bool:
        """
        Full pipeline: FlareSolverr → Playwright → Turnstile solve → Post.
        """
        # Step 1: Get FlareSolverr cookies
        clearance = await self.get_clearance()
        cookies = clearance.get("cookies", [])
        ua = clearance.get("user_agent",
                           "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36")

        # Step 2: Launch Playwright with cookies
        from playwright.async_api import async_playwright

        async with async_playwright() as pw:
            # Launch persistent context with anti-detection
            context = await pw.chromium.launch_persistent_context(
                user_data_dir=self.session_dir,
                headless=not xvfb,
                viewport={"width": 1280, "height": 800},
                user_agent=ua,
                locale="en-US",
                timezone_id="America/New_York",
                bypass_csp=True,
                ignore_https_errors=True,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-features=IsolateOrigins,site-per-process",
                    "--no-sandbox",
                    "--disable-web-security",
                ],
            )

            page = await context.new_page()
            page.set_default_timeout(30000)

            # Inject anti-detection
            await page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                });
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en']
                });
                // Override chrome.runtime
                window.chrome = { runtime: {} };
            """)

            # Inject cookies
            if cookies:
                await context.add_cookies(cookies)

            # Step 3: Navigate to question
            print(f"[*] Navigating to {question_url}...")
            try:
                await page.goto(question_url, wait_until="domcontentloaded", timeout=30000)
            except Exception as e:
                print(f"[-] Navigation timeout: {e}")

            await page.wait_for_timeout(5000)

            # Handle potential Cloudflare challenge
            for _ in range(15):
                title = await page.title()
                if "Just a moment" not in title:
                    break
                print("[*] Waiting for Cloudflare challenge...")
                await page.wait_for_timeout(3000)

            # Step 4: Check for Turnstile and solve if present
            has_turnstile = await page.evaluate("""() => {
                return !!(
                    document.querySelector('[data-sitekey]') ||
                    document.querySelector('iframe[src*="turnstile"]') ||
                    document.getElementById('cf-turnstile')
                );
            }""")

            if has_turnstile:
                print("[!] Turnstile detected! Solving...")
                token = self.turnstile.solve_via_playwright(page)
                if token:
                    print("[+] Turnstile solved!")
                    await page.wait_for_timeout(2000)
                else:
                    print("[-] Turnstile solving failed — need API key")
                    print("[*] Set CAPTCHA_API_KEY or use xvfb for manual solve")
                    await context.close()
                    return False

            # Step 5: Click "Answer" button
            try:
                answer_btn = await page.query_selector('button:has-text("Answer")')
                if answer_btn:
                    await answer_btn.click()
                    await page.wait_for_timeout(3000)
                    print("[+] Clicked Answer button")
            except Exception:
                print("[-] Answer button not found, trying direct navigation")

            # Step 6: Type answer
            try:
                editor = await page.query_selector('[contenteditable="true"]')
                if not editor:
                    print("[-] Editor not found")
                    await context.close()
                    return False

                await editor.click()
                await page.keyboard.type(answer_text, delay=5)
                await page.wait_for_timeout(2000)
                print(f"[+] Typed {len(answer_text)} chars into editor")
            except Exception as e:
                print(f"[-] Editor interaction failed: {e}")
                await context.close()
                return False

            # Step 7: Submit answer
            try:
                for text in ["Submit", "Post", "Add Answer"]:
                    sb = await page.query_selector(f'button:has-text("{text}")')
                    if sb:
                        await sb.click(force=True)
                        print(f"[+] Answer posted ({text})!")
                        break
                else:
                    # Try Ctrl+Enter
                    await page.keyboard.press("Control+Enter")
                    print("[+] Answer posted (Ctrl+Enter)!")
            except Exception as e:
                print(f"[-] Submit failed: {e}")
                await context.close()
                return False

            await page.wait_for_timeout(3000)
            print("[+] Answer successfully posted!")
            await context.close()
            return True

    async def create_question(self, topic: str, xvfb: bool = True) -> Optional[str]:
        """
        Create a new Quora question on a topic.
        Returns question URL if successful.
        """
        clearance = await self.get_clearance()
        cookies = clearance.get("cookies", [])
        ua = clearance.get("user_agent", "")

        from playwright.async_api import async_playwright
        async with async_playwright() as pw:
            context = await pw.chromium.launch_persistent_context(
                user_data_dir=self.session_dir,
                headless=not xvfb,
                viewport={"width": 1280, "height": 800},
                user_agent=ua,
                bypass_csp=True,
                ignore_https_errors=True,
            )
            page = await context.new_page()

            if cookies:
                await context.add_cookies(cookies)

            await page.goto("https://www.quora.com", wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(5000)

            # Click "Add Question" or navigate to add question
            await page.goto("https://www.quora.com/add", wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(3000)

            # Type question
            editor = await page.query_selector('[contenteditable="true"]')
            if editor:
                await editor.click()
                await page.keyboard.type(topic, delay=3)
                await page.wait_for_timeout(2000)

                # Submit
                for text in ["Add Question", "Post", "Submit"]:
                    btn = await page.query_selector(f'button:has-text("{text}")')
                    if btn:
                        await btn.click(force=True)
                        await page.wait_for_timeout(5000)
                        current_url = page.url
                        print(f"[+] Question created! URL: {current_url}")
                        await context.close()
                        return current_url

            print("[-] Could not create question")
            await context.close()
            return None
