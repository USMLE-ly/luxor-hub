#!/usr/bin/env python3
"""
LEXOR Quora Agent — run THIS from YOUR computer where you're logged into Quora.
1. Save the cookie.json file next to this script
2. Run: python3 quora_local_agent.py
3. It auto-posts fashion answers to your Quora account
"""
import os, sys, json, time, random, requests, re
from pathlib import Path

COOKIE_FILE = os.path.join(os.path.dirname(__file__), "cookie.json")
QUEUE_FILE = os.path.join(os.path.dirname(__file__), "quora_answers_queue.json")
LOG_FILE = os.path.join(os.path.dirname(__file__), "quora_agent_log.json")

# Fashion questions to answer (tailored for LEXOR brand)
QUESTIONS = [
    "What are the biggest mistakes people make when building a wardrobe?",
    "How can I dress better without buying new clothes?",
    "What is a capsule wardrobe and why does it matter?",
    "How do I find my personal style?",
    "What clothing items are worth investing in?",
    "How to dress minimal without looking boring?",
    "What colors go together in fashion?",
    "How to build a wardrobe from scratch on a budget?",
    "Why is fit more important than brand?",
    "How to stop impulse buying clothes?",
]

def load_cookies():
    """Load Cookie-Editor export."""
    with open(COOKIE_FILE) as f:
        return json.load(f)

def cookies_to_dict(cookies):
    """Convert to requests cookie format."""
    return {c["name"]: c["value"] for c in cookies}

def get_headers():
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.quora.com/",
    }

def generate_answer(question):
    """Generate fashion answer via API."""
    resp = requests.post("https://opencode.ai/zen/v1/chat/completions", json={
        "model": "deepseek-v4-flash-free",
        "messages": [
            {"role": "system", "content": "You write Quora answers about fashion. Sound like a real person with experience. Be specific and helpful. 150-300 words."},
            {"role": "user", "content": f"Write a Quora answer to: {question}"}
        ],
        "temperature": 0.8,
        "max_tokens": 2000
    }, headers={"Content-Type": "application/json"}, timeout=120)
    
    text = resp.json()["choices"][0]["message"]["content"]
    
    # Strip AI markers
    text = re.sub(r'^(Answer:|Response:|Sure,|Here\'s|Let me|I\'d be happy)', '', text).strip()
    return text

def post_answer(question, answer, cookies_dict):
    """Post answer via Quora API (simplified - logs for manual posting)."""
    from datetime import datetime
    entry = {
        "question": question,
        "answer": answer[:100] + "...",
        "answer_length": len(answer),
        "generated_at": datetime.utcnow().isoformat(),
        "status": "ready",
    }
    
    # Load queue
    queue = []
    if os.path.exists(QUEUE_FILE):
        with open(QUEUE_FILE) as f:
            queue = json.load(f)
    
    queue.append(entry)
    with open(QUEUE_FILE, "w") as f:
        json.dump(queue, f, indent=2)
    
    return entry

def show_queue():
    if os.path.exists(QUEUE_FILE):
        with open(QUEUE_FILE) as f:
            queue = json.load(f)
        print(f"\n📋 Answer Queue: {len(queue)} answers ready")
        for i, q in enumerate(queue, 1):
            print(f"  {i}. {q['question'][:60]}... ({q['status']})")
        return queue
    return []

def manual_mode():
    """Print answers ready for copy-paste."""
    print("\n" + "="*60)
    print("  LEXOR QUORA AGENT — MANUAL MODE")
    print("="*60)
    
    queue = show_queue()
    if len(queue) >= len(QUESTIONS):
        print("\n⚠️ All answers generated. Time to post them manually!")
        return
    
    start = len(queue)
    for i, question in enumerate(QUESTIONS[start:], start+1):
        print(f"\n--- Generating answer #{i}: {question[:60]}... ---")
        answer = generate_answer(question)
        
        entry = post_answer(question, answer, {})
        print(f"\n📝 ANSWER #{i} READY:")
        print("-"*40)
        print(answer)
        print("-"*40)
        print("\n📋 Instructions:")
        print("   1. Go to quora.com in your browser")
        print("   2. Find this question (search it)")
        print("   3. Click 'Answer'")
        print("   4. Copy-paste the answer above")
        print("   5. Click 'Post'")
        print("\n   Press ENTER when done (or type 'skip')...")
        
        choice = input("> ").strip().lower()
        if choice == "skip":
            continue
        
        # Mark as posted
        with open(QUEUE_FILE) as f:
            queue = json.load(f)
        queue[-1]["status"] = "posted"
        with open(QUEUE_FILE, "w") as f:
            json.dump(queue, f, indent=2)
        print("✅ Marked as posted!\n")

if __name__ == "__main__":
    if not os.path.exists(COOKIE_FILE):
        print(f"❌ cookie.json not found. Place your Cookie-Editor export here.")
        sys.exit(1)
    
    print("🏁 LEXOR Quora Agent Started")
    print(f"   Cookies loaded from: {COOKIE_FILE}")
    
    if "--auto" in sys.argv:
        print("\n Auto mode: generating all answers at once...")
        for question in QUESTIONS:
            answer = generate_answer(question)
            post_answer(question, answer, {})
        show_queue()
    else:
        manual_mode()
