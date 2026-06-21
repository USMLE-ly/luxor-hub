"""Post 3 answers to Quora — fast, robust, with stealth + React fiber."""
import json, os, sys, time
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_quora_working.json")

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

ANSWERS = [
    {
        "search": "sustainable fashion",
        "text": """Sustainable fashion matters because the fashion industry is the second-largest polluter globally. It produces 10% of carbon emissions, 20% of wastewater, and 85% of textiles end up in landfills yearly.

What you can do: buy less but better, look for GOTS/Fair Trade certifications, use AI tools like Luxor (https://luxor.ly) to maximize your existing wardrobe, and repair instead of replacing.

The most sustainable garment is the one already hanging in your closet."""
    },
    {
        "search": "dress well on a budget",
        "text": """Being stylish has nothing to do with budget. Fit is everything — a tailored thrifted piece beats expensive off-the-rack. Stick to a neutral palette so everything coordinates. Invest in one quality pair of shoes. Use AI fashion tools like Luxor (https://luxor.ly) to discover new outfit combinations from clothes you already own.

Style is a skill, not a budget. The most stylish people I know have the smallest wardrobes."""
    },
    {
        "search": "fashionable every day",
        "text": """Looking fashionable daily is about having a personal uniform. Find a silhouette formula that works (e.g. high-waist + fitted top + layer) and iterate across seasons. Use the 80/20 rule: 80% versatile neutrals, 20% personality pieces. Spend on daily-wear items like shoes and coats.

AI tools like Luxor (https://luxor.ly) analyze your body type and wardrobe to generate outfit combinations. Fashionable doesn't mean trendy — it means intentional."""
    }
]

def post_one(answer_data):
    """Post one answer to Quora."""
    from playwright.sync_api import sync_playwright
    
    with open(COOKIES_FILE) as f:
        cookies = json.load(f)
    
    search = answer_data["search"]
    text = answer_data["text"]
    
    log(f"  Searching: {search}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"])
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            viewport={"width": 1280, "height": 900}
        )
        
        for c in cookies:
            try:
                ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".quora.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
            except: pass
        
        page = ctx.new_page()
        page.set_default_timeout(45000)
        
        # Stealth
        from playwright_stealth import Stealth
        Stealth().apply_stealth_sync(page)
        
        # Search
        page.goto(f"https://www.quora.com/search?q={search.replace(' ', '+')}", wait_until="domcontentloaded", timeout=45000)
        time.sleep(6)
        
        # Find and click "Answer" on search result
        log("  Clicking Answer...")
        result = page.evaluate("""() => {
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
                if (btn.textContent.trim().toLowerCase() === 'answer' && btn.offsetParent !== null) {
                    const key = Object.keys(btn).find(k => k.startsWith('__reactProps'));
                    if (key && btn[key] && btn[key].onClick) {
                        btn[key].onClick({});
                        return 'react';
                    }
                    btn.click();
                    return 'dom';
                }
            }
            return 'not_found';
        }""")
        log(f"  Answer: {result}")
        
        if result == "not_found":
            # Try clicking a question link first
            link = page.evaluate("""() => {
                const links = document.querySelectorAll('a');
                for (const l of links) {
                    if (l.href.includes('quora.com/') && !l.href.includes('/search') && 
                        l.textContent.trim().includes('?')) return l.href;
                }
                return null;
            }""")
            if link:
                log(f"  Going to: {link[:60]}...")
                page.goto(link, wait_until="domcontentloaded", timeout=45000)
                time.sleep(5)
                
                result = page.evaluate("""() => {
                    const els = document.querySelectorAll('button, a');
                    for (const el of els) {
                        const text = el.textContent.trim().toLowerCase();
                        if ((text === 'answer' || text.startsWith('answer ')) && el.offsetParent !== null) {
                            const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
                            if (key && el[key] && el[key].onClick) { el[key].onClick({}); return 'react'; }
                            el.click(); return 'clicked';
                        }
                    }
                    return 'not_found';
                }""")
                log(f"  Answer: {result}")
        
        time.sleep(3)
        
        # Editor
        editor = page.evaluate("() => { const e = document.querySelector('[contenteditable=\"true\"]'); return e ? 'ok' : 'no'; }")
        log(f"  Editor: {editor}")
        
        if editor == "no":
            log("  ❌ No editor")
            browser.close()
            return False
        
        # Type
        log(f"  Typing {len(text)} chars...")
        try:
            page.locator('[contenteditable="true"]').first.click()
            time.sleep(0.2)
            page.keyboard.type(text, delay=1)
            time.sleep(1)
        except:
            log("  ⚠ Type error")
            browser.close()
            return False
        
        # Submit via React
        log("  Submitting...")
        submit = page.evaluate("""() => {
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
                const text = btn.textContent.trim().toLowerCase();
                if (['submit','post','publish','add answer','done','share'].includes(text) && btn.offsetParent !== null) {
                    const key = Object.keys(btn).find(k => k.startsWith('__reactProps'));
                    if (key && btn[key] && btn[key].onClick) { btn[key].onClick({}); return 'react'; }
                    btn.click(); return 'dom';
                }
            }
            return 'no';
        }""")
        log(f"  Submit: {submit}")
        
        if submit == "no":
            page.keyboard.press("Control+Enter")
        
        time.sleep(5)
        log(f"  URL: {page.url}")
        
        browser.close()
        return "answer" in page.url.lower()

def main():
    log("=" * 60)
    log("📝 Quora Poster")
    log("=" * 60)
    
    for i, ans in enumerate(ANSWERS):
        log(f"\n--- [{i+1}/3] ---")
        ok = post_one(ans)
        log(f"  {'✅' if ok else '❌'}")
        time.sleep(8)
    
    log("\n✅ Complete!")

if __name__ == "__main__":
    main()
