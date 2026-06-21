# LibGen Mirror Research — From GitHub Issues

## Issue 1: pylibgen#11 — `search` returns 504 Gateway Time-out
- **Source**: https://github.com/joshuarli/pylibgen/issues/11
- **Domain**: `libgen.io` (defunct)
- **Fix**: Use alternative mirrors; libgen servers are not production-grade reliable

## Issue 2: libgen-seedtools#4 — Errno 111 Connection refused
- **Source**: https://github.com/subdavis/libgen-seedtools/issues/4
- **Problem**: Tool tries to connect to `localhost:9091` (Transmission torrent client)
- **Fix**: Set `"transmission_enabled": false` in config to only download .torrent files

## Issue 3: LibgenDesktop#39 — Mirrors return invalid URL
- **Source**: https://github.com/libgenapps/LibgenDesktop/issues/39
- **Key findings**:
  - `libgen.lc` returns **relative URLs** — needs trailing slash fix in XSLT:
    ```xml
    <!-- WRONG: -->
    <xsl:text>http://libgen.lc</xsl:text><xsl:value-of select="@href" />
    <!-- FIX: add trailing slash -->
    <xsl:text>http://libgen.lc/</xsl:text><xsl:value-of select="@href" />
    ```
  - `library.lol` (including IPFS gateways) has working configs in commit c97c016
  - `gen.lib.rus.ec` works but very slow
  - `libgen.lol` uses redirects to subdomains (e.g., `ww6.libgen.lol`)
  - Mirrors are increasingly unreliable, especially from certain regions (India, etc.)

## Working Mirror Status (from this network — aarch64)
| Mirror | Status |
|--------|--------|
| libgen.ee | ✅ Search works (200), but book results vary |
| libgen.li | ✅ Homepage works, search returns 404 |
| libgen.is | ❌ Connection timeout |
| libgen.lc | ❌ 404 on search |
| gen.lib.rus.ec | ❌ SSL error |
| library.lol | ❌ 404/SSL error |
| libgen.lol | ❌ Cloudflare 520 error |
| libgen.gs | ❌ Connection error |
| libgen.st | ❌ Connection timeout |
| libgen.rs | ❌ Connection timeout |

## Recommendations
1. Fashion/textile books are niche and rarely available on LibGen
2. For these specific ISBNs, try Anna's Archive or direct purchase
3. LibGen is best for technical/academic books, not fashion
4. Use `download_books.py` with multi-mirror fallback on a network that can reach more mirrors
