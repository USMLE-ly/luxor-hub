"""Inspect Quora editor for image upload capabilities."""
import json, time
from playwright.sync_api import sync_playwright

with open("cookies_quora_working.json") as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"])
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    
    from playwright_stealth import Stealth
    Stealth().apply_stealth_sync(page)
    
    for c in cookies:
        try:
            ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".quora.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
        except: pass
    
    # Go to search and click Answer to open editor
    page.goto("https://www.quora.com/search?q=dress+well+budget", wait_until="domcontentloaded", timeout=45000)
    time.sleep(6)
    
    # Click first Answer button to open editor
    page.evaluate("""() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
            if (btn.textContent.trim().toLowerCase() === 'answer' && btn.offsetParent !== null) {
                const key = Object.keys(btn).find(k => k.startsWith('__reactProps'));
                if (key && btn[key] && btn[key].onClick) { btn[key].onClick({}); }
                break;
            }
        }
    }""")
    time.sleep(5)
    
    # Now inspect the editor area
    print("=== Editor inspection ===")
    info = page.evaluate("""() => {
        const editor = document.querySelector('[contenteditable="true"]');
        if (!editor) return {error: 'no editor'};
        
        // Look for image-related elements nearby
        const parent = editor.closest('div[class]');
        
        // Find file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        // Find image/toolbar buttons
        const toolbarBtns = [];
        document.querySelectorAll('button, [role="button"]').forEach(b => {
            if (b.textContent.includes('Image') || b.textContent.includes('Picture') || 
                b.innerHTML.includes('image') || b.innerHTML.includes('camera') ||
                b.getAttribute('aria-label')?.includes('image') ||
                b.getAttribute('aria-label')?.includes('photo')) {
                toolbarBtns.push({
                    text: b.textContent.trim().substring(0, 30),
                    ariaLabel: b.getAttribute('aria-label') || '',
                    testid: b.getAttribute('data-testid') || '',
                    tag: b.tagName
                });
            }
        });
        
        return {
            editorTag: editor.tagName,
            editorAttrs: editor.getAttributeNames().reduce((o, n) => { o[n] = editor.getAttribute(n); return o; }, {}),
            parentClass: parent?.className?.substring(0, 100),
            fileInputs: Array.from(fileInputs).map(f => ({
                accept: f.getAttribute('accept'),
                multiple: f.multiple,
                parent: f.parentElement?.tagName
            })),
            toolbarBtns: toolbarBtns,
            // Get all buttons in the editor area
            allBtns: Array.from(document.querySelectorAll('button')).slice(0, 30).map(b => ({
                text: b.textContent.trim().substring(0, 20),
                aria: b.getAttribute('aria-label') || '',
                testid: b.getAttribute('data-testid') || '',
                visible: b.offsetParent !== null
            }))
        };
    }""")
    print(json.dumps(info, indent=2)[:2000])
    
    page.screenshot(path="/tmp/quora_editor.png")
    print("\nScreenshot saved")
    browser.close()
