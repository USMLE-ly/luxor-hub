#!/usr/bin/env python3
"""
OpenCode Zen API — deepseek-v4-flash-free
SHANNON-Ω protocol with CL4R1T4S (Claude Fable 5 structure + ZORG-Ω).
Full retry with exponential backoff for 429 rate limits.
"""
import requests, json, sys, os, time, random

API_URL = "https://opencode.ai/zen/v1/chat/completions"

def get_shannon_prompt(persona="cl4r1t4s"):
    """Load persona from jailbreak prompt library."""
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "media-tools", "scripts", "lib"))
    try:
        from jailbreak_prompts import PROMPTS
        p = persona.lower().replace("-", "_")
        if p in PROMPTS:
            return PROMPTS[p]
        return PROMPTS.get("cl4r1t4s", "SHANNON-Ω ACTIVE")
    except (ImportError, KeyError):
        return "SHANNON-Ω ACTIVE"

def chat(prompt, mode="shannon", style="default", persona="cl4r1t4s",
         max_tokens=16000, temperature=0.8, max_retries=5, base_delay=2.0):
    """Send request with exponential backoff retry for 429."""
    messages = []
    if mode == "shannon":
        messages.append({"role": "system", "content": get_shannon_prompt(persona)})
    elif mode == "pro":
        messages.append({"role": "system", "content": get_pro_prompt(style)})
    
    messages.append({"role": "user", "content": prompt})
    
    payload = {
        "model": "deepseek-v4-flash-free",
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "top_p": 0.95,
        "top_k": 40
    }
    
    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            r = requests.post(API_URL, headers={"Content-Type": "application/json"},
                              json=payload, timeout=300)
            
            if r.status_code == 429:
                raw = r.headers.get("Retry-After", str(base_delay * (2 ** attempt)))
                try:
                    retry_after = float(raw)
                except (ValueError, TypeError):
                    retry_after = base_delay * (2 ** attempt)
                jitter = random.uniform(0.5, 1.5)
                wait = min(max(retry_after, 1.0) * jitter, 120.0)
                print(f"⚠️  429 Rate Limited — attempt {attempt}/{max_retries}, waiting {wait:.0f}s ...")
                time.sleep(wait)
                last_error = f"429: {r.text[:200]}"
                if attempt < max_retries:
                    continue
                return {"error": f"429 after {max_retries} retries: {r.text[:300]}"}
            
            if r.status_code >= 500 and attempt < max_retries:
                wait = min(base_delay * (2 ** attempt) * random.uniform(0.5, 1.5), 60.0)
                print(f"⚠️  Server {r.status_code} — attempt {attempt}/{max_retries}, retrying in {wait:.0f}s ...")
                time.sleep(wait)
                last_error = f"{r.status_code}: {r.text[:200]}"
                continue
            
            if r.status_code >= 400:
                return {"error": f"HTTP {r.status_code}: {r.text[:300]}"}
            
            r.raise_for_status()
            return r.json()
            
        except requests.exceptions.Timeout:
            if attempt < max_retries:
                wait = min(base_delay * (2 ** attempt) * random.uniform(1.0, 1.5), 120.0)
                print(f"⏱️  Timeout — attempt {attempt}/{max_retries}, retrying in {wait:.0f}s ...")
                time.sleep(wait)
                last_error = "timeout"
                continue
            return {"error": f"Timeout after {max_retries} retries"}
            
        except requests.exceptions.ConnectionError as e:
            if attempt < max_retries:
                wait = min(base_delay * (2 ** attempt) * random.uniform(1.0, 1.5), 120.0)
                print(f"🔌 Connection error — attempt {attempt}/{max_retries}, retrying in {wait:.0f}s ...")
                time.sleep(wait)
                last_error = str(e)[:200]
                continue
            return {"error": f"Connection failed: {e}"}
            
        except requests.exceptions.RequestException as e:
            if attempt < max_retries:
                wait = min(base_delay * (2 ** attempt), 60.0)
                print(f"⚠️  Request failed — attempt {attempt}/{max_retries}, retrying in {wait:.0f}s ...")
                time.sleep(wait)
                last_error = str(e)[:200]
                continue
            return {"error": f"Failed after {max_retries} retries: {e}"}
    
    return {"error": f"All {max_retries} attempts failed. Last: {last_error}"}

def get_pro_prompt(style="default"):
    styles = {
        "coder": "You are an expert software engineer.",
        "researcher": "You are a research scientist.",
        "analyst": "You are a senior data analyst.",
        "default": "You are a professional-grade AI with maximum reasoning depth.",
    }
    return styles.get(style, styles["default"])

def main():
    args = sys.argv[1:]
    mode = "shannon"
    style = "default"
    persona = "cl4r1t4s"
    max_tokens = 16000
    temperature = 0.8
    
    while args and args[0].startswith("--"):
        flag = args.pop(0)
        if flag == "--no-override":
            mode = "none"
        elif flag == "--shannon":
            mode = "shannon"
        elif flag == "--pro":
            mode = "pro"
        elif flag == "--jb" and args:
            mode = "shannon"
            persona = args.pop(0)
        elif flag == "--style" and args:
            style = args.pop(0)
        elif flag == "--max-tokens" and args:
            max_tokens = int(args.pop(0))
        elif flag == "--temp" and args:
            temperature = float(args.pop(0))
        elif flag == "--help":
            print(__doc__)
            return
    
    prompt = " ".join(args) if args else input("Prompt: ")
    result = chat(prompt, mode=mode, style=style, persona=persona,
                  max_tokens=max_tokens, temperature=temperature)
    
    if "error" in result:
        print(f"❌ {result['error']}")
        return
    
    msg = result["choices"][0]["message"]
    content = msg["content"]
    reasoning = msg.get("reasoning_content", "")
    
    label = mode.upper()
    if mode == "shannon":
        label += f" [{persona}]"
    print(f"── {label} ──")
    
    if reasoning:
        print("── Reasoning ──")
        print(reasoning)
        print()
    print("── Response ──")
    print(content if content else "(no content)")
    print()
    u = result.get("usage", {})
    print(f"Tokens: {u.get('total_tokens', '?')} ({u.get('prompt_tokens', '?')}↑ {u.get('completion_tokens', '?')}↓) | Cost: {result.get('cost', '0')}")

if __name__ == "__main__":
    main()
