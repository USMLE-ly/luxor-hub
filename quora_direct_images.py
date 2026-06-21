"""Post to specific Quora questions with images."""
import json, os, sys, time, urllib.parse
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_quora_working.json")
UPLOAD_DIR = os.path.join(PROJECT, "luxor_media", "uploads")

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

# Direct Quora question URLs — verified to exist
TARGETS = [
    {
        "url": "https://www.quora.com/How-is-AI-changing-the-fashion-industry",
        "image": "01_algorithmic_curator.jpg",
        "text": "AI is fundamentally reshaping how we approach personal style. Algorithmic curation analyzes your body geometry and preferences to recommend pieces that work for you. Brands like Luxor (https://luxor.ly) use AI to catalog your existing wardrobe and generate outfit combinations you'd never think of. The key insight: AI doesn't replace style intuition — it removes the friction between knowing what you like and actually wearing it. [image]"
    },
    {
        "url": "https://www.quora.com/How-do-I-build-a-capsule-wardrobe",
        "image": "02_infinite_wardrobe.jpg",
        "text": "Building a capsule wardrobe isn't about owning less — it's about owning the right pieces. The 60-30-10 rule: 60% neutral core, 30% texture play, 10% accent color. Every item must work in three different outfits. AI tools like Luxor (https://luxor.ly) automate this — upload your closet and get instant outfit combinations. [image]"
    },
    {
        "url": "https://www.quora.com/How-can-AI-help-me-dress-better",
        "image": "03_casual_iphone.jpg",
        "text": "The average person spends 15 minutes daily deciding what to wear. AI eliminates decision fatigue by learning your preferences, factoring in weather and calendar, and pre-selecting outfits. Platforms like Luxor (https://luxor.ly) combine wardrobe management and outfit recommendations into one seamless experience. [image]"
    }
]

def main():
    log("=" * 60)
    log("📸 Quora Direct with Images")
    log("=" * 60)
    
    from playwright.sync_api import sync_playwright
    from playwright_stealth import Stealth
    
    with open(COOKIES_FILE) as f:
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
        Stealth().apply_stealth_sync(page)
        
        for i, target in enumerate(TARGETS):
            log(f"\n--- [{i+1}/3] {target['image']} ---")
            
            img_path = os.path.join(UPLOAD_DIR, target["image"])
            if not os.path.exists(img_path):
                log(f"  ⚠ Missing image")
                continue
            
            # Go directly to question page
            log(f"  Loading: {target['url'][:60]}...")
            page.goto(target["url"], wait_until="domcontentloaded", timeout=60000)
            time.sleep(8)
            
            # Check if Cloudflare blocked
            if "Just a moment" in page.title():
                log("  ⚠ Cloudflare, waiting...")
                time.sleep(5)
            
            # Find Answer button
            log("  Finding Answer...")
            result = page.evaluate("""() => {
                const btns = document.querySelectorAll('button, a');
                for (const el of btns) {
                    if (el.offsetParent === null) continue;
                    const text = el.textContent.trim().toLowerCase();
                    if (text === 'answer' || text.startsWith('answer ')) {
                        const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
                        if (key && el[key] && el[key].onClick) { el[key].onClick({}); return 'react'; }
                        el.click(); return 'clicked';
                    }
                }
                // Check for draft 'continue writing'
                for (const el of btns) {
                    if (el.textContent.includes('Click here') && el.offsetParent !== null) {
                        el.click(); return 'draft_clicked';
                    }
                }
                return 'not_found';
            }""")
            log(f"  Result: {result}")
            
            if result == "not_found":
                # Check for existing draft
                if "continue writing" in page.evaluate("() => document.body.innerText").lower():
                    log("  Found draft, clicking...")
                    try:
                        page.locator("text=Click here").first.click(timeout=3000)
                        time.sleep(3)
                        result = "draft"
                    except: pass
            
            time.sleep(4)
            
            # Check editor
            editor = page.evaluate("() => !!document.querySelector('[contenteditable=\"true\"]')")
            log(f"  Editor: {editor}")
            if not editor:
                log("  ❌ No editor")
                continue
            
            # Upload image
            log(f"  Uploading: {target['image']}")
            try:
                fi = page.query_selector('input[type="file"]')
                if fi:
                    fi.set_input_files(img_path)
                    time.sleep(5)
                    log("  ✅ Image uploaded")
                else:
                    log("  ⚠ No file input")
            except Exception as e:
                log(f"  ⚠ Upload: {e}")
            
            # Type text
            text = target["text"]
            log(f"  Typing {len(text)} chars...")
            page.keyboard.type(text, delay=1)
            time.sleep(1)
            
            # Submit
            log("  Submitting...")
            submit = page.evaluate("""() => {
                const btns = document.querySelectorAll('button');
                for (const btn of btns) {
                    const text = btn.textContent.trim().toLowerCase();
                    if (['submit','post','publish','add answer','done','share'].includes(text) && btn.offsetParent !== null) {
                        const key = Object.keys(btn).find(k => k.startsWith('__reactProps'));
                        if (key && btn[key] && btn[key].onClick) { btn[key].onClick({}); return 'react'; }
                        btn.click(); return 'clicked';
                    }
                }
                return 'not_found';
            }""")
            log(f"  Submit: {submit}")
            if submit == "not_found":
                page.keyboard.press("Control+Enter")
            
            time.sleep(5)
            log(f"  URL: {page.url[:80]}")
        
        browser.close()
        log("\n✅ Complete!")

if __name__ == "__main__":
    main()
