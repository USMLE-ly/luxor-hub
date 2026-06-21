"""Test X posting with JS event dispatch for React compatibility."""
import json, time
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
            print(f"  Rendered {i+1}s")
            break
        time.sleep(1)
    
    print("[2] Opening composer...")
    page.click('[data-testid="SideNav_NewTweet_Button"]', timeout=10000)
    
    for i in range(10):
        c = page.evaluate("""() => {
            const el = document.querySelector('[data-testid="tweetTextarea_0"]');
            return el && el.offsetParent !== null;
        }""")
        if c:
            print(f"  Ready {i+1}s")
            break
        time.sleep(1)
    
    print(f"[3] Typing via JS ({len(TWEET)} chars)...")
    # Use JS to set text and trigger React event
    page.evaluate(f"""() => {{
        const ta = document.querySelector('[data-testid="tweetTextarea_0"]');
        if (!ta) return;
        
        // Focus
        ta.focus();
        
        // Set innerText
        ta.innerText = {json.dumps(TWEET)};
        
        // Dispatch input event for React
        ta.dispatchEvent(new Event('input', {{ bubbles: true, cancelable: true }}));
        
        // Also dispatch beforeinput
        ta.dispatchEvent(new Event('beforeinput', {{ bubbles: true, cancelable: true }}));
    }}""")
    time.sleep(1)
    
    # Verify text was set
    text_set = page.evaluate("""() => {
        const ta = document.querySelector('[data-testid="tweetTextarea_0"]');
        return ta ? ta.innerText : 'no element';
    }""")
    print(f"  Text in composer: \"{text_set[:50]}\"")
    
    # Attach image
    img_path = "luxor_media/uploads/01_algorithmic_curator.jpg"
    if os.path.exists(img_path):
        try:
            fi = page.query_selector('input[type="file"]')
            if fi:
                fi.set_input_files(img_path)
                time.sleep(3)
                print("  Image attached")
        except Exception as e:
            print(f"  Image error: {e}")
    
    page.screenshot(path="/tmp/x_js_before.png")
    
    print("[4] Clicking Post via JS...")
    page.evaluate("""() => {
        const btn = document.querySelector('[data-testid="tweetButton"]');
        if (!btn) { console.log('no button'); return; }
        
        // Dispatch proper pointer events for React
        btn.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true}));
        btn.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, cancelable: true}));
        btn.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window}));
        btn.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window}));
        btn.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
        
        // Also try direct click
        setTimeout(() => btn.click(), 100);
    }""")
    
    # Wait and check
    time.sleep(5)
    page.screenshot(path="/tmp/x_js_after.png")
    
    posted = page.evaluate("() => document.body.innerText.includes('Your post was sent')")
    final_url = page.url
    print(f"  Posted: {posted}")
    print(f"  URL: {final_url}")
    
    # If still on compose, try Playwright click as backup
    if "compose" in final_url:
        print("[5] Trying Playwright direct click...")
        btn = page.query_selector('[data-testid="tweetButton"]')
        if btn:
            btn.click(force=True)
            time.sleep(5)
            posted = page.evaluate("() => document.body.innerText.includes('Your post was sent')")
            print(f"  Posted: {posted}")
            print(f"  URL: {page.url}")
    
    # Check profile
    if "compose" in page.url:
        page.goto("https://x.com/Luxor_Offical", wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)
        latest = page.evaluate("""() => {
            const articles = document.querySelectorAll('[data-testid="tweet"]');
            return Array.from(articles).slice(0, 2).map(a => a.innerText.substring(0, 100));
        }""")
        print(f"  Recent tweets: {latest}")
    
    browser.close()
    print("DONE")
