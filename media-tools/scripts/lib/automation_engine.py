"""
SHANNON-Ω Automation Engine
Proxy monitor, captcha handler, anti-ban, Quora + Twitter automation
"""
import os, sys, json, time, random, hashlib, logging
from datetime import datetime
from pathlib import Path
from typing import Optional

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(BASE, "media-tools", "scripts", "lib"))

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
log = logging.getLogger(__name__)

# ─── CONFIG ───────────────────────────────────────────────────────
PROXY_MONITOR_PATH = os.path.join(BASE, "omega", "proxy_pool.json")
CAPTCHA_LOG_PATH = os.path.join(BASE, "omega", "captcha_log.json")
ACCOUNTS_PATH = os.path.join(BASE, "omega", "accounts.json")

os.makedirs(os.path.join(BASE, "omega"), exist_ok=True)


# ═══════════════════════════════════════════════════════════════════
# PROXY QUALITY MONITOR
# ═══════════════════════════════════════════════════════════════════
class ProxyPool:
    """Manages proxy quality scoring and rotation."""
    
    def __init__(self, path=PROXY_MONITOR_PATH):
        self.path = path
        self.proxies = self._load()
    
    def _load(self) -> list:
        try:
            with open(self.path) as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def _save(self):
        with open(self.path, 'w') as f:
            json.dump(self.proxies, f, indent=2)
    
    def add(self, host: str, port: int, protocol: str = "http", username: str = "", password: str = ""):
        proxy = {
            "host": host, "port": port, "protocol": protocol,
            "username": username, "password": password,
            "score": 100, "uses": 0, "successes": 0, "failures": 0,
            "last_captcha": None, "last_used": None,
            "added": datetime.utcnow().isoformat(),
        }
        self.proxies.append(proxy)
        self._save()
    
    def get_best(self, min_score: int = 50) -> Optional[dict]:
        """Get the highest-scoring available proxy."""
        candidates = [p for p in self.proxies if p.get("score", 0) >= min_score]
        if not candidates:
            return None
        candidates.sort(key=lambda p: (p.get("score", 0), -p.get("uses", 0)), reverse=True)
        return candidates[0]
    
    def report_success(self, proxy_key: str):
        for p in self.proxies:
            if f"{p['host']}:{p['port']}" == proxy_key:
                p["successes"] = p.get("successes", 0) + 1
                p["uses"] = p.get("uses", 0) + 1
                p["score"] = min(100, p["score"] + 5)
                p["last_used"] = datetime.utcnow().isoformat()
                self._save()
                return
    
    def report_failure(self, proxy_key: str, reason: str = ""):
        for p in self.proxies:
            if f"{p['host']}:{p['port']}" == proxy_key:
                p["failures"] = p.get("failures", 0) + 1
                p["uses"] = p.get("uses", 0) + 1
                p["score"] = max(0, p["score"] - 15)
                p["last_error"] = reason
                self._save()
                return
    
    def next_rotating(self) -> Optional[str]:
        """Get proxy URL string for requests."""
        proxy = self.get_best()
        if not proxy:
            return None
        auth = f"{proxy['username']}:{proxy['password']}@" if proxy.get('username') else ""
        return f"{proxy['protocol']}://{auth}{proxy['host']}:{proxy['port']}"


