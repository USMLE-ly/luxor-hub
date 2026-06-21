#!/usr/bin/env python3
"""
Download the first PDF result for each ISBN from Library Genesis.
Requires: requests, beautifulsoup4, lxml
Install with: pip install requests beautifulsoup4 lxml
"""

import requests
import re
import time
import sys
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# --- Configuration ---
ISBNS = [
    "9781350193901",
    "9781501382567",
    "9781472532664",
    "9781607053552",
    "9781854799975",
]

# LibGen mirror that currently works (change if needed)
LIBGEN_SEARCH = "https://libgen.is/search.php"
LIBGEN_DOWNLOAD_PAGE = "https://libgen.is/book/index.php?md5="
# Mirror for direct download – libgen.li often has a clean PDF link
DIRECT_MIRROR = "https://libgen.li/ads.php?md5="

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
TIMEOUT = 20
DELAY = 3  # seconds between requests, be polite

OUTPUT_DIR = Path("downloaded_books")
OUTPUT_DIR.mkdir(exist_ok=True)

# ------------------------------------------------------------

def search_isbn(isbn):
    """Return the md5 hash of the first result for the given ISBN, or None."""
    params = {"req": isbn, "column": "isbn"}
    try:
        resp = requests.get(LIBGEN_SEARCH, params=params,
                            headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
    except Exception as e:
        print(f"  [!] Search failed for {isbn}: {e}")
        return None

    soup = BeautifulSoup(resp.text, "lxml")
    # Results are in a table with class "catalog"
    table = soup.find("table", class_="catalog")
    if not table:
        print(f"  [-] No results table for {isbn}")
        return None

    # First data row (skip header)
    rows = table.find_all("tr")
    for row in rows:
        # The first link in the row typically points to the book page
        link = row.find("a", href=re.compile(r"book/index\.php\?md5="))
        if link:
            md5 = link["href"].split("md5=")[-1].split("&")[0]
            print(f"  [+] Found MD5: {md5}")
            return md5

    print(f"  [-] No MD5 link in results for {isbn}")
    return None

def get_direct_download_url(md5):
    """Use libgen.li to obtain a direct PDF download link."""
    url = f"{DIRECT_MIRROR}{md5}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
    except Exception as e:
        print(f"  [!] Failed to reach libgen.li for {md5}: {e}")
        return None

    soup = BeautifulSoup(resp.text, "lxml")
    # Look for a link that ends with .pdf or contains 'get.php'
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.lower().endswith(".pdf") or "get.php" in href:
            return urljoin(url, href)  # ensure absolute URL

    # Sometimes the link is behind a button or image
    for img in soup.find_all("img", alt=True):
        if "download" in img.get("alt", "").lower():
            parent = img.find_parent("a")
            if parent and parent.get("href"):
                return urljoin(url, parent["href"])

    print(f"  [!] No download link found on libgen.li for {md5}")
    return None

def download_file(url, filename):
    """Stream the file to disk."""
    try:
        resp = requests.get(url, headers=HEADERS, stream=True, timeout=60)
        resp.raise_for_status()
        with open(filename, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"  [!] Download failed: {e}")
        return False

def main():
    for isbn in ISBNS:
        print(f"\n--- Processing ISBN {isbn} ---")
        md5 = search_isbn(isbn)
        if not md5:
            continue

        time.sleep(DELAY)
        download_url = get_direct_download_url(md5)
        if not download_url:
            continue

        # Filename: use ISBN.pdf, but we could extract title if desired
        out_path = OUTPUT_DIR / f"{isbn}.pdf"
        print(f"  --> Downloading to {out_path} ...")
        if download_file(download_url, out_path):
            print(f"  [\u2713] Success: {out_path}")
        else:
            print(f"  [\u2717] Failed to save {out_path}")

        time.sleep(DELAY)

    print("\nDone.")

if __name__ == "__main__":
    main()
