#!/usr/bin/env python3
"""
SHANNON-Ω PDF DeDRM Tool
=========================
Adobe Adept (EBX_HANDLER) DRM removal for fashion PDFs.

PDFs have EBX_HANDLER DRM — fully AES-128 encrypted. No content readable
without the ADE private key (adeptkey.der).

── METHODS ──

Method 1 — ADE key from desktop:
  python3 dedrm_books.py /path/to/adeptkey.der

Method 2 — ADE key from Android:
  python3 dedrm_books.py --android-activation /path/to/activation.xml

Method 3 — ADE key from Wine (Linux):
  python3 dedrm_books.py --extract-key-wine /path/to/wineprefix

Method 4 — Guide & status:
  python3 dedrm_books.py --guide

── HOW TO GET THE KEY ──

A. Install ADE 2.0.1 under Wine on Linux:
   1. Install wine and winetricks
   2. WINEPREFIX=~/.adewine WINEARCH=win32 wineboot
   3. winetricks -q corefonts dotnet35sp1
   4. Download ADE 2.0.1: http://download.adobe.com/pub/adobe/digitaleditions/ADE_2.0_Installer.exe
   5. wine ADE_2.0_Installer.exe
   6. Launch ADE, Help → Authorize Computer (use Adobe ID)
   7. python3 dedrm_books.py --extract-key-wine ~/.adewine
   8. python3 dedrm_books.py adobekey.der

B. From Android ADE app (root required):
   1. Copy /data/data/com.adobe.digitaleditions/files/.adept/activation.xml
   2. python3 dedrm_books.py --android-activation activation.xml
   3. python3 dedrm_books.py adobekey.der

C. From Windows/Mac:
   1. Install ADE 2.0.1, authorize it
   2. Get adeptkey.der from:
      Windows: %APPDATA%/Adobe/Digital Editions/adeptkey.der
      macOS:   ~/Library/Application Support/Adobe/Digital Editions/adeptkey.der
   3. Copy to this machine, run: python3 dedrm_books.py adeptkey.der

D. Download clean DRM-free PDFs from IA (unrestricted network needed):
   See --guide for direct IA links.
"""

import sys, os, glob, base64, struct
from pathlib import Path

TOOLS_DIR = '/tmp/dedrm_tools/DeDRM_plugin'
BOOKS_DIR = 'aa_books'
INPUT_KEY = None  # Will be set to the key filename


def get_source_pdfs():
    pdfs = []
    for f in sorted(glob.glob(f'{BOOKS_DIR}/*.pdf')):
        base = os.path.basename(f)
        if any(x in base for x in ['_decrypted', '_OCR', '_reconstructed', '_textonly', '_clean']):
            continue
        pdfs.append(f)
    return pdfs


def get_isbn(fname):
    return os.path.basename(fname).split('_')[0]


# ─── Key extraction methods ───

def extract_key_from_wine(wineprefix):
    """Extract ADE key from an ADE installation under Wine."""
    sys.path.insert(0, TOOLS_DIR)
    try:
        import adobekey
        # adobekey.getkey(wineprefix) or similar
        if hasattr(adobekey, 'getkey'):
            key = adobekey.getkey(wineprefix=wineprefix)
        else:
            # Fallback: run adobekey.py via Wine python
            import subprocess
            winepython = os.path.join(wineprefix, 'drive_c', 'python27', 'python.exe')
            adobekey_script = os.path.join(TOOLS_DIR, 'adobekey.py')
            result = subprocess.run(
                ['wine', winepython, adobekey_script],
                capture_output=True, text=True, timeout=30
            )
            key = result.stdout.strip()
        
        if key:
            outpath = os.path.join(BOOKS_DIR, 'adeptkey_from_wine.der')
            with open(outpath, 'wb') as f:
                f.write(key if isinstance(key, bytes) else key.encode())
            print(f"  ✓ Key extracted → {outpath} ({len(key)} bytes)")
            return outpath
    except Exception as e:
        print(f"  ✗ Wine key extraction failed: {e}")
    
    print("  Manual method: run this in the Wine environment:")
    print(f"    wine python {TOOLS_DIR}/adobekey.py")
    print("  Then copy the resulting adeptkey.der to this directory.")
    return None


