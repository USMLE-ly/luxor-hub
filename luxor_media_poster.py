#!/usr/bin/env python3
"""Luxor Media Poster — Scrape luxor.ly, generate posts, post with media.
Usage:
    python3 luxor_media_poster.py gen-content        # Generate posts from luxor.ly
    python3 luxor_media_poster.py scrape-media       # Download images from luxor.ly
    python3 luxor_media_poster.py post-x --index 0   # Post to X with image
    python3 luxor_media_poster.py post-quora --index 0  # Post to Quora
"""
import json, sys, os, time, re, asyncio
from pathlib import Path

PROJECT = Path(__file__).parent
MEDIA_DIR = PROJECT / "luxor_media"
MEDIA_DIR.mkdir(exist_ok=True)

# Source: scrapling or just static parse
LUXOR_URL = "https://luxor.ly"
LUXOR_ASSETS_URL = "https://luxor.ly/assets/"

# Images known from the page
LUXOR_IMAGES = {
    "outfit_gen": "https://luxor.ly/assets/feature-outfit-gen-DdFHi2ea.jpg",
    "closet_scanner": "https://luxor.ly/assets/feature-closet-scanner-DSdzcdPx.jpg",
    "style_dna": "https://luxor.ly/assets/feature-style-dna-D49Ef_HL.jpg",
    "transparency": "https://luxor.ly/assets/transparency-B8C3yBrH.png",
}

def ensure_scrapling():
    """Try to use Scrapling if available for dynamic content."""
    try:
        from scrapling import StealthyFetcher
        return StealthyFetcher()
    except ImportError:
        return None

def fetch_playwright(url, screenshot_path=None):
    """Use Playwright to fetch a page and optionally screenshot it."""
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-software-rasterizer",
                  "--disable-dev-shm-usage", "--single-process"]
        )
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        
        text = page.evaluate("() => document.body.innerText")
        if screenshot_path:
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"  Screenshot: {screenshot_path}")
        
        browser.close()
        return text

def download_image(url, name):
    """Download an image from luxor.ly."""
    import requests
    path = MEDIA_DIR / name
    if path.exists():
        print(f"  Already exists: {name}")
        return str(path)
    
    try:
        r = requests.get(url, timeout=30)
        if r.status_code == 200:
            path.write_bytes(r.content)
            print(f"  Downloaded: {name} ({len(r.content)} bytes)")
            return str(path)
    except Exception as e:
        print(f"  Failed to download {name}: {e}")
    return None

def scrape_media():
    """Download all known Luxor media assets."""
    print("[*] Downloading Luxor media assets...")
    results = []
    for name, url in LUXOR_IMAGES.items():
        ext = url.split(".")[-1]
        fname = f"{name}.{ext}"
        path = download_image(url, fname)
        if path:
            results.append(path)
    
    # Also screenshot
    print("[*] Taking screenshot of luxor.ly...")
    fetch_playwright(LUXOR_URL, str(MEDIA_DIR / "luxor_screenshot.png"))
    
    print(f"\n✅ Downloaded {len(results)} images to {MEDIA_DIR}")
    return results

def gen_content():
    """Generate content about Luxor from the website."""
    from api_interact import chat
    
    # First scrape the site
    print("[*] Scraping luxor.ly for content...")
    text = fetch_playwright(LUXOR_URL)
    
    if text:
        print(f"  Got {len(text)} chars of text")
        # Save the scraped text
        (MEDIA_DIR / "luxor_text.txt").write_text(text[:5000])
    
    print("[*] Generating posts from site content...")
    topics = [
        "AI-powered fashion styling with Luxor",
        "Virtual wardrobe and weather-based outfit recommendations",
        "Digital fashion and personal style AI",
    ]
    
    posts = []
    for topic in topics:
        result = chat(
            f"Write a short X post (max 280 chars) about {topic} for Luxor brand (luxor.ly). "
            f"Use this info from their site: {text[:1000] if text else 'AI fashion stylist'}. "
            f"Make it engaging with a call to action. Reply ONLY with the post text.",
            mode="shannon", persona="fable5"
        )
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        posts.append({"topic": topic, "content": content.strip()[:280]})
        print(f"  [{len(posts)}] {posts[-1]['content'][:60]}...")
    
    # Save posts
    out = MEDIA_DIR / "generated_posts.json"
    out.write_text(json.dumps(posts, indent=2))
    print(f"\n✅ Saved {len(posts)} posts to {out}")
    return posts

