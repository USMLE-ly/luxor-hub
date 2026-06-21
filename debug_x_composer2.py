"""Debug X composer - find what actually appears after clicking Post."""
import json, time
from playwright.sync_api import sync_playwright

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
        except: pass
    
    page = ctx.new_page()
    page.set_default_timeout(60000)
    
    page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=60000)
    for i in range(20):
        body = page.evaluate("() => document.body?.innerText || ''")
        if "Home" in body and len(body) > 100:
            print(f"Rendered after {i+1}s")
            break
        time.sleep(1)
    
    # Click Post button
    print("Clicking Post button...")
    try:
        page.click('[data-testid="SideNav_NewTweet_Button"]', timeout=5000)
        print("  Clicked!")
    except Exception as e:
        print(f"  Click failed: {e}")
    
    time.sleep(3)
    
    # Check whats on screen now
    body = page.evaluate("() => document.body.innerText")
    print(f"\nBody text (after click):")
    print(body[:1200])
    
    # Check for any textarea or input
    inputs = page.evaluate("""() => {
        const ta = document.querySelectorAll('textarea');
        const div = document.querySelectorAll('[contenteditable="true"]');
        const input = document.querySelectorAll('input[type="text"]');
        return {
            textareas: Array.from(ta).map(t => t.placeholder || t.getAttribute('aria-label') || 'unnamed'),
            contenteditables: Array.from(div).map(d => d.getAttribute('aria-label') || d.getAttribute('role') || 'unnamed'),
            textinputs: Array.from(input).map(i => i.placeholder || i.getAttribute('aria-label') || 'unnamed')
        };
    }""")
    print(f"\nInputs found:")
    print(f"  textareas: {inputs['textareas']}")
    print(f"  contenteditables: {inputs['contenteditables']}")
    print(f"  textinputs: {inputs['textinputs']}")
    
    # Check all elements with data-testid containing 'tweet'
    tweet_elems = page.evaluate("""() => {
        const all = document.querySelectorAll('[data-testid]');
        return Array.from(all).filter(e => e.getAttribute('data-testid').toLowerCase().includes('tweet')).map(e => ({
            testid: e.getAttribute('data-testid'),
            tag: e.tagName,
            visible: e.offsetParent !== null
        }));
    }""")
    print(f"\ntweet-related elements: {json.dumps(tweet_elems, indent=2)}")
    
    # Also check for placeholder text that indicates the composer
    placeholders = page.evaluate("""() => {
        const all = document.querySelectorAll('[placeholder]');
        return Array.from(all).map(e => e.getAttribute('placeholder'));
    }""")
    print(f"\nPlaceholders: {placeholders}")
    
    page.screenshot(path="/tmp/x_debug_composer2.png")
    print("\nScreenshot saved")
    
    browser.close()
