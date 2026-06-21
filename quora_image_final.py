"""Post 3 images to Quora — with proven search terms + image embedding via file input."""
import json, os, sys, time
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_quora_working.json")
UPLOAD_DIR = os.path.join(PROJECT, "luxor_media", "uploads")

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

# Use proven search terms from earlier successful runs
POSTS = [
    {
        "search": "dress well on a budget",
        "image": "01_algorithmic_curator.jpg",
        "text": "AI is transforming how we approach personal style. Algorithmic curation analyzes your body geometry and preferences to recommend pieces that work for you — no more buying clothes you never wear. Brands like Luxor (https://luxor.ly) use AI to catalog your existing wardrobe and generate outfits you'd never think of combining. The days of staring at a full closet with nothing to wear are ending."
    },
    {
        "search": "fashionable every day",
        "image": "02_infinite_wardrobe.jpg",
        "text": "A minimalist wardrobe isn't about owning less — it's about owning the right pieces. The 60-30-10 rule works: 60% neutral core, 30% texture play (silk, merino, denim), 10% accent color. Every item must work in three different outfits. AI tools like Luxor (https://luxor.ly) automate this entire process — upload your closet, get instant outfit combinations, and identify gaps. The most sustainable garment is the one you already own."
    },
    {
        "search": "how to dress better with AI",
        "image": "03_casual_iphone.jpg",
        "text": "The average person spends 15 minutes every morning deciding what to wear. AI eliminates this decision fatigue by learning your preferences, factoring in weather and your calendar, and pre-selecting outfits. Wardrobe gap analysis identifies missing pieces. Platforms like Luxor (https://luxor.ly) combine all this into one experience — upload your clothes once, get daily outfit recommendations, and evolve your style naturally."
    }
]

def post_one(post):
    """Post answer with embedded image to Quora."""
    from playwright.sync_api import sync_playwright
    
    with open(COOKIES_FILE) as f:
        cookies = json.load(f)
    
    img_path = os.path.join(UPLOAD_DIR, post["image"])
    if not os.path.exists(img_path):
        log(f"  ⚠ Missing: {post['image']}")
        return False
    
    log(f"  Search: \"{post['search']}\"")
    log(f"  Image: {post['image']} ({os.path.getsize(img_path)//1024}KB)")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"])
        ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", viewport={"width": 1280, "height": 900})
        
        for c in cookies:
            try:
                ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".quora.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
            except: pass
        
        page = ctx.new_page()
        page.set_default_timeout(60000)
        
        from playwright_stealth import Stealth
        Stealth().apply_stealth_sync(page)
        
        # Search
        page.goto(f"https://www.quora.com/search?q={post['search'].replace(' ', '+')}", wait_until="domcontentloaded", timeout=60000)
        time.sleep(8)
        
        # Find any Answer button — iterate all visible buttons
        log("  Finding Answer...")
        result = page.evaluate("""() => {
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
                if (btn.offsetParent === null) continue;
                const text = btn.textContent.trim().toLowerCase();
                if (text === 'answer') {
                    const key = Object.keys(btn).find(k => k.startsWith('__reactProps'));
                    if (key && btn[key] && btn[key].onClick) {
                        btn[key].onClick({});
                        return 'react';
                    }
                    btn.click();
                    return 'dom';
                }
            }
            return 'not_found';
        }""")
        log(f"  Result: {result}")
        
        if result == "not_found":
            browser.close()
            return False
        
        time.sleep(5)
        
        # Check editor
        editor = page.evaluate("() => !!document.querySelector('[contenteditable=\"true\"]')")
        log(f"  Editor: {editor}")
        if not editor:
            browser.close()
            return False
        
        # Focus editor
        page.locator('[contenteditable="true"]').first.click()
        time.sleep(0.5)
        
        # Upload image via hidden file input
        log("  Uploading image...")
        try:
            fi = page.query_selector('input[type="file"]')
            if fi:
                fi.set_input_files(img_path)
                time.sleep(6)  # Wait for upload
                log("  ✅ Image uploaded")
            else:
                log("  ⚠ No file input")
        except Exception as e:
            log(f"  ⚠ Upload: {e}")
        
        # Type text after image
        text = post["text"]
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
                    btn.click(); return 'dom';
                }
            }
            return 'no';
        }""")
        log(f"  Submit: {submit}")
        if submit == "no":
            page.keyboard.press("Control+Enter")
        
        time.sleep(5)
        log(f"  URL: {page.url}")
        browser.close()
        return True

def main():
    log("=" * 60)
    log("📸 Quora with Images")
    log("=" * 60)
    
    for i, post in enumerate(POSTS):
        log(f"\n--- [{i+1}/3] {post['image']} ---")
        ok = post_one(post)
        log(f"  {'✅' if ok else '❌'}")
        time.sleep(10)
    
    log("\n✅ Complete!")

if __name__ == "__main__":
    main()
