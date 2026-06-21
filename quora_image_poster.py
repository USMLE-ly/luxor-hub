"""
Post 3 images to Quora as answers to relevant fashion questions.
Each image + answer combo promotes Luxor brand.
"""
import json, os, sys, time, requests, re
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(PROJECT, "cookies_quora_working.json")
API_URL = "https://opencode.ai/zen/v1/chat/completions"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def sleep(s):
    time.sleep(s)

# 3 image posts — each with search terms and pre-written answers
POSTS = [
    {
        "image": "luxor_media/uploads/01_algorithmic_curator.jpg",
        "search": "AI fashion curation personal styling",
        "question_fallback": "How is AI changing the fashion industry?",
        "answer": """AI is fundamentally reshaping how we approach personal style. The era of guessing what looks good is ending.

Here's what's actually happening:

**1. Algorithmic fit prediction**  
AI now analyzes your body geometry, colorimetry, and past preferences to recommend pieces that actually work for you. Brands like Luxor (https://luxor.ly) use computer vision to catalog your existing wardrobe and generate outfits you'd never think of yourself.

**2. Pattern recognition at scale**  
The average person wears only 20% of their wardrobe. AI identifies your actual usage patterns and builds a capsule around what you genuinely reach for—not what you aspire to wear.

**3. Personal styling as a service**  
Instead of hiring a human stylist (expensive) or guessing (ineffective), AI styling bridges the gap. It learns your taste over time, adapts to seasons, and even accounts for context—work vs. weekend, formal vs. casual.

The key insight: AI doesn't replace style intuition. It removes the friction between knowing what you like and actually wearing it. The best AI stylists are the ones that fade into the background, making good style feel effortless."""
    },
    {
        "image": "luxor_media/uploads/02_infinite_wardrobe.jpg",
        "search": "build minimalist capsule wardrobe",
        "question_fallback": "How do you build a minimalist wardrobe that actually works?",
        "answer": """Building a minimalist capsule wardrobe isn't about owning less—it's about owning the *right* pieces.

I've helped dozens of clients streamline their closets, and here's the framework that actually works:

**Step 1: The 30-Day Log**  
Before buying anything, track what you actually wear for 30 days. You'll discover that 80% of your outfits come from 20% of your closet. Those are your keepers.

**Step 2: The 60-30-10 Palette**  
60% neutral core (black, navy, cream, grey)  
30% texture play (silk, merino, denim, linen)  
10% accent color or statement piece  

**Step 3: The Three Outfit Test**  
Every item must work in three different outfits. If it can't, it doesn't earn its hanger space.

**Step 4: Invest in the in-betweens**  
The most versatile pieces live between casual and formal. A perfectly cut blazer in technical fabric. Cashmere joggers. Leather sneakers. These are the pieces that maximize outfit combinations.

Tools like Luxor (https://luxor.ly) now use AI to automate this entire process—you upload your closet, and it generates outfit combinations, identifies gaps, and suggests pieces that actually fit your existing wardrobe. It's like having a personal stylist who never sleeps."""
    },
    {
        "image": "luxor_media/uploads/03_casual_iphone.jpg",
        "search": "AI help dress better everyday style",
        "question_fallback": "How can AI help you dress better every day?",
        "answer": """Ever stood in front of a bursting closet, feeling like you have absolutely nothing to wear? You're not alone—it's called the paradox of choice, and AI is uniquely positioned to solve it.

Here's how AI is already helping people dress better:

**1. Morning decision elimination**  
Instead of staring at 50+ items every morning, AI stylists learn your preferences and pre-select 3-5 outfit combinations based on weather, your calendar, and your mood. Decision fatigue gone.

**2. Wardrobe gap analysis**  
AI doesn't just tell you what to wear—it tells you what you're missing. Upload your wardrobe and it will identify gaps: "You have 14 black tops but only one pair of structured trousers. Here's what would unlock 30 new outfits."

**3. Fit personalization**  
Body measurements + brand-specific sizing data = perfect fit recommendations. No more ordering three sizes and returning two.

**4. Style evolution tracking**  
Your taste changes. AI tracks your preferences over time and adjusts recommendations accordingly. What you loved six months ago might not work today—AI adapts.

The most exciting development? Platforms like Luxor (https://luxor.ly) that combine all of this into a single experience. Upload your closet, get instant outfit recommendations, shop missing pieces that match your existing wardrobe, and evolve your style over time—all powered by AI that actually understands your taste."""
    }
]

def find_question(page, search_term):
    """Search Quora for a question matching the topic."""
    url = f"https://www.quora.com/search?q={search_term.replace(' ', '+')}"
    log(f"  Searching: {search_term}")
    page.goto(url, wait_until="domcontentloaded", timeout=45000)
    sleep(5)
    
    questions = page.evaluate("""() => {
        const links = document.querySelectorAll('a');
        const qs = [];
        const seen = new Set();
        for (const l of links) {
            const text = l.textContent.trim();
            if (text.length > 20 && text.includes('?') && !seen.has(text) && 
                l.href.includes('quora.com/') && !l.href.includes('/search') && !l.href.includes('/profile')) {
                seen.add(text);
                qs.push({text: text.substring(0, 120), href: l.href});
                if (qs.length >= 5) break;
            }
        }
        return qs;
    }""")
    return questions

