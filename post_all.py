#!/usr/bin/env python3
"""
🚀 LUXOR Posting System — Unified Launcher
Posts to X and Quora with AI content + clickable https://luxor.ly links

Usage:
    source .venv/bin/activate
    python3 post_all.py x              # Post 3 images to X
    python3 post_all.py quora          # Post 3 answers to Quora
    python3 post_all.py quora-images   # Post 3 images to Quora
    python3 post_all.py all            # Post to both platforms
"""
import os, sys, subprocess

PROJECT = os.path.dirname(os.path.abspath(__file__))

def run(script, desc):
    print(f"\n{'='*60}")
    print(f"🚀 {desc}")
    print(f"{'='*60}")
    result = subprocess.run(
        [sys.executable, os.path.join(PROJECT, script)],
        cwd=PROJECT,
        capture_output=False
    )
    return result.returncode == 0

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "all"
    
    if cmd == "x":
        run("x_poster_final.py", "Posting 3 images to X")
    elif cmd == "quora":
        run("quora_go.py", "Posting 3 answers to Quora")
    elif cmd == "quora-images":
        run("quora_all_in_one.py", "Posting 3 images to Quora")
    elif cmd == "all":
        run("x_poster_final.py", "Step 1/2: Posting 3 images to X")
        run("quora_go.py", "Step 2/2: Posting 3 answers to Quora")
    elif cmd == "both":
        run("x_poster_final.py", "Step 1/3: Posting 3 images to X")
        run("quora_go.py", "Step 2/3: Posting text answers to Quora")
        run("quora_all_in_one.py", "Step 3/3: Posting images to Quora")
    elif cmd == "verify":
        run("verify_posts.py", "Verifying posts went through" 
            if os.path.exists(os.path.join(PROJECT, "verify_posts.py")) 
            else "echo 'Check X: https://x.com/Luxor_Offical' && echo 'Check Quora: https://www.quora.com/profile/Luxor-AI-Stylist/answers'")
    else:
        print(f"Usage: python3 post_all.py [x|quora|quora-images|all|both|verify]")
