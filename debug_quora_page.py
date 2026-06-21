"""Debug what Quora actually shows."""
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
    time.sleep(8)
    
    title = page.title()
    print(f"Title: {title}")
    print(f"URL: {page.url}")
    
    body = page.evaluate("() => document.body.innerText")
    print(f"\nBody (first 1500 chars):")
    print(body[:1500])
    
    print("\n--- Buttons ---")
    btns = page.evaluate("""() => {
        const all = document.querySelectorAll('button, a');
        return Array.from(all).filter(el => {
            const t = el.textContent.trim().toLowerCase();
            return (t.includes('answer') || el.getAttribute('data-testid')?.includes('answer'));
        }).slice(0, 10).map(el => ({
            tag: el.tagName,
            text: el.textContent.trim().substring(0, 50),
            testid: el.getAttribute('data-testid') || '',
            href: el.href || '',
            visible: el.offsetParent !== null
        }));
    }""")
    print(f"Answer-related elements: {json.dumps(btns, indent=2)}")
    
    print("\n--- All data-testid containing 'answer' ---")
    testids = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('[data-testid*=\"answer\" i]')).map(el => ({
            tag: el.tagName,
            testid: el.getAttribute('data-testid'),
            text: el.textContent.trim().substring(0, 40)
        }));
    }""")
    print(json.dumps(testids, indent=2))
    
    page.screenshot(path="/tmp/quora_debug.png", full_page=True)
    print("\nScreenshot saved")
    browser.close()
