"""
Quora cURL Client — TLS impersonation + proxy rotation
=======================================================
Uses curl_cffi (chrome124 impersonation) to bypass Cloudflare,
combined with proxy rotation for IP diversity.

This is the most practical approach: no browser needed,
works in headless, handles Cloudflare JS challenges.

Usage:
    client = QuoraCurlClient()
    html = client.get("https://www.quora.com/profile")
    answer_id = client.post_answer("What is fashion?", "answer text...")
"""
import json, time, random, re, os, hashlib
from pathlib import Path
from typing import Optional, Dict, List, Tuple
from curl_cffi import requests as curl_requests
from curl_cffi.requests import Session as CurlSession

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# ─── Configuration ────────────────────────────────────────────────
IMPERSONATE = "chrome124"
TIMEOUT = 30
USER_AGENTS = [
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

# Quora API endpoints
QUORA_GRAPHQL = "https://www.quora.com/graphql"
QUORA_RELAY_PREFIX = "https://qsbr.cf2.quoracdn.net/-4-ans_frontend-relay-rspack-"


class QuoraCurlClient:
    """
    Cloudflare-bypassing Quora client using curl_cffi TLS impersonation.
    Supports proxy rotation, cookie persistence, and basic Quora API calls.
    """

    def __init__(self, proxy: str = None):
        self.session = CurlSession(impersonate=IMPERSONATE, timeout=TIMEOUT)
        self.proxy = proxy
        self.cookies = {}
        self.formkey = None
        self.viewer_id = None
        self._setup_session()

    def _setup_session(self):
        """Configure session headers and proxy.
        NOTE: Minimal headers only - excessive headers break curl_cffi TLS impersonation.
        """
        # curl_cffi handles its own headers for impersonation
        # Adding custom headers breaks the TLS fingerprint and triggers Cloudflare
        if self.proxy:
            self.session.proxies = {"https": self.proxy, "http": self.proxy}

    def set_proxy(self, proxy: str):
        """Set or change proxy."""
        self.proxy = proxy
        if proxy:
            self.session.proxies = {"https": proxy, "http": proxy}
            self.session.headers[
                "User-Agent"
            ] = random.choice(USER_AGENTS)
        else:
            self.session.proxies = None

    def get(self, url: str, **kwargs) -> str:
        """GET request with Cloudflare bypass."""
        resp = self.session.get(url, **kwargs)
        self._update_cookies(resp.cookies)
        return resp.text

    def post(self, url: str, data: dict = None, json_data: dict = None,
             headers: dict = None, **kwargs) -> str:
        """POST request with Cloudflare bypass."""
        req_headers = {
            "Origin": "https://www.quora.com",
            "Referer": "https://www.quora.com/",
            "X-Requested-With": "XMLHttpRequest",
        }
        if self.formkey:
            req_headers["X-Formkey"] = self.formkey
        if headers:
            req_headers.update(headers)

        resp = self.session.post(
            url, data=data, json=json_data, headers=req_headers, **kwargs
        )
        self._update_cookies(resp.cookies)
        return resp.text

    def _update_cookies(self, cookies):
        """Track cookies from responses."""
        for c in list(cookies) if hasattr(cookies, '__iter__') else []:
            if hasattr(c, 'name') and hasattr(c, 'value'):
                self.cookies[c.name] = c.value

    # ─── Quora Operations ──────────────────────────────────

    def load_home(self) -> bool:
        """Load Quora to establish session and check login state."""
        html = self.get("https://www.quora.com/")
        if "Just a moment" in html or len(html) < 1000:
            return False
        # Extract formkey
        match = re.search(r'"formkey"\s*:\s*"([^"]+)"', html)
        if match:
            self.formkey = match.group(1)
        # Extract viewer ID
        match = re.search(r'"viewer"\s*:\s*\{[^}]*"id"\s*:\s*"(\d+)"', html)
        if match:
            self.viewer_id = match.group(1)
        return True

    def is_logged_in(self) -> bool:
        """Check if session has valid Quora auth."""
        return "m-b" in self.cookies or "m-login" in self.cookies

    def get_profile(self) -> Optional[dict]:
        """Get current user profile info."""
        html = self.get("https://www.quora.com/profile")
        if "Just a moment" in html:
            return None
        # Extract user info
        user = {}
        match = re.search(r'"displayName"\s*:\s*"([^"]+)"', html)
        if match:
            user["name"] = match.group(1)
        match = re.search(r'"username"\s*:\s*"([^"]+)"', html)
        if match:
            user["username"] = match.group(1)
        return user if user else None

    def find_question(self, query: str) -> Optional[str]:
        """Search for a question on Quora. Returns question URL or None."""
        search_url = f"https://www.quora.com/search?q={query.replace(' ', '%20')}"
        html = self.get(search_url)
        # Look for question links
        matches = re.findall(
            r'href="(/[^"]*/question/[^"]*)"', html
        )
        if matches:
            return f"https://www.quora.com{matches[0]}"
        # Try alternative pattern
        matches = re.findall(
            r'"url"\s*:\s*"([^"]*/question/[^"]*)"', html
        )
        if matches:
            return matches[0]
        return None

    def post_answer(self, question_url: str, answer_text: str) -> Optional[str]:
        """
        Post answer via Quora's GraphQL API.
        Uses the Relay mutation format captured from browser traffic.

        Returns answer ID if successful.
        """
        # First load the page to get tokens
        print(f"[*] Loading question page: {question_url}")
        html = self.get(question_url)
        if "Just a moment" in html:
            print("[-] Cloudflare blocked the request")
            return None

        # Try to extract question ID
        qid = None
        # From URL pattern: /What-is-fashion/qid=12345
        match = re.search(r'/qid=(\d+)', question_url)
        if match:
            qid = match.group(1)
        # From page data
        if not qid:
            match = re.search(r'"questionId"\s*:\s*"(\d+)"', html)
            if match:
                qid = match.group(1)

        if not qid:
            print("[-] Could not extract question ID")
            return None

        print(f"[+] Question ID: {qid}")

        # Method 1: Try direct GraphQL mutation
        print("[*] Attempting GraphQL mutation...")
        mutation = {
            "operationName": "AddAnswerMutation",
            "variables": {
                "questionId": qid,
                "text": answer_text,
                "isDraft": False,
            },
            "query": """mutation AddAnswerMutation($questionId: String!, $text: String!, $isDraft: Boolean) {
                addAnswer(questionId: $questionId, text: $text, isDraft: $isDraft) {
                    id
                    url
                    __typename
                }
            }""",
        }

        try:
            result = self.post(
                "https://www.quora.com/graphql",
                json_data=mutation,
                headers={"X-Formkey": self.formkey or ""},
            )
            print(f"GraphQL response ({len(result)} chars): {result[:300]}")
            if '"id"' in result:
                match = re.search(r'"id"\s*:\s*"(\d+)"', result)
                if match:
                    print(f"[+] Answer posted! ID: {match.group(1)}")
                    return match.group(1)
        except Exception as e:
            print(f"[-] GraphQL mutation failed: {e}")

        # Method 2: Try alternative mutation format
        print("[*] Trying alternative mutation format...")
        mutation2 = {
            "query": f"""mutation {{
                addAnswer(input: {{
                    questionId: "{qid}",
                    text: {json.dumps(answer_text)},
                    isDraft: false
                }}) {{
                    id
                    url
                }}
            }}""",
        }
        try:
            result2 = self.post(
                "https://www.quora.com/graphql",
                json_data=mutation2,
            )
            print(f"Alt GraphQL ({len(result2)} chars): {result2[:300]}")
            if '"id"' in result2:
                match = re.search(r'"id"\s*:\s*"(\d+)"', result2)
                if match:
                    print(f"[+] Answer posted! ID: {match.group(1)}")
                    return match.group(1)
        except Exception as e:
            print(f"[-] Alt mutation failed: {e}")

        print("[-] All posting methods failed")
        return None

    def create_question(self, topic: str, details: str = "") -> Optional[str]:
        """Create a new Quora question."""
        html = self.get("https://www.quora.com/add")
        # Try to find the right mutation
        mutation = {
            "operationName": "QuoraAddQuestionMutation",
            "variables": {
                "title": topic,
                "details": details,
                "isAnonymous": False,
            },
            "query": """mutation QuoraAddQuestionMutation($title: String!, $details: String, $isAnonymous: Boolean) {
                addQuestion(title: $title, details: $details, isAnonymous: $isAnonymous) {
                    id
                    url
                    __typename
                }
            }""",
        }
        try:
            result = self.post(
                "https://www.quora.com/graphql",
                json_data=mutation,
            )
            if '"url"' in result:
                match = re.search(r'"url"\s*:\s*"([^"]+)"', result)
                if match:
                    return f"https://www.quora.com{match.group(1)}"
        except Exception:
            pass
        return None

    # ─── Cookie Management ─────────────────────────────────

    def save_cookies(self, filepath: str = None):
        """Save session cookies to file."""
        if filepath is None:
            filepath = str(PROJECT_ROOT / "cookies_curl.json")
        with open(filepath, "w") as f:
            json.dump(self.cookies, f, indent=2)
        print(f"[+] Saved {len(self.cookies)} cookies to {filepath}")

    def load_cookies(self, filepath: str = None):
        """Load cookies from file into session."""
        if filepath is None:
            filepath = str(PROJECT_ROOT / "cookies_curl.json")
        try:
            with open(filepath) as f:
                cookies = json.load(f)
            for name, value in cookies.items():
                self.session.cookies.set(name, value)
            self.cookies.update(cookies)
            print(f"[+] Loaded {len(cookies)} cookies from {filepath}")
            return True
        except (FileNotFoundError, json.JSONDecodeError):
            return False


# ─── Quick test ──────────────────────────────────────────────────
if __name__ == "__main__":
    client = QuoraCurlClient()
    print("[*] Testing Quora curl client...")

    ok = client.load_home()
    print(f"Home loaded: {ok}")
    print(f"Logged in: {client.is_logged_in()}")
    print(f"Formkey: {client.formkey}")
    print(f"Viewer ID: {client.viewer_id}")

    if ok:
        profile = client.get_profile()
        print(f"Profile: {profile}")

    # Try with a proxy if available
    with open('proxy_pool_cache.json') as f:
        pool = json.load(f)
    proxies = pool.get('proxies', [])
    if proxies:
        p = random.choice(proxies[:20])
        proxy_url = f"{p['type']}://{p['ip']}:{p['port']}"
        print(f"\n[*] Testing with proxy: {proxy_url}")
        client.set_proxy(proxy_url)
        ok2 = client.load_home()
        print(f"Home via proxy: {ok2}")
