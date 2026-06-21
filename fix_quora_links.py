"""Find and fix all Quora scripts to use https://luxor.ly instead of plain luxor.ly"""
import os, re

PROJECT = os.path.dirname(os.path.abspath(__file__))
scripts = [f for f in os.listdir(PROJECT) if f.startswith("quora_") and f.endswith(".py")]

for script in scripts:
    path = os.path.join(PROJECT, script)
    with open(path) as f:
        content = f.read()
    
    # Fix: luxor.ly in parentheses -> (https://luxor.ly)
    # Fix: "luxor.ly" without protocol -> "https://luxor.ly" 
    new_content = content.replace("(luxor.ly)", "(https://luxor.ly)")
    new_content = new_content.replace("luxor.ly", "https://luxor.ly")
    # But reverting the UPLOAD_DIR path and project paths that got mangled
    new_content = new_content.replace("https://luxor.ly_media", "luxor_media")
    new_content = new_content.replace("https://luxor.ly_offacial", "luxor.offacial")
    new_content = new_content.replace("https://luxor.ly_prompts", "luxor_prompts")
    new_content = new_content.replace("https://luxor.ly_x_posts", "luxor_x_posts")
    new_content = new_content.replace("https://luxor.ly_media_poster", "luxor_media_poster")
    new_content = new_content.replace("https://luxor.ly_post_image", "luxor_post_image")
    new_content = new_content.replace("https://luxor.ly_prompt_studio", "luxor_prompt_studio")
    # Fix cookie_quora path
    new_content = new_content.replace("cookie_quora_working", "cookies_quora_working")
    new_content = new_content.replace("cookie_https://luxor.ly", "cookies_quora")
    # Fix any double replacements in cookies_quora
    new_content = new_content.replace("cookies_https://luxor.ly_working", "cookies_quora_working")
    new_content = new_content.replace("cookies_https://luxor.ly.json", "cookies_quora_working.json")
    # Fix COOKIES_FILE assignments  
    new_content = new_content.replace('"https://luxor.ly_media', '"luxor_media')
    
    # Fix content_queue references
    new_content = new_content.replace("content_https://luxor.lyueue", "content_queue")
    new_content = new_content.replace("https://luxor.lyueue", "queue")
    
    if new_content != content:
        with open(path, 'w') as f:
            f.write(new_content)
        print(f"✅ Fixed: {script}")
    else:
        print(f"  No changes: {script}")

print("\nDone! All scripts updated to use https://luxor.ly")
