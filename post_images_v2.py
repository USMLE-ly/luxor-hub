#!/usr/bin/env python3
"""
Post all 3 uploaded images to X — fixed API handling.
Uses moderate system prompt + high max_tokens for reasoning budget.
"""
import os, sys, json, time, shutil, requests

PROJECT = os.path.dirname(os.path.abspath(__file__))
API_URL = "https://opencode.ai/zen/v1/chat/completions"

IMAGES = [
    {
        "file": "uploads/01_algorithmic_curator.jpg",
        "prompt": "Write a short X post (exactly one line, max 230 chars) about this fashion image: a casually dressed person with an ethereal/creative AI curation overlay. Brand: Luxor (luxor.ly). Tone: tech-luxe, confident, digital-native. Reply ONLY with the single line of tweet text."
    },
    {
        "file": "uploads/02_infinite_wardrobe.jpg",
        "prompt": "Write a short X post (exactly one line, max 230 chars) about this minimalist fashion aesthetic image. Brand: Luxor (luxor.ly). Tone: minimalist power, edit ruthlessly. Reply ONLY with the single line of tweet text."
    },
    {
        "file": "uploads/03_casual_iphone.jpg",
        "prompt": "Write a short X post (exactly one line, max 230 chars) about this everyday person looking effortlessly styled. Brand: Luxor (luxor.ly). Tone: relaxed confidence, anti-hustle. Reply ONLY with the single line of tweet text."
    }
]

def extract_text(data):
    """Extract visible text from API response, fallback to reasoning_content."""
    if 'choices' not in data:
        return None
    msg = data['choices'][0]['message']
    content = msg.get('content', '').strip()
    if content:
        return content
    # Fallback: scan reasoning for tweet-like lines
    reasoning = msg.get('reasoning_content', '')
    if reasoning:
        lines = reasoning.split('\n')
        # Take last line that looks like a tweet
        for line in reversed(lines):
            line = line.strip().strip('"').strip("'").strip('*')
            if len(line) > 15 and len(line) < 280 and any(kw in line.lower() for kw in ['luxor', 'fashion', 'style', 'wardrobe', 'outfit', 'ai']):
                return line
    return None

def gen_copy(prompt):
    """Generate tweet copy via API."""
    payload = {
        "model": "deepseek-v4-flash-free",
        "messages": [
            {"role": "system", "content": "You write short social media posts. Output ONLY the single line of tweet text, nothing else."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.85,
        "max_tokens": 8000,
        "top_p": 0.95,
    }
    r = requests.post(API_URL, json=payload, timeout=300)
    data = r.json()
    text = extract_text(data)
    if text:
        text = text.strip().strip('"').strip("'")
        return text[:277] + "..." if len(text) > 280 else text
    return None

def post_x(image_path, text):
    """Post to X using Playwright + cookie injection."""
    from playwright.sync_api import sync_playwright
    
    cookies_file = os.path.join(PROJECT, "cookies_x.json")
    with open(cookies_file) as f:
        raw = json.load(f)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-software-rasterizer",
                  "--disable-dev-shm-usage", "--single-process"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            viewport={"width": 1280, "height": 900}
        )
        
        for c in raw:
            try:
                ss_map = {'lax':'Lax','strict':'Strict','none':'None','no_restriction':'None','unspecified':'None'}
                ss = ss_map.get(c.get('sameSite','Lax').lower(), 'Lax')
                ctx.add_cookies([{'name': c['name'], 'value': str(c.get('value','')), 'url': c.get('url','https://x.com/'), 'sameSite': ss}])
            except: pass
        
        page = ctx.new_page()
        page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)
        
        # Open composer
        try:
            page.query_selector('[data-testid="SideNav_NewTweet_Button"]').click()
        except:
            page.keyboard.press('n')
        time.sleep(2)
        
        # Type
        try:
            ed = page.query_selector('[data-testid="tweetTextarea_0"]')
            if ed: ed.fill(text)
            else: page.keyboard.type(text, delay=5)
        except:
            page.keyboard.type(text, delay=5)
        time.sleep(1)
        
        # Attach image
        if os.path.exists(image_path):
            try:
                fi = page.query_selector('input[type="file"]')
                if fi:
                    fi.set_input_files(image_path)
                    time.sleep(3)
                    print(f"    Image attached: {os.path.basename(image_path)}")
            except Exception as e:
                print(f"    Image issue: {e}")
        
        time.sleep(2)
        try:
            btn = page.query_selector('[data-testid="tweetButton"]')
            if btn: btn.click(force=True)
            else: page.keyboard.press("Control+Enter")
            print(f"    Posted!")
        except:
            page.keyboard.press("Control+Enter")
            print(f"    Posted!")
        
        time.sleep(3)
        browser.close()

def main():
    print("=" * 60)
    print("📸 LUXOR — Posting all 3 images to X")
    print("=" * 60)
    
    # Ensure upload dir exists with images
    media_dir = os.path.join(PROJECT, "luxor_media")
    upload_dir = os.path.join(media_dir, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Copy from tmp uploads if needed
    if not os.listdir(upload_dir):
        for d in os.listdir("/tmp/codex-web-uploads/"):
            ud = f"/tmp/codex-web-uploads/{d}"
            if os.path.isdir(ud):
                for f in os.listdir(ud):
                    if f.endswith(('.jpg','.jpeg','.png')):
                        shutil.copy2(os.path.join(ud, f), os.path.join(upload_dir, f))
                        print(f"  Copied: {f}")
    
    fallbacks = [
        "Your style, algorithmically curated. Luxor (luxor.ly) decodes fashion. #AIFashion",
        "Less is more when it's the right more. Luxor edits your wardrobe. #Minimalism",
        "Stop wasting time. Start wearing confidence. Luxor AI styling. (luxor.ly)"
    ]
    
    for i, img in enumerate(IMAGES):
        path = os.path.join(media_dir, img["file"])
        if not os.path.exists(path):
            print(f"\n[{i+1}/3] ⚠ Image not found: {path}")
            # Find any jpg in uploads
            jpgs = sorted([os.path.join(upload_dir, f) for f in os.listdir(upload_dir) if f.endswith('.jpg')])
            if jpgs and i < len(jpgs):
                path = jpgs[i]
                print(f"  Using: {os.path.basename(path)}")
            else:
                continue
        
        print(f"\n[{i+1}/3] Generating copy...")
        copy = gen_copy(img["prompt"])
        if not copy:
            print(f"  Using fallback #{i+1}")
            copy = fallbacks[i]
        print(f"  📝 {copy}")
        
        print(f"  Posting to X...")
        post_x(path, copy)
        time.sleep(5)
    
    print("\n✅ All done!")

if __name__ == "__main__":
    main()
