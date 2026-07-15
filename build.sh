#!/bin/bash
set -e
echo "=== Building Frontend ==="
npm --prefix luxor-hub install --ignore-engines
npm --prefix luxor-hub run build

echo "=== Installing Backend Python Packages ==="
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
