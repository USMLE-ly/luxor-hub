#!/usr/bin/env python3
"""
🐦 X/Twitter Poster — FINAL WORKING VERSION
✅ React fiber onClick for reliable Post button clicking
✅ Cookie-based login via Playwright
✅ Image attachment
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
            {"role": "system", "content": "You write short X/Twitter posts. Output ONLY the tweet text (max 280 chars). No quotes, no labels."},
            {"role": "user", "content": prompt_text}
        ],
        "temperature": 0.85,
        "max_tokens": 500,
    }
    try:
        r = requests.post(API_URL, json=payload, timeout=60)
        data = r.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        if content:
            content = content.strip('"').strip("'").strip()
            if len(content) > 280:
                content = content[:277] + "..."
            return content
    except Exception as e:
        log(f"  ⚠ API: {e}")
    return None

def post_to_x(image_path, tweet_text):
    """Post tweet + optional image. Returns (success, detail)."""
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

        c_count = 0
        for c in cookies:
            try:
                ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".x.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
                c_count += 1
            except: pass
        log(f"  Cookies: {c_count}")

        page = ctx.new_page()
        page.set_default_timeout(60000)

        log("  Loading x.com...")
        page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=60000)

        for i in range(20):
            body = page.evaluate("() => document.body?.innerText || ''")
            if "Home" in body and len(body) > 100:
                log(f"  Rendered {i+1}s")
                break
            time.sleep(1)

        logged = page.evaluate("() => !!document.querySelector('[data-testid=\"SideNav_NewTweet_Button\"]')")
        log(f"  Logged in: {logged}")
        if not logged:
            page.screenshot(path="/tmp/x_login_fail.png")
            browser.close()
            return False, "login_failed"

        log("  Opening composer...")
        page.click('[data-testid="SideNav_NewTweet_Button"]', timeout=10000)

        for i in range(10):
            c = page.evaluate("() => { const e = document.querySelector('[data-testid=\"tweetTextarea_0\"]'); return e && e.offsetParent !== null; }")
            if c:
                log(f"  Composer {i+1}s")
                break
            time.sleep(1)
        else:
            page.screenshot(path="/tmp/x_no_composer.png")
            browser.close()
            return False, "no_composer"

        log(f"  Typing {len(tweet_text)} chars...")
        page.click('[data-testid="tweetTextarea_0"]')
        time.sleep(0.3)
        page.keyboard.type(tweet_text, delay=5)
        time.sleep(1)

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

        # Click Post via React fiber (WORKS reliably)
        log("  Submitting (React fiber)...")
        result = page.evaluate("""() => {
            const btn = document.querySelector('[data-testid="tweetButton"]');
            if (!btn) return 'no_button';
            const key = Object.keys(btn).find(k => k.startsWith('__reactProps') || k.startsWith('__reactEventHandlers'));
            if (key) {
                const props = btn[key];
                if (props && props.onClick) {
                    props.onClick({});
                    return 'success';
                }
            }
            return 'no_react_handler';
        }""")
        log(f"  Click: {result}")

        # Wait for redirect (up to 25s)
        for i in range(25):
            time.sleep(1)
            url = page.url
            if "compose" not in url:
                log(f"  Redirected after {i+1}s")
                break

        page.screenshot(path="/tmp/x_after_post.png")

        posted = "compose" not in page.url
        log(f"  Posted: {posted}")
        browser.close()
        return posted, "posted" if posted else "failed"

def main():
    log("=" * 60)
    log("🐦 LUXOR X Poster")
    log("=" * 60)

    upload_dir = os.path.join(PROJECT, "luxor_media", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    for d in os.listdir("/tmp/codex-web-uploads/"):
        ud = f"/tmp/codex-web-uploads/{d}"
        if os.path.isdir(ud):
            for f in os.listdir(ud):
                if f.endswith(('.jpg','.jpeg','.png')):
                    dst = os.path.join(upload_dir, f)
                    if not os.path.exists(dst):
                        shutil.copy2(os.path.join(ud, f), dst)

    jpgs = sorted([os.path.join(upload_dir, f) for f in os.listdir(upload_dir) if f.endswith('.jpg')])
    log(f"Images: {len(jpgs)}")

    fallbacks = [
        "Your style, algorithmically curated. Luxor decodes fashion. https://luxor.ly #AIFashion #LuxorStyle",
        "Less is more when it's the right more. Luxor edits your wardrobe. https://luxor.ly #MinimalLuxury",
        "Stop wasting time. Start wearing confidence. Luxor AI styling. https://luxor.ly #EffortlessStyle"
    ]

    to_post = jpgs[:3] if jpgs else [None]

    for i, img in enumerate(to_post):
        name = os.path.basename(img) if img else f"post-{i+1}"
        log(f"\n--- [{i+1}/{len(to_post)}] {name} ---")

        prompt = "Write a tweet (max 280 chars) for Luxor fashion brand. Tone: confident, minimal, luxurious. Include hashtags. Output ONLY the tweet."
        tweet = gen_tweet(prompt)
        if not tweet:
            tweet = fallbacks[i % len(fallbacks)]
        log(f"📝 {tweet}")

        ok, info = post_to_x(img, tweet)
        log(f"{'✅' if ok else '❌'} {info}")
        time.sleep(5)

    log("\n✅ Complete!")

if __name__ == "__main__":
    main()