def extract_key_from_android(xmlpath):
    """Extract ADE key from Android ADE activation.xml."""
    import xml.etree.ElementTree as ET
    
    if not os.path.exists(xmlpath):
        print(f"  ✗ File not found: {xmlpath}")
        return None
    
    try:
        tree = ET.parse(xmlpath)
        root = tree.getroot()
        
        # Find privateLicenseKey
        ns = {'adept': 'http://ns.adobe.com/adept'}
        key_el = root.find('.//adept:privateLicenseKey', ns)
        if key_el is None:
            key_el = root.find('.//privateLicenseKey')
        
        if key_el is not None and key_el.text:
            b64key = key_el.text.strip()
            raw = base64.b64decode(b64key)
            # Skip first 26 bytes (ADE header)
            ade_key = raw[26:]
            
            outpath = os.path.join(BOOKS_DIR, 'adeptkey_from_android.der')
            with open(outpath, 'wb') as f:
                f.write(ade_key)
            print(f"  ✓ Key extracted → {outpath} ({len(ade_key)} bytes)")
            return outpath
        else:
            print("  ✗ No privateLicenseKey found in XML")
    except Exception as e:
        print(f"  ✗ XML parse error: {e}")
    
    return None


# ─── Decryption ───

def decrypt_all(keypath):
    """Decrypt all PDFs using an ADE key."""
    if not os.path.exists(keypath):
        print(f"\n  ✗ Key not found: {keypath}")
        return False

    # Ensure DeDRM plugin is importable
    plugin = os.path.join(TOOLS_DIR, 'ineptpdf.py')
    if not os.path.exists(plugin):
        print(f"\n  ✗ DeDRM plugin not found at {plugin}")
        return False

    sys.path.insert(0, TOOLS_DIR)
    try:
        from ineptpdf import decryptBook
    except ImportError as e:
        print(f"\n  ✗ Failed to import decryptBook: {e}")
        return False

    with open(keypath, 'rb') as f:
        userkey = f.read()

    all_ok = True
    for fname in get_source_pdfs():
        base = os.path.basename(fname)
        outpath = fname.replace('.pdf', '_decrypted.pdf')
        if os.path.exists(outpath):
            print(f"  ⏭ {base} → already decrypted")
            continue

        print(f"  ▶ {base}...", end=' ')
        sys.stdout.flush()
        try:
            result = decryptBook(userkey, fname, outpath)
            if result == 0:
                sz = os.path.getsize(outpath) / 1024 / 1024
                print(f"✓ ({sz:.1f} MB)")
            else:
                print(f"✗ error code {result}")
                all_ok = False
        except Exception as e:
            print(f"✗ {str(e)[:100]}")
            all_ok = False

    return all_ok


# ─── Guide ───

