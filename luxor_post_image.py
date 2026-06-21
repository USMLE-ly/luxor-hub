#!/usr/bin/env python3
"""LUXOR IMAGE POSTER — Upload an image, generate savage copy, post to X.
Usage:
    python3 luxor_post_image.py /path/to/image.jpg "Algorithmic Curator"
    python3 luxor_post_image.py /path/to/image.jpg "Time Dividend" --post
    python3 luxor_post_image.py /path/to/image.jpg "Infinite Wardrobe" --no-post
"""
import sys, os, json, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from api_interact import chat

PROJECT = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = os.path.join(PROJECT, "luxor_media")

THEME_COPY_PROMPTS = {
    "Algorithmic Curator": "Write 1 savage X/Twitter post (max 200 chars, 2-3 hashtags) about this fashion image showing an AI fashion stylist interface with a model. The brand is Luxor (luxor.ly). Tone: confident, tech-luxe, authoritative. The algorithm knows before you do. Include 1 thread continuation hook.",
    "Time Dividend": "Write 1 savage X/Twitter post (max 200 chars, 2-3 hashtags) about a before/after fashion transformation image showing an AI-styled wardrobe. Brand: Luxor (luxor.ly). Tone: value-focused, anti-waste, fashion-as-asset. Stop burning cash on trends. Include 1 thread continuation hook.",
    "Infinite Wardrobe": "Write 1 savage X/Twitter post (max 200 chars, 2-3 hashtags) about an image showing an endless digital wardrobe with glowing UI slots. Brand: Luxor (luxor.ly). Tone: futuristic, abundant, freedom from maintenance. Laundry is for peasants. Include 1 thread continuation hook.",
}

DEFAULT_THEME = "Algorithmic Curator"

def process_image(image_path, theme=DEFAULT_THEME):
    """Save image, generate copy, optionally post to X."""
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return False
    
    os.makedirs(MEDIA_DIR, exist_ok=True)
    
    # Copy to media dir with timestamp
    ext = os.path.splitext(image_path)[1] or ".jpg"
    dest = os.path.join(MEDIA_DIR, f"luxor_campaign_{theme.lower().replace(' ', '_')}{ext}")
    shutil.copy2(image_path, dest)
    print(f"✅ Saved to {dest}")
    
    # Get image info
    from PIL import Image
    img = Image.open(dest)
    print(f"  Size: {img.size[0]}x{img.size[1]}, Mode: {img.mode}")
    
    # Generate copy
    print(f"\n🎯 Theme: {theme}")
    print("📝 Generating savage copy...")
    
    copy_prompt = THEME_COPY_PROMPTS.get(theme, THEME_COPY_PROMPTS[DEFAULT_THEME])
    response = chat(copy_prompt, mode="jb", persona="zorg")
    
    if isinstance(response, dict) and 'choices' in response:
        copy_text = response['choices'][0]['message']['content']
    else:
        copy_text = str(response)
    
    print(f"\n{'='*60}")
    print("📋 GENERATED COPY:")
    print(f"{'='*60}")
    print(copy_text)
    print(f"{'='*60}")
    
    return dest, copy_text

def post_to_x_with_image(image_path, copy_text):
    """Post the image to X with the generated copy."""
    print(f"\n📤 Posting to X with image...")
    
    from playwright.sync_api import sync_playwright
    import time
    
    cookies_file = os.path.join(PROJECT, "cookies_x.json")
    with open(cookies_file) as f:
        raw_cookies = json.load(f)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-software-rasterizer",
                  "--disable-dev-shm-usage", "--single-process"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            viewport={"width": 1280, "height": 900}
        )
        
        for c in raw_cookies:
            try:
                ss_map = {'lax':'Lax','strict':'Strict','none':'None','no_restriction':'None','unspecified':'None'}
                ss = ss_map.get(c.get('sameSite','Lax').lower(), 'Lax')
                url = c.get('url', 'https://x.com/')
                context.add_cookies([{'name': c['name'], 'value': c.get('value',''), 'url': url, 'sameSite': ss}])
            except: pass
        
        page = context.new_page()
        page.set_default_timeout(30000)
        page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)
        
        # Click compose
        page.keyboard.press('n')
        time.sleep(3)
        
        # Type copy
        editor = page.query_selector('[role="textbox"][contenteditable="true"]')
        if editor:
            editor.fill(copy_text[:280])
            time.sleep(1)
            
            # Attach image
            file_input = page.query_selector('input[type="file"]')
            if file_input:
                file_input.set_input_files(image_path)
                time.sleep(2)
                print("  📎 Image attached")
            
            # Post
            clicked = page.evaluate('''() => {
                const btn = document.querySelector('button[data-testid="tweetButton"]');
                if (btn) { btn.dispatchEvent(new Event('click', {bubbles: true})); return true; }
                return false;
            }''')
            time.sleep(4)
            print(f"  ✅ {'Posted!' if clicked else 'Sent via fallback'}")
        else:
            print("  ❌ No editor found")
        
        browser.close()
        return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    image_path = sys.argv[1]
    theme = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_THEME
    should_post = "--no-post" not in sys.argv
    
    dest, copy = process_image(image_path, theme)
    
    if should_post and dest:
        post_to_x_with_image(dest, copy)
    
    print("\n✅ Done")
