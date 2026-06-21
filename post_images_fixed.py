#!/usr/bin/env python3
"""
Post images to X — fixed version that handles reasoning-only API responses.
Extracts usable text from reasoning_content when content is empty.
"""
import os, sys, json, time, requests

PROJECT = os.path.dirname(os.path.abspath(__file__))
API_URL = "https://opencode.ai/zen/v1/chat/completions"

IMAGES = [
    {
        "path": "luxor_media/uploads/01_algorithmic_curator.jpg",
        "theme": "Algorithmic Curator",
        "prompt": "Write exactly ONE short X/Twitter post (max 230 chars, on a single line, with no formatting) promoting a fashion image from Luxor (luxor.ly). The image shows a casually dressed person with an ethereal AI curation overlay. Tone: confident tech-luxe. Brand: Luxor. Output ONLY the single line of tweet text — no quotes, no explanations, no emoji formatting."
    },
    {
        "path": "luxor_media/uploads/02_infinite_wardrobe.jpg",
        "theme": "Infinite Wardrobe",
        "prompt": "Write exactly ONE short X/Twitter post (max 230 chars, on a single line, with no formatting) promoting a minimalist fashion image from Luxor (luxor.ly). The image shows minimalist aesthetic with modern elegance and AI curation. Tone: edit ruthlessly, minimalist power. Output ONLY the single line of tweet text — no quotes, no explanations."
    },
    {
        "path": "luxor_media/uploads/03_casual_iphone.jpg",
        "theme": "Time Dividend",
        "prompt": "Write exactly ONE short X/Twitter post (max 230 chars, on a single line, with no formatting) promoting a fashion image from Luxor (luxor.ly). The image shows a casually styled person who looks effortlessly put together by AI. Tone: relaxed confidence, anti-hustle. Output ONLY the single line of tweet text — no quotes, no explanations."
    }
]

def extract_content(response_data):
    """Extract content from API response, falling back to reasoning if needed."""
    if 'choices' not in response_data:
        return None
    
    msg = response_data['choices'][0]['message']
    content = msg.get('content', '').strip()
    reasoning = msg.get('reasoning_content', '')
    
    if content:
        return content
    
    # If content is empty but reasoning exists, extract tweet-like text from reasoning
    if reasoning:
        # Look for tweet-like lines in reasoning (lines that look like social posts)
        lines = reasoning.split('\n')
        tweets = []
        for line in lines:
            line = line.strip().strip('"').strip("'").strip('*').strip('#')
            # Catch things that look like tweet text
            if any(phrase in line.lower() for phrase in ['luxor', 'fashion', 'style', 'wardrobe', 'outfit']):
                if 20 < len(line) < 280 and not line.startswith(('I\'ll', 'Let me', 'Here', 'First,', 'Draft', 'Option')):
                    tweets.append(line)
        
        # Also try extracting from numbered lists
        if not tweets:
            for line in lines:
                line = line.strip()
                # Remove numbering
                if line and (line[0].isdigit() and '. ' in line[:4]):
                    candidate = line.split('. ', 1)[1] if '. ' in line else line
                    if 20 < len(candidate) < 280:
                        tweets.append(candidate)
        
        if tweets:
            return tweets[0]  # Return first good tweet
        
        # Last resort: use last substantial line from reasoning
        substantial = [l.strip() for l in lines if len(l.strip()) > 30]
        if substantial:
            return substantial[-1]
    
    return None

def generate_copy(entry, max_tokens=32000):
    """Generate post copy via direct API call."""
    messages = [
        {"role": "system", "content": "You are a direct social media copywriter. Output ONLY the requested text with no reasoning or any other text."},
        {"role": "user", "content": entry["prompt"]}
    ]
    
    payload = {
        "model": "deepseek-v4-flash-free",
        "messages": messages,
        "reasoning_effort": "max",
        "temperature": 0.9,
        "max_tokens": max_tokens,
        "top_p": 0.95,
    }
    
    for attempt in range(3):
        try:
            r = requests.post(API_URL, json=payload, timeout=300)
            data = r.json()
            
            text = extract_content(data)
            if text:
                # Clean up
                text = text.strip().strip('"').strip("'")
                if len(text) > 280:
                    text = text[:277] + "..."
                return text
            
            # If we got reasoning but no content, try again with even more tokens
            reasoning = data.get('choices', [{}])[0].get('message', {}).get('reasoning_content', '')
            if reasoning and len(reasoning) > 100:
                # Use the reasoning content itself - extract the best tweet from it
                lines = reasoning.split('\n')
                for line in lines:
                    line = line.strip().strip('"').strip("'").strip('*').strip('#')
                    if any(kw in line.lower() for kw in ['luxor', 'fashion', 'style', 'wardrobe', 'outfit', 'ai']):
                        if 20 < len(line) < 280 and not line.startswith(('i\'ll', 'let me', 'first,', 'here ')):
                            return line[:277] + "..." if len(line) > 280 else line
                
                # Last line of reasoning often has the answer
                if lines:
                    last = lines[-1].strip().strip('"').strip("'")
                    if 20 < len(last):
                        return last[:277] + "..." if len(last) > 280 else last
            
            time.sleep(3)
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            time.sleep(3)
    
    return None