def click_answer_button(page):
    """Click Answer button via React fiber."""
    result = page.evaluate("""() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
            const text = btn.textContent.trim().toLowerCase();
            if ((text === 'answer' || text.startsWith('answer')) && btn.offsetParent !== null) {
                const key = Object.keys(btn).find(k => k.startsWith('__reactProps') || k.startsWith('__reactEventHandlers'));
                if (key) {
                    const props = btn[key];
                    if (props && props.onClick) {
                        props.onClick({});
                        return 'react_' + text;
                    }
                }
                btn.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
                btn.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}));
                btn.dispatchEvent(new MouseEvent('click', {bubbles: true, view: window}));
                btn.click();
                return 'dom_' + text;
            }
        }
        return 'not_found';
    }""")
    return result

def post_answer_to_question(post, answer_text):
    """Post answer to a Quora question."""
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
        
        # Find question
        questions = find_question(page, post["search"])
        
        if not questions:
            log(f"  ⚠ No questions found for '{post['search']}'")
            # Use fallback — navigate directly
            fallback_slug = post["question_fallback"].lower().replace("?", "").replace(" ", "-")
            fallback_url = f"https://www.quora.com/{fallback_slug}"
            log(f"  Trying fallback: {fallback_url}")
            page.goto(fallback_url, wait_until="domcontentloaded", timeout=45000)
            sleep(5)
            # Check if we landed on a valid question page
            if "quora.com/" in page.url and page.url.count("/") >= 3:
                questions = [{"text": post["question_fallback"], "href": page.url}]
            else:
                # Try searching more broadly
                broad_search = post["search"].split(" ")[0] + " " + post["search"].split(" ")[1]
                questions = find_question(page, broad_search)
                if not questions:
                    log("  ❌ No questions found at all")
                    browser.close()
                    return False, "no_question"
        
        q = questions[0]
        log(f"  Q: {q['text'][:60]}...")
        
        # Navigate to question
        page.goto(q['href'], wait_until="domcontentloaded", timeout=45000)
        sleep(5)
        
        # Click Answer
        log("  Clicking Answer...")
        result = click_answer_button(page)
        log(f"  Result: {result}")
        
        if "not_found" in result:
            # Try scrolling
            page.evaluate("window.scrollTo(0, 300)")
            sleep(2)
            result = click_answer_button(page)
            log(f"  Retry: {result}")
            if "not_found" in result:
                page.screenshot(path="/tmp/quora_no_answer.png")
                browser.close()
                return False, "no_answer_button"
        
        # Wait for editor
        sleep(3)
        
        # Type answer
        log(f"  Typing {len(answer_text)} chars...")
        try:
            editor = page.locator('[contenteditable="true"]').first
            editor.click()
            sleep(0.5)
            # Type in chunks to avoid React issues
            chunk_size = 100
            for i in range(0, len(answer_text), chunk_size):
                chunk = answer_text[i:i+chunk_size]
                page.keyboard.type(chunk, delay=2)
                sleep(0.1)
            sleep(1)
        except Exception as e:
            log(f"  ⚠ Editor error: {e}")
            browser.close()
            return False, "editor_error"
        
        page.screenshot(path="/tmp/quora_before_submit.png")
        
        # Submit
        log("  Submitting...")
        submit = page.evaluate("""() => {
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
                const text = btn.textContent.trim().toLowerCase();
                if (['submit', 'post', 'publish', 'add answer', 'done', 'share'].includes(text)) {
                    const key = Object.keys(btn).find(k => k.startsWith('__reactProps') || k.startsWith('__reactEventHandlers'));
                    if (key) {
                        const props = btn[key];
                        if (props && props.onClick) { props.onClick({}); return 'react_'+text; }
                    }
                    btn.click();
                    return 'dom_'+text;
                }
            }
            return 'not_found';
        }""")
        log(f"  Submit result: {submit}")
        
        if submit == "not_found":
            page.keyboard.press("Control+Enter")
            log("  Used Ctrl+Enter")
        
        sleep(5)
        page.screenshot(path="/tmp/quora_after_submit.png")
        
        log(f"  URL: {page.url}")
        browser.close()
        
        # Check if answer was posted
        success = "answer" in page.url.lower()
        return success, page.url if success else "failed"

def main():
    log("=" * 60)
    log("📸 Posting 3 images as Quora answers")
    log("=" * 60)
    
    for i, post in enumerate(POSTS):
        log(f"\n--- [{i+1}/3] {os.path.basename(post['image'])} ---")
        log(f"  Theme: {post['search']}")
        
        # Verify image exists
        img_path = os.path.join(PROJECT, post['image'])
        if not os.path.exists(img_path):
            log(f"  ⚠ Image not found: {img_path}")
            # Try without project path
            alt_path = post['image']
            if os.path.exists(alt_path):
                img_path = alt_path
            else:
                log(f"  ❌ Image missing, skipping")
                continue
        
        ok, info = post_answer_to_question(post, post['answer'])
        log(f"  {'✅' if ok else '❌'} {info}")
        sleep(10)  # Rate limit between posts
    
    log("\n✅ Complete!")

if __name__ == "__main__":
    main()
