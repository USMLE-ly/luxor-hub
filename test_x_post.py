"""Test X posting with hardcoded tweet."""
import json, time, os, sys
from playwright.sync_api import sync_playwright

tweet_text = "Quiet luxury. No logos, no trends. Just impeccable tailoring and effortless confidence. Luxor decodes your style. luxor.ly #AIFashion #LuxuryStyle"

with open("cookies_x.json") as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"]
    )
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        viewport={"width": 1280, "height": 900},
    )
    
    for c in cookies:
        try:
            ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".x.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
        except:
            pass
    
    page = ctx.new_page()
    page.set_default_timeout(60000)
    
    print("Loading x.com...")
    page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=60000)
    
    for i in range(20):
        body = page.evaluate("() => document.body?.innerText || ''")
        if "Home" in body and len(body) > 100:
            print(f"Rendered after {i+1}s")
            break
        time.sleep(1)
    
    # Check login
    logged = page.evaluate("() => !!document.querySelector('[data-testid=\"SideNav_NewTweet_Button\"]')")
    print(f"Logged in: {logged}")
    if not logged:
        print("NOT LOGGED IN!")
        page.screenshot(path="/tmp/x_login_fail.png")
        browser.close()
        sys.exit(1)
    
    # Click Post
    print("Opening composer...")
    page.click('[data-testid="SideNav_NewTweet_Button"]', timeout=5000)
    time.sleep(2)
    
    has_c = page.evaluate("() => !!document.querySelector('[data-testid=\"tweetTextarea_0\"]')")
    print(f"Composer: {has_c}")
    if not has_c:
        page.screenshot(path="/tmp/x_no_composer.png")
        browser.close()
        sys.exit(1)
    
    # Type
    print(f"Typing {len(tweet_text)} chars...")
    page.click('[data-testid="tweetTextarea_0"]')
    time.sleep(0.3)
    page.keyboard.type(tweet_text, delay=5)
    time.sleep(1)
    
    # Attach image
    img_path = "luxor_media/uploads/01_algorithmic_curator.jpg"
    if os.path.exists(img_path):
        print(f"Attaching: {img_path}")
        try:
            fi = page.query_selector('input[type="file"]')
            if fi:
                fi.set_input_files(img_path)
                time.sleep(3)
                print("  Attached")
        except Exception as e:
            print(f"  Error: {e}")
    
    page.screenshot(path="/tmp/x_before_post.png")
    print("Pre-post screenshot: /tmp/x_before_post.png")
    
    # Post
    print("Submitting...")
    btn = page.query_selector('[data-testid="tweetButton"]')
    if not btn:
        btn = page.query_selector('[data-testid="tweetButtonInline"]')
    if btn:
        btn.click(force=True)
        print("  Button clicked")
    else:
        page.keyboard.press("Control+Enter")
        print("  Ctrl+Enter fallback")
    
    time.sleep(5)
    page.screenshot(path="/tmp/x_after_post.png")
    print("Post screenshot: /tmp/x_after_post.png")
    
    # Verify
    posted = page.evaluate("() => document.body.innerText.includes('Your post was sent')")
    print(f"Posted verified: {posted}")
    print(f"URL: {page.url}")
    
    browser.close()
    print("DONE")
