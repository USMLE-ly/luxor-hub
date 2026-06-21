"""Debug X submission - check button states."""
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
    page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=60000)
    
    for i in range(20):
        body = page.evaluate("() => document.body?.innerText || ''")
        if "Home" in body and len(body) > 100:
            print(f"Rendered {i+1}s")
            break
        time.sleep(1)
    
    page.click('[data-testid="SideNav_NewTweet_Button"]')
    
    for i in range(10):
        c = page.evaluate("() => { const e = document.querySelector('[data-testid=\"tweetTextarea_0\"]'); return e && e.offsetParent !== null ? 'ok' : 'no'; }")
        if c == "ok":
            print(f"Composer {i+1}s")
            break
        time.sleep(1)
    
    # Type something
    page.click('[data-testid="tweetTextarea_0"]')
    time.sleep(0.3)
    page.keyboard.type("Test post from Luxor AI. Checking if posting works. #Test", delay=5)
    time.sleep(1)
    
    # Check button states
    btn_state = page.evaluate("""() => {
        const btn = document.querySelector('[data-testid="tweetButton"]');
        const btnInline = document.querySelector('[data-testid="tweetButtonInline"]');
        return {
            tweetButton: btn ? {
                disabled: btn.disabled,
                ariaDisabled: btn.getAttribute('aria-disabled'),
                class: btn.className.substring(0, 100),
                text: btn.textContent.trim(),
                visible: btn.offsetParent !== null,
                rect: (b => b ? {x: ~~b.getBoundingClientRect().x, y: ~~b.getBoundingClientRect().y, w: ~~b.getBoundingClientRect().width, h: ~~b.getBoundingClientRect().height} : null)(btn)
            } : null,
            tweetButtonInline: btnInline ? {
                disabled: btnInline.disabled,
                ariaDisabled: btnInline.getAttribute('aria-disabled'),
                text: btnInline.textContent.trim(),
                visible: btnInline.offsetParent !== null
            } : null
        };
    }""")
    
    print(f"Button state: {json.dumps(btn_state, indent=2)}")
    
    # Check if there's any error or character count indicator
    page_info = page.evaluate("""() => {
        const body = document.body.innerText;
        const errEls = document.querySelectorAll('[role="alert"]');
        return {
            snippet: body.substring(400, 700),
            hasFileInput: !!document.querySelector('input[type="file"]'),
            charCount: body.match(/\d+/)?.[0]
        };
    }""")
    print(f"Page info: {json.dumps(page_info, indent=2)}")
    
    page.screenshot(path="/tmp/x_debug_submit.png")
    print("Screenshot saved")
    
    browser.close()
