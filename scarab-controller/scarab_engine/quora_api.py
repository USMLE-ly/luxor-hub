"""
Quora Relay API client — powered by FlareSolverr sessions.
Bypasses Cloudflare by routing all requests through FlareSolverr's headless browser.

Usage:
    client = QuoraAPIClient()
    client.create_session()
    answer_id = client.post_answer("What is fashion?", "My answer text...")
"""
import requests, json, re, time, os, random
from typing import Optional, Dict, List
from urllib.parse import urlencode

FLARESOLVERR_URL = os.environ.get("FLARESOLVERR_URL", "http://localhost:8191/v1")


class QuoraAPIClient:
    """
    Quora API client that routes all requests through FlareSolverr
    to bypass Cloudflare challenges.
    """

    def __init__(self, flaresolverr_url: str = FLARESOLVERR_URL):
        self.fs_url = flaresolverr_url
        self.session_id = None
        self.cookies = {}
        self.user_agent = ""
        self.api_key = None  # Quora API key for GraphQL
        self.formkey = None   # Quora formkey for POST

    def create_session(self) -> str:
        """Create a new FlareSolverr session."""
        r = requests.post(self.fs_url, json={"cmd": "sessions.create"}, timeout=10)
        data = r.json()
        self.session_id = data.get("session", "")
        print(f"[+] FlareSolverr session: {self.session_id}")
        return self.session_id

    def _request(self, method: str, url: str, data: dict = None,
                 headers: dict = None, max_timeout: int = 20000) -> dict:
        """Make a request through FlareSolverr."""
        if not self.session_id:
            self.create_session()

        payload = {
            "cmd": f"request.{method.lower()}",
            "url": url,
            "maxTimeout": max_timeout,
            "session": self.session_id,
        }
        if data:
            payload["postData"] = json.dumps(data) if isinstance(data, dict) else data
        if headers:
            payload["headers"] = headers

        r = requests.post(self.fs_url, json=payload, timeout=max_timeout // 1000 + 5)
        result = r.json()

        if result.get("status") != "ok":
            raise RuntimeError(f"FlareSolverr error: {result.get('message', result)}")

        sol = result.get("solution", {})
        # Update cookies
        for c in sol.get("cookies", []):
            self.cookies[c["name"]] = c["value"]
        if sol.get("userAgent"):
            self.user_agent = sol["userAgent"]

        return sol

    def get(self, url: str, **kwargs) -> str:
        """GET request through FlareSolverr."""
        sol = self._request("GET", url, **kwargs)
        return sol.get("response", "")

    def post(self, url: str, data: dict = None,
             content_type: str = "application/json", **kwargs) -> str:
        """POST request through FlareSolverr."""
        headers = kwargs.get("headers", {})
        headers.setdefault("Content-Type", content_type)
        headers.setdefault("Accept", "*/*")
        headers.setdefault("Origin", "https://www.quora.com")
        headers.setdefault("Referer", "https://www.quora.com/")
        kwargs["headers"] = headers
        sol = self._request("POST", url, data=data, **kwargs)
        return sol.get("response", "")

    def load_quora(self) -> bool:
        """Initialize session by loading Quora homepage."""
        print("[*] Loading Quora to establish session...")
        html = self.get("https://www.quora.com/")
        if "Just a moment" in html:
            print("[-] Cloudflare challenge not solved")
            return False
        print(f"[+] Quora loaded: {len(html)} chars, logged in: {'m-login' in self.cookies}")
        return True

    def get_formkey(self) -> Optional[str]:
        """Extract formkey from Quora page (needed for some POST operations)."""
        html = self.get("https://www.quora.com/")
        match = re.search(r'formkey["\']\s*[:=]\s*["\']([^"\']+)["\']', html)
        if match:
            self.formkey = match.group(1)
            return self.formkey
        return None

    def get_graphql_endpoint(self) -> Optional[str]:
        """Find the GraphQL API endpoint from Quora's page."""
        html = self.get("https://www.quora.com/")
        # Look for relay mutations endpoint
        match = re.search(r'"https?://([^"]*?quoracdn\.net[^"]*?relay[^"]*?mutation[^"]*)"', html)
        if match:
            return f"https://{match.group(1)}"
        # Try alternative patterns
        match = re.search(r'"https?://([^"]*?quoracdn\.net[^"]*?graphql[^"]*)"', html)
        if match:
            return f"https://{match.group(1)}"
        # Default Quora GraphQL endpoint
        return "https://www.quora.com/graphql"

    def post_answer(self, question_url: str, answer_text: str) -> Optional[str]:
        """
        Post an answer to a Quora question.
        
        This tries multiple approaches:
        1. Direct GraphQL mutation through FlareSolverr
        2. Form-based submission
        3. Relay API
        """
        # Method 1: Try the form-based approach
        print(f"[*] Posting answer to: {question_url}")

        # Load the question page to get any tokens
        html = self.get(question_url)
        if "Just a moment" in html:
            print("[-] Blocked by Cloudflare")
            return None

        # Check for answer form data
        formkey = self.get_formkey()
        print(f"[+] Formkey: {formkey}")

        # Method: Try GraphQL relay mutation
        # The Quora Relay API typically accepts mutations at a specific endpoint
        # with the mutation name and variables

        # For now, use the FlareSolverr to POST answer via Quora's API
        # We'll use the standard Quora answer endpoint
        import uuid

        # Method: Navigate to answer page through FlareSolverr session
        # and extract the mutation payload from the JavaScript
        answer_page = self.get(question_url + "/answer")

        # Look for the relay mutation format in the page
        operations = re.search(
            r'"operationName"\s*:\s*"([^"]*AddAnswer[^"]*)"', answer_page
        )
        if operations:
            print(f"[+] Found operation: {operations.group(1)}")

        # Build the simplest possible payload
        # Quora uses Relay with persisted queries
        # The actual mutation format needs to be extracted from the JS bundles

        # For now, try known Quora API patterns
        answer_payload = {
            "operationName": "AddAnswerMutation",
            "variables": {
                "questionId": self._extract_qid(question_url),
                "text": answer_text,
                "isDraft": False,
            },
            "query": """
                mutation AddAnswerMutation($questionId: String!, $text: String!, $isDraft: Boolean) {
                    addAnswer(questionId: $questionId, text: $text, isDraft: $isDraft) {
                        id
                        url
                    }
                }
            """.strip(),
        }

        # Try POST through FlareSolverr
        try:
            # Find the GraphQL endpoint
            graphql_url = self.get_graphql_endpoint()
            print(f"[*] Trying GraphQL at: {graphql_url}")

            result = self.post(
                "https://www.quora.com/graphql",
                data=answer_payload,
                headers={
                    "X-Formkey": formkey or "",
                    "X-Requested-With": "XMLHttpRequest",
                },
            )
            print(f"[+] GraphQL response ({len(result)} chars): {result[:500]}")
            if '"id"' in result or '"url"' in result:
                return self._extract_from_json(result, "id")
        except Exception as e:
            print(f"[-] GraphQL mutation failed: {e}")

        return None

    def _extract_qid(self, url: str) -> str:
        """Extract question ID from Quora URL."""
        match = re.search(r'/qid=(\d+)', url)
        if match:
            return match.group(1)
        # Try to get it from the page
        html = self.get(url)
        match = re.search(r'"questionId"\s*:\s*"(\d+)"', html)
        if match:
            return match.group(1)
        return ""

    def _extract_from_json(self, text: str, key: str) -> Optional[str]:
        """Extract a value from JSON in text."""
        try:
            data = json.loads(text)
            if "data" in data and key in data["data"]:
                return data["data"][key].get("id")
        except json.JSONDecodeError:
            pass
        return None

    def close(self):
        """Destroy FlareSolverr session."""
        if self.session_id:
            try:
                requests.post(self.fs_url, json={
                    "cmd": "sessions.destroy",
                    "session": self.session_id,
                }, timeout=5)
            except Exception:
                pass
            self.session_id = None
            print("[+] FlareSolverr session closed")


# ─── Quick test ───────────────────────────────────────────────────
if __name__ == "__main__":
    client = QuoraAPIClient()
    client.create_session()
    client.load_quora()
    print(f"\nCookies: {len(client.cookies)}")
    print(f"m-login: {client.cookies.get('m-login', 'N/A')}")
    print(f"m-b: {client.cookies.get('m-b', 'N/A')[:20]}...")
    client.close()
