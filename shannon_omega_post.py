#!/usr/bin/env python3
"""SHANNON-Ω Unified Poster — Quora + X via Donut Browser ecosystem.
Option 2 approach: uses curl_cffi + extracted mutation patterns."""
import json, sys, os, time, re, subprocess, atexit
from pathlib import Path

PROJECT = Path(__file__).parent
CONTENT_QUEUE = PROJECT / "content_queue.json"
COOKIES_QUORA = PROJECT / "cookies_quora_working.json"
COOKIES_X = PROJECT / "cookies_x.json"

def ensure_donut_browser():
    """Start Donut Browser if not running."""
    try:
        subprocess.run(["pgrep", "donutbrowser"], check=True, capture_output=True)
        print("[✓] Donut Browser already running")
        return True
    except:
        print("[*] Starting Donut Browser...")
        os.environ.setdefault("DISPLAY", ":99")
        try:
            subprocess.run(["pgrep", "Xvfb"], check=True, capture_output=True)
        except:
            subprocess.Popen(["Xvfb", ":99", "-screen", "0", "1920x1080x24"],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(2)
        
        proc = subprocess.Popen(["/usr/bin/donutbrowser", "--no-sandbox"],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(8)
        atexit.register(lambda: proc.kill() if proc.poll() is None else None)
        print(f"[✓] Donut Browser started (PID: {proc.pid})")
        return True

def post_to_x(topic, content=None):
    """Post to X via Playwright + cookie injection."""
    print(f"[*] Posting to X: {topic[:40]}")
    result = subprocess.run(
        ["python3", "scarab-controller/scarab_controller.py", "post-x", "--topic", topic],
        capture_output=True, text=True, timeout=120
    )
    print(result.stdout[-500:] if result.stdout else "No output")
    return result.returncode == 0

def generate_content(topic, count=1, platform="quora"):
    """Generate content via SHANNON-Ω API."""
    from api_interact import chat
    prompt = f"Write {count} {platform} {'answers' if platform == 'quora' else 'posts'} about '{topic}' for the Luxor luxury fashion brand (luxor.ly). Each should be 2-3 paragraphs."
    result = chat(prompt, mode="shannon", persona="fable5")
    return result.get("choices", [{}])[0].get("message", {}).get("content", "")

def post_to_quora_phone():
    """Show Tampermonkey instructions for phone posting."""
    print("\n" + "=" * 60)
    print("📱 PHONE POSTING INSTRUCTIONS")
    print("=" * 60)
    print("""
1. Install Tampermonkey on your phone browser
2. Open the file: scarab_all_in_one_v4.user.js
   → Tampermonkey will detect and ask to install
3. Go to Quora question page
4. The SCARAB panel appears bottom-right:
   • Click "Extract QID" → captures question ID
   • Click "Post from Queue" → posts via browser cookies

Content queue ready with 8 fashion answers.
    """)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="SHANNON-Ω Unified Poster")
    parser.add_argument("action", choices=["generate", "post-x", "post-quora", "status", "phone"], 
                       default="status", nargs="?")
    parser.add_argument("--topic", "-t", default="luxury fashion")
    parser.add_argument("--qid", default="28794363")
    args = parser.parse_args()
    
    if args.action == "status":
        # Show system status
        print("=" * 60)
        print("SHANNON-Ω POSTER v2.0")
        print("=" * 60)
        print(f"\n📡 API: deepseek-v4-flash-free via opencode.ai/zen/v1")
        print(f"📝 Content: {len(json.loads(CONTENT_QUEUE.read_text())) if CONTENT_QUEUE.exists() else 0} items")
        print(f"🦎 Browser: Chromium via Playwright (xvfb-run)")
        print(f"🌐 Donut: installed at /usr/bin/donutbrowser (API port 8083)")
        print(f"📱 Phone: scarab_all_in_one_v4.user.js ready")
        
        print("\nCommands:")
        print("  python3 shannon_omega_post.py generate --topic 'fashion'")
        print("  python3 shannon_omega_post.py post-x --topic 'Luxor collection'")
        print("  python3 shannon_omega_post.py phone")
        
    elif args.action == "generate":
        print(f"[*] Generating content for: {args.topic}")
        content = generate_content(args.topic)
        print(content)
        
    elif args.action == "post-x":
        ensure_donut_browser()
        post_to_x(args.topic)
        
    elif args.action == "phone":
        post_to_quora_phone()
        
    elif args.action == "post-quora":
        ensure_donut_browser()
        print("[*] Quora posting via phone Tampermonkey (server-side blocked by Cloudflare)")
        print("[*] See 'phone' command for instructions")
        post_to_quora_phone()