def post_to_x(image_path, copy_text):
    """Post to X with image using Playwright + cookies."""
    from playwright.sync_api import sync_playwright
    
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
                context.add_cookies([{'name': c['name'], 'value': str(c.get('value','')), 'url': url, 'sameSite': ss}])
            except: pass
        
        page = context.new_page()
        page.set_default_timeout(30000)
        page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=30000)
        time.sleep(5)
        
        # Click compose
        try:
            composer = page.query_selector('[data-testid="SideNav_NewTweet_Button"]')
            if composer:
                composer.click()
                time.sleep(2)
        except:
            page.keyboard.press('n')
            time.sleep(2)
        
        # Enter text
        try:
            editor = page.query_selector('[data-testid="tweetTextarea_0"]')
            if editor:
                editor.click()
                time.sleep(0.5)
                editor.fill(copy_text)
            else:
                page.keyboard.type(copy_text, delay=5)
            time.sleep(1)
        except:
            page.keyboard.type(copy_text, delay=5)
            time.sleep(1)
        
        # Attach image
        if os.path.exists(image_path):
            try:
                file_input = page.query_selector('input[type="file"]')
                if file_input:
                    file_input.set_input_files(image_path)
                    time.sleep(3)
                    print(f"    📎 Attached: {os.path.basename(image_path)}")
            except Exception as e:
                print(f"    Image attach issue: {e}")
        
        # Submit
        time.sleep(2)
        try:
            btn = page.query_selector('[data-testid="tweetButton"]')
            if btn:
                btn.click(force=True)
                print(f"    ✅ Posted!")
            else:
                page.keyboard.press("Control+Enter")
                print(f"    ✅ Posted!")
        except:
            page.keyboard.press("Control+Enter")
            print(f"    ✅ Posted!")
        
        time.sleep(3)
        browser.close()

def main():
    dry_run = "--dry-run" in sys.argv
    
    print("=" * 60)
    print(f"📸 LUXOR — Posting {len(IMAGES)} images to X")
    print("=" * 60)
    
    # Generate copy for each
    for i, img in enumerate(IMAGES):
        full_path = os.path.join(PROJECT, img["path"]) if not img["path"].startswith("/") else img["path"]
        if not os.path.exists(full_path):
            print(f"⚠ Missing: {img['path']}")
            # Try copying from tmp
            for d in os.listdir("/tmp/codex-web-uploads/"):
                udir = f"/tmp/codex-web-uploads/{d}"
                if os.path.isdir(udir):
                    for pic in os.listdir(udir):
                        if pic.endswith(('.jpg','.jpeg','.png')):
                            import shutil
                            os.makedirs(os.path.dirname(full_path), exist_ok=True)
                            shutil.copy2(os.path.join(udir, pic), full_path)
                            print(f"  Copied: {pic}")
                            break
        
        print(f"\n[{i+1}/3] {img['theme']}")
        
        if not dry_run:
            copy = generate_copy(img)
            if copy:
                print(f"  📝 {copy[:100]}...")
                print(f"  📤 Posting...")
                post_to_x(full_path, copy)
            else:
                print(f"  ❌ No copy generated - using fallback")
                fallbacks = [
                    "Your style, algorithmically curated. Luxor (luxor.ly) #AIFashion #Luxor",
                    "Less is more when it's the right more. Luxor edits your wardrobe. #Minimalism #Luxor",
                    "AI styling that saves you hours. Dress better, think less. Luxor (luxor.ly)"
                ]
                post_to_x(full_path, fallbacks[i])
        else:
            print(f"  ✓ Image exists: {os.path.basename(full_path)}")
            print(f"  🔍 Would generate copy and post")
        
        time.sleep(3)
    
    print("\n✅ Done")

if __name__ == "__main__":
    main()
