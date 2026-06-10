#!/bin/bash
cd /root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free
source .venv/bin/activate

# Close the Telegram session (will retry until rate limit clears)
python3 << 'PYEOF'
import requests, time
TOKEN = '8758115339:AAHH6gAIHmSo7Qf_VMc_HmBxz2Jy8w_1mtM'
while True:
    r = requests.get(f'https://api.telegram.org/bot{TOKEN}/close', timeout=10)
    if r.json().get('ok'):
        print('close: OK')
        break
    retry = r.json().get('parameters', {}).get('retry_after', 30)
    print(f'rate_limited retry_in={retry}')
    time.sleep(retry + 1)
requests.get(f'https://api.telegram.org/bot{TOKEN}/getUpdates?offset=-1&timeout=0', timeout=10)
requests.get(f'https://api.telegram.org/bot{TOKEN}/deleteWebhook', timeout=10)
print('Session cleared')
PYEOF

# Start bot
nohup python3 run_bot.py > bot_plugin.log 2>&1 &
echo $! > bot.pid
echo "Bot started PID $(cat bot.pid)"
