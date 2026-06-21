#!/bin/bash
# Start all Luxor backend services
set -e

BASEDIR="$(cd "$(dirname "$0")" && pwd)"

# Kill any existing instances
for port in 8766 8767; do
    fuser -k "${port}/tcp" 2>/dev/null || true
done

sleep 1

# Start analysis server (Flask on :8766)
cd "$BASEDIR"
nohup python3 luxor_analysis_server.py --port 8766 > /tmp/luxor_server.log 2>&1 &
echo "Analysis server started (PID $!) on :8766"

# Start tweaks microservice (FastAPI on :8767)
cd "$BASEDIR/stylist-tweaks-svc"
nohup python3 -c "
import uvicorn
uvicorn.run('main:app', host='0.0.0.0', port=8767, workers=1, log_level='info')
" > /tmp/tweak_svc.log 2>&1 &
echo "Tweaks microservice started (PID $!) on :8767"

sleep 2
echo ""
echo "=== Health checks ==="
curl -s http://localhost:8766/ | python3 -c "import sys,json; print(f'Analysis: {json.load(sys.stdin)[\"status\"]}')" 2>/dev/null || echo "Analysis: starting..."
curl -s http://localhost:8767/tweaks/health | python3 -c "import sys,json; print(f'Tweaks: {json.load(sys.stdin)[\"status\"]}')" 2>/dev/null || echo "Tweaks: starting..."
echo "=== Services ready ==="