def show_guide():
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║  SHANNON-Ω PDF DeDRM — Status & Reference               ║")
    print("╚═══════════════════════════════════════════════════════════╝")

    print("\n── PDF Status ──")
    for fname in get_source_pdfs():
        sz = os.path.getsize(fname) / 1024 / 1024
        decrypted = os.path.exists(fname.replace('.pdf', '_decrypted.pdf'))
        status = "✓ DeCRYPTED" if decrypted else "✗ ENCRYPTED (EBX_HANDLER)"
        print(f"  {os.path.basename(fname):50s} ({sz:.1f} MB) {status}")

    print(f"\n── Tools Status ──")
    has_inept = os.path.exists(os.path.join(TOOLS_DIR, 'ineptpdf.py'))
    has_inept_v10 = os.path.exists(os.path.join(TOOLS_DIR, 'ineptpdf_v10.py'))
    has_adobekey = os.path.exists(os.path.join(TOOLS_DIR, 'adobekey.py'))
    print(f"  ineptpdf v9.0.0:     {'✓' if has_inept else '✗'}")
    print(f"  ineptpdf v10.0.4:    {'✓' if has_inept_v10 else '✗'}  (noDRM fork, extra features)")
    print(f"  adobekey v7.0:       {'✓' if has_adobekey else '✗'}")

    has_wine = os.system('which wine >/dev/null 2>&1') == 0
    print(f"  Wine installed:      {'✓' if has_wine else '✗'}")

    print(f"\n── Direct IA URLs (DRM-free clean PDFs) ──")
    print(f"  Download these from an unrestricted machine:")
    ia_links = [
        ("9781350193901 Sketchbook", "fashiondesigners0000roth", 19.0),
        ("9781501382567 Guide 4th Ed", "guidetofashionse0000amad_k7x4", 17.4),
        ("9781472532664 Guide 3rd Ed", "guidetofashionse0000amad", 18.1),
        ("9781607053552 Field Guide", "fieldguidetofabr0000kigh", 28.3),
        ("9781854799975 Zandra Rhodes", "artofzandrarhode0000zand", 26.8),
    ]
    for title, ia_id, mb in ia_links:
        print(f"  curl -L -o \"{title.replace(' ', '_')}.pdf\" https://archive.org/download/{ia_id}/{ia_id}.pdf")

    print(f"\n── ADE Key Extraction Guide ──")
    print(f"  A) Install ADE 2.0.1 under Wine (Linux):")
    print(f"     WINEPREFIX=~/.adewine WINEARCH=win32 wineboot")
    print(f"     winetricks -q corefonts dotnet35sp1")
    print(f"     wine ADE_2.0_Installer.exe")
    print(f"     → Authorize with Adobe ID")
    print(f"     python3 dedrm_books.py --extract-key-wine ~/.adewine")
    print(f"     python3 dedrm_books.py aa_books/adeptkey_from_wine.der")
    print()
    print(f"  B) Android root (activation.xml):")
    print(f"     adb pull /data/data/com.adobe.digitaleditions/files/.adept/activation.xml")
    print(f"     python3 dedrm_books.py --android-activation activation.xml")
    print(f"     python3 dedrm_books.py aa_books/adeptkey_from_android.der")

    print(f"\n── Alternative sources (DRM-free) ──")
    print(f"  • Anna's Archive:     https://annasarchive.org/search?q=<ISBN>")
    print(f"  • Z-Library:          https://singlelogin.re")
    print(f"  • Library Genesis:    https://libgen.is")

    print(f"\n── Resources consulted ──")
    print(f"  • github.com/apprenticeharper/DeDRM_tools")
    print(f"  • github.com/noDRM/DeDRM_tools (v10.0.4, hardened DRM support)")
    print(f"  • Issue 702:  DeDRM under Linux (Wine+ADE)")
    print(f"  • Issue 952:  ADE key from Android activation.xml")
    print(f"  • Issue 1098: Extracting ADE keys from Windows")
    print(f"  • Wiki:       'Exactly how to remove DRM'")


def main():
    print("╔══════════════════════════════════════════════════╗")
    print("║  SHANNON-Ω PDF DeDRM Tool                       ║")
    print("╚══════════════════════════════════════════════════╝")

    if not os.path.exists(BOOKS_DIR):
        print(f"\n  ✗ Books directory '{BOOKS_DIR}' not found!")
        print(f"  Run: mkdir -p {BOOKS_DIR}")
        return 1

    if len(sys.argv) < 2:
        show_guide()
        return 0

    cmd = sys.argv[1]

    if cmd == '--guide':
        show_guide()
    elif cmd == '--extract-key-wine':
        prefix = sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser('~/.adewine')
        extract_key_from_wine(prefix)
    elif cmd == '--android-activation':
        if len(sys.argv) < 3:
            print("Usage: python3 dedrm_books.py --android-activation /path/to/activation.xml")
            return 1
        keypath = extract_key_from_android(sys.argv[2])
        if keypath:
            print(f"\nNow run: python3 dedrm_books.py {keypath}")
    elif cmd in ('-h', '--help'):
        show_guide()
    else:
        decrypt_all(cmd)

    return 0


if __name__ == '__main__':
    main()
