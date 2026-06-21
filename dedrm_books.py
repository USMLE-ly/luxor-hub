#!/usr/bin/env python3
"""
DeDRM ACS-encrypted PDFs (Adobe Adept / EBX_HANDLER).
Requires an adeptkey.der file from an authorized Adobe Digital Editions installation.

Usage:
  1. Get adeptkey.der from your ADE installation:
     - Windows: %APPDATA%/Adobe/Digital Editions/adeptkey.der
     - macOS: ~/Library/Application Support/Adobe/Digital Editions/adeptkey.der
     - Linux: ~/.adobe-digital-editions/adeptkey.der
  
  2. Place the key file in this directory, then run:
     python3 dedrm_books.py /path/to/adeptkey.der

  3. Decrypted PDFs will be saved in aa_books/ with '_decrypted' suffix.
"""

import sys, os, glob

TOOLS_DIR = '/tmp/dedrm_tools/DeDRM_plugin'
sys.path.insert(0, TOOLS_DIR)

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("Available encrypted PDFs:")
        for f in sorted(glob.glob('aa_books/*.pdf')):
            sz = os.path.getsize(f) / 1024 / 1024
            print(f"  {f} ({sz:.1f} MB)")
        print()
        print("Usage: python3 dedrm_books.py /path/to/adeptkey.der")
        return 1
    
    keypath = sys.argv[1]
    if not os.path.exists(keypath):
        print(f"Key file not found: {keypath}")
        return 1
    
    from ineptpdf import decryptBook
    
    for fname in sorted(glob.glob('aa_books/*.pdf')):
        if '_decrypted' in fname or '_OCR' in fname:
            continue
        outpath = fname.replace('.pdf', '_decrypted.pdf')
        if os.path.exists(outpath):
            print(f"  ⏭ {os.path.basename(outpath)} already exists")
            continue
        
        print(f"  Decrypting {os.path.basename(fname)}...", end=' ')
        sys.stdout.flush()
        try:
            result = decryptBook(open(keypath, 'rb').read(), fname, outpath)
            if result == 0:
                sz = os.path.getsize(outpath) / 1024 / 1024
                print(f"✓ ({sz:.1f} MB)")
            else:
                print(f"✗ (error code {result})")
        except Exception as e:
            print(f"✗ {e}")

if __name__ == '__main__':
    sys.exit(main())
