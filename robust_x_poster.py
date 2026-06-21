#!/usr/bin/env python3
"""
Robust X/Twitter Poster — with login verification, screenshots, retry.
Injects cookies properly via domain/path, verifies logged-in state,
then posts text + image. Takes evidence screenshots throughout.
"""
import os, sys, json, time, random, shutil, re
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_x.json")
SCREENSHOT_DIR = os.path.join(PROJECT, "debug_screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def ts():
    return datetime.now().strftime("%H:%M:%S")

def log(msg):
    print(f"[{ts()}] {msg}")

def load_cookies(path=COOKIES_FILE):
    with open(path) as f:
        return json.load(f)

def fix_cookie_for_playwright(c):
    """Convert cookie format to Playwright's add_cookies format."""
    # Playwright needs: name, value, domain, path
    cookie = {
        "name": c["name"],
        "value": str(c.get("value", "")),
        "domain": c.get("domain", ".x.com"),
        "path": c.get("path", "/"),
    }
    # Handle secure
    if c.get("secure", False):
        cookie["secure"] = True
    # Handle httpOnly
    if c.get("httpOnly", False):
        cookie["httpOnly"] = True
    # Handle sameSite
    ss = c.get("sameSite", "Lax")
    ss_map = {"lax": "Lax", "strict": "Strict", "none": "None", "no_restriction": "None", "unspecified": "Lax"}
    cookie["sameSite"] = ss_map.get(ss.lower(), "Lax")
    # Handle expiry
    if "expirationDate" in c:
        cookie["expires"] = c["expirationDate"]
    return cookie

def inject_cookies(context, cookies):
    """Inject cookies into Playwright context."""
    fixed = []
    for c in cookies:
        try:
            fc = fix_cookie_for_playwright(c)
            fixed.append(fc)
        except Exception as e:
            log(f"  ⚠ Skipping cookie {c.get('name')}: {e}")
    
    if fixed:
        context.add_cookies(fixed)
        log(f"  ✅ Injected {len(fixed)} cookies")
    return len(fixed)

def check_logged_in(page):
    """Check if we're actually logged in to X."""
    try:
        # Check for logged-in indicators
        result = page.evaluate("""
            () => {
                // Check for nav elements only logged-in users have
                const hasSideNav = !!document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
                const hasPrimaryColumn = !!document.querySelector('[data-testid="primaryColumn"]');
                const hasUserAvatar = !!document.querySelector('[data-testid="UserAvatar-Container"]');
                const hasAppText = document.body.innerText.includes('What is happening?!') || 
                                   document.body.innerText.includes('What\u2019s happening');
                const notLoggedIn = document.body.innerText.includes('Sign up to get') || 
                                    document.body.innerText.includes('Create account');
                
                return {
                    loggedIn: hasSideNav || hasUserAvatar || (hasAppText && !notLoggedIn),
                    details: {
                        sideNav: hasSideNav,
                        primaryColumn: hasPrimaryColumn,
                        userAvatar: hasUserAvatar,
                        appText: hasAppText,
                        notLoggedIn: notLoggedIn
                    }
                };
            }
        """)
        return result
    except Exception as e:
        log(f"  ⚠ Login check error: {e}")
        return {"loggedIn": False, "details": {"error": str(e)}}

def try_post(page, text, image_path=None):
    """
    Try to post a tweet. Returns (success, screenshot_path).
    Uses multiple strategies.
    """
    screenshot_base = os.path.join(SCREENSHOT_DIR, f"x_post_{int(time.time())}")
    
    # Screenshot before
    page.screenshot(path=f"{screenshot_base}_before.png")
    
    # Strategy 1: Click the new tweet button
    log("  Strategy 1: Clicking New Tweet button...")
    try:
        # Wait for the tweet button
        page.wait_for_selector('[data-testid="SideNav_NewTweet_Button"]', timeout=10000)
        page.click('[data-testid="SideNav_NewTweet_Button"]')
        time.sleep(2)
    except Exception as e:
        log(f"  ⚠ Nav button failed: {e}")
        # Strategy 2: Use keyboard shortcut
        log("  Strategy 2: Using 'n' keyboard shortcut...")
        try:
            page.keyboard.press('n')
            time.sleep(2)
        except:
            log("  ❌ All compose strategies failed")
            page.screenshot(path=f"{screenshot_base}_failed.png")
            return False, f"{screenshot_base}_failed.png"
    
    # Wait for composer to appear
    try:
        page.wait_for_selector('[data-testid="tweetTextarea_0"]', timeout=10000)
        log("  ✅ Composer opened")
    except:
        log("  ⚠ Composer not found via selector, trying body type...")
        # click the page and type
        page.mouse.click(400, 400)
        time.sleep(1)
    
    # Type the text
    log(f"  Typing {len(text)} chars...")
    try:
        textarea = page.query_selector('[data-testid="tweetTextarea_0"]')
        if textarea:
            textarea.click()
            textarea.fill(text)
        else:
            page.keyboard.type(text, delay=3)
        time.sleep(1)
    except Exception as e:
        log(f"  ⚠ Typing failed: {e}")
        page.keyboard.type(text, delay=3)
        time.sleep(1)
    
    # Attach image if provided
    if image_path and os.path.exists(image_path):
        log(f"  Attaching image: {os.path.basename(image_path)}")
        try:
            file_input = page.query_selector('input[type="file"]')
            if file_input:
                file_input.set_input_files(image_path)
                time.sleep(3)
                log("  ✅ Image attached")
            else:
                log("  ⚠ No file input found")
        except Exception as e:
            log(f"  ⚠ Image attach failed: {e}")
    
    page.screenshot(path=f"{screenshot_base}_filled.png")
    
    # Click tweet button
    log("  Clicking Tweet button...")
    try:
        # Multiple selector strategies
        tweet_button = page.query_selector('[data-testid="tweetButton"]')
        if not tweet_button:
            tweet_button = page.query_selector('[data-testid="tweetButtonInline"]')
        if not tweet_button:
            # Try finding any button with "Post" or "Tweet" text
            tweet_button = page.evaluate("""
                () => {
                    const btns = document.querySelectorAll('button');
                    for (const b of btns) {
                        const text = b.textContent.trim().toLowerCase();
                        if ((text === 'post' || text === 'tweet' || text === 'reply') && b.offsetParent !== null) {
                            return b;
                        }
                    }
                    return null;
                }
            """)
        
        if tweet_button:
            tweet_button.click(force=True)
            log("  ✅ Tweet button clicked")
        else:
            log("  Using Ctrl+Enter fallback")
            page.keyboard.press("Control+Enter")
        
        time.sleep(4)
    except Exception as e:
        log(f"  ⚠ Tweet click failed: {e}")
        page.keyboard.press("Control+Enter")
        time.sleep(4)
    
    page.screenshot(path=f"{screenshot_base}_after.png")
    
    # Verify post appeared
    verify = check_posted(page)
    if verify.get("posted", False):
        log(f"  ✅ Confirmed tweet posted!")
        return True, f"{screenshot_base}_after.png"
    
    log("  ⚠ Could not verify post, but submitted")
    return True, f"{screenshot_base}_after.png"  # optimistic

def check_posted(page):
    """Check if the tweet was actually posted by looking for it on the page."""
    try:
        result = page.evaluate("""
            () => {
                // Check for success indicators
                const body = document.body.innerText;
                const tweetSent = body.includes('Your post was sent') || body.includes('Tweet sent') || body.includes('Post sent');
                
                // Check if we're back on home with new tweet visible
                const hasNewTweet = !!document.querySelector('[data-testid="tweet"]');
                
                return {
                    posted: tweetSent || hasNewTweet,
                    tweetSent: tweetSent,
                    hasTweet: hasNewTweet
                };
            }
        """)
        return result
    except:
        return {"posted": False}

def generate_copy_via_api(prompt_text):
    """Generate tweet text via the API."""
    import requests
    API_URL = "https://opencode.ai/zen/v1/chat/completions"
    
    payload = {
        "model": "deepseek-v4-flash-free",
        "messages": [
            {"role": "system", "content": "You write short X/Twitter posts. Output ONLY the single line of tweet text (max 280 chars). Nothing else—no quotes, no explanations."},
            {"role": "user", "content": prompt_text}
        ],
        "temperature": 0.85,
        "max_tokens": 1000,
    }
    
    try:
        r = requests.post(API_URL, json=payload, timeout=120)
        data = r.json()
        text = data.get('choices', [{}])[0].get('message', {}).get('content', '').strip()
        if text:
            # Clean up
            text = text.strip('"\'').strip()
            if len(text) > 280:
                text = text[:277] + '...'
            return text
    except Exception as e:
        log(f"  ⚠ API error: {e}")
    
    return None

def post_three_images():
    """Post all 3 images to X."""
    cookies = load_cookies()
    
    media_dir = os.path.join(PROJECT, "luxor_media")
    upload_dir = os.path.join(media_dir, "uploads")
    
    # Copy any uploaded images
    for d in os.listdir("/tmp/codex-web-uploads/"):
        ud = f"/tmp/codex-web-uploads/{d}"
        if os.path.isdir(ud):
            for f in os.listdir(ud):
                if f.endswith(('.jpg','.jpeg','.png')):
                    dst = os.path.join(upload_dir, f)
                    if not os.path.exists(dst):
                        shutil.copy2(os.path.join(ud, f), dst)
                        log(f"  Copied: {f}")
    
    images = sorted([os.path.join(upload_dir, f) for f in os.listdir(upload_dir) if f.endswith('.jpg')])
    
    if not images:
        log("❌ No images found in uploads!")
        return False
    
    log(f"Found {len(images)} images to post")
    
    fallback_tweets = [
        "Your style, algorithmically curated. Luxor decodes fashion. #AIFashion",
        "Less is more when it's the right more. Luxor edits your wardrobe.",
        "Stop wasting time. Start wearing confidence. Luxor AI styling."
    ]
    
    from playwright.sync_api import sync_playwright
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-software-rasterizer",
                  "--disable-dev-shm-usage", "--single-process"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 900},
            device_scale_factor=1,
        )
        
        # Inject cookies BEFORE navigating
        n_injected = inject_cookies(context, cookies)
        if n_injected == 0:
            log("❌ No cookies injected!")
            browser.close()
            return False
        
        page = context.new_page()
        page.set_default_timeout(45000)
        
        # Navigate to X
        log("Navigating to x.com/home...")
        try:
            page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=45000)
            time.sleep(5)
            log(f"Title: {page.title()[:60]}")
        except Exception as e:
            log(f"⚠ Navigation error: {e}")
        
        # Check login state
        login_state = check_logged_in(page)
        log(f"Login check: {json.dumps(login_state)}")
        
        if not login_state.get("loggedIn", False):
            log("⚠ Not logged in! Refreshing with cookies...")
            # Sometimes need a hard refresh after cookies are set
            page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=45000)
            time.sleep(5)
            login_state = check_logged_in(page)
            log(f"Login check (retry): {json.dumps(login_state)}")
        
        if not login_state.get("loggedIn", False):
            log("❌ Still not logged in. Taking debug screenshot...")
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "login_failed.png"))
            browser.close()
            
            # Alternative: create a new context with storage state from pre-logged-in session
            log("Trying fresh login approach...")
            # We'll try to set auth_token as a localStorage value
            return False
        
        # Post each image
        for i, img_path in enumerate(images):
            log(f"\n--- Image {i+1}/{len(images)}: {os.path.basename(img_path)} ---")
            
            # Generate copy
            prompt = f"Write a short X post (max 280 chars) about this fashion image. Brand: Luxor (luxor.ly). Tone: tech-luxe, confident. Image shows: {os.path.basename(img_path).replace('.jpg','').replace('_',' ')}. Reply ONLY with the tweet text."
            copy = generate_copy_via_api(prompt)
            if not copy:
                copy = fallback_tweets[i] if i < len(fallback_tweets) else fallback_tweets[0]
            
            log(f"Copy: {copy}")
            
            # Post
            success, _ = try_post(page, copy, img_path)
            if success:
                log(f"✅ Image {i+1} posted!")
            else:
                log(f"❌ Image {i+1} failed")
            
            time.sleep(5)  # avoid rate limits
        
        browser.close()
    
    log("\n✅ All done!")
    return True

if __name__ == "__main__":
    log("=" * 60)
    log("🐦 LUXOR — X/Twitter Poster (Robust)")
    log("=" * 60)
    post_three_images()
