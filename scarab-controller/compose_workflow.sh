#!/bin/bash
# SCARAB Complete Workflow — ZORG-Ω
set -e
cd "$(dirname "$0")/.."
source .venv/bin/activate

NICHE="${1:-fashion}"
COUNT="${2:-5}"
PLATFORM="${3:-quora}"

echo "╔══════════════════════════════════════════╗"
echo "║     SCARAB COMPLETE WORKFLOW — ZORG-Ω    ║"
echo "╚══════════════════════════════════════════╝"
echo

# Step 1: Refresh FlareSolverr cookies
echo "─── Step 1/4: Refreshing FlareSolverr cookies ───"
python3 << 'PYEOF'
import json, requests
r = requests.post('http://localhost:8191/v1', json={
    'cmd': 'request.get', 'url': 'https://www.quora.com', 'maxTimeout': 15000,
}, timeout=20)
sol = r.json().get('solution', {})
cookies = sol.get('cookies', [])
user_agent = sol.get('userAgent', '')
with open('cookies_flaresolverr.json', 'w') as f:
    json.dump({"cookies": cookies, "userAgent": user_agent}, f, indent=2)
print(f"✓ {len(cookies)} cookies saved (UA: {user_agent[:50]}...)")
PYEOF

# Step 2: Generate content with FABLE5
echo "─── Step 2/4: Generating ${COUNT} ${PLATFORM} posts about '${NICHE}' ───"
python3 api_interact.py --fable5 "Write ${COUNT} engaging ${PLATFORM} posts about the ${NICHE} niche, specifically for Luxor brand (https://luxor.ly). Each post should be under 280 chars for X or 300-500 words for Quora. Output as a JSON array of objects with 'topic', 'content', and 'platform' fields. Only output the JSON array, nothing else." 2>&1 | sed -n '/^\[/,/^\]/p' > /tmp/raw_content.txt

python3 << 'PYEOF'
import json, sys
with open('/tmp/raw_content.txt') as f:
    text = f.read().strip()
try:
    items = json.loads(text)
except:
    import re
    match = re.search(r'\[[\s\S]*\]', text)
    if match:
        items = json.loads(match.group())
    else:
        items = [{"topic": "luxury fashion", "content": text[:500], "platform": "quora"}]

# Normalize platform names
for item in items:
    p = item.get('platform', 'quora').lower()
    if 'x' in p or 'twitter' in p:
        item['platform'] = 'x'
    else:
        item['platform'] = 'quora'

with open('content_queue.json', 'w') as f:
    json.dump(items, f, indent=2)
print(f"✓ Generated {len(items)} items, saved to content_queue.json")
for i, item in enumerate(items):
    print(f"  {i+1}. [{item['platform']}] {item['topic'][:40]}... ({len(item['content'])} chars)")
PYEOF

# Step 3: Generate Tampermonkey script
echo "─── Step 3/4: Building Tampermonkey script ───"
python3 scarab-controller/scarab_controller.py gen-script 2>&1 | grep -E "saved|Install"

# Step 4: Generate queue import script
echo "─── Step 4/4: Building queue import script ───"
python3 << 'PYEOF'
import json, base64, sys
sys.path.insert(0, 'scarab-controller')
from scarab_engine.tampermonkey_bridge import ContentQueue
with open('content_queue.json') as f:
    items = json.load(f)
script = ContentQueue.generate_queue_script(items)
with open('scarab_queue_import.user.js', 'w') as f:
    f.write(script)
print(f"✓ Queue import script saved: scarab_queue_import.user.js")
PYEOF

echo
echo "╔══════════════════════════════════════════╗"
echo "║     WORKFLOW COMPLETE                    ║"
echo "╠══════════════════════════════════════════╣"
echo "║ Files generated:                         ║"
ls -la content_queue.json scarab_automation.user.js scarab_queue_import.user.js cookies_flaresolverr.json 2>/dev/null | awk '{print "║ " $NF " (" $5 " bytes)"}'
echo "║                                          ║"
echo "║ Next steps:                              ║"
echo "║ 1. Install scarab_automation.user.js     ║"
echo "║    in Tampermonkey                       ║"
echo "║ 2. Install scarab_queue_import.user.js   ║"
echo "║    to auto-load content queue            ║"
echo "║ 3. Navigate to quora.com/x.com           ║"
echo "║ 4. Click \"Post from Queue\" button       ║"
echo "║                                          ║"
echo "║ Or post via command line:                ║"
echo "║   python3 api_interact.py --fable5 ...   ║"
echo "║   xvfb-run python3 scarab-controller/    ║"
echo "║     scarab_controller.py post-x --topic  ║"
echo "╚══════════════════════════════════════════╝"
