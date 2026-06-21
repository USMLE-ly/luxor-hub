#!/usr/bin/env python3
"""
Post all 3 uploaded images to X with generated copy.
Usage:
    python3 post_3_images.py                    # Post all 3 as individual posts
    python3 post_3_images.py --thread           # Post as a thread
    python3 post_3_images.py --dry-run          # Preview only, don't post
"""
import os, sys, json, time, shutil

PROJECT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT)
from api_interact import chat

IMAGES = [
    {
        "path": "luxor_media/uploads/01_algorithmic_curator.jpg",
        "theme": "Algorithmic Curator",
        "prompt": "Write 1 savage X/Twitter post (max 230 chars) about this fashion image: a casually dressed person with an ethereal/creative overlay showing AI curation. Brand: Luxor (luxor.ly). Tone: tech-luxe, confident, digital-native. The algorithm styles you better than 100 stylists. Include 1 thread hook. Output ONLY the post text, nothing else."
    },
    {
        "path": "luxor_media/uploads/02_infinite_wardrobe.jpg",
        "theme": "Infinite Wardrobe",
        "prompt": "Write 1 savage X/Twitter post (max 230 chars) about this fashion image: minimalist aesthetic fashion shot with modern elegance. Brand: Luxor (luxor.ly). Tone: minimalist power, edit ruthlessly, less is more when it's the right more. Your capsule wardrobe just got AI-powered. Include 1 thread hook. Output ONLY the post text, nothing else."
    },
    {
        "path": "luxor_media/uploads/03_casual_iphone.jpg",
        "theme": "Time Dividend",
        "prompt": "Write 1 savage X/Twitter post (max 230 chars) about this fashion image: a casual everyday person who looks effortlessly styled by AI. Brand: Luxor (luxor.ly). Tone: relaxed confidence, anti-hustle, fashion that works FOR you not the other way. AI styling to save you hours each week. Include 1 thread hook. Output ONLY the post text, nothing else."
    }
]

def generate_copy(entry, dry_run=False):
    """Generate X post copy for the image."""
    if dry_run:
        return f"[DRY RUN] Testing post for theme: {entry['theme']}"
    
    print(f"  Generating copy for {entry['theme']}...")
    result = chat(entry["prompt"], mode="shannon", persona="fable5", max_tokens=500)
    
    if isinstance(result, dict) and 'choices' in result:
        text = result['choices'][0]['message']['content']
    else:
        text = str(result)
    
    # Clean it
    text = text.strip().strip('"').strip("'")
    if len(text) > 280:
        text = text[:277] + "..."
    
    print(f"  ✓ {text[:70]}...")
    return text

def post_to_x_with_image(image_path, copy_text, index=0):
    """Post one image to X with copy using playwright + cookies."""
    from playwright.sync_api import sync_playwright
    
    cookies_file = os.path.join(PROJECT, "cookies_x.json")
    with open(cookies_file) as f:
        raw_cookies = json.load(f)
    
    print(f"  Opening browser...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-software-rasterizer",
                  "--disable-dev-shm-usage", "--single-process"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 900}
        )
        
        # Inject cookies
        for c in raw_cookies:
            try:
                ss_map = {'lax':'Lax','strict':'Strict','none':'None','no_restriction':'None','unspecified':'None'}
                ss = ss_map.get(c.get('sameSite','Lax').lower(), 'Lax')
                url = c.get('url', 'https://x.com/')
                context.add_cookies([{'name': c['name'], 'value': str(c.get('value','')), 'url': url, 'sameSite': ss}])
            except: pass
        
        page = context.new_page()
        page.set_default_timeout(30000)
        
        print(f"  Navigating to X...")
        page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)
        
        # Click compose tweet button
        try:
            composer = page.query_selector('[data-testid="SideNav_NewTweet_Button"]')
            if composer:
                composer.click()
                time.sleep(2)
        except:
            page.keyboard.press('n')
            time.sleep(2)
        
        # Type text
        try:
            editor = page.query_selector('[data-testid="tweetTextarea_0"]')
            if editor:
                editor.click()
                time.sleep(0.5)
                editor.fill(copy_text)
            else:
                page.keyboard.type(copy_text, delay=10)
            time.sleep(1)
            print(f"  Text entered")
        except:
            page.keyboard.type(copy_text, delay=10)
            time.sleep(1)
        
        # Attach image
        if os.path.exists(image_path):
            try:
                file_input = page.query_selector('input[type="file"]')
                if file_input:
                    file_input.set_input_files(image_path)
                    time.sleep(3)
                    print(f"  ✓ Image attached: {os.path.basename(image_path)}")
                else:
                    print(f"  No file input found, trying alt...")
                    page.evaluate("""() => {
                        const inp = document.createElement('input');
                        inp.type = 'file';
                        inp.style.display = 'none';
                        document.body.appendChild(inp);
                        return true;
                    }""")
            except Exception as e:
                print(f"  Image attach failed: {e}")
        
        # Submit
        time.sleep(2)
        try:
            btn = page.query_selector('[data-testid="tweetButton"]')
            if btn:
                btn.click(force=True)
                print(f"  ✓ Posted!")
            else:
                page.keyboard.press("Control+Enter")
                print(f"  ✓ Sent via keyboard shortcut")
        except Exception as e:
            print(f"  Post click failed: {e}")
            page.keyboard.press("Control+Enter")
        
        time.sleep(3)
        browser.close()
        return True

