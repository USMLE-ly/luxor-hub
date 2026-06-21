#!/usr/bin/env python3
"""
🐦 X/Twitter Poster — FINAL WORKING VERSION
- Robust cookie-based login
- Waits for composer to fully render
- Types into contenteditable div (React-compatible)
- Attaches images
- Verifies post
"""
import os, sys, json, time, shutil, requests
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_x.json")
API_URL = "https://opencode.ai/zen/v1/chat/completions"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def gen_tweet(prompt_text):
    """Generate tweet text via API."""
    payload = {
        "model": "deepseek-v4-flash-free",
        "messages": [
            {"role": "system", "content": "You write short X/Twitter posts. Output ONLY the tweet text (max 280 chars). No quotes, no labels, no commentary."},
            {"role": "user", "content": prompt_text}
        ],
        "temperature": 0.85,
        "max_tokens": 1000,
    }
    try:
        r = requests.post(API_URL, json=payload, timeout=90)
        data = r.json()
        msg = data.get("choices", [{}])[0].get("message", {})
        content = msg.get("content", "").strip()
        if not content:
            reasoning = msg.get("reasoning_content", "")
            if reasoning:
                for line in reversed(reasoning.split("\n")):
                    line = line.strip().strip('"').strip("'").strip("*")
                    if 10 < len(line) < 280:
                        content = line
                        break
        if content:
            content = content.strip('"').strip("'").strip()
            if len(content) > 280:
                content = content[:277] + "..."
            return content
    except Exception as e:
        log(f"  ⚠ API: {e}")
    return None

def wait_for_composer(page, timeout=15):
    """Wait for the tweet composer to appear after clicking Post."""
    for i in range(timeout):
        result = page.evaluate("""() => {
            const ta = document.querySelector('[data-testid="tweetTextarea_0"]');
            if (ta) {
                const rect = ta.getBoundingClientRect();
                const visible = ta.offsetParent !== null && rect.width > 0;
                if (visible) return 'visible';
                return 'hidden';
            }
            // Also check for the label
            const label = document.querySelector('[data-testid="tweetTextarea_0_label"]');
            if (label) return 'label_found';
            return 'not_found';
        }""")
        if result == 'visible':
            return True
        log(f"  Composer status: {result}")
        time.sleep(1)
    return False

