#!/usr/bin/env python3
"""Quora Poster v3 — Production-ready Playwright poster with full React support.
Usage:
    xvfb-run python3 quora_poster_v3.py                           # Post next queued answer
    xvfb-run python3 quora_poster_v3.py --index 2                  # Post specific queue item
    xvfb-run python3 quora_poster_v3.py --all                      # Post all queued answers
    xvfb-run python3 quora_poster_v3.py --question-url <url>       # Post to specific question
    xvfb-run python3 quora_poster_v3.py --text "custom answer"     # Custom text
"""
import json, sys, os, time, re
from playwright.sync_api import sync_playwright

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_quora_working.json")
QUEUE_FILE = os.path.join(PROJECT, "content_queue.json")

def load_cookies(path=COOKIES_FILE):
    with open(path) as f:
        return json.load(f)

def load_queue(path=QUEUE_FILE):
    with open(path) as f:
        return json.load(f)

def post_answer(page, content, question_url=None, max_retries=3):
    """Post an answer to Quora. Returns True on success."""
    
    # Step 1: Navigate to question
    if question_url:
        print(f"[1] Navigating to question...")
        page.goto(question_url, wait_until="domcontentloaded", timeout=30000)
    else:
        print(f"[1] Loading answer page...")
        page.goto("https://www.quora.com/answer", wait_until="domcontentloaded", timeout=30000)
    
    time.sleep(3)
    
    # Remove OneTrust overlay
    page.evaluate("""() => {
        const e = document.getElementById('onetrust-consent-sdk');
        if(e) e.remove();
    }""")
    
    # Remove cookie banners
    page.evaluate("""() => {
        for (const e of document.querySelectorAll('[class*="cookie"], [id*="cookie"], [class*="consent"], [id*="consent"]')) {
            if (e.offsetParent !== null) e.remove();
        }
    }""")
    
    if not question_url:
        # Find questions on /answer page
        questions = page.evaluate("""
            () => {
                const links = document.querySelectorAll('a');
                const qs = [];
                const seen = new Set();
                for (const l of links) {
                    const t = l.textContent.trim();
                    if (t.includes('?') && t.length > 15 && !seen.has(t) && l.href.includes('quora.com/')) {
                        seen.add(t);
                        qs.push({text: t.substring(0, 80), href: l.href});
                    }
                }
                return qs;
            }
        """)
        
        if not questions:
            print("  ❌ No questions found on /answer page")
            return False
        
        # Pick a question that matches our content topic
        question_url = questions[0]['href']
        print(f"  Found {len(questions)} questions, picking: {questions[0]['text'][:60]}...")
        
        # Navigate to question
        print(f"[2] Navigating to question page...")
        page.goto(question_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
    
    print(f"  Title: {page.title()[:80]}")
    
    # Remove overlays again
    page.evaluate("""() => {
        const e = document.getElementById('onetrust-consent-sdk');
        if(e) e.remove();
    }""")
    
    # Step 2: Click Answer button with multiple strategies
    print(f"[3] Clicking Answer button...")
    clicked = False
    
    for attempt in range(max_retries):
        # Strategy 1: Direct click on button with text "Answer"
        if not clicked:
            clicked = page.evaluate("""
                () => {
                    const btns = document.querySelectorAll('button');
                    for (const b of btns) {
                        if (b.textContent.trim() === 'Answer' && b.offsetParent !== null) {
                            // Try React-compatible event dispatch
                            b.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true}));
                            b.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, cancelable: true}));
                            b.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
                            b.click();
                            b.focus();
                            console.log('Clicked Answer button via strategy 1');
                            return true;
                        }
                    }
                    // Strategy 2: Look for SVG button
                    const answerLinks = document.querySelectorAll('a[href*="/answer"], [role="button"]');
                    for (const a of answerLinks) {
                        const t = a.textContent.trim().toLowerCase();
                        if (t.includes('answer')) {
                            a.click();
                            console.log('Clicked Answer via strategy 2');
                            return true;
                        }
                    }
                    return false;
                }
            """)
        
        if clicked:
            print(f"  ✅ Answer button clicked (attempt {attempt+1})")
            break
        else:
            print(f"  ⏳ Answer button not found, waiting... (attempt {attempt+1})")
            time.sleep(2)
            page.evaluate("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(1)
    
    if not clicked:
        print("  ❌ Could not find Answer button")
        return False
    
    # Wait for editor to appear
    time.sleep(3)
    
    # Remove overlays again (they may have reappeared)
    page.evaluate("""() => {
        const e = document.getElementById('onetrust-consent-sdk');
        if(e) e.remove();
    }""")
    
    # Step 3: Find editor and type content
    print(f"[4] Typing answer ({len(content)} chars)...")
    editor = None
    
    for attempt in range(10):
        editor = page.query_selector('[contenteditable="true"]')
        if editor:
            break
        time.sleep(1)
    
    if not editor:
        print("  ❌ No editor found after Answer button click")
        return False
    
    # Click editor
    editor.click()
    time.sleep(1)
    
    # Type content in chunks to avoid editor issues
    chunk_size = 200
    for i in range(0, len(content), chunk_size):
        chunk = content[i:i+chunk_size]
        page.keyboard.type(chunk, delay=2)
        time.sleep(0.3)
    
    time.sleep(2)
    print("  ✅ Answer typed")
    
    # Remove overlays before submit
    page.evaluate("""() => {
        const e = document.getElementById('onetrust-consent-sdk');
        if(e) e.remove();
    }""")
    
    # Step 4: Submit
    print(f"[5] Submitting answer...")
    submitted = False
    
    for attempt in range(5):
        submitted = page.evaluate("""
            () => {
                const btns = document.querySelectorAll('button');
                const submitTexts = ['submit', 'post', 'done', 'add answer', 'publish'];
                for (const b of btns) {
                    const t = b.textContent.trim().toLowerCase();
                    if (submitTexts.includes(t) && b.offsetParent !== null) {
                        b.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true}));
                        b.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, cancelable: true}));
                        b.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
                        b.click();
                        return true;
                    }
                }
                return false;
            }
        """)
        
        if submitted:
            print(f"  ✅ Submit button clicked (attempt {attempt+1})")
            break
        
        # Try Ctrl+Enter
        page.keyboard.press("Control+Enter")
        time.sleep(2)
        
        # Check if answer appears to have been posted
        page_content = page.content()
        if "Your answer" in page_content or "Answer added" in page_content:
            submitted = True
            print(f"  ✅ Answer appeared after Ctrl+Enter (attempt {attempt+1})")
            break
        
        time.sleep(1)
    
    time.sleep(5)
    
    # Take final screenshot
    page.screenshot(path=os.path.join(PROJECT, "/tmp/quora_posted_final.png"), full_page=True)
    
    if submitted:
        print("\n" + "=" * 60)
        print("✅ ANSWER POSTED SUCCESSFULLY!")
        print("=" * 60)
        return True
    else:
        print("\n" + "=" * 60)
        print("❌ Could not confirm posting")
        print("=" * 60)
        return False


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Quora Poster v3")
    parser.add_argument("--index", "-i", type=int, default=0, help="Queue index to post")
    parser.add_argument("--all", "-a", action="store_true", help="Post all queued answers")
    parser.add_argument("--question-url", "-u", help="Direct question URL")
    parser.add_argument("--text", "-t", help="Custom answer text")
    parser.add_argument("--cookies", "-c", default=COOKIES_FILE, help="Cookies file")
    args = parser.parse_args()
    
    raw_cookies = load_cookies(args.cookies)
    
    if args.text:
        queue = [{"topic": "custom", "content": args.text, "platform": "quora"}]
    else:
        queue = load_queue(QUEUE_FILE)
    
    if args.all:
        indices = range(len(queue))
    else:
        indices = [args.index if args.index < len(queue) else 0]
    
    success_count = 0
    
    for idx in indices:
        item = queue[idx]
        content = item["content"]
        topic = item["topic"]
        
        print("\n" + "=" * 60)
        print(f"📝 QUEUE #{idx}: {topic[:60]}")
        print(f"📏 Size: {len(content)} chars")
        print("=" * 60)
        
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=False,
                args=["--no-sandbox", "--disable-gpu", "--disable-software-rasterizer",
                      "--disable-dev-shm-usage", "--single-process"]
            )
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                viewport={"width": 1280, "height": 900},
            )
            
            valid_cookies = 0
            for c in raw_cookies:
                try:
                    ss_map = {'lax':'Lax','strict':'Strict','none':'None','no_restriction':'None','unspecified':'None'}
                    ss = ss_map.get(c.get('sameSite','Lax').lower(), 'Lax')
                    url = c.get('url', 'https://www.quora.com/')
                    if 'www.www.' in url: url = 'https://www.quora.com/'
                    context.add_cookies([{'name': c['name'], 'value': c.get('value', ''), 'url': url, 'sameSite': ss}])
                    valid_cookies += 1
                except Exception:
                    pass
            
            print(f"[*] Loaded {valid_cookies} cookies")
            
            page = context.new_page()
            page.set_default_timeout(45000)
            
            if args.question_url:
                ok = post_answer(page, content, question_url=args.question_url)
            else:
                ok = post_answer(page, content)
            
            if ok:
                success_count += 1
            
            browser.close()
        
        if not args.all or idx == len(indices) - 1:
            pass
    
    print(f"\n{'='*60}")
    print(f"📊 RESULTS: {success_count}/{len(indices)} posted successfully")
    print(f"{'='*60}")
    
    return 0 if success_count == len(indices) else 1


if __name__ == "__main__":
    sys.exit(main())
