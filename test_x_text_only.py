"""Test X posting - text only, no image."""
import json, time, os
from playwright.sync_api import sync_playwright

COOKIES_FILE = "cookies_x.json"
TWEET = "Testing Luxor AI posting pipeline. This is a text-only test. #Luxor #AITesting"

with open(COOKIES_FILE) as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"])
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36", viewport={"width": 1280, "height": 900})
    
    for c in cookies:
        try:
            ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".x.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
        except: pass
    
    page = ctx.new_page()
    page.set_default_timeout(60000)
    page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=60000)
    
    for i in range(20):
        body = page.evaluate("() => document.body?.innerText || ''")
        if "Home" in body and len(body) > 100:
            print(f"Rendered {i+1}s")
            break
        time.sleep(1)
    
    page.click('[data-testid="SideNav_NewTweet_Button"]', timeout=10000)
    
    for i in range(10):
        c = page.evaluate("() => { const e = document.querySelector('[data-testid=\"tweetTextarea_0\"]'); return e && e.offsetParent !== null; }")
        if c:
            print(f"Composer {i+1}s")
            break
        time.sleep(1)
    
    # Type
    page.click('[data-testid="tweetTextarea_0"]')
    time.sleep(0.3)
    page.keyboard.type(TWEET, delay=5)
    time.sleep(1)
    
    print("Text typed, taking screenshot...")
    page.screenshot(path="/tmp/x_text_before.png")
    
    # Try clicking Post via Playwright proper click (not force)
    print("Clicking Post...")
    try:
        btn = page.query_selector('[data-testid="tweetButton"]')
        if btn:
            # Try without force first
            try:
                btn.click(timeout=5000)
                print("  Playwright click (no force)")
            except:
                btn.click(force=True)
                print("  Playwright click (force)")
        else:
            page.keyboard.press("Control+Enter")
            print("  Ctrl+Enter")
    except Exception as e:
        print(f"  Error: {e}")
    
    # Wait longer
    for i in range(10):
        time.sleep(1)
        url = page.url
        if "compose" not in url:
            print(f"Redirected after {i+1}s, URL: {url}")
            break
    else:
        print("Still on compose page after 10s")
    
    page.screenshot(path="/tmp/x_text_after.png")
    
    posted = page.evaluate("() => document.body.innerText.includes('Your post was sent')")
    print(f"Posted: {posted}")
    print(f"URL: {page.url}")
    
    # Check profile
    page.goto("https://x.com/Luxor_Offical", wait_until="domcontentloaded", timeout=30000)
    time.sleep(5)
    
    latest_tweets = page.evaluate("""() => {
        const articles = document.querySelectorAll('[data-testid="tweet"]');
        const results = [];
        for (const a of articles) {
            const text = a.innerText;
            results.push(text.substring(0, 200));
            if (results.length >= 3) break;
        }
        return results;
    }""")
    print(f"Latest tweets: {json.dumps(latest_tweets, indent=2)}")
    
    browser.close()
