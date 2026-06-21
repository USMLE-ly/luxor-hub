#!/usr/bin/env python3
"""Quora Poster — uses Playwright + cookie injection + React fiber click."""
import json, os, sys, time, requests
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_quora_working.json")
QUEUE_FILE = os.path.join(PROJECT, "content_queue.json")
API_URL = "https://opencode.ai/zen/v1/chat/completions"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def load_queue():
    with open(QUEUE_FILE) as f:
        return json.load(f)

def gen_answer(question, context=""):
    """Generate answer via API."""
    sys_prompt = "You are a fashion expert answering on Quora. Write a helpful, detailed answer (200-500 words). Be authoritative but conversational."
    prompt = f"Question: {question}\n\nWrite a comprehensive answer as a fashion industry insider."
    payload = {
        "model": "deepseek-v4-flash-free",
        "messages": [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.8,
        "max_tokens": 1000,
    }
    try:
        r = requests.post(API_URL, json=payload, timeout=90)
        data = r.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        return content if content else None
    except Exception as e:
        log(f"  ⚠ API: {e}")
    return None

def find_quora_question(page, topic):
    """Search Quora for a question to answer."""
    page.goto(f"https://www.quora.com/search?q={topic.replace(' ', '+')}", wait_until="domcontentloaded", timeout=45000)
    time.sleep(5)
    
    questions = page.evaluate("""() => {
        const links = document.querySelectorAll('a');
        const qs = [];
        const seen = new Set();
        for (const l of links) {
            const text = l.textContent.trim();
            if (text.length > 20 && text.includes('?') && !seen.has(text) && 
                l.href.includes('quora.com/') && !l.href.includes('/search') && !l.href.includes('/profile')) {
                seen.add(text);
                qs.push({text: text.substring(0, 100), href: l.href});
                if (qs.length >= 5) break;
            }
        }
        return qs;
    }""")
    return questions

def click_answer_button(page):
    """Find and click Answer button using React fiber (similar to X)."""
    result = page.evaluate("""() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
            const text = btn.textContent.trim().toLowerCase();
            if ((text === 'answer' || text.startsWith('answer')) && btn.offsetParent !== null) {
                // Try React fiber first
                const key = Object.keys(btn).find(k => k.startsWith('__reactProps') || k.startsWith('__reactEventHandlers'));
                if (key) {
                    const props = btn[key];
                    if (props && props.onClick) {
                        props.onClick({});
                        return 'react_click_' + text;
                    }
                }
                // Fallback to DOM events
                btn.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
                btn.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}));
                btn.dispatchEvent(new MouseEvent('click', {bubbles: true, view: window}));
                btn.click();
                return 'dom_click_' + text;
            }
        }
        return 'not_found';
    }""")
    return result

def post_answer(image, answer_text):
    """Post an answer to Quora."""
    from playwright.sync_api import sync_playwright
    
    with open(COOKIES_FILE) as f:
        cookies = json.load(f)
    
    log("  Launching browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 900},
        )
        
        for c in cookies:
            try:
                ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".quora.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
            except: pass
        
        page = ctx.new_page()
        page.set_default_timeout(60000)
        
        # Search for question
        topic = image.get("topic", "luxury fashion")
        log(f"  Searching: '{topic}'")
        questions = find_quora_question(page, topic)
        
        if not questions:
            log("  ❌ No questions found")
            browser.close()
            return False, "no_questions"
        
        q = questions[0]
        log(f"  Question: {q['text'][:60]}...")
        
        # Navigate to question
        page.goto(q['href'], wait_until="domcontentloaded", timeout=45000)
        time.sleep(5)
        
        # Click Answer button
        log("  Clicking Answer...")
        result = click_answer_button(page)
        log(f"  Result: {result}")
        
        if "not_found" in result:
            log("  ⚠ No Answer button")
            page.screenshot(path="/tmp/quora_no_answer.png")
            browser.close()
            return False, "no_answer_button"
        
        # Wait for editor
        time.sleep(3)
        
        # Find the editor
        editor = page.evaluate("""() => {
            const editors = document.querySelectorAll('[contenteditable="true"]');
            if (editors.length > 0) return editors[0].getAttribute('aria-label') || 'found';
            // Check iframes
            const iframes = document.querySelectorAll('iframe');
            return 'iframes=' + iframes.length;
        }""")
        log(f"  Editor: {editor}")
        
        # Type answer
        log(f"  Typing {len(answer_text)} chars...")
        try:
            page.locator('[contenteditable="true"]').first.click()
            time.sleep(0.5)
            page.keyboard.type(answer_text, delay=3)
            time.sleep(1)
        except:
            log("  ⚠ Could not type in editor")
            browser.close()
            return False, "editor_error"
        
        page.screenshot(path="/tmp/quora_before_submit.png")
        
        # Submit
        log("  Submitting...")
        submit = page.evaluate("""() => {
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
                const text = btn.textContent.trim().toLowerCase();
                if (['submit', 'post', 'publish', 'add answer', 'done'].includes(text)) {
                    const key = Object.keys(btn).find(k => k.startsWith('__reactProps') || k.startsWith('__reactEventHandlers'));
                    if (key) {
                        const props = btn[key];
                        if (props && props.onClick) { props.onClick({}); return 'react_'+text; }
                    }
                    btn.click();
                    return 'dom_'+text;
                }
            }
            // Try Ctrl+Enter
            return 'ctrl_enter';
        }""")
        log(f"  Submit: {submit}")
        
        if submit == "ctrl_enter":
            page.keyboard.press("Control+Enter")
        
        time.sleep(5)
        page.screenshot(path="/tmp/quora_after_submit.png")
        
        log(f"  Final URL: {page.url}")
        browser.close()
        return True, "submitted"

def main():
    log("=" * 60)
    log("📝 LUXOR Quora Poster")
    log("=" * 60)
    
    queue = load_queue()
    log(f"Queue items: {len(queue)}")
    
    # Post max 3 items
    for i, item in enumerate(queue[:3]):
        if item.get("posted", False):
            log(f"  [{i+1}] Skipping (already posted)")
            continue
        
        log(f"\n--- [{i+1}] {item.get('topic', 'Untitled')} ---")
        text = item.get("content", "")
        log(f"  Content: {len(text)} chars")
        
        if len(text) < 50:
            log("  ❌ Content too short")
            continue
        
        ok, info = post_answer(item, text)
        log(f"  {'✅' if ok else '❌'} {info}")
        time.sleep(10)
    
    log("\n✅ Complete!")

if __name__ == "__main__":
    main()