# ═══════════════════════════════════════════════════════════════════
# CAPTCHA HANDLER — Free first, paid fallback
# ═══════════════════════════════════════════════════════════════════
class CaptchaHandler:
    """Multi-layer captcha solver: free methods first, 2captcha fallback."""
    
    def __init__(self):
        self.twocaptcha_key = os.environ.get("TWOCAPTCHA_API_KEY", "")
        self.stats = {"free": 0, "paid": 0, "failed": 0}
    
    def solve_v3(self, anchor_url: str) -> Optional[str]:
        """Try free PyPasser/freecaptcha first, fallback to 2captcha."""
        # Method 1: PyPasser (free)
        try:
            from pypasser import reCaptchaV3
            token = reCaptchaV3(anchor_url)
            if token and len(token) > 50:
                self.stats["free"] += 1
                return token
        except Exception:
            pass
        
        # Method 2: freecaptcha (free)
        try:
            from freecaptcha import reCAPTCHAV3Solver
            token = reCAPTCHAV3Solver.solve(anchor_url)
            if token and len(token) > 50:
                self.stats["free"] += 1
                return token
        except Exception:
            pass
        
        # Method 3: 2captcha (paid fallback)
        if self.twocaptcha_key:
            try:
                from twocaptcha import TwoCaptcha
                solver = TwoCaptcha(self.twocaptcha_key)
                result = solver.recaptcha(
                    sitekey=self._extract_sitekey(anchor_url),
                    url=self._extract_page_url(anchor_url),
                    version='v3'
                )
                if result and result.get('code'):
                    self.stats["paid"] += 1
                    return result['code']
            except Exception as e:
                log.warning(f"2captcha V3 failed: {e}")
        
        self.stats["failed"] += 1
        return None
    
    def solve_v2(self, sitekey: str, page_url: str) -> Optional[str]:
        """Try buster-style approach first, fallback to 2captcha."""
        # Method 1: 2captcha v2
        if self.twocaptcha_key:
            try:
                from twocaptcha import TwoCaptcha
                solver = TwoCaptcha(self.twocaptcha_key)
                result = solver.recaptcha(sitekey=sitekey, url=page_url)
                if result and result.get('code'):
                    self.stats["paid"] += 1
                    return result['code']
            except Exception as e:
                log.warning(f"2captcha V2 failed: {e}")
        
        self.stats["failed"] += 1
        return None
    
    def _extract_sitekey(self, anchor_url: str) -> str:
        """Extract sitekey from anchor URL."""
        import re
        m = re.search(r'k=([a-zA-Z0-9_-]+)', anchor_url)
        return m.group(1) if m else ""
    
    def _extract_page_url(self, anchor_url: str) -> str:
        """Extract page URL from anchor."""
        import re
        m = re.search(r'co=([a-zA-Z0-9%:/._-]+)', anchor_url)
        if m:
            from urllib.parse import unquote
            return unquote(m.group(1))
        return "https://quora.com"


# ═══════════════════════════════════════════════════════════════════
# FINGERPRINT RANDOMIZATION
# ═══════════════════════════════════════════════════════════════════
class FingerprintManager:
    """Browser fingerprint randomizer using playwright-stealth."""
    
    @staticmethod
    def get_playwright_browser():
        """Get a stealth playwright browser instance."""
        from playwright.sync_api import sync_playwright
        from playwright_stealth import stealth_sync
        
        pw = sync_playwright().start()
        browser = pw.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={"width": random.randint(1200, 1600), "height": random.randint(800, 1000)},
            user_agent=random.choice([
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            ]),
            locale=random.choice(["en-US", "en-GB", "en-CA"]),
            timezone_id=random.choice(["America/New_York", "America/Chicago", "America/Los_Angeles"]),
        )
        page = context.new_page()
        stealth_sync(page)
        return pw, browser, context, page
    
    @staticmethod
    def human_delay(min_s: float = 0.5, max_s: float = 3.0):
        """Random human-like delay."""
        time.sleep(random.uniform(min_s, max_s))
    
    @staticmethod
    def human_mouse(page, target_x: int, target_y: int):
        """Bezier curve mouse movement."""
        import math
        start_x = random.randint(100, 800)
        start_y = random.randint(100, 600)
        steps = random.randint(8, 20)
        
        for i in range(steps):
            t = (i + 1) / steps
            # Quadratic bezier
            cx, cy = start_x + random.randint(-50, 50), start_y + random.randint(-50, 50)
            x = (1-t)**2 * start_x + 2*(1-t)*t * cx + t**2 * target_x
            y = (1-t)**2 * start_y + 2*(1-t)*t * cy + t**2 * target_y
            page.mouse.move(x, y)
            time.sleep(random.uniform(0.01, 0.05))


