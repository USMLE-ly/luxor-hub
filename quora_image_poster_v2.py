"""
Post 3 images to Quora — improved question detection.
"""
import json, os, sys, time
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_quora_working.json")

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

POSTS = [
    {
        "search": "AI changing fashion industry",
        "answer": """AI is fundamentally reshaping how we approach personal style. Here's what's actually happening:

**1. Algorithmic fit prediction** — AI analyzes your body geometry, colorimetry, and past preferences to recommend pieces that actually work for you. Brands like Luxor (https://luxor.ly) use computer vision to catalog your existing wardrobe and generate outfits you'd never think of.

**2. Pattern recognition** — The average person wears only 20% of their wardrobe. AI identifies your actual usage patterns and builds a capsule around what you genuinely reach for.

**3. Personal styling as a service** — Instead of hiring a human stylist (expensive) or guessing (ineffective), AI styling bridges the gap. It learns your taste over time, adapts to seasons, and accounts for context.

The key insight: AI doesn't replace style intuition. It removes the friction between knowing what you like and actually wearing it."""
    },
    {
        "search": "how to build a capsule wardrobe",
        "answer": """Building a minimalist capsule wardrobe isn't about owning less—it's about owning the right pieces. Here's the framework:

**Step 1: The 30-Day Log** — Track what you actually wear. You'll discover 80% of outfits come from 20% of your closet.

**Step 2: The 60-30-10 Palette** — 60% neutral core (black, navy, cream), 30% texture play (silk, merino, denim), 10% accent color.

**Step 3: The Three Outfit Test** — Every item must work in three different outfits or it doesn't earn its hanger space.

**Step 4: Invest in versatility** — A perfectly cut blazer in technical fabric, cashmere joggers, leather sneakers. These maximize outfit combinations.

Tools like Luxor (https://luxor.ly) now use AI to automate this entire process—upload your closet, get instant outfit combinations, and identify gaps."""
    },
    {
        "search": "how can AI help you dress better",
        "answer": """Ever stood in front of a bursting closet feeling like you have nothing to wear? AI solves this. Here's how:

**1. Morning decision elimination** — AI learns your preferences and pre-selects outfits based on weather, calendar, and mood. Decision fatigue gone.

**2. Wardrobe gap analysis** — Upload your wardrobe and AI identifies what you're missing: "You have 14 black tops but only one pair of structured trousers."

**3. Fit personalization** — Body measurements + brand-specific sizing data = perfect fit recommendations every time.

**4. Style evolution tracking** — Your taste changes. AI tracks preferences over time and adjusts recommendations.

Platforms like Luxor (https://luxor.ly) combine all of this into one experience. Upload your closet, get instant outfits, shop missing pieces that match, and evolve your style."""
    }
]

def find_good_question(page, search_term):
    """Find a real Quora question (not an ad/profile page)."""
    url = f"https://www.quora.com/search?q={search_term.replace(' ', '+')}"
    log(f"  Searching: {search_term}")
    page.goto(url, wait_until="domcontentloaded", timeout=45000)
    time.sleep(5)
    
    questions = page.evaluate("""() => {
        const links = document.querySelectorAll('a');
        const qs = [];
        const seen = new Set();
        for (const l of links) {
            const text = l.textContent.trim();
            const href = l.href;
            // Must contain '?' in text, be a real question URL, not contain 'search' or 'profile'
            if (text.length > 25 && text.includes('?') && !seen.has(text) && 
                href.includes('quora.com/') && href.split('/').length >= 4 &&
                !href.includes('/search') && !href.includes('/profile') && 
                !href.includes('/topic') && !href.includes('/answer')) {
                seen.add(text);
                qs.push({text: text.substring(0, 120), href: href});
                if (qs.length >= 5) break;
            }
        }
        // Also look for items in search results specifically
        const searchItems = document.querySelectorAll('[data-testid="search_result"]');
        if (qs.length === 0) {
            document.querySelectorAll('a[href*="quora.com/"]').forEach(a => {
                const t = a.textContent.trim();
                const h = a.href;
                if (t.includes('?') && t.length > 30 && h.split('/').filter(x => x).length >= 3 && !h.includes('/search') && !h.includes('/profile')) {
                    if (!seen.has(t)) {
                        seen.add(t);
                        qs.push({text: t.substring(0, 120), href: h});
                    }
                }
            });
        }
        return qs.slice(0, 5);
    }""")
    return questions