def post_to_x(image_path, tweet_text):
    """Post tweet + optional image."""
    from playwright.sync_api import sync_playwright

    with open(COOKIES_FILE) as f:
        cookies = json.load(f)

    log("  Launching browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
                  "--single-process", "--disable-software-rasterizer"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 900},
        )

        # Inject cookies
        c_count = 0
        for c in cookies:
            try:
                ctx.add_cookies([{
                    "name": c["name"],
                    "value": str(c.get("value", "")),
                    "domain": c.get("domain", ".x.com"),
                    "path": c.get("path", "/"),
                    "secure": c.get("secure", False),
                    "httpOnly": c.get("httpOnly", False),
                    "sameSite": "Lax"
                }])
                c_count += 1
            except:
                pass
        log(f"  Cookies: {c_count}")

        page = ctx.new_page()
        page.set_default_timeout(60000)

        # Load X
        log("  Loading x.com...")
        page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=60000)

        # Wait for render
        for i in range(20):
            body = page.evaluate("() => document.body?.innerText || ''")
            if "Home" in body and len(body) > 100:
                log(f"  Rendered after {i+1}s")
                break
            time.sleep(1)

        # Verify login
        logged = page.evaluate("() => !!document.querySelector('[data-testid=\"SideNav_NewTweet_Button\"]')")
        log(f"  Logged in: {logged}")
        if not logged:
            page.screenshot(path="/tmp/x_login_fail.png")
            browser.close()
            return False, "login_failed"

        # Click Post button
        log("  Opening composer...")
        try:
            page.wait_for_selector('[data-testid="SideNav_NewTweet_Button"]', timeout=10000)
            page.click('[data-testid="SideNav_NewTweet_Button"]')
        except Exception as e:
            log(f"  Click failed: {e}")
            page.evaluate("""() => {
                const btn = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
                if (btn) btn.click();
            }""")
        
        # Wait for composer to fully appear
        composer_ok = wait_for_composer(page)
        log(f"  Composer ready: {composer_ok}")
        if not composer_ok:
            page.screenshot(path="/tmp/x_no_composer.png")
            browser.close()
            return False, "no_composer"

        # Type text by clicking the contenteditable div and typing
        log(f"  Typing {len(tweet_text)} chars...")
        page.click('[data-testid="tweetTextarea_0"]')
        time.sleep(0.5)
        page.keyboard.type(tweet_text, delay=5)
        time.sleep(1)

        # Attach image
        if image_path and os.path.exists(image_path):
            log(f"  Attaching: {os.path.basename(image_path)}")
            try:
                fi = page.query_selector('input[type="file"]')
                if fi:
                    fi.set_input_files(image_path)
                    time.sleep(3)
                    log("  ✅ Attached")
            except Exception as e:
                log(f"  ⚠ Attach: {e}")

        page.screenshot(path="/tmp/x_before_post.png")
        
        # Submit
        log("  Submitting...")
        btn = page.query_selector('[data-testid="tweetButton"]')
        if not btn:
            btn = page.query_selector('[data-testid="tweetButtonInline"]')
        if btn:
            btn.click(force=True)
            log("  Button clicked")
        else:
            page.keyboard.press("Control+Enter")
            log("  Ctrl+Enter")

        time.sleep(5)
        page.screenshot(path="/tmp/x_after_post.png")

        # Verify
        posted = page.evaluate("() => document.body.innerText.includes('Your post was sent')")
        log(f"  Posted: {posted}")
        
        browser.close()
        return True, "posted" if posted else "submitted"

def main():
    log("=" * 60)
    log("🐦 LUXOR X Poster")
    log("=" * 60)

    # Gather images
    upload_dir = os.path.join(PROJECT, "luxor_media", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    for d in os.listdir("/tmp/codex-web-uploads/"):
        ud = f"/tmp/codex-web-uploads/{d}"
        if os.path.isdir(ud):
            for f in os.listdir(ud):
                if f.endswith(('.jpg', '.jpeg', '.png')):
                    dst = os.path.join(upload_dir, f)
                    if not os.path.exists(dst):
                        shutil.copy2(os.path.join(ud, f), dst)

    jpgs = sorted([os.path.join(upload_dir, f) for f in os.listdir(upload_dir) if f.endswith('.jpg')])
    log(f"Images: {len(jpgs)}")
    
    to_post = jpgs[:3] if jpgs else [None]

    fallbacks = [
        "Your style, algorithmically curated. Luxor decodes fashion. #AIFashion #LuxorStyle",
        "Less is more when it's the right more. Luxor edits your wardrobe. #MinimalLuxury",
        "Stop wasting time. Start wearing confidence. Luxor AI styling. luxor.ly #EffortlessStyle"
    ]

    for i, img in enumerate(to_post):
        name = os.path.basename(img) if img else f"post-{i+1}"
        log(f"\n--- [{i+1}/{len(to_post)}] {name} ---")

        t0 = time.time()
        prompt = "Write a tweet (max 280 chars) for Luxor fashion brand. Tone: confident, minimal, luxurious. Include hashtags. Output ONLY the tweet."
        tweet = gen_tweet(prompt)
        if not tweet:
            tweet = fallbacks[i % len(fallbacks)]
        log(f"📝 {tweet}")
        log(f"  Gen time: {time.time()-t0:.1f}s")

        ok, info = post_to_x(img, tweet)
        log(f"{'✅' if ok else '❌'} {info}")
        time.sleep(5)

    log("\n✅ Complete!")

if __name__ == "__main__":
    main()