# ═══════════════════════════════════════════════════════════════════
# QUORA AUTOMATION ENGINE
# ═══════════════════════════════════════════════════════════════════
class QuoraAutomation:
    """Automate Quora question discovery, answering, and engagement."""
    
    def __init__(self, profile_dir: str = None):
        self.profile_dir = profile_dir or os.path.join(BASE, "omega", "chrome_profiles", f"profile_{random.randint(1000,9999)}")
        os.makedirs(self.profile_dir, exist_ok=True)
        self.captcha = CaptchaHandler()
        self.proxy_pool = ProxyPool()
    
    def login(self, email: str, password: str) -> bool:
        """Login to Quora with stealth + captcha handling."""
        from undetected_chromedriver import Chrome, ChromeOptions
        
        opts = ChromeOptions()
        opts.add_argument(f"--user-data-dir={self.profile_dir}")
        opts.add_argument("--disable-blink-features=AutomationControlled")
        opts.add_argument("--no-first-run")
        opts.add_argument("--no-default-browser-check")
        
        proxy = self.proxy_pool.next_rotating()
        if proxy:
            opts.add_argument(f"--proxy-server={proxy}")
        
        driver = Chrome(options=opts)
        driver.get("https://www.quora.com")
        FingerprintManager.human_delay(2, 4)
        
        # Check if already logged in via profile
        if "answer" in driver.page_source.lower() or "feed" in driver.page_source.lower():
            log.info("Already logged in via profile")
            return True
        
        # Click login
        try:
            from selenium.webdriver.common.by import By
            login_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]")
            login_btn.click()
            FingerprintManager.human_delay(1, 2)
            
            email_field = driver.find_element(By.NAME, "email")
            for ch in email:
                email_field.send_keys(ch)
                time.sleep(random.uniform(0.01, 0.08))
            
            pw_field = driver.find_element(By.NAME, "password")
            for ch in password:
                pw_field.send_keys(ch)
                time.sleep(random.uniform(0.01, 0.08))
            
            submit = driver.find_element(By.XPATH, "//button[@type='submit']")
            submit.click()
            FingerprintManager.human_delay(3, 6)
            
            # Handle captcha if present
            if "recaptcha" in driver.page_source.lower():
                log.info("reCAPTCHA detected during login")
                token = self.captcha.solve_v3("https://www.google.com/recaptcha/api2/anchor")
                if token:
                    driver.execute_script(f"document.getElementById('g-recaptcha-response').innerHTML='{token}';")
                    FingerprintManager.human_delay(1, 2)
            
            return True
        except Exception as e:
            log.error(f"Login failed: {e}")
            return False
        finally:
            try: driver.quit()
            except: pass
    
    def answer_question(self, email: str, password: str, max_answers: int = 5) -> list:
        """Automatically find and answer questions."""
        from undetected_chromedriver import Chrome, ChromeOptions
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        
        opts = ChromeOptions()
        opts.add_argument(f"--user-data-dir={self.profile_dir}")
        opts.add_argument("--disable-blink-features=AutomationControlled")
        
        driver = Chrome(options=opts)
        answers_posted = []
        
        try:
            driver.get("https://www.quora.com")
            WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            # Navigate to answers page
            driver.get("https://www.quora.com/answers")
            FingerprintManager.human_delay(2, 4)
            
            for i in range(max_answers):
                try:
                    # Get question
                    question_el = WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "[class*='q-text'] a"))
                    )
                    question = question_el.text
                    if not question:
                        continue
                    
                    log.info(f"Answering: {question[:80]}...")
                    
                    # Generate answer via our API
                    import requests
                    api_url = "https://opencode.ai/zen/v1/chat/completions"
                    resp = requests.post(api_url, json={
                        "model": "deepseek-v4-flash-free",
                        "messages": [
                            {"role": "system", "content": f"Answer this Quora question with authority and depth. Make it sound human, not AI."},
                            {"role": "user", "content": question}
                        ],
                        "reasoning_effort": "max",
                        "temperature": 0.8,
                        "max_tokens": 4000
                    }, headers={"Content-Type": "application/json"}, timeout=120)
                    answer = resp.json()["choices"][0]["message"]["content"]
                    
                    # Humanize the answer
                    from council_integration import humanize_text
                    answer = humanize_text(answer)
                    
                    # Post answer
                    answer_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Answer')]")
                    answer_btn.click()
                    FingerprintManager.human_delay(1, 2)
                    
                    answer_box = WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "[class*='qu-editor']"))
                    )
                    answer_box.send_keys(answer)
                    FingerprintManager.human_delay(2, 4)
                    
                    post_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Post')]")
                    post_btn.click()
                    FingerprintManager.human_delay(3, 5)
                    
                    answers_posted.append({"question": question, "status": "posted"})
                    log.info(f"Posted answer #{i+1}")
                    
                    driver.get("https://www.quora.com/answers")
                    FingerprintManager.human_delay(2, 4)
                    
                except Exception as e:
                    log.warning(f"Failed on question {i+1}: {e}")
                    continue
            
            return answers_posted
        
        except Exception as e:
            log.error(f"Answer loop failed: {e}")
            return answers_posted
        finally:
            try: driver.quit()
            except: pass