def post_one(post):
    """Post one answer to Quora."""
    from playwright.sync_api import sync_playwright
    
    with open(COOKIES_FILE) as f:
        cookies = json.load(f)
    
    log("  Launching browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"])
        ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36", viewport={"width": 1280, "height": 900})
        
        for c in cookies:
            try:
                ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".quora.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
            except: pass
        
        page = ctx.new_page()
        page.set_default_timeout(60000)
        
        # Find question
        questions = find_good_question(page, post["search"])
        
        if not questions:
            log("  ❌ No questions found")
            browser.close()
            return False
        
        q = questions[0]
        log(f"  Q: {q['text'][:70]}...")
        log(f"  URL: {q['href'][:80]}...")
        
        # Go to question
        page.goto(q['href'], wait_until="domcontentloaded", timeout=45000)
        time.sleep(5)
        
        # Try various ways to find Answer button
        log("  Finding Answer button...")
        result = page.evaluate("""() => {
            // Method 1: React fiber on buttons
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
                const text = btn.textContent.trim().toLowerCase();
                if ((text === 'answer' || text.startsWith('answer ')) && btn.offsetParent !== null) {
                    const key = Object.keys(btn).find(k => k.startsWith('__reactProps') || k.startsWith('__reactEventHandlers'));
                    if (key && btn[key] && btn[key].onClick) {
                        btn[key].onClick({});
                        return 'react_' + btn.getAttribute('data-testid') || 'no_testid';
                    }
                    btn.click();
                    return 'dom_click';
                }
            }
            // Method 2: Look for Answer link/button with data-testid
            const answerLinks = document.querySelectorAll('[data-testid*=\"answer\"], a[href*=\"/answer\"]');
            for (const a of answerLinks) {
                if (a.offsetParent !== null) {
                    a.click();
                    return 'link_click';
                }
            }
            // Method 3: Navigate to /answer page
            return 'not_found';
        }""")
        log(f"  Button result: {result}")
        
        if result == "not_found":
            # Try scrolling and looking again
            page.evaluate("window.scrollTo(0, 500)")
            time.sleep(2)
            result = page.evaluate("""() => {
                const btns = document.querySelectorAll('button');
                for (const btn of btns) {
                    const text = btn.textContent.trim().toLowerCase();
                    if ((text === 'answer' || text.startsWith('answer ')) && btn.offsetParent !== null) {
                        btn.click();
                        return 'scroll_click';
                    }
                }
                return 'not_found';
            }""")
            log(f"  Scroll result: {result}")
        
        if result == "not_found":
            log("  ⚠ No Answer button — trying /answer direct URL")
            page.goto(q['href'] + "/answer", wait_until="domcontentloaded", timeout=30000)
            time.sleep(4)
            # Check if we got an editor
            has_editor = page.evaluate("() => document.querySelector('[contenteditable=\"true\"]') !== null")
            if has_editor:
                log("  ✅ Editor found via /answer direct")
            else:
                page.screenshot(path="/tmp/quora_no_answer.png")
                browser.close()
                return False
        
        # Wait for editor
        time.sleep(3)
        
        # Check for editor
        editor_ready = page.evaluate("() => { const e = document.querySelector('[contenteditable=\"true\"]'); return e ? 'found' : 'not_found'; }")
        log(f"  Editor: {editor_ready}")
        
        if editor_ready == "not_found":
            page.screenshot(path="/tmp/quora_editor_missing.png")
            browser.close()
            return False
        
        # Type answer — fast approach
        answer_text = post["answer"]
        log(f"  Typing {len(answer_text)} chars...")
        try:
            page.locator('[contenteditable="true"]').first.click()
            time.sleep(0.3)
            # Type in larger chunks for speed
            for i in range(0, len(answer_text), 200):
                chunk = answer_text[i:i+200]
                page.keyboard.type(chunk, delay=1)
                time.sleep(0.05)
            time.sleep(1)
        except Exception as e:
            log(f"  ⚠ Editor error: {e}")
            browser.close()
            return False
        
        page.screenshot(path="/tmp/quora_before_submit.png", timeout=15000)
        
        # Submit
        log("  Submitting...")
        submit = page.evaluate("""() => {
            const btns = document.querySelectorAll('button');
            const targets = ['submit', 'post', 'publish', 'add answer', 'done', 'share'];
            for (const btn of btns) {
                const text = btn.textContent.trim().toLowerCase();
                if (targets.includes(text) && btn.offsetParent !== null) {
                    const key = Object.keys(btn).find(k => k.startsWith('__reactProps'));
                    if (key && btn[key] && btn[key].onClick) {
                        btn[key].onClick({});
                        return 'react_' + text;
                    }
                    btn.click();
                    return 'dom_' + text;
                }
            }
            return 'not_found';
        }""")
        log(f"  Submit: {submit}")
        
        if submit == "not_found":
            page.keyboard.press("Control+Enter")
            log("  Ctrl+Enter")
        
        time.sleep(5)
        page.screenshot(path="/tmp/quora_after_submit.png", timeout=15000)
        log(f"  URL: {page.url}")
        
        browser.close()
        return "answer" in page.url.lower()

def main():
    log("=" * 60)
    log("📸 Quora Image Poster v2")
    log("=" * 60)
    
    for i, post in enumerate(POSTS):
        log(f"\n--- [{i+1}/3] Theme: {post['search']} ---")
        ok = post_one(post)
        log(f"  {'✅' if ok else '❌'}")
        time.sleep(10)
    
    log("\n✅ Complete!")

if __name__ == "__main__":
    main()