def post_to_x(topic, content, image_path=None):
    """Post to X with optional image.
    Uses Playwright to inject cookies, compose tweet, attach media.
    """
    from playwright.sync_api import sync_playwright
    import json as j
    
    cookies_file = PROJECT / "cookies_x.json"
    with open(cookies_file) as f:
        raw_cookies = j.load(f)
    
    print(f"[*] Posting to X: {content[:60]}...")
    
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
                context.add_cookies([{'name': c['name'], 'value': c.get('value', ''), 'url': url, 'sameSite': ss}])
            except:
                pass
        
        page = context.new_page()
        page.set_default_timeout(30000)
        page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)
        
        # Click compose
        composer = page.query_selector('[data-testid="SideNav_NewTweet_Button"]')
        if composer:
            composer.click()
            time.sleep(2)
        
        # Type text
        editor = page.query_selector('[data-testid="tweetTextarea_0"]')
        if editor:
            editor.click()
            page.keyboard.type(content, delay=5)
            time.sleep(1)
        
        # Attach image if provided
        if image_path and os.path.exists(image_path):
            file_input = page.query_selector('input[type="file"]')
            if file_input:
                file_input.set_input_files(image_path)
                print(f"  📷 Attached image: {os.path.basename(image_path)}")
                time.sleep(3)
        
        # Submit
        btn = page.query_selector('[data-testid="tweetButton"]')
        if btn:
            btn.click(force=True)
        else:
            page.keyboard.press("Control+Enter")
        
        time.sleep(3)
        print(f"  ✅ Tweet posted!")
        browser.close()
        return True

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Luxor Media Poster")
    parser.add_argument("action", choices=["scrape-media", "gen-content", "post-x", "post-quora", "all"])
    parser.add_argument("--index", "-i", type=int, default=0)
    parser.add_argument("--topic", "-t", default="Luxor AI fashion")
    parser.add_argument("--text", "-T", default=None)
    args = parser.parse_args()
    
    if args.action == "scrape-media":
        scrape_media()
        
    elif args.action == "gen-content":
        gen_content()
        
    elif args.action == "post-x":
        posts_file = MEDIA_DIR / "generated_posts.json"
        if posts_file.exists():
            posts = json.loads(posts_file.read_text())
        else:
            posts = gen_content()
        
        if args.index < len(posts):
            post = posts[args.index]
            # Use an image if available
            images = list(MEDIA_DIR.glob("*.jpg")) + list(MEDIA_DIR.glob("*.png"))
            img = str(images[0]) if images else None
            post_to_x(post["topic"], post["content"], img)
        else:
            print(f"Index {args.index} out of range ({len(posts)} posts)")
            
    elif args.action == "post-quora":
        # use quora_poster_v4.py
        posts_file = MEDIA_DIR / "generated_posts.json"
        if not posts_file.exists():
            posts = gen_content()
        else:
            posts = json.loads(posts_file.read_text())
        
        if args.index < len(posts):
            post = posts[args.index]
            topic = post["topic"]
            content = post["content"]
            print(f"[*] Queuing for Quora: {content[:60]}...")
            # Save to temp and call quora poster
            tmp = PROJECT / "temp_quora_content.json"
            tmp.write_text(json.dumps([{"topic": topic, "content": content, "platform": "quora"}]))
            print(f"  Run: xvfb-run python3 quora_poster_v4.py --text \"{content[:50]}...\"")
        else:
            print(f"Index {args.index} out of range ({len(posts)} posts)")
            
    elif args.action == "all":
        scrape_media()
        posts = gen_content()
        if posts:
            images = list(MEDIA_DIR.glob("*.jpg")) + list(MEDIA_DIR.glob("*.png"))
            img = str(images[0]) if images else None
            for i, post in enumerate(posts):
                print(f"\n--- Post {i+1}/{len(posts)} ---")
                post_to_x(post["topic"], post["content"], img)
                time.sleep(5)

if __name__ == "__main__":
    main()