# ═══════════════════════════════════════════════════════════════════
# TWITTER AUTOMATION  
# ═══════════════════════════════════════════════════════════════════
class TwitterAutomation:
    """Automate Twitter posting, following, and engagement."""
    
    def __init__(self):
        self.captcha = CaptchaHandler()
        self.proxy_pool = ProxyPool()
    
    def _get_playwright(self):
        return FingerprintManager.get_playwright_browser()
    
    def login(self, email: str, username: str, password: str) -> bool:
        """Login to Twitter with stealth + captcha handling."""
        pw, browser, context, page = self._get_playwright()
        try:
            page.goto("https://twitter.com/i/flow/login")
            FingerprintManager.human_delay(2, 4)
            
            # Email
            page.fill('input[autocomplete="username"]', email)
            page.click('text=Next')
            FingerprintManager.human_delay(1, 3)
            
            # Username (sometimes required)
            try:
                page.fill('input[data-testid="ocfEnterTextTextInput"]', username)
                page.click('text=Next')
                FingerprintManager.human_delay(1, 3)
            except:
                pass
            
            # Password
            page.fill('input[type="password"]', password)
            page.click('text=Log in')
            FingerprintManager.human_delay(3, 6)
            
            # Check for captcha
            if "recaptcha" in page.content().lower():
                log.info("reCAPTCHA on Twitter login")
            
            return "home" in page.url or "explore" in page.url
        except Exception as e:
            log.error(f"Twitter login failed: {e}")
            return False
        finally:
            browser.close()
            pw.stop()
    
    def post_tweet(self, content: str) -> bool:
        """Post a tweet using playwright stealth."""
        pw, browser, context, page = self._get_playwright()
        try:
            page.goto("https://twitter.com/compose/tweet")
            FingerprintManager.human_delay(2, 3)
            
            page.fill('[data-testid="tweetTextarea_0"]', content)
            FingerprintManager.human_delay(1, 2)
            
            page.click('[data-testid="tweetButtonInline"]')
            FingerprintManager.human_delay(2, 4)
            
            return True
        except Exception as e:
            log.error(f"Tweet failed: {e}")
            return False
        finally:
            browser.close()
            pw.stop()
    
    def auto_follow(self, target_handle: str, count: int = 5) -> list:
        """Follow users who follow a target account."""
        pw, browser, context, page = self._get_playwright()
        followed = []
        try:
            page.goto(f"https://twitter.com/{target_handle}/followers")
            FingerprintManager.human_delay(3, 5)
            
            for i in range(count):
                try:
                    follow_btns = page.query_selector_all('[data-testid$="-follow"]')
                    if i < len(follow_btns):
                        follow_btns[i].click()
                        FingerprintManager.human_delay(random.uniform(10, 30))
                        followed.append(i)
                except:
                    break
            
            return followed
        except Exception as e:
            log.error(f"Follow failed: {e}")
            return followed
        finally:
            browser.close()
            pw.stop()


