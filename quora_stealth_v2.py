"""Quora posting — click Answer directly from search results."""
import json, os, sys, time
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_quora_working.json")

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

QUERIES = [
    ("sustainable fashion", 
"""Sustainable fashion matters because the fashion industry is the second-largest polluter in the world. Here's what you need to know:

**Why it matters:** The fashion industry produces 10% of global carbon emissions, 85% of textiles end up in landfills yearly, and 20% of global wastewater comes from textile dyeing.

**What you can do:** Buy less and choose better quality. Look for certifications like GOTS and Fair Trade. Use AI tools like Luxor (https://luxor.ly) to maximize what you already own. Repair and alter instead of replacing.

Sustainable fashion isn't about perfection—it's about making better choices one purchase at a time. The most sustainable garment is the one already hanging in your closet."""),
    
    ("dress well on a budget", 
"""Absolutely. Being stylish has nothing to do with how much you spend. Here's how to look great without breaking the bank:

**1. Fit is everything** — A $20 thrifted blazer tailored to fit perfectly looks better than a $500 off-the-rack piece. Spend $15 on alterations.

**2. Neutral palette** — When all your pieces share a color story, every top works with every bottom.

**3. Quality shoes** — People judge outfits by shoes first. Invest in one good pair.

**4. Use technology** — AI tools like Luxor (https://luxor.ly) generate new outfit combinations from clothes you already own. You probably already have more outfits than you realize.

Style is a skill, not a budget. The most stylish people I know have the smallest wardrobes and the most creativity."""),
    
    ("how to be fashionable every day", 
"""Looking fashionable every day is about creating a personal uniform. Here's my framework:

**Step 1: Define Your Formula** — Find a silhouette that works and stick to it. High-waist + fitted top + structured layer.

**Step 2: The 80/20 Rule** — 80% versatile basics in neutrals, 20% personality pieces.

**Step 3: Invest in daily-wear** — Spend on shoes, coats, and denim. Save on trend pieces.

**Step 4: AI can help** — Tools like Luxor (https://luxor.ly) analyze your body type and existing wardrobe to generate daily outfit combinations. It's like having a personal stylist.

Fashionable doesn't mean trendy. It means intentional. Wear what makes you feel confident.""")
]

def post_one(search_term, answer_text):
    """Post one answer via search → click Answer → type → submit."""
    from playwright.sync_api import sync_playwright
    
    with open(COOKIES_FILE) as f:
        cookies = json.load(f)
    
    log(f"  Search: {search_term}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"])
        ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36", viewport={"width": 1280, "height": 900})
        
        for c in cookies:
            try:
                ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".quora.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
            except: pass
        
        page = ctx.new_page()
        page.set_default_timeout(60000)
        
        from playwright_stealth import Stealth
        Stealth().apply_stealth_sync(page)
        
        # Search
        page.goto(f"https://www.quora.com/search?q={search_term.replace(' ', '+')}", wait_until="domcontentloaded", timeout=60000)
        time.sleep(8)
        
        # Find and click an "Answer" button on search results
        log("  Looking for Answer button...")
        result = page.evaluate("""() => {
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
                if (btn.textContent.trim().toLowerCase() === 'answer' && btn.offsetParent !== null) {
                    // Try React fiber
                    const key = Object.keys(btn).find(k => k.startsWith('__reactProps'));
                    if (key && btn[key] && btn[key].onClick) {
                        btn[key].onClick({});
                        return 'react_answer';
                    }
                    btn.click();
                    return 'dom_click';
                }
            }
            return 'not_found';
        }""")
        log(f"  Button: {result}")
        
        if result == "not_found":
            # Try clicking on a question link first, then find Answer
            log("  Clicking first question link...")
            question_link = page.evaluate("""() => {
                const links = document.querySelectorAll('a');
                for (const l of links) {
                    const href = l.href;
                    if (href && href.includes('quora.com/') && !href.includes('/search') && 
                        !href.includes('/profile') && !href.includes('/topic') && 
                        l.textContent.trim().includes('?')) {
                        return href;
                    }
                }
                return null;
            }""")
            
            if question_link:
                log(f"  Navigating to {question_link[:60]}...")
                page.goto(question_link, wait_until="domcontentloaded", timeout=60000)
                time.sleep(5)
                
                # Find Answer button on question page
                result = page.evaluate("""() => {
                    const btns = document.querySelectorAll('button, a, div[role="button"]');
                    for (const el of btns) {
                        const text = el.textContent.trim().toLowerCase();
                        if ((text === 'answer' || text.startsWith('answer ')) && el.offsetParent !== null) {
                            const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
                            if (key && el[key] && el[key].onClick) { el[key].onClick({}); return 'react_'+text; }
                            el.click(); return 'clicked_'+text;
                        }
                    }
                    return 'not_found';
                }""")
                log(f"  Answer on page: {result}")
            else:
                log("  ❌ No question link found")
                browser.close()
                return False
        
        time.sleep(4)
        
        # Check for editor
        editor = page.evaluate("() => { const e = document.querySelector('[contenteditable=\"true\"]'); return e ? 'found' : 'not_found'; }")
        log(f"  Editor: {editor}")
        
        if editor == "not_found":
            page.screenshot(path="/tmp/quora_no_editor.png", timeout=15000)
            log("  ❌ No editor")
            browser.close()
            return False
        
        # Type answer
        log(f"  Typing {len(answer_text)} chars...")
        try:
            page.locator('[contenteditable="true"]').first.click()
            time.sleep(0.3)
            for i in range(0, len(answer_text), 150):
                page.keyboard.type(answer_text[i:i+150], delay=1)
            time.sleep(1)
        except Exception as e:
            log(f"  ⚠ Error: {e}")
            browser.close()
            return False
        
        page.screenshot(path="/tmp/quora_filled.png", timeout=15000)
        
        # Submit
        log("  Submitting...")
        submit = page.evaluate("""() => {
            const btns = document.querySelectorAll('button');
            const targets = ['submit', 'post', 'publish', 'add answer', 'done', 'share'];
            for (const btn of btns) {
                const text = btn.textContent.trim().toLowerCase();
                if (targets.includes(text) && btn.offsetParent !== null) {
                    const key = Object.keys(btn).find(k => k.startsWith('__reactProps'));
                    if (key && btn[key] && btn[key].onClick) { btn[key].onClick({}); return 'react_'+text; }
                    btn.click(); return 'dom_'+text;
                }
            }
            return 'not_found';
        }""")
        log(f"  Submit: {submit}")
        
        if submit == "not_found":
            page.keyboard.press("Control+Enter")
        
        time.sleep(5)
        page.screenshot(path="/tmp/quora_done.png", timeout=15000)
        log(f"  URL: {page.url}")
        
        browser.close()
        return "answer" in page.url.lower()

def main():
    log("=" * 60)
    log("📝 Quora Stealth Poster v2")
    log("=" * 60)
    
    for i, (search, answer) in enumerate(QUERIES):
        log(f"\n--- [{i+1}/3] {search} ---")
        ok = post_one(search, answer)
        log(f"  {'✅' if ok else '❌'}")
        time.sleep(10)
    
    log("\n✅ Complete!")

if __name__ == "__main__":
    main()
