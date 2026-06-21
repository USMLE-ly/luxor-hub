"""All 3 Quora posts in ONE browser session to avoid Cloudflare rate limits."""
import json, os, sys, time, urllib.parse
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_quora_working.json")
UPLOAD_DIR = os.path.join(PROJECT, "luxor_media", "uploads")

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

POSTS = [
    {
        "search": "dress well on a budget",
        "image": "01_algorithmic_curator.jpg",
        "text": "AI is transforming how we approach personal style. Algorithmic curation analyzes your body geometry and preferences to recommend pieces that work for you — no more buying clothes you never wear. Brands like Luxor (https://luxor.ly) use AI to catalog your existing wardrobe and generate outfits you'd never think of combining."
    },
    {
        "search": "fashionable every day",
        "image": "02_infinite_wardrobe.jpg",
        "text": "A minimalist wardrobe isn't about owning less — it's about owning the right pieces. The 60-30-10 rule works: 60% neutral core, 30% texture play, 10% accent color. Every item must work in three different outfits. AI tools like Luxor (https://luxor.ly) automate this process — upload your closet, get instant outfit combinations."
    },
    {
        "search": "how to dress better",
        "image": "03_casual_iphone.jpg",
        "text": "The average person spends 15 minutes every morning deciding what to wear. AI eliminates this decision fatigue by learning your preferences, factoring in your calendar, and pre-selecting outfits. Platforms like Luxor (https://luxor.ly) combine wardrobe management, outfit recommendations, and style tracking into one experience."
    }
]

def main():
    log("=" * 60)
    log("📸 Quora — All 3 in one session")
    log("=" * 60)
    
    from playwright.sync_api import sync_playwright
    from playwright_stealth import Stealth
    
    with open(COOKIES_FILE) as f:
        cookies = json.load(f)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True, 
            args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            viewport={"width": 1280, "height": 900}
        )
        
        for c in cookies:
            try:
                ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".quora.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
            except: pass
        
        page = ctx.new_page()
        page.set_default_timeout(60000)
        Stealth().apply_stealth_sync(page)
        
        for i, post in enumerate(POSTS):
            log(f"\n--- [{i+1}/3] {post['image']} ---")
            
            img_path = os.path.join(UPLOAD_DIR, post["image"])
            if not os.path.exists(img_path):
                log(f"  ⚠ Missing image")
                continue
            
            # Search
            q = urllib.parse.quote(post["search"])
            log(f"  Search: {post['search']}")
            page.goto(f"https://www.quora.com/search?q={q}", wait_until="domcontentloaded", timeout=60000)
            time.sleep(8)
            
            # Check for Cloudflare
            title = page.title()
            if "Just a moment" in title:
                log("  ⚠ Cloudflare, waiting...")
                time.sleep(5)
            
            # Find Answer button using JS (more reliable)
            log("  Finding Answer...")
            result = page.evaluate("""() => {
                const btns = document.querySelectorAll('button');
                for (const btn of btns) {
                    if (btn.offsetParent === null) continue;
                    if (btn.textContent.trim().toLowerCase() === 'answer') {
                        // Try React fiber first
                        const key = Object.keys(btn).find(k => k.startsWith('__reactProps'));
                        if (key && btn[key] && btn[key].onClick) {
                            btn[key].onClick({});
                            return 'react';
                        }
                        // Fallback to DOM click
                        btn.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
                        btn.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}));
                        btn.dispatchEvent(new MouseEvent('click', {bubbles: true, view: window}));
                        return 'dom';
                    }
                }
                return 'not_found';
            }""")
            log(f"  Answer: {result}")
            
            if result == "not_found":
                log(f"  ❌ No Answer button")
                continue
            
            time.sleep(5)
            
            # Check for editor
            editor = page.evaluate("() => !!document.querySelector('[contenteditable=\"true\"]')")
            log(f"  Editor: {editor}")
            if not editor:
                log("  ❌ No editor")
                continue
            
            # Focus editor
            page.evaluate("() => document.querySelector('[contenteditable=\"true\"]')?.focus()")
            time.sleep(0.5)
            
            # Upload image
            log(f"  Uploading: {post['image']}")
            try:
                fi = page.query_selector('input[type="file"]')
                if fi:
                    fi.set_input_files(img_path)
                    time.sleep(5)
                    log("  ✅ Image uploaded")
            except Exception as e:
                log(f"  ⚠ Upload: {e}")
            
            # Type text
            text = post["text"]
            log(f"  Typing {len(text)} chars...")
            page.keyboard.type(text, delay=1)
            time.sleep(1)
            
            # Submit
            log("  Submitting...")
            submit = page.evaluate("""() => {
                const btns = document.querySelectorAll('button');
                const targets = ['submit','post','publish','add answer','done','share'];
                for (const btn of btns) {
                    const text = btn.textContent.trim().toLowerCase();
                    if (targets.includes(text) && btn.offsetParent !== null) {
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
