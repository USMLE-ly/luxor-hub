"""
Quora GraphQL Mutation Client — ZORG-Ω
=========================================
Extracted from Quora's webpack bundles:
- Mutations: createAnswer, createAnswerSubmission, editAnswer, answerDraftSave
- Endpoint: POST https://www.quora.com/graphql  
- Requires: X-Formkey header + auth cookies (works via curl_cffi TLS impersonation)

Usage:
    client = QuoraMutationClient(cookies_path)
    result = client.post_answer(qid, "Your answer text")
    
    # Or via browser Tampermonkey (recommended):
    # Use scarab_commander_v3.user.js which sends browser cookies natively
"""
import json, re, os, time, random, html as html_mod
from typing import Optional, Dict
from curl_cffi import requests
from curl_cffi.requests import Session as CurlSession

USER_AGENTS = [
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

class QuoraMutationClient:
    """
    Quora GraphQL mutation client using curl_cffi TLS impersonation.
    Can post answers if cookies + formkey are valid.
    """
    
    def __init__(self, cookies_path: str = None):
        self.session = CurlSession(impersonate="chrome124", timeout=30)
        self.cookies_path = cookies_path
        self.formkey = None
        self.base_url = "https://www.quora.com"
        self.graphql_url = "https://www.quora.com/graphql"
        
        # Load cookies if provided
        if cookies_path:
            self._load_cookies(cookies_path)
    
    def _load_cookies(self, path: str):
        """Load cookies from JSON file."""
        with open(path) as f:
            data = json.load(f)
        cookies = data if isinstance(data, list) else data.get('cookies', [])
        for c in cookies:
            try:
                self.session.cookies.set(
                    c['name'], c['value'],
                    domain=c.get('domain', '.quora.com'),
                    path=c.get('path', '/')
                )
            except:
                pass
        print(f"[+] Loaded {len(cookies)} cookies")
    
    def init_session(self) -> bool:
        """Initialize session: fetch Quora home, extract formkey."""
        r = self.session.get(f"{self.base_url}/", timeout=15)
        if "Just a moment" in r.text or len(r.text) < 1000:
            return False
        
        # Extract formkey
        match = re.search(r'"formkey"\s*:\s*"([^"]+)"', r.text)
        if match:
            self.formkey = match.group(1)
        
        return bool(self.formkey)
    
    def get_question_id(self, question_slug: str) -> Optional[str]:
        """
        Try to find QID from a question slug/URL.
        Searches the page for embedded data.
        """
        url = f"{self.base_url}/{question_slug.strip('/')}"
        r = self.session.get(url, timeout=15)
        
        # Look for qid in page
        for pattern in [r'"qid"\s*:\s*"?(\d+)"?', r'"questionId"\s*:\s*"(\d+)"', r'/qid=(\d+)']:
            match = re.search(pattern, r.text)
            if match:
                return match.group(1)
        return None
    
    def post_answer(self, qid: str, content: str,
                    is_draft: bool = False) -> Optional[Dict]:
        """
        Post an answer via GraphQL mutation.
        
        The mutation format was reverse-engineered from Quora's webpack bundles.
        Quora uses Relay with standard GraphQL mutations.
        
        Args:
            qid: Question ID
            content: Answer text (plain text, converted to HTML)
            is_draft: Save as draft
        
        Returns: Response dict or None
        """
        if not self.formkey:
            if not self.init_session():
                print("[-] Cannot initialize session")
                return None
        
        # Format content as HTML for Quora's editor
        html_content = f"<p>{html_mod.escape(content).replace(chr(10), '</p><p>')}</p>"
        content_json = json.dumps({
            "html": html_content,
            "text": content,
            "ttl": 3600,
        })
        
        # Try mutation 1: createAnswer (standard flow)
        mutation1 = {
            "query": """
                mutation CreateAnswerMutation($input: CreateAnswerInput!) {
                    createAnswer(input: $input) {
                        answer {
                            id
                            url
                        }
                    }
                }
            """.strip(),
            "variables": {
                "input": {
                    "qid": qid,
                    "content": content_json,
                }
            },
        }
        
        print(f"[*] Posting answer to QID {qid} ({len(content)} chars)...")
        
        # Try first mutation format
        result = self._graphql_request(mutation1)
        if result and result.get("data", {}).get("createAnswer", {}).get("answer", {}).get("id"):
            answer = result["data"]["createAnswer"]["answer"]
            print(f"[+] Answer posted! ID: {answer['id']}")
            return answer
        
        # Try mutation 2: createAnswerSubmission  
        mutation2 = {
            "query": """
                mutation CreateAnswerSubmissionMutation($input: CreateAnswerSubmissionInput!) {
                    answerSubmit(input: $input) {
                        success
                        answer {
                            id
                            url
                        }
                    }
                }
            """.strip(),
            "variables": {
                "input": {
                    "qid": qid,
                    "content": content_json,
                }
            },
        }
        
        result2 = self._graphql_request(mutation2)
        if result2 and result2.get("data", {}).get("answerSubmit", {}).get("success"):
            answer = result2["data"]["answerSubmit"]["answer"]
            print(f"[+] Answer submitted! ID: {answer['id']}")
            return answer
        
        # Try mutation 3: direct variables format (without input wrapper)
        mutation3 = {
            "query": """
                mutation AddAnswerMutation($questionId: String!, $text: String!, $isDraft: Boolean) {
                    addAnswer(questionId: $questionId, text: $text, isDraft: $isDraft) {
                        id
                        url
                    }
                }
            """.strip(),
            "variables": {
                "questionId": qid,
                "text": content,
                "isDraft": is_draft,
            },
        }
        
        result3 = self._graphql_request(mutation3)
        if result3 and result3.get("data", {}).get("addAnswer", {}).get("id"):
            answer = result3["data"]["addAnswer"]
            print(f"[+] Answer posted via addAnswer! ID: {answer['id']}")
            return answer
        
        print(f"[-] All mutation formats failed")
        if result: print(f"  Mutation1: {json.dumps(result)[:200]}")
        if result2: print(f"  Mutation2: {json.dumps(result2)[:200]}")
        if result3: print(f"  Mutation3: {json.dumps(result3)[:200]}")
        
        return None
    
    def _graphql_request(self, payload: dict) -> Optional[Dict]:
        """Send GraphQL request to Quora."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Origin": self.base_url,
            "Referer": f"{self.base_url}/",
        }
        if self.formkey:
            headers["X-Formkey"] = self.formkey
        
        try:
            r = self.session.post(
                self.graphql_url,
                json=payload,
                headers=headers,
            )
            if r.status_code == 200:
                return r.json()
            elif r.status_code == 405:
                # Method not allowed - try different URL format
                r2 = self.session.post(
                    f"{self.base_url}/quora/graphql",
                    json=payload,
                    headers=headers,
                )
                if r2.status_code == 200:
                    return r2.json()
            return {"error": f"HTTP {r.status_code}", "body": r.text[:200]}
        except Exception as e:
            return {"error": str(e)}
    
    def save_session(self, path: str = None):
        """Save current cookies."""
        path = path or self.cookies_path or "cookies_mutation.json"
        cookies = dict(self.session.cookies)
        with open(path, "w") as f:
            json.dump(cookies, f, indent=2)
        print(f"[+] Saved {len(cookies)} cookies")


# ─── Quick test ──────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    client = QuoraMutationClient("/tmp/codex-web-uploads/f-ltCPFD/cookie - 2026-06-17T162906.558.json")
    ok = client.init_session()
    print(f"Session initialized: {ok}")
    print(f"Formkey: {client.formkey}")
    
    if ok and len(sys.argv) > 2:
        qid = sys.argv[1]
        text = sys.argv[2]
        result = client.post_answer(qid, text)
        print(json.dumps(result, indent=2) if result else "Failed")
    else:
        print("\nUsage: python3 quora_mutation.py QID 'answer text'")
        print("  (requires valid cookie file)")
