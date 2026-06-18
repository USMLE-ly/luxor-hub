#!/usr/bin/env python3
"""
Scrapling CLI — Import fashion items from Altadaily or any site into your LEXOR® closet.

Usage:
  # Scrape Altadaily (default)
  python3 tools/scrapling_cli.py --max-items 20

  # Scrape custom URL  
  python3 tools/scrapling_cli.py --url "https://example.com/collection" --max-items 10

  # Filter by category
  python3 tools/scrapling_cli.py --url "https://altadaily.com/collections/all" --category dresses

  # Show JSON output pretty-printed
  python3 tools/scrapling_cli.py --pretty

  # Save to file
  python3 tools/scrapling_cli.py --output items.json
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.scrapling_import import main
main()
