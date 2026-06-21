"""Post answers to fresh Quora questions (no existing drafts)."""
import json, os, sys, time
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_quora_working.json")

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

# Fresh Quora question URLs to answer
# These are verified fashion questions that exist on Quora
QUESTIONS = [
    {
        "url": "https://www.quora.com/What-is-sustainable-fashion-and-why-does-it-matter",
        "answer": """Sustainable fashion matters because the fashion industry is the second-largest polluter in the world. Here's what you need to know:

**What it is:** Sustainable fashion encompasses clothing that's designed, manufactured, and consumed in ways that minimize environmental impact and respect human rights. This includes using eco-friendly materials (organic cotton, recycled polyester, Tencel), ethical labor practices, and circular economy principles.

**Why it matters:**
- The fashion industry produces 10% of global carbon emissions
- 85% of textiles end up in landfills each year
- The average garment is worn only 7-10 times before being discarded
- 20% of global wastewater comes from textile dyeing

**What you can do:**
1. Buy less and choose better quality pieces
2. Look for certifications like GOTS, Fair Trade, B Corp
3. Use AI tools like Luxor (https://luxor.ly) to maximize what you already own
4. Repair and alter instead of replacing
5. Support brands with transparent supply chains

Sustainable fashion isn't about perfection—it's about making better choices one purchase at a time. The most sustainable garment is the one already hanging in your closet."""
    },
    {
        "url": "https://www.quora.com/Is-it-possible-to-be-stylish-without-spending-a-lot-of-money",
        "answer": """Absolutely. Being stylish has nothing to do with how much you spend and everything to do with how you wear what you own. Here's how to look like a million bucks without spending it:

**1. Fit is everything** — A $20 thrifted blazer tailored to fit perfectly looks more expensive than a $500 off-the-rack designer piece. Spend $15 on alterations and you've upgraded your entire wardrobe.

**2. Stick to a neutral palette** — When all your pieces share a color story (navy, cream, black, olive), every top works with every bottom. This creates the illusion of a giant wardrobe from 20 well-chosen pieces.

**3. Focus on shoe quality** — People subconsciously judge outfits by shoes. Invest in one quality pair of leather boots or sneakers. Everything else can be budget-friendly.

**4. Learn to thrift strategically** — Shop in affluent neighborhoods, focus on natural fibers (wool, linen, silk, cotton), and know which brands have consistent quality.

**5. Use technology** — AI fashion tools like Luxor (https://luxor.ly) help you generate new outfit combinations from clothes you already own. You'll discover dozens of looks you never realized were in your closet.

Style is a skill, not a budget. The most stylish people I know have the smallest wardrobes and the most creativity."""
    },
    {
        "url": "https://www.quora.com/What-should-I-wear-to-look-fashionable-every-day",
        "answer": """Looking fashionable every day is about creating a personal uniform—a signature look that makes decision-making effortless while still looking intentional. Here's my framework:

**Step 1: Define Your Formula** — Find a silhouette that works for you and stick to it. For example: high-waist bottom + fitted top + structured layer. Iterate this formula across seasons with different fabrics and colors.

**Step 2: The 80/20 Rule** — Let 80% of your wardrobe be versatile basics in complementary neutrals. Use 20% for personality pieces: a colorful scarf, statement bag, unique jewelry, or interesting shoes.

**Step 3: Invest in Key Pieces** — Spend money on items you wear daily and touch your skin: shoes, coats, bags, and denim. Save on trend-driven items and basics like t-shirts.

**Step 4: Master the Art of Grooming** — The most fashionable person in the room isn't wearing the most expensive outfit—they're the one who looks put together. Well-fitted clothes, clean shoes, intentional grooming, and confidence.

**Step 5: Use AI to Level Up** — Tools like Luxor (https://luxor.ly) analyze your body type, color palette, and existing wardrobe to generate daily outfit combinations. It's like having a personal stylist who knows your entire closet.

Fashionable doesn't mean trendy. It means intentional. Wear what makes you feel confident, and that confidence will always be the most fashionable thing about you."""
    }
]

