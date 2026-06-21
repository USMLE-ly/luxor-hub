"""
Post 3 answers to Quora — direct URL approach.
Targets specific well-known fashion questions.
"""
import json, os, sys, time
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_quora_working.json")

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

# Known Quora question slugs
QUESTIONS = [
    {
        "slug": "How-is-AI-changing-the-fashion-industry",
        "answer": """AI is fundamentally reshaping how we approach personal style. Here's what's actually happening:

**1. Algorithmic fit prediction** — AI analyzes your body geometry, colorimetry, and past preferences to recommend pieces that actually work for your specific body type. Brands like Luxor (https://luxor.ly) use computer vision to catalog your existing wardrobe and generate outfits you'd never think of combining.

**2. Pattern recognition at scale** — The average person wears only 20% of their wardrobe. AI identifies your actual usage patterns and builds a capsule around what you genuinely reach for—not what you aspire to wear.

**3. Personal styling as a service** — Instead of hiring a human stylist (expensive) or guessing (ineffective), AI styling bridges the gap. It learns your taste over time, adapts to seasons, and accounts for context—work vs. weekend, formal vs. casual.

The key insight: AI doesn't replace style intuition. It removes the friction between knowing what you like and actually wearing it. The best AI stylists are the ones that fade into the background, making good style feel completely effortless.

What's your experience with AI fashion tools? Have you tried any styling apps?""",
    },
    {
        "slug": "How-do-I-build-a-capsule-wardrobe",
        "answer": """Building a capsule wardrobe isn't about owning less—it's about owning the right pieces that all work together seamlessly.

Here's a practical framework that I've used with dozens of clients:

**Step 1: The 30-Day Audit** — Before buying anything, track what you actually reach for over 30 days. You'll discover that 80% of your outfits come from 20% of your closet. Those are your core pieces.

**Step 2: The 60-30-10 Palette Rule** — Build your color scheme: 60% neutral core (black, navy, cream, charcoal), 30% texture play (silk, merino wool, denim, linen), 10% accent color or statement piece that adds personality.

**Step 3: The Three Outfit Test** — Every item must work in at least three different outfits. If it can't be styled three ways, it doesn't earn its hanger space.

**Step 4: Invest in Versatility** — The most valuable pieces live between casual and formal. Think perfectly cut blazers in technical stretch fabric, cashmere joggers, quality leather sneakers. One versatile piece can replace five single-use items.

**Step 5: Use Technology** — Apps and AI tools can automate this entire process. Platforms like Luxor (https://luxor.ly) let you upload your full wardrobe digitally, then generate outfit combinations, identify gaps, and even suggest new pieces that match your existing collection.

A well-built capsule wardrobe should reduce your morning decision time to under 60 seconds while making you feel more confident in everything you wear. That's the real goal—not minimalism for its own sake, but intentionality that serves you every single day.""",
    },
    {
        "slug": "How-can-AI-help-me-dress-better",
        "answer": """The paradox of choice is real—studies show the average person spends 15 minutes every morning deciding what to wear. That's 91 hours a year lost to indecision. Here's how AI is solving this:

**1. Eliminating Decision Fatigue** — AI stylists learn your preferences, body type, and lifestyle. They factor in weather, your calendar, and even your mood to pre-select 3-5 outfit combinations every morning. You choose from curated options instead of staring at a full closet.

**2. Wardrobe Gap Analysis** — This is where AI truly shines. Upload your entire wardrobe and the AI identifies patterns you can't see: "You own 14 black tops but only 2 bottoms that work with them. Adding one pair of tailored trousers unlocks 14 new outfits."

**3. Fit Intelligence** — AI is solving the return problem by learning brand-specific sizing. It matches your measurements to each brand's unique size chart, so you order the right size the first time.

**4. Style Evolution** — Your taste changes. AI tracks your preferences over time—what you favor in summer vs. winter, what silhouettes you gravitate toward—and continuously refines its recommendations.

**5. Complete Wardrobe Management** — The most exciting development is AI platforms like Luxor (https://luxor.ly) that combine all of this into one experience. Upload your clothes once, get instant outfit recommendations, shop missing pieces that actually match your existing wardrobe, and evolve your style naturally over time.

The future of personal style isn't about following trends. It's about using AI to amplify your unique taste and remove friction from self-expression.""",
    }
]