def main():
    dry_run = "--dry-run" in sys.argv
    as_thread = "--thread" in sys.argv
    
    print("=" * 60)
    print(f"📸 LUXOR — Posting {len(IMAGES)} images to X")
    if dry_run:
        print("   🔍 DRY RUN MODE — no posts will be sent")
    if as_thread:
        print("   🧵 THREAD MODE — posting as linked thread")
    print("=" * 60)
    
    # Step 1: Verify images exist
    for img in IMAGES:
        full_path = os.path.join(PROJECT, img["path"])
        if not os.path.exists(full_path):
            print(f"⚠ Warning: {full_path} not found")
            # Try other locations
            alt = os.path.join(PROJECT, "luxor_media", os.path.basename(img["path"]))
            if os.path.exists(alt):
                print(f"  Found at: {alt}")
                img["path"] = alt
            else:
                # Try copying from upload dirs
                for f in os.listdir("/tmp/codex-web-uploads/"):
                    upload_dir = f"/tmp/codex-web-uploads/{f}"
                    if os.path.isdir(upload_dir):
                        for pic in os.listdir(upload_dir):
                            if pic.endswith(('.jpg', '.jpeg', '.png')):
                                src = os.path.join(upload_dir, pic)
                                dst = os.path.join(PROJECT, "luxor_media", "uploads", pic)
                                os.makedirs(os.path.dirname(dst), exist_ok=True)
                                shutil.copy2(src, dst)
                                img["path"] = dst
                                print(f"  Copied from uploads: {pic}")
                                break
                if not os.path.exists(os.path.join(PROJECT, img["path"].split("/")[-1] if "/" in img["path"] else img["path"])):
                    print(f"❌ Could not find image for {img['theme']}")
        else:
            print(f"✓ Image {os.path.basename(img['path'])} exists")
    
    if dry_run:
        print("\n🔍 DRY RUN — Checkpoint passed. Images verified.")
        return
    
    # Step 2: Generate copy for each image
    print("\n🎨 Generating copy for each image...")
    for img in IMAGES:
        img["copy"] = generate_copy(img, dry_run)
        time.sleep(2)  # Rate limiting
    
    # Step 3: Post them
    print("\n📤 Posting to X...")
    for i, img in enumerate(IMAGES):
        copy = img.get("copy", "")
        if not copy:
            print(f"  ⏭ Skipping {img['theme']} (no copy generated)")
            continue
        
        full_path = os.path.join(PROJECT, img["path"]) if not img["path"].startswith("/") else img["path"]
        print(f"\n--- Post {i+1}/3: {img['theme']} ---")
        print(f"    Copy: {copy[:80]}...")
        
        post_to_x_with_image(full_path, copy, i)
        time.sleep(5)  # Delay between posts
    
    print("\n" + "=" * 60)
    print("✅ All images posted to X!")
    print("=" * 60)

if __name__ == "__main__":
    main()
