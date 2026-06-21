"""Click the 'Click here to continue writing' draft link on Quora."""
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
    
    # Find clickable elements containing "Click here" or "continue writing" or "Edit draft"
    result = page.evaluate("""() => {
        // Find by text content using XPath
        const terms = ['Click here', 'continue writing', 'Edit draft', 'answer draft'];
        const results = [];
        
        for (const term of terms) {
            // Search all elements
            const all = document.querySelectorAll('a, span, div, button');
            for (const el of all) {
                if (el.textContent.includes(term) && el.offsetParent !== null) {
                    results.push({
                        term: term,
                        tag: el.tagName,
                        text: el.textContent.trim().substring(0, 80),
                        id: el.id,
                        class: el.className.substring(0, 40),
                        href: el.href || '',
                        clickable: el.tagName === 'A' || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || el.onclick !== null,
                        rect: (r => r ? {x: ~~r.x, y: ~~r.y, w: ~~r.width, h: ~~r.height} : null)(el.getBoundingClientRect())
                    });
                }
            }
        }
        return results;
    }""")
    
    print(f"Found {len(result)} elements:")
    for r in result:
        print(f"  {json.dumps(r, indent=4)}")
    
    # Try clicking "Click here" if found
    if result:
        for r in result:
            if "Click here" in r.get("text", ""):
                print(f"\nTrying to click '{r['text']}'...")
                try:
                    # Try using Playwright's text selector
                    page.locator(f"text={r['text']}").first.click()
                    print("Clicked via locator")
                    time.sleep(3)
                    editor = page.evaluate("() => document.querySelector('[contenteditable=\"true\"]') ? 'found' : 'not_found'")
                    print(f"Editor: {editor}")
                    break
                except Exception as e:
                    print(f"Error: {e}")
    
    # Also try clicking "Edit draft" 
    if not result:
        # Try finding by text "Edit draft" more directly
        try:
            page.locator("text=Edit draft").first.click()
            print("Clicked Edit draft")
            time.sleep(3)
        except:
            print("No Edit draft found")
    
    page.screenshot(path="/tmp/quora_click_draft.png")
    print("Screenshot saved")
    browser.close()
