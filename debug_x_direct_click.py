"""Debug: try clicking Post via JS dispatchEvent chain."""
import json, time
from playwright.sync_api import sync_playwright

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
    
    network_calls = []
    def on_resp(response):
        if "CreateTweet" in response.url or "create_tweet" in response.url:
            network_calls.append({"url": response.url, "status": response.status, "body": response.text()[:500]})
    
    page.on("response", on_resp)
    
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
    
    # Type text
    page.click('[data-testid="tweetTextarea_0"]')
    time.sleep(0.3)
    page.keyboard.type("Test click dispatch chain. #Debug", delay=5)
    time.sleep(2)
    
    # Get the button's bounding box
    btn_rect = page.evaluate("""() => {
        const btn = document.querySelector('[data-testid="tweetButton"]');
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return {x: r.x + r.width/2, y: r.y + r.height/2};
    }""")
    
    if btn_rect:
        x, y = btn_rect["x"], btn_rect["y"]
        print(f"Button center: {x}, {y}")
        
        # Method 1: Playwright click at coordinates
        print("\nMethod 1: Playwright click at coordinates")
        page.mouse.click(x, y)
        time.sleep(3)
        print(f"  URL: {page.url}")
        
        if "compose" in page.url:
            print("  Still on compose, trying Method 2...")
        else:
            print("  SUCCESS!")
            browser.close()
            exit()
    
    # Method 2: Full JS event chain
    print("\nMethod 2: JS event dispatch chain")
    page.evaluate("""() => {
        const btn = document.querySelector('[data-testid="tweetButton"]');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const x = rect.x + rect.width/2;
        const y = rect.y + rect.height/2;
        
        // Full event chain that React expects
        btn.dispatchEvent(new PointerEvent('pointermove', {bubbles: true, cancelable: true, clientX: x, clientY: y}));
        btn.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true, clientX: x, clientY: y}));
        btn.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true, clientX: x, clientY: y, view: window}));
        btn.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, cancelable: true, clientX: x, clientY: y}));
        btn.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, cancelable: true, clientX: x, clientY: y, view: window}));
        btn.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, clientX: x, clientY: y, view: window}));
    }""")
    time.sleep(3)
    print(f"  URL: {page.url}")
    
    if "compose" in page.url:
        print("  Still on compose, trying Method 3...")
    else:
        print("  SUCCESS!")
        browser.close()
        exit()
    
    # Method 3: Get the React fiber and call onClick directly
    print("\nMethod 3: React onClick via fiber")
    page.evaluate("""() => {
        const btn = document.querySelector('[data-testid="tweetButton"]');
        if (!btn) return;
        // React stores event handlers in __reactProps$... or __reactEventHandlers$...
        const key = Object.keys(btn).find(k => k.startsWith('__reactProps') || k.startsWith('__reactEventHandlers'));
        if (key) {
            const props = btn[key];
            if (props.onClick) {
                props.onClick({});
                return 'onClick called';
            }
        }
        return 'no react handler found';
    }""")
    time.sleep(3)
    print(f"  URL: {page.url}")
    print(f"  Network calls: {network_calls}")
    
    page.screenshot(path="/tmp/x_debug_click.png")
    browser.close()
