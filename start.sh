#!/bin/bash
set -e
echo "[START] Booting Luxor backend on port ${PORT:-5000}..."
exec gunicorn main:app --bind 0.0.0.0:"${PORT:-5000}" --timeout 180 --workers 2 --threads 4
