"""Quick test: post one hardcoded tweet to X."""
import os, json, time
from playwright.sync_api import sync_playwright

TWEET = "Quiet luxury. No logos, no trends. Just impeccable tailoring and effortless confidence. Luxor decodes your style. luxor.ly #AIFashion #LuxuryStyle"
COOKIES_FILE = "cookies_x.json"

with open(COOKIES_FILE) as f:
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
        except: pass
    
    page = ctx.new_page()
    page.set_default_timeout(60000)
    print("[1] Loading x.com...")
    page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=60000)
    
    for i in range(20):
        body = page.evaluate("() => document.body?.innerText || ''")
        if "Home" in body and len(body) > 100:
            print(f"  Rendered after {i+1}s")
            break
        time.sleep(1)
    
    logged = page.evaluate("() => !!document.querySelector('[data-testid=\"SideNav_NewTweet_Button\"]')")
    print(f"[2] Logged in: {logged}")
    if not logged:
        print("❌ NOT LOGGED IN!")
        browser.close()
        exit(1)
    
    print("[3] Opening composer...")
    page.wait_for_selector('[data-testid="SideNav_NewTweet_Button"]', timeout=10000)
    page.click('[data-testid="SideNav_NewTweet_Button"]')
    
    for i in range(10):
        c = page.evaluate("""() => {
            const el = document.querySelector('[data-testid="tweetTextarea_0"]');
            return el && el.offsetParent !== null ? 'visible' : 'not_visible';
        }""")
        if c == "visible":
            print(f"  Composer ready after {i+1}s")
            break
        time.sleep(1)
    else:
        print("❌ Composer not found!")
        page.screenshot(path="/tmp/x_composer_fail.png")
        browser.close()
        exit(1)
    
    print(f"[4] Typing {len(TWEET)} chars...")
    page.click('[data-testid="tweetTextarea_0"]')
    time.sleep(0.3)
    page.keyboard.type(TWEET, delay=5)
    time.sleep(1)
    
    # Attach first image
    img_path = "luxor_media/uploads/01_algorithmic_curator.jpg"
    if os.path.exists(img_path):
        print(f"[5] Attaching {os.path.basename(img_path)}...")
        try:
            fi = page.query_selector('input[type="file"]')
            if fi:
                fi.set_input_files(img_path)
                time.sleep(3)
                print("  ✅ Attached")
        except Exception as e:
            print(f"  ⚠ {e}")
    
    page.screenshot(path="/tmp/x_before_post.png")
    print("[6] Pre-post: /tmp/x_before_post.png")
    
    print("[7] Submitting...")
    btn = page.query_selector('[data-testid="tweetButton"]')
    if not btn:
        btn = page.query_selector('[data-testid="tweetButtonInline"]')
    if btn:
        btn.click(force=True)
        print("  ✅ Button clicked")
    else:
        page.keyboard.press("Control+Enter")
        print("  Ctrl+Enter")
    
    time.sleep(5)
    page.screenshot(path="/tmp/x_after_post.png")
    print("[8] Post: /tmp/x_after_post.png")
    
    posted = page.evaluate("() => document.body.innerText.includes('Your post was sent')")
    print(f"[9] Verified posted: {posted}")
    print(f"    URL: {page.url}")
    
    browser.close()
    print("✅ DONE")
