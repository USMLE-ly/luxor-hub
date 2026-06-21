"""Check what Quora shows with our cookies."""
import json, time
from playwright.sync_api import sync_playwright

with open("cookies_quora_working.json") as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"])
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", viewport={"width": 1280, "height": 900})
    
    for c in cookies:
        try:
            ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".quora.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
        except: pass
    
    page = ctx.new_page()
    page.set_default_timeout(60000)
    page.goto("https://www.quora.com/How-is-AI-changing-the-fashion-industry", wait_until="domcontentloaded", timeout=60000)
    
    for i in range(15):
        body = page.evaluate("() => document.body?.innerText?.substring(0, 500) || '(empty)'")
        if len(body) > 100:
            print(f"After {i+1}s: [{len(body)} chars] {body[:300]}")
            break
        print(f"After {i+1}s: [{len(body)} chars]")
        time.sleep(1)
    
    print(f"\nFull body:\n{page.evaluate('() => document.body.innerText')}")
    page.screenshot(path="/tmp/quora_body_check.png")
    print("\nScreenshot saved")
    browser.close()
