#!/bin/bash
# Run this to deploy updates
set -e

echo "🚀 Deploying Luxor backend..."

cd /root/luxor-hub
git pull
source venv/bin/activate
pip install -r requirements.txt -q

# Run smoke tests
python3 backend/scripts/smoke_test.py

# Restart service
systemctl restart luxor

echo "✅ Deployed successfully!"
