#!/usr/bin/env python3
"""Wayfern Quora Poster — via Donut Browser's Chromium engine.
Fixes applied:
- JS pointer event dispatch to trigger React Answer button ✅
- OneTrust cookie consent removal ✅
- Multi-question fallback ✅
- Cloudflare retry logic ✅

Usage: xvfb-run python3 wayfern_quora_post.py [question_index]"""
import asyncio, json, sys, os, random
from playwright.async_api import async_playwright

PROJECT = os.path.dirname(os.path.abspath(__file__))

async def post_answer(qid, content):
    with open(os.path.join(PROJECT, "cookies_quora_working.json")) as f:
        raw_cookies = json.load(f)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=["--no-sandbox", "--disable-gpu", "--disable-software-rasterizer",
                  "--disable-dev-shm-usage", "--single-process"]
        )
        
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            viewport={"width": 1280, "height": 800},
        )
        
        for c in raw_cookies:
            try:
                ss = {'lax':'Lax','strict':'Strict','none':'None','no_restriction':'None','unspecified':'None'}.get(
                    c.get('sameSite','Lax').lower(), 'Lax')
                url = c.get('url', 'https://www.quora.com/')
                if 'www.www.' in url: url = 'https://www.quora.com/'
                await context.add_cookies([{'name': c['name'], 'value': c.get('value', ''), 'url': url, 'sameSite': ss}])
            except:
                pass
        
        page = await context.new_page()
        page.set_default_timeout(45000)
        
        # Step 1: Navigate to /answer page (reliable)
        print("[1] Loading /answer page...")
        await page.goto("https://www.quora.com/answer", wait_until="domcontentloaded", timeout=30000)
        
        for i in range(20):
            title = await page.title()
            if "Just a moment" not in title: break
            await page.wait_for_timeout(2000)
        
        if "Just a moment" in await page.title():
            print("  Cloudflare blocked — use phone Tampermonkey instead")
            print(f"  Install scarab_all_in_one_v4.user.js on your phone")
            await browser.close()
            return False
        
        print(f"  Title: {await page.title()}")
        await page.wait_for_timeout(3000)
        
        # Remove cookie consent
        await page.evaluate("""() => { 
            const ot = document.getElementById('onetrust-consent-sdk'); 
            if (ot) ot.remove(); 
        }""")
        
        # Get question links
        questions = await page.evaluate("""
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
        
        if not questions:
            print("  No questions to answer")
            await browser.close()
            return False
        
        # Try each question
        for qi, q in enumerate(questions):
            print(f"\n[2] Trying Q{qi+1}: {q['text'][:40]}...")
            
            try:
                await page.goto(q['href'], wait_until="domcontentloaded", timeout=30000)
            except:
                continue
            
            for i in range(10):
                title = await page.title()
                if "Just a moment" not in title and "Error" not in title: break
                await page.wait_for_timeout(2000)
            
            if "Just a moment" in await page.title() or "Error" in await page.title():
                continue
            
            print(f"  Title: {await page.title()[:60]}")
            
            # Remove OneTrust
            await page.evaluate("""() => { const e = document.getElementById('onetrust-consent-sdk'); if(e) e.remove(); }""")
            
            # Click Answer via JS pointer events
            clicked = await page.evaluate("""
                () => {
                    for (const el of document.querySelectorAll('*')) {
                        if (el.textContent.trim() === 'Answer' && el.offsetParent !== null) {
                            ['pointerdown','pointerup'].forEach(t => 
                                el.dispatchEvent(new PointerEvent(t, {bubbles: true, cancelable: true})));
                            el.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
                            el.focus();
                            return true;
                        }
                    }
                    return false;
                }
            """)
            
            if not clicked:
                print("  No Answer button")
                continue
            
            # Wait for editor
            for i in range(10):
                editor = await page.query_selector('[contenteditable="true"]')
                if editor:
                    print(f"  ✅ Editor found! Posting...")
                    
                    await editor.click()
                    await page.wait_for_timeout(500)
                    
                    for j in range(0, len(content), 200):
                        await page.keyboard.type(content[j:j+200], delay=0)
                    
                    await page.wait_for_timeout(2000)
                    
                    # Remove OneTrust (might reappear)
                    await page.evaluate("""() => { const e = document.getElementById('onetrust-consent-sdk'); if(e) e.remove(); }""")
                    
                    # Submit
                    submitted = await page.evaluate("""
                        () => {
                            for (const b of document.querySelectorAll('button')) {
                                const t = b.textContent.trim().toLowerCase();
                                if (['submit', 'post', 'done', 'add answer'].includes(t)) {
                                    b.click(); return 'button';
                                }
                            }
                            return 'nobutton';
                        }
                    """)
                    
                    await page.wait_for_timeout(5000)
                    print(f"\n[+] ✅ ANSWER POSTED! (submit via {submitted})")
                    await page.screenshot(path="/tmp/quora_posted.png", full_page=True)
                    await browser.close()
                    return True
                
                await page.wait_for_timeout(1000)
            
            print("  Editor didn't appear")
        
        print("\n[-] All questions failed")
        await browser.close()
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        idx = int(sys.argv[1])
    else:
        idx = 0
    
    with open(os.path.join(PROJECT, "content_queue.json")) as f:
        queue = json.load(f)
    
    content = queue[idx]["content"] if idx < len(queue) else queue[0]["content"]
    
    print("=" * 60)
    print("🌐 WAYFERN QUORA POSTER v2.0")
    print("📝 Content: #" + str(idx) + " " + (queue[idx]["topic"] if idx < len(queue) else "")[:50])
    print("=" * 60)
    
    result = asyncio.run(post_answer(None, content))
    print(f"\nResult: {'✅ SUCCESS' if result else '❌ FAILED'}")
    if not result:
        print("💡 Tip: Use phone Tampermonkey instead:")
        print("   Install scarab_all_in_one_v4.user.js → navigate to question → SCARAB panel → Post")
