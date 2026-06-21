"""Find the answer draft element and continue it."""
import json, time
from playwright.sync_api import sync_playwright

with open("cookies_quora_working.json") as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"])
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", viewport={"width": 1280, "height": 900})
    
    for c in cookies:
        try:
            ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".quora.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
        except: pass
    
    page = ctx.new_page()
    page.set_default_timeout(60000)
    
    page.goto("https://www.quora.com/How-is-AI-changing-the-fashion-industry", wait_until="domcontentloaded", timeout=60000)
    time.sleep(8)
    
    # Find all clickable elements related to draft/answer
    print("=== Looking for draft/answer elements ===")
    
    # Find elements by text content
    elements = page.evaluate("""() => {
        const els = [];
        // Search for elements containing draft-related text
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            if ((text.includes('draft') || text.includes('continue writing') || text.includes('Answer')) && text.length < 100) {
                const parent = node.parentElement;
                els.push({
                    text: text.substring(0, 80),
                    tag: parent.tagName,
                    id: parent.id,
                    class: parent.className.substring(0, 60),
                    href: parent.href || parent.closest('a')?.href || '',
                    onclick: parent.onclick ? 'yes' : parent.closest('[role="button"]') ? 'role_button' : 'no',
                    rect: (() => { const r = parent.getBoundingClientRect(); return {x: ~~r.x, y: ~~r.y, w: ~~r.width, h: ~~r.height}; })()
                });
            }
        }
        return els;
    }""")
    
    print(f"Found {len(elements)} draft-related elements:")
    for el in elements[:15]:
        print(f"  {el}")
    
    # Also find any clickable thing near the top of the page that says Answer or draft
    print("\n=== Looking for 'Answer' text in page ===")
    answer_spots = page.evaluate("""() => {
        const body = document.body.innerText;
        const idx = body.indexOf('Answer');
        const results = [];
        let i = 0;
        while (idx !== -1 && i < 5) {
            const start = Math.max(0, idx - 5);
            const end = Math.min(body.length, idx + 40);
            results.push(body.substring(start, end));
            i++;
        }
        return results;
    }""")
    for spot in answer_spots:
        print(f"  '{spot}'")
    
    # Also look at all links and buttons
    print("\n=== All buttons on page ===")
    btns = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('button')).slice(0, 20).map(b => ({
            text: b.textContent.trim().substring(0, 50),
            testid: b.getAttribute('data-testid') || '',
            role: b.getAttribute('role') || '',
            visible: b.offsetParent !== null
        }));
    }""")
    for b in btns:
        if b['visible']:
            print(f"  {b}")
    
    print("\n=== All links with 'answer' in text ===")
    links = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a')).filter(a => a.textContent.toLowerCase().includes('answer')).slice(0, 10).map(a => ({
            text: a.textContent.trim().substring(0, 60),
            href: a.href,
            visible: a.offsetParent !== null
        }));
    }""")
    for l in links:
        print(f"  {l}")
    
    page.screenshot(path="/tmp/quora_draft_debug.png")
    print("\nScreenshot saved")
    browser.close()