# ═══════════════════════════════════════════════════════════════════
# CONTENT GENERATOR
# ═══════════════════════════════════════════════════════════════════
class ContentGenerator:
    """Generate human-like content using deepseek-v4-flash-free + council."""
    
    @staticmethod
    def generate_quora_answer(question: str, niche: str = "fashion") -> str:
        import requests
        api_url = "https://opencode.ai/zen/v1/chat/completions"
        
        prompt = f"""Write a Quora answer about {niche}. 
Question: {question}

Requirements:
- Sound like a real person with experience, not an AI
- Use personal anecdotes ("I remember when...", "In my experience...")
- Be specific and actionable
- 200-400 words
- No marketing fluff, just real value

Answer:"""
        
        resp = requests.post(api_url, json={
            "model": "deepseek-v4-flash-free",
            "messages": [{"role": "user", "content": prompt}],
            "reasoning_effort": "max",
            "temperature": 0.85,
            "max_tokens": 4000
        }, headers={"Content-Type": "application/json"}, timeout=120)
        
        answer = resp.json()["choices"][0]["message"]["content"]
        from council_integration import humanize_text, plh
        answer = humanize_text(answer)
        answer = plh.obfuscate(answer, intensity=0.12)
        return answer
    
    @staticmethod
    def generate_tweet(niche: str = "fashion") -> str:
        import requests
        api_url = "https://opencode.ai/zen/v1/chat/completions"
        
        topics = {
            "fashion": [
                "wardrobe minimalist tips", "color matching hack", 
                "why fast fashion is dying", "capsule wardrobe must-haves",
                "dressing for your body type", "sustainable style on a budget"
            ]
        }
        import random
        topic = random.choice(topics.get(niche, topics["fashion"]))
        
        prompt = f"""Write a viral Twitter/X post about {topic}.
        
Requirements:
- Max 280 characters
- Hook in first 5 words
- Controversial or surprising angle
- No hashtags, no emojis
- Sound like a real person with attitude

Tweet:"""
        
        resp = requests.post(api_url, json={
            "model": "deepseek-v4-flash-free",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.9,
            "max_tokens": 500
        }, headers={"Content-Type": "application/json"}, timeout=60)
        
        tweet = resp.json()["choices"][0]["message"]["content"]
        tweet = tweet.strip().strip('"').strip("'")
        from council_integration import plh
        tweet = plh.obfuscate(tweet, intensity=0.08)
        return tweet


# ═══════════════════════════════════════════════════════════════════
# MAIN ORCHESTRATOR
# ═══════════════════════════════════════════════════════════════════
class OmegaOrchestrator:
    """Master controller for all automation."""
    
    def __init__(self):
        self.quora = QuoraAutomation()
        self.twitter = TwitterAutomation()
        self.content = ContentGenerator()
        self.proxy = ProxyPool()
        self.captcha = CaptchaHandler()
    
    def run_quora_session(self, email: str, password: str, answers: int = 5):
        log.info(f"Starting Quora session: {answers} answers")
        result = self.quora.answer_question(email, password, max_answers=answers)
        log.info(f"Quora session complete: {len(result)} answers posted")
        return result
    
    def run_twitter_session(self, email: str, username: str, password: str, posts: int = 3):
        log.info(f"Starting Twitter session: {posts} posts")
        if not self.twitter.login(email, username, password):
            log.error("Twitter login failed")
            return []
        
        results = []
        for i in range(posts):
            content = self.content.generate_tweet()
            if self.twitter.post_tweet(content):
                results.append(content)
                log.info(f"Tweet #{i+1} posted")
            time.sleep(random.uniform(60, 180))
        
        return results
    
    def status_report(self) -> dict:
        return {
            "proxy_pool_size": len(self.proxy.proxies),
            "captcha_stats": self.captcha.stats,
            "accounts": len(json.load(open(ACCOUNTS_PATH)) if os.path.exists(ACCOUNTS_PATH) else []),
        }


if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "status"
    orch = OmegaOrchestrator()
    
    if action == "status":
        print(json.dumps(orch.status_report(), indent=2))
    elif action == "quora" and len(sys.argv) >= 4:
        result = orch.run_quora_session(sys.argv[2], sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 5)
        print(json.dumps(result, indent=2))
    elif action == "twitter" and len(sys.argv) >= 5:
        result = orch.run_twitter_session(sys.argv[2], sys.argv[3], sys.argv[4])
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python automation_engine.py status")
        print("       python automation_engine.py quora <email> <password> [answers=5]")
        print("       python automation_engine.py twitter <email> <username> <password> [posts=3]")
