#!/usr/bin/env python3
"""SCARAB CONTROLLER v2.0 — ZORG-Ω / SHANNON-Ω with Turnstile Bypass."""
import sys, os, asyncio, argparse, json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "scarab_engine"))

from scarab_engine import (
    SessionManager, CookieInjector, ContentGenerator,
    TampermonkeyBridge, CaptchaSolver,
    TurnstileSolver, FlareSolverrClient, QuoraBypassPipeline,
)

async def do_post_x(args):
    mgr = SessionManager(headless=True)
    await mgr.start()
    injector = CookieInjector(mgr)
    await injector.inject_x()
    page = await mgr.get_page()
    gen = ContentGenerator()
    content = args.content or gen.generate_x_post(args.topic)
    
    await page.goto("https://x.com/home", wait_until="domcontentloaded", timeout=30000)
    await page.wait_for_timeout(5000)
    
    composer = await page.query_selector('[data-testid="SideNav_NewTweet_Button"]')
    if composer:
        await composer.click()
        await page.wait_for_timeout(3000)
    
    editor = await page.query_selector('[data-testid="tweetTextarea_0"]')
    if editor:
        await editor.click()
        await page.keyboard.type(content, delay=5)
        await page.wait_for_timeout(2000)
        btn = await page.query_selector('[data-testid="tweetButton"]')
        if btn:
            await btn.click(force=True)
            print("[+] Tweet posted!")
        else:
            await page.keyboard.press("Control+Enter")
            print("[+] Tweet posted (Ctrl+Enter)")
    else:
        print("[-] Editor not found")
    
    await mgr.close()


