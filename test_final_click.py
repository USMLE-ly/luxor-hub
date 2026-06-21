"""Test final React fiber click approach."""
import json, time, os
from playwright.sync_api import sync_playwright

TWEET = "React fiber click test from Luxor AI. If you see this, the fix works! #Luxor #ReactFiber"

with open("cookies_x.json") as f:
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
    
    print("Loading x.com...")
    page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=60000)
    
    for i in range(20):
        body = page.evaluate("() => document.body?.innerText || ''")
        if "Home" in body and len(body) > 100:
            print(f"  Rendered {i+1}s")
            break
        time.sleep(1)
    
    page.click('[data-testid="SideNav_NewTweet_Button"]', timeout=10000)
    
    for i in range(10):
        c = page.evaluate("() => { const e = document.querySelector('[data-testid=\"tweetTextarea_0\"]'); return e && e.offsetParent !== null; }")
        if c:
            print(f"  Composer {i+1}s")
            break
        time.sleep(1)
    
    page.click('[data-testid="tweetTextarea_0"]')
    time.sleep(0.3)
    page.keyboard.type(TWEET, delay=5)
    time.sleep(2)
    
    img = "luxor_media/uploads/01_algorithmic_curator.jpg"
    if os.path.exists(img):
        fi = page.query_selector('input[type="file"]')
        if fi:
            fi.set_input_files(img)
            time.sleep(3)
            print("  Image attached")
    
    print("Clicking Post via React fiber...")
    result = page.evaluate("""() => {
        const btn = document.querySelector('[data-testid="tweetButton"]');
        if (!btn) return 'no_tweetButton';
        const key = Object.keys(btn).find(k => k.startsWith('__reactProps') || k.startsWith('__reactEventHandlers'));
        if (key) {
            const props = btn[key];
            if (props && props.onClick) {
                props.onClick({});
                return 'react_' + key;
            }
        }
        btn.click();
        return 'dom_click';
    }""")
    print(f"  Method: {result}")
    
    for i in range(15):
        time.sleep(1)
        url = page.url
        if "compose" not in url:
            print(f"  Redirected after {i+1}s: {url}")
            break
    else:
        print("  Still on compose")
    
    page.screenshot(path="/tmp/x_final_result.png")
    print(f"Final URL: {page.url}")
    browser.close()
    print("DONE")
