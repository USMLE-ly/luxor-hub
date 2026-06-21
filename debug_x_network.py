"""Debug X network request when clicking Post."""
import json, time
from playwright.sync_api import sync_playwright

with open("cookies_x.json") as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--single-process","--disable-software-rasterizer"])
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36", viewport={"width": 1280, "height": 900})
    
    for c in cookies:
        try:
            ctx.add_cookies([{"name":c["name"],"value":str(c.get("value","")),"domain":c.get("domain",".x.com"),"path":c.get("path","/"),"secure":c.get("secure",False),"httpOnly":c.get("httpOnly",False),"sameSite":"Lax"}])
        except: pass
    
    page = ctx.new_page()
    page.set_default_timeout(60000)
    
    # Capture API requests
    api_requests = []
    def on_request(request):
        url = request.url
        if "graphql" in url and "CreateTweet" in url:
            api_requests.append({
                "url": url,
                "method": request.method,
                "headers": dict(request.headers),
                "post_data": request.post_data
            })
            print(f"\n📡 CreateTweet request captured!")
            print(f"  URL: {url[:100]}")
    
    page.on("request", on_request)
    
    page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=60000)
    
    for i in range(20):
        body = page.evaluate("() => document.body?.innerText || ''")
        if "Home" in body and len(body) > 100:
            print(f"Rendered {i+1}s")
            break
        time.sleep(1)
    
    page.click('[data-testid="SideNav_NewTweet_Button"]', timeout=10000)
    
    for i in range(10):
        c = page.evaluate("() => { const e = document.querySelector('[data-testid=\"tweetTextarea_0\"]'); return e && e.offsetParent !== null; }")
        if c:
            print(f"Composer {i+1}s")
            break
        time.sleep(1)
    
    # Type
    page.click('[data-testid="tweetTextarea_0"]')
    time.sleep(0.3)
    page.keyboard.type("Debug network test from Luxor AI. Checking API calls. #Debug", delay=5)
    time.sleep(2)
    
    # Click Post
    print("Clicking Post...")
    btn = page.query_selector('[data-testid="tweetButton"]')
    if btn:
        btn.click(force=True)
    
    time.sleep(5)
    
    print(f"\nAPI requests captured: {len(api_requests)}")
    if api_requests:
        r = api_requests[0]
        print(f"URL: {r['url']}")
        # Redact sensitive headers
        safe_headers = {k:v for k,v in r['headers'].items() if k not in ['authorization', 'cookie', 'x-csrf-token']}
        print(f"Method: {r['method']}")
        print(f"Headers: {json.dumps(safe_headers, indent=2)[:500]}")
        print(f"Post data: {r['post_data'][:500] if r['post_data'] else 'None'}")
    else:
        print("No CreateTweet API call detected!")
        # Check all graphql calls
        all_requests = []
        def check_all(req):
            if "graphql" in req.url:
                all_requests.append(req.url[:120])
        page.remove_listener("request", on_request)
        ctx.on("request", check_all)
        page.reload(wait_until="domcontentloaded")
        time.sleep(5)
        print(f"All graphql URLs seen: {all_requests[:5]}")
    
    page.screenshot(path="/tmp/x_network_debug.png")
    browser.close()