async def do_post_quora_v1(args):
    """Legacy Quora post - uses Playwright + cookie injection."""
    print("[*] Using legacy Quora post method...")
    mgr = SessionManager(headless=False)  # Non-headless for Cloudflare
    await mgr.start()
    injector = CookieInjector(mgr)
    await injector.inject_quora()
    page = await mgr.get_page()
    gen = ContentGenerator()
    topic = args.topic
    content = args.content or gen.generate_quora_answer(topic)
    
    await page.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        window.chrome = { runtime: {} };
    """)
    
    question_url = f"https://www.quora.com/{topic.replace(' ', '-')}"
    await page.goto(question_url, wait_until="domcontentloaded", timeout=30000)
    await page.wait_for_timeout(10000)
    
    for _ in range(10):
        title = await page.title()
        if "Just a moment" not in title:
            break
        await page.wait_for_timeout(3000)
    
    answer_btn = await page.query_selector('button:has-text("Answer")')
    if answer_btn:
        await answer_btn.click()
        await page.wait_for_timeout(3000)
    
    editor = await page.query_selector('[contenteditable="true"]')
    if editor:
        await editor.click()
        await page.keyboard.type(content, delay=3)
        await page.wait_for_timeout(2000)
        for text in ["Submit", "Post"]:
            sb = await page.query_selector(f'button:has-text("{text}")')
            if sb:
                await sb.click(force=True)
                print(f"[+] Quora answer posted!")
                break
        else:
            await page.keyboard.press("Control+Enter")
            print("[+] Quora answer posted (Ctrl+Enter)")
    else:
        print("[-] Editor not found")
    
    await mgr.close()


async def do_post_quora_v2(args):
    """New Quora post method: FlareSolverr + Turnstile + Playwright."""
    print("[*] Using Turnstile bypass pipeline...")
    pipe = QuoraBypassPipeline(api_key=os.environ.get("CAPTCHA_API_KEY", ""))
    
    gen = ContentGenerator()
    topic = args.topic
    content = args.content or gen.generate_quora_answer(topic)
    
    # Check if it's a question URL or a topic
    if args.topic.startswith("http"):
        question_url = args.topic
    else:
        question_url = f"https://www.quora.com/{topic.replace(' ', '-')}"
    
    success = await pipe.post_answer(question_url, content, xvfb=True)
    
    if success:
        print("[+] Quora answer posted via bypass pipeline!")
    else:
        print("[-] Bypass pipeline failed, trying legacy method...")
        await do_post_quora_v1(args)


async def do_post_quora(args):
    """Smart Quora post: try v2 (bypass) first, fallback to v1 (legacy)."""
    if os.environ.get("FLARESOLVERR_URL") or args.flaresolverr:
        await do_post_quora_v2(args)
    else:
        await do_post_quora_v1(args)


async def do_flare_cookies(args):
    """Fetch Quora cookies via FlareSolverr."""
    flare = FlareSolverrClient()
    output = args.output or None
    try:
        path = flare.save_cookies_file(url="https://www.quora.com", output=output)
        print(f"[+] FlareSolverr cookies saved to {path}")
    except Exception as e:
        print(f"[-] FlareSolverr failed: {e}")
        print("[*] Try: pip install flaresolverr && flaresolverr &")


async def do_quora_pipeline(args):
    """Run the full Quora bypass pipeline on a question."""
    pipe = QuoraBypassPipeline(api_key=os.environ.get("CAPTCHA_API_KEY", ""))
    
    # Get content
    if args.file:
        with open(args.file) as f:
            content = f.read()
    elif args.topic:
        gen = ContentGenerator()
        content = gen.generate_quora_answer(args.topic)
    else:
        print("[-] Need --topic or --file")
        return
    
    # Build URL
    if args.question_url:
        url = args.question_url
    elif args.topic:
        url = f"https://www.quora.com/{args.topic.replace(' ', '-')}"
    else:
        print("[-] Need --question-url or --topic")
        return
    
    success = await pipe.post_answer(url, content, xvfb=not args.headless)
    print(f"\n{'[+] Pipeline succeeded!' if success else '[-] Pipeline failed.'}")


def do_gen_content(args):
    gen = ContentGenerator()
    for i in range(args.count):
        if args.platform == "quora":
            content = gen.generate_quora_answer(args.topic)
            fname = f"quora_answer_{args.topic.replace(' ','_')}_{i}.txt"
        else:
            content = gen.generate_x_post(args.topic)
            fname = f"x_post_{args.topic.replace(' ','_')}_{i}.txt"
        with open(PROJECT_ROOT / fname, "w") as f:
            f.write(content)
        print(f"[+] Saved {fname}")


def do_gen_script(args):
    bridge = TampermonkeyBridge()
    output = args.output or str(PROJECT_ROOT / "scarab_automation.user.js")
    path = bridge.save_script(output)
    print(f"[+] Tampermonkey script saved: {path}")


async def do_inject_cookies(args):
    mgr = SessionManager()
    await mgr.start()
    injector = CookieInjector(mgr)
    if args.platform in ("quora", "all"):
        await injector.inject_quora()
    if args.platform in ("x", "all"):
        await injector.inject_x()
    await mgr.close()


async def do_session_refresh(args):
    mgr = SessionManager(headless=False)
    await mgr.start()
    if args.platform in ("quora", "all"):
        page = await mgr.get_page()
        await page.goto("https://www.quora.com")
        input("[*] Refresh Quora cookies then press Enter...")
        mgr.save_cookies("quora")
    if args.platform in ("x", "all"):
        page = await mgr.get_page()
        await page.goto("https://x.com/home")
        input("[*] Refresh X cookies then press Enter...")
        mgr.save_cookies("x")
    await mgr.close()


async def do_solve_turnstile(args):
    """Test Turnstile solving on a URL."""
    from scarab_engine.turnstile_solver import TurnstileSolver, FlareSolverrClient
    import asyncio
    
    solver = TurnstileSolver()
    flare = FlareSolverrClient()
    
    print(f"[*] Getting FlareSolverr clearance for {args.url}...")
    try:
        cookies = flare.get_cookies(args.url)
        print(f"[+] Got {len(cookies.get('cookies', []))} cookies")
    except Exception as e:
        print(f"[-] FlareSolverr: {e}")
        cookies = {"cookies": []}
    
    from playwright.async_api import async_playwright
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        if cookies.get("cookies"):
            await context.add_cookies(cookies["cookies"])
        
        print(f"[*] Loading {args.url}...")
        await page.goto(args.url, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(5000)
        
        # Check for Turnstile
        sitekey = await page.evaluate("""() => {
            const el = document.querySelector('[data-sitekey]');
            if (el) return el.getAttribute('data-sitekey');
            const iframe = document.querySelector('iframe[src*="turnstile"]');
            if (iframe) {
                const m = iframe.src.match(/sitekey=([^&]+)/);
                return m ? m[1] : null;
            }
            return document.getElementById('cf-turnstile') ? 'present' : null;
        }""")
        
        if sitekey:
            print(f"[!] Turnstile detected! Sitekey: {sitekey}")
            if sitekey != "present":
                token = solver.solve_turnstile(sitekey, args.url)
                if token:
                    print(f"[+] Token: {token[:48]}...")
                else:
                    print("[-] No API key set. Set CAPTCHA_API_KEY env var.")
            else:
                print("[*] Turnstile container present but no sitekey extracted")
        else:
            print("[+] No Turnstile detected on this page")
        
        # Screenshot
        await page.screenshot(path="turnstile_check.png")
        print("[+] Screenshot saved: turnstile_check.png")
        
        await browser.close()


def main():
    parser = argparse.ArgumentParser(
        description="SCARAB CONTROLLER v2.0 — X + Quora Automation with Turnstile Bypass"
    )
    sub = parser.add_subparsers(dest="command")

    # X posting
    p_x = sub.add_parser("post-x", help="Post tweet to X")
    p_x.add_argument("--topic", required=True)
    p_x.add_argument("--content", default=None)

    # Quora posting (auto-selects method)
    p_quora = sub.add_parser("post-quora", help="Post answer to Quora")
    p_quora.add_argument("--topic", required=True)
    p_quora.add_argument("--content", default=None)
    p_quora.add_argument("--flaresolverr", action="store_true",
                         help="Use FlareSolverr bypass pipeline")

    # Quora v2 pipeline (FlareSolverr + Turnstile)
    p_pipe = sub.add_parser("quora-pipeline",
                            help="Full Quora bypass pipeline with Turnstile solving")
    p_pipe.add_argument("--question-url", default=None)
    p_pipe.add_argument("--topic", default=None)
    p_pipe.add_argument("--file", default=None,
                        help="File containing answer text")
    p_pipe.add_argument("--headless", action="store_true",
                        help="Run headless (may trigger Turnstile)")

    # FlareSolverr cookie fetch
    p_flare = sub.add_parser("flare-cookies",
                             help="Fetch Quora cookies via FlareSolverr")
    p_flare.add_argument("--output", default=None)
    p_flare.add_argument("--url", default="https://www.quora.com")

    # Turnstile test
    p_ts = sub.add_parser("solve-turnstile",
                          help="Test Turnstile solving on a URL")
    p_ts.add_argument("url", help="URL to check and solve Turnstile on")

    # Content generation
    p_gen = sub.add_parser("gen-content", help="Generate content without posting")
    p_gen.add_argument("--platform", choices=["quora", "x"], default="quora")
    p_gen.add_argument("--topic", required=True)
    p_gen.add_argument("--count", type=int, default=1)

    # Tampermonkey script generation
    p_script = sub.add_parser("gen-script", help="Generate Tampermonkey userscript")
    p_script.add_argument("--output", default=None)

    # Cookie injection
    p_inject = sub.add_parser("inject-cookies", help="Inject cookies into session")
    p_inject.add_argument("--platform", choices=["quora", "x", "all"], default="all")

    # Session refresh
    p_refresh = sub.add_parser("session-refresh",
                               help="Open browser for cookie refresh")
    p_refresh.add_argument("--platform", choices=["quora", "x", "all"], default="all")

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return

    cmds = {
        "post-x": lambda a: asyncio.run(do_post_x(a)),
        "post-quora": lambda a: asyncio.run(do_post_quora(a)),
        "quora-pipeline": lambda a: asyncio.run(do_quora_pipeline(a)),
        "flare-cookies": lambda a: asyncio.run(do_flare_cookies(a)),
        "solve-turnstile": lambda a: asyncio.run(do_solve_turnstile(a)),
        "gen-content": do_gen_content,
        "gen-script": do_gen_script,
        "inject-cookies": lambda a: asyncio.run(do_inject_cookies(a)),
        "session-refresh": lambda a: asyncio.run(do_session_refresh(a)),
    }
    cmds[args.command](args)


if __name__ == "__main__":
    main()