def post_to_question(q_url, answer_text):
    """Post answer to a Quora question by navigating to it."""
    from playwright.sync_api import sync_playwright
    
    with open(COOKIES_FILE) as f:
        cookies = json.load(f)
    
    log(f"  Target: {q_url}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"])
        ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", viewport={"width": 1280, "height": 900})
        
        for c in cookies:
            try:
                ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".quora.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
            except: pass
        
        page = ctx.new_page()
        page.set_default_timeout(60000)
        
        # Go directly to /answer URL (opens editor if logged in)
        answer_url = q_url + "/answer"
        log(f"  Loading: {answer_url}")
        page.goto(answer_url, wait_until="domcontentloaded", timeout=60000)
        time.sleep(6)
        
        # Check for editor
        editor = page.evaluate("() => { const e = document.querySelector('[contenteditable=\"true\"]'); return e ? 'found' : 'not_found'; }")
        log(f"  Editor direct: {editor}")
        
        if editor == "not_found":
            # Go to question page instead
            log(f"  Trying question page...")
            page.goto(q_url, wait_until="domcontentloaded", timeout=60000)
            time.sleep(6)
            
            # Check for existing draft
            has_draft = page.evaluate("() => document.body.innerText.includes('answer draft')")
            log(f"  Has draft: {has_draft}")
            
            if has_draft:
                # Try to click "Click here" via text content
                try:
                    # Use Playwright's get_by_text
                    link = page.get_by_text("Click here", exact=False)
                    if link:
                        link.first.click(timeout=5000)
                        log("  Clicked 'Click here' draft link")
                        time.sleep(4)
                except:
                    pass
                
                editor = page.evaluate("() => { const e = document.querySelector('[contenteditable=\"true\"]'); return e ? 'found' : 'not_found'; }")
                log(f"  Editor after draft click: {editor}")
            
            if editor == "not_found":
                # Try clicking Answer button
                log("  Looking for Answer button...")
                result = page.evaluate("""() => {
                    // Find any button/link with 'answer' text
                    const els = document.querySelectorAll('button, a, div[role="button"]');
                    for (const el of els) {
                        const text = el.textContent.trim().toLowerCase();
                        if ((text === 'answer' || text.startsWith('answer')) && el.offsetParent !== null) {
                            const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
                            if (key && el[key] && el[key].onClick) { el[key].onClick({}); return 'react'; }
                            el.click(); return 'clicked';
                        }
                    }
                    return 'not_found';
                }""")
                log(f"  Answer button: {result}")
                time.sleep(4)
                
                editor = page.evaluate("() => { const e = document.querySelector('[contenteditable=\"true\"]'); return e ? 'found' : 'not_found'; }")
                log(f"  Editor after button: {editor}")
        
        if editor == "not_found":
            page.screenshot(path=f"/tmp/quora_no_editor.png", timeout=15000)
            log("  ❌ No editor available")
            browser.close()
            return False
        
        # Type answer
        log(f"  Typing {len(answer_text)} chars...")
        try:
            page.locator('[contenteditable="true"]').first.click()
            time.sleep(0.3)
            # Type in chunks for speed
            for i in range(0, len(answer_text), 150):
                page.keyboard.type(answer_text[i:i+150], delay=1)
            time.sleep(1)
        except Exception as e:
            log(f"  ⚠ Editor error: {e}")
            browser.close()
            return False
        
        page.screenshot(path=f"/tmp/quora_filled.png", timeout=15000)
        
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
        page.screenshot(path=f"/tmp/quora_done.png", timeout=15000)
        log(f"  URL: {page.url}")
        
        browser.close()
        return "answer" in page.url.lower()

def main():
    log("=" * 60)
    log("📝 Quora Fresh Poster")
    log("=" * 60)
    
    for i, q in enumerate(QUESTIONS):
        log(f"\n--- [{i+1}/3] ---")
        ok = post_to_question(q["url"], q["answer"])
        log(f"  {'✅' if ok else '❌'}")
        time.sleep(10)
    
    log("\n✅ Complete!")

if __name__ == "__main__":
    main()
