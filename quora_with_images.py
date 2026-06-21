"""Post 3 images to Quora — direct click approach, tested working."""
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

def post_one(post):
    """Post one answer with image to Quora."""
    from playwright.sync_api import sync_playwright
    
    with open(COOKIES_FILE) as f:
        cookies = json.load(f)
    
    img_path = os.path.join(UPLOAD_DIR, post["image"])
    if not os.path.exists(img_path):
        log(f"  ⚠ Missing: {post['image']}")
        return False
    
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
        q = urllib.parse.quote(post["search"])
        page.goto(f"https://www.quora.com/search?q={q}", wait_until="domcontentloaded", timeout=60000)
        time.sleep(8)
        
        # Click Answer button
        log("  Clicking Answer...")
        try:
            # Use Playwright's text locator which is more reliable
            btn = page.locator('button:has-text("Answer")').first
            btn.wait_for(timeout=10000)
            btn.click()
            log("  ✅ Clicked")
        except Exception as e:
            log(f"  ⚠ Button click: {e}")
            browser.close()
            return False
        
        time.sleep(5)
        
        # Wait for editor
        try:
            page.wait_for_selector('[contenteditable="true"]', timeout=15000)
            log("  ✅ Editor ready")
        except:
            log("  ❌ No editor")
            browser.close()
            return False
        
        # Focus editor
        page.locator('[contenteditable="true"]').first.click()
        time.sleep(0.5)
        
        # Upload image via file input
        log("  Uploading image...")
        try:
            fi = page.locator('input[type="file"]')
            if fi.count() > 0:
                fi.first.set_input_files(img_path)
                time.sleep(6)
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
        try:
            submit_btn = page.locator('button:has-text("Post"), button:has-text("Submit"), button:has-text("Share")').first
            submit_btn.wait_for(timeout=5000)
            submit_btn.click()
            log("  ✅ Submitted")
        except:
            log("  Using Ctrl+Enter")
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