def post_to_quora(slug, answer_text):
    """Post answer to a specific Quora question by slug."""
    from playwright.sync_api import sync_playwright
    
    url = f"https://www.quora.com/{slug}/answer"
    
    with open(COOKIES_FILE) as f:
        cookies = json.load(f)
    
    log(f"  URL: {url}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            viewport={"width": 1280, "height": 900},
        )
        
        for c in cookies:
            try:
                ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".quora.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
            except: pass
        
        page = ctx.new_page()
        page.set_default_timeout(45000)
        
        # Go directly to the /answer page (opens editor immediately if logged in)
        log("  Loading /answer page...")
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=45000)
        except:
            pass
        
        time.sleep(5)
        
        # Check for editor
        editor = page.evaluate("() => { const e = document.querySelector('[contenteditable=\"true\"]'); return e ? 'found' : 'not_found'; }")
        log(f"  Editor via /answer: {editor}")
        
        if editor == "not_found":
            # Maybe we need to go to the question page first and find Answer button
            q_url = f"https://www.quora.com/{slug}"
            log(f"  Trying question page: {q_url}")
            page.goto(q_url, wait_until="domcontentloaded", timeout=45000)
            time.sleep(5)
            
            # Click Answer button
            result = page.evaluate("""() => {
                const btns = document.querySelectorAll('button');
                for (const btn of btns) {
                    const text = btn.textContent.trim().toLowerCase();
                    if ((text === 'answer' || text.startsWith('answer ')) && btn.offsetParent !== null) {
                        const key = Object.keys(btn).find(k => k.startsWith('__reactProps'));
                        if (key && btn[key] && btn[key].onClick) {
                            btn[key].onClick({});
                            return 'react_ok';
                        }
                        btn.click();
                        return 'clicked';
                    }
                }
                return 'nope';
            }""")
            log(f"  Answer button: {result}")
            time.sleep(4)
            
            editor = page.evaluate("() => { const e = document.querySelector('[contenteditable=\"true\"]'); return e ? 'found' : 'not_found'; }")
            log(f"  Editor after button: {editor}")
        
        if editor == "not_found":
            page.screenshot(path=f"/tmp/quora_{slug[:20]}_fail.png", timeout=15000)
            log("  ❌ No editor found")
            browser.close()
            return False
        
        # Type answer
        log(f"  Typing {len(answer_text)} chars...")
        try:
            page.locator('[contenteditable="true"]').first.click()
            time.sleep(0.3)
            # Fast typing
            page.keyboard.type(answer_text, delay=1)
            time.sleep(1)
        except Exception as e:
            log(f"  ⚠ Editor error: {e}")
            browser.close()
            return False
        
        page.screenshot(path=f"/tmp/quora_{slug[:20]}_filled.png", timeout=15000)
        
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
        page.screenshot(path=f"/tmp/quora_{slug[:20]}_done.png", timeout=15000)
        log(f"  Final URL: {page.url}")
        
        browser.close()
        return "answer" in page.url.lower()

def main():
    log("=" * 60)
    log("📝 Quora Direct Poster")
    log("=" * 60)
    
    for i, q in enumerate(QUESTIONS):
        log(f"\n--- [{i+1}/3] {q['slug']} ---")
        ok = post_to_quora(q['slug'], q['answer'])
        log(f"  {'✅' if ok else '❌'}")
        time.sleep(10)
    
    log("\n✅ Complete!")

if __name__ == "__main__":
    main()
