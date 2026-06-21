"""Debug X composer opening."""
import json, time, requests
from playwright.sync_api import sync_playwright

API_URL = "https://opencode.ai/zen/v1/chat/completions"

# Generate tweet
print("=== Generate tweet ===")
payload = {
    "model": "deepseek-v4-flash-free",
    "messages": [
        {"role": "system", "content": "You write short X/Twitter posts. Output ONLY the tweet text (max 280 chars). No quotes, no labels, no commentary."},
        {"role": "user", "content": "Write a tweet (max 280 chars) for Luxor fashion brand. Tone: confident, minimal, luxurious. Include hashtags."}
    ],
    "temperature": 0.85,
    "max_tokens": 1000,
}
r = requests.post(API_URL, json=payload, timeout=60)
data = r.json()
msg = data["choices"][0]["message"]
content = msg.get("content", "").strip()
print(f"Content: \"{content}\"")
print(f"Usage: {data.get('usage',{})}")
tweet = content.strip('"').strip("'").strip() if content else "Luxor: Your style, algorithmically curated."
if len(tweet) > 280:
    tweet = tweet[:277] + "..."
print(f"Final tweet: {tweet}")

# Debug composer
print("\n=== Debug X composer ===")
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
        except:
            pass
    
    page = ctx.new_page()
    page.set_default_timeout(45000)
    page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=45000)
    
    for i in range(15):
        body = page.evaluate("() => document.body?.innerText || ''")
        if "Home" in body and len(body) > 100:
            print(f"Rendered after {i+1}s")
            break
        time.sleep(1)
    
    # Check buttons
    btns = page.evaluate("""() => {
        const btns = document.querySelectorAll('button');
        return Array.from(btns).map(b => ({
            text: b.textContent.trim().substring(0, 40),
            testid: b.getAttribute('data-testid') || '',
            visible: b.offsetParent !== null
        }));
    }""")
    
    print("All buttons (showing first 20):")
    for b in btns[:20]:
        print(f"  {b}")
    
    # Find Post button specifically
    post_btn = page.evaluate("""() => {
        const btn = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
        if (!btn) return 'not found';
        const rect = btn.getBoundingClientRect();
        return `found at ${rect.x},${rect.y} size ${rect.width}x${rect.height} visible=${btn.offsetParent !== null}`;
    }""")
    print(f"\nPost button: {post_btn}")
    
    # Try clicking
    print("\nClicking Post button...")
    try:
        page.click('[data-testid="SideNav_NewTweet_Button"]', timeout=5000)
        print("Clicked via selector")
    except Exception as e:
        print(f"Selector failed: {e}")
        js_r = page.evaluate("""() => {
            const btn = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
            if (!btn) return 'no button';
            btn.scrollIntoView({behavior: 'instant', block: 'center'});
            setTimeout(() => {
                btn.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
                btn.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}));
                btn.dispatchEvent(new MouseEvent('click', {bubbles: true, view: window}));
                btn.click();
            }, 100);
            return 'js click dispatched';
        }""")
        print(f"JS result: {js_r}")
        time.sleep(2)
    
    time.sleep(3)
    has_c = page.evaluate("() => !!document.querySelector('[data-testid=\"tweetTextarea_0\"]')")
    print(f"\nComposer after click: {has_c}")
    
    # Also check for dialog/overlay
    dialog_info = page.evaluate("""() => {
        const dialogs = document.querySelectorAll('[role="dialog"], [role="presentation"]');
        return dialogs.length;
    }""")
    print(f"Dialogs: {dialog_info}")
    
    body_text = page.evaluate("() => document.body.innerText")
    print(f"\nBody around 400-700: {body_text[400:700]}")
    
    page.screenshot(path="/tmp/x_debug_composer.png")
    print("Screenshot saved")
    
    # Now also try keyboard shortcut 'n'
    print("\nTrying keyboard 'n'...")
    page.keyboard.press('n')
    time.sleep(3)
    has_c2 = page.evaluate("() => !!document.querySelector('[data-testid=\"tweetTextarea_0\"]')")
    print(f"Composer after 'n': {has_c2}")
    
    page.screenshot(path="/tmp/x_debug_composer2.png")
    print("Screenshot 2 saved")
    
    browser.close()
