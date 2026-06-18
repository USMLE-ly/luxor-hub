#!/usr/bin/env python3
"""Quora Poster v4 — Post answers reliably using Playwright.
Usage:
    xvfb-run python3 quora_poster_v4.py --question "What is luxury fashion?"
    xvfb-run python3 quora_poster_v4.py --queue 0
    xvfb-run python3 quora_poster_v4.py --search "luxury fashion"
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

def find_and_click_answer(page):
    """Click the Answer button using text startsWith matching."""
    return page.evaluate("""
        () => {
            const btns = document.querySelectorAll('button');
            for (const b of btns) {
                const t = b.textContent.trim();
                if (t.startsWith('Answer') && b.offsetParent !== null) {
                    b.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true}));
                    b.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, cancelable: true}));
                    b.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
                    b.click();
                    b.focus();
                    return t;
                }
            }
            return null;
        }
    """)

def find_editor(page, timeout=15):
    """Find contenteditable editor, including in iframes."""
    for i in range(timeout):
        editor = page.query_selector('[contenteditable="true"]')
        if editor:
            return editor
        # Check iframes
        for frame in page.frames:
            ed = frame.query_selector('[contenteditable="true"]')
            if ed:
                return ed
        time.sleep(1)
    return None

def click_submit(page):
    """Click submit/post button or use Ctrl+Enter."""
    # Remove overlays
    page.evaluate("""() => {
        const e = document.getElementById('onetrust-consent-sdk');
        if(e) e.remove();
    }""")
    
    result = page.evaluate("""
        () => {
            const btns = document.querySelectorAll('button');
            const targets = ['submit', 'post', 'done', 'add answer', 'publish', 'share'];
            for (const b of btns) {
                const t = b.textContent.trim().toLowerCase();
                if (targets.includes(t) && b.offsetParent !== null) {
                    b.click();
                    return 'clicked: ' + t;
                }
            }
            return 'notfound';
        }
    """)
    
    if result == 'notfound':
        page.keyboard.press("Control+Enter")
        time.sleep(2)
        return 'ctrl+enter'
    return result

def post_to_question(page, q_url, content):
    """Full flow: navigate to question, click answer, type, submit."""
    print(f"[1] Navigating to question...")
    page.goto(q_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    
    title = page.title()
    print(f"  Title: {title[:80]}")
    
    if "Just a moment" in title:
        print("  ❌ Cloudflare blocked")
        return False
    
    # Remove cookie overlays
    page.evaluate("""() => {
        for (const sel of ['#onetrust-consent-sdk', '.consent', '.cookie']){
            const e = document.querySelector(sel);
            if(e) e.remove();
        }
    }""")
    
    # Click Answer button
    print(f"[2] Clicking Answer button...")
    btn_text = find_and_click_answer(page)
    if btn_text:
        print(f"  ✅ Clicked: '{btn_text}'")
    else:
        print(f"  ⏳ No Answer button, scrolling...")
        page.evaluate("window.scrollTo(0, 300)")
        time.sleep(2)
        btn_text = find_and_click_answer(page)
        if btn_text:
            print(f"  ✅ Clicked (after scroll): '{btn_text}'")
        else:
            print(f"  ❌ Could not find Answer button")
            return False
    
    # Wait for editor
    print(f"[3] Waiting for editor...")
    editor = find_editor(page)
    if not editor:
        print(f"  ❌ No editor appeared")
        page.screenshot(path="/tmp/quora_no_editor.png")
        return False
    
    print(f"  ✅ Editor found!")
    editor.click()
    time.sleep(1)
    
    # Type content
    print(f"[4] Typing answer ({len(content)} chars)...")
    page.keyboard.type(content, delay=5)
    time.sleep(1)
    print(f"  ✅ Answer typed")
    
    # Remove overlays before submit
    page.evaluate("""() => {
        const e = document.getElementById('onetrust-consent-sdk');
        if(e) e.remove();
    }""")
    
    # Submit
    print(f"[5] Submitting...")
    result = click_submit(page)
    print(f"  Submit method: {result}")
    
    time.sleep(5)
    
    print(f"  ✅ Done! Screenshot saved")
    page.screenshot(path="/tmp/quora_post_result.png", full_page=True)
    return True


def search_question(page, topic):
    """Search Quora for a question on a topic."""
    search_url = f"https://www.quora.com/search?q={topic.replace(' ', '+')}"
    page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    
    questions = page.evaluate("""
        () => {
            const links = document.querySelectorAll('a[href*="/"]');
            const qs = [];
            const seen = new Set();
            for (const l of links) {
                const t = l.textContent.trim();
                if (t.includes('?') && t.length > 10 && !seen.has(t) && 
                    l.href.includes('quora.com/') && !l.href.includes('/search') && !l.href.includes('/profile')) {
                    seen.add(t);
                    qs.push({text: t.substring(0, 80), href: l.href});
                }
            }
            return qs.slice(0, 5);
        }
    """)
    return questions


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Quora Poster v4")
    parser.add_argument("--question", "-q", help="Question URL or slug")
    parser.add_argument("--search", "-s", help="Search topic")
    parser.add_argument("--queue", "-i", type=int, default=0, help="Queue index")
    parser.add_argument("--all", "-a", action="store_true", help="Post all")
    parser.add_argument("--text", "-t", help="Custom text")
    args = parser.parse_args()
    
    cookies = load_cookies()
    queue = load_queue()
    
    if args.text:
        contents = [{"topic": "custom", "content": args.text}]
    else:
        contents = queue if args.all else [queue[args.queue]]
    
    for item in contents:
        content = item["content"]
        topic = item.get("topic", "fashion")
        
        print(f"\n{'='*60}")
        print(f"📝 {topic[:60]}")
        print(f"📏 {len(content)} chars")
        print(f"{'='*60}")
        
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
            
            valid = 0
            for c in cookies:
                try:
                    ss_map = {'lax':'Lax','strict':'Strict','none':'None','no_restriction':'None','unspecified':'None'}
                    ss = ss_map.get(c.get('sameSite','Lax').lower(), 'Lax')
                    url = c.get('url', 'https://www.quora.com/')
                    if 'www.www.' in url: url = 'https://www.quora.com/'
                    context.add_cookies([{'name': c['name'], 'value': c.get('value', ''), 'url': url, 'sameSite': ss}])
                    valid += 1
                except Exception:
                    pass
            print(f"[*] Loaded {valid} cookies")
            
            page = context.new_page()
            page.set_default_timeout(45000)
            
            if args.question:
                ok = post_to_question(page, args.question, content)
            elif args.search:
                questions = search_question(page, args.search)
                print(f"  Found {len(questions)} questions")
                for q in questions:
                    print(f"    - {q['text'][:60]}")
                if questions:
                    ok = post_to_question(page, questions[0]['href'], content)
                else:
                    ok = False
            else:
                # Use the /answer page to find questions
                page.goto("https://www.quora.com/answer", wait_until="domcontentloaded", timeout=30000)
                time.sleep(4)
                
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
                        return qs.slice(0, 10);
                    }
                """)
                if questions:
                    ok = post_to_question(page, questions[0]['href'], content)
                else:
                    print("  No questions found on /answer page")
                    ok = False
            
            browser.close()
            
            if ok:
                print(f"✅ SUCCESS: {topic}")
            else:
                print(f"❌ FAILED: {topic}")

if __name__ == "__main__":
    sys.exit(main())
