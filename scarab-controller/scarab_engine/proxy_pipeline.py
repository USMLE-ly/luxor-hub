"""
Proxy Pipeline — ZORG-Ω SCARAB Controller
===========================================
Scrapes free proxy lists, validates against Quora Cloudflare,
maintains a scored pool, integrates with Playwright + FlareSolverr.

Sources:
  - TheSpeedX/PROXY-List      (HTTP/SOCKS4/SOCKS5, ~10k entries)
  - proxifly/free-proxy-list  (HTTP/SOCKS5, ~5k entries)
  - OpenProxyList/free-proxy-list (HTTP, ~3k entries)

Usage:
    pool = ProxyPool()
    asyncio.run(pool.populate_pool())
    asyncio.run(pool.validate_pool())
    proxy = pool.get_best()
    # Use proxy in Playwright: browser.new_context(proxy=proxy)
"""
import asyncio, aiohttp, json, time, random, os, re
from pathlib import Path
from typing import Optional, Dict, List, Tuple
from datetime import datetime, timedelta
from urllib.parse import urlparse

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# ─── Configuration ────────────────────────────────────────────────
CACHE_FILE = str(PROJECT_ROOT / "proxy_pool_cache.json")
MAX_POOL_SIZE = 500
VALIDATION_TIMEOUT = 10  # seconds per proxy
VALIDATION_URL = "https://www.quora.com"
VALIDATION_KEYWORDS = ["quora", "questions", "answers"]  # present on bypassed page
BLOCK_KEYWORDS = ["Just a moment", "challenge", "cf-captcha"]
REFRESH_INTERVAL = 300  # 5 minutes
SCORE_DECAY = 0.9  # multiply score by this on each failed validation

# Proxy sources (raw GitHub raw URLs)
PROXY_SOURCES = [
    # TheSpeedX/PROXY-List
    {
        "url": "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
        "type": "http",
        "format": "ip:port",
    },
    {
        "url": "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt",
        "type": "socks4",
        "format": "ip:port",
    },
    {
        "url": "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt",
        "type": "socks5",
        "format": "ip:port",
    },
    # proxifly/free-proxy-list
    {
        "url": "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies.json",
        "type": "mixed",
        "format": "json",
    },
    # Additional: OpenProxyList
    {
        "url": "https://raw.githubusercontent.com/OpenProxyList/free-proxy-list/main/http.txt",
        "type": "http",
        "format": "ip:port",
    },
]


class ProxyRecord:
    """Individual proxy with scoring."""
    __slots__ = ("ip", "port", "type", "source", "score", "last_validated",
                 "success_count", "fail_count", "latency_ms", "country")

    def __init__(self, ip: str, port: int, proxy_type: str = "http",
                 source: str = ""):
        self.ip = ip
        self.port = port
        self.type = proxy_type  # http, socks4, socks5
        self.source = source
        self.score = 50.0  # starting score
        self.last_validated = 0.0  # timestamp
        self.success_count = 0
        self.fail_count = 0
        self.latency_ms = 9999.0
        self.country = ""

    @property
    def url(self) -> str:
        return f"{self.type}://{self.ip}:{self.port}"

    @property
    def is_valid(self) -> bool:
        return self.score > 20.0 and (time.time() - self.last_validated) < 600

    def record_success(self, latency_ms: float):
        self.score = min(100.0, self.score + 5.0)
        self.success_count += 1
        self.latency_ms = (self.latency_ms * 0.7 + latency_ms * 0.3)
        self.last_validated = time.time()

    def record_fail(self):
        self.score = max(0.0, self.score * SCORE_DECAY - 10.0)
        self.fail_count += 1

    def to_dict(self) -> dict:
        return {
            "ip": self.ip, "port": self.port, "type": self.type,
            "source": self.source, "score": self.score,
            "last_validated": self.last_validated,
            "success_count": self.success_count,
            "fail_count": self.fail_count,
            "latency_ms": self.latency_ms,
        }

    @classmethod
    def from_dict(cls, d: dict):
        p = cls(d["ip"], d["port"], d.get("type", "http"), d.get("source", ""))
        p.score = d.get("score", 50.0)
        p.last_validated = d.get("last_validated", 0)
        p.success_count = d.get("success_count", 0)
        p.fail_count = d.get("fail_count", 0)
        p.latency_ms = d.get("latency_ms", 9999)
        return p


class ProxyPool:
    """Scraped proxy pool with validation and scoring."""

    def __init__(self):
        self.proxies: List[ProxyRecord] = []
        self.last_refresh = 0.0
        self._lock = asyncio.Lock()

    # ─── Scraping ──────────────────────────────────────────

    async def populate_pool(self):
        """Scrape all proxy sources."""
        print("[*] Populating proxy pool from all sources...")
        total = 0
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as sess:
            for source in PROXY_SOURCES:
                try:
                    async with sess.get(source["url"]) as resp:
                        if resp.status != 200:
                            continue
                        text = await resp.text()
                        parsed = self._parse_proxies(text, source)
                        async with self._lock:
                            for p in parsed:
                                if not any(x.ip == p.ip and x.port == p.port for x in self.proxies):
                                    self.proxies.append(p)
                        total += len(parsed)
                        print(f"  + {len(parsed)} from {source['url'][:60]}...")
                except Exception as e:
                    print(f"  - Source failed: {source['url'][:50]}... ({e})")

        print(f"[+] Pool populated: {len(self.proxies)} total proxies (from {total} new)")
        self._trim_pool()
        self.last_refresh = time.time()
        self._save_cache()

    def _parse_proxies(self, text: str, source: dict) -> List[ProxyRecord]:
        """Parse proxy list text into ProxyRecord objects."""
        records = []
        proxy_type = source["type"]
        fmt = source["format"]

        if fmt == "json":
            # proxifly JSON format
            try:
                data = json.loads(text)
                for item in data if isinstance(data, list) else []:
                    ip = item.get("ip", "")
                    port = item.get("port", 0)
                    ptype = item.get("protocol", proxy_type)
                    if ip and port:
                        records.append(ProxyRecord(ip, int(port), ptype, source["url"]))
            except json.JSONDecodeError:
                pass
        else:
            # ip:port format (one per line)
            for line in text.strip().split("\n"):
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                parts = line.split(":")
                if len(parts) == 2:
                    ip, port = parts[0], parts[1]
                    try:
                        records.append(ProxyRecord(ip, int(port), proxy_type, source["url"]))
                    except ValueError:
                        continue

        return records

    def _trim_pool(self):
        """Keep only the best proxies."""
        if len(self.proxies) > MAX_POOL_SIZE:
            self.proxies.sort(key=lambda p: p.score, reverse=True)
            self.proxies = self.proxies[:MAX_POOL_SIZE]

    # ─── Validation ────────────────────────────────────────

    async def validate_pool(self, max_workers: int = 50):
        """Test all proxies against Quora's Cloudflare."""
        print(f"[*] Validating {len(self.proxies)} proxies against {VALIDATION_URL}...")
        sem = asyncio.Semaphore(max_workers)

        async def test_proxy(proxy: ProxyRecord):
            async with sem:
                start = time.time()
                try:
                    connector = aiohttp.TCPConnector(ssl=False)
                    async with aiohttp.ClientSession(
                        connector=connector,
                        timeout=aiohttp.ClientTimeout(total=VALIDATION_TIMEOUT),
                    ) as sess:
                        proxy_url = f"{proxy.type}://{proxy.ip}:{proxy.port}"
                        try:
                            async with sess.get(
                                VALIDATION_URL,
                                proxy=proxy_url,
                                headers={
                                    "User-Agent": random.choice(UA_LIST),
                                    "Accept": "text/html,application/xhtml+xml",
                                },
                            ) as resp:
                                text = await resp.text()
                                latency = (time.time() - start) * 1000

                                # Check if Cloudflare blocked
                                if any(kw in text for kw in BLOCK_KEYWORDS):
                                    proxy.record_fail()
                                    return
                                # Check if Quora content loaded
                                if any(kw in text for kw in VALIDATION_KEYWORDS):
                                    proxy.record_success(latency)
                                else:
                                    # Got response but no Quora content
                                    proxy.score = max(0, proxy.score - 15)
                        except Exception:
                            proxy.record_fail()
                except Exception:
                    proxy.record_fail()

        tasks = [test_proxy(p) for p in self.proxies[:200]]  # validate top 200
        await asyncio.gather(*tasks)

        valid = [p for p in self.proxies if p.is_valid]
        print(f"[+] Validation complete: {len(valid)}/{len(self.proxies)} valid")
        self._trim_pool()
        self._save_cache()
        return valid

    # ─── Selection ─────────────────────────────────────────

    def get_best(self, proxy_type: str = None) -> Optional[ProxyRecord]:
        """Get the best scoring proxy."""
        candidates = [p for p in self.proxies if p.is_valid]
        if proxy_type:
            candidates = [p for p in candidates if p.type == proxy_type]
        if not candidates:
            return None

        # Weighted random selection by score
        scores = [max(p.score, 1) for p in candidates]
        total = sum(scores)
        r = random.uniform(0, total)
        cumulative = 0
        for i, p in enumerate(candidates):
            cumulative += scores[i]
            if r <= cumulative:
                return p
        return candidates[-1]

    def get_batch(self, count: int = 5, proxy_type: str = None) -> List[ProxyRecord]:
        """Get multiple proxies (returns best, rotates between calls)."""
        candidates = [p for p in self.proxies if p.is_valid]
        if proxy_type:
            candidates = [p for p in candidates if p.type == proxy_type]
        random.shuffle(candidates)
        return candidates[:count]

    # ─── FlareSolverr integration ──────────────────────────

    async def get_flaresolverr_proxy(self) -> Optional[dict]:
        """
        Get a proxy that FlareSolverr can use.
        Returns {"url": "...", "username": "...", "password": "..."} or None.
        """
        proxy = self.get_best()
        if not proxy:
            return None
        return {"url": proxy.url}

    # ─── Cache ─────────────────────────────────────────────

    def _save_cache(self):
        """Save pool to disk."""
        data = {
            "timestamp": time.time(),
            "proxies": [p.to_dict() for p in self.proxies],
        }
        try:
            with open(CACHE_FILE, "w") as f:
                json.dump(data, f, indent=2)
        except Exception:
            pass

    def load_cache(self) -> bool:
        """Load cached pool from disk."""
        try:
            with open(CACHE_FILE) as f:
                data = json.load(f)
            self.proxies = [ProxyRecord.from_dict(d) for d in data.get("proxies", [])]
            self.last_refresh = data.get("timestamp", 0)
            print(f"[+] Loaded {len(self.proxies)} proxies from cache")
            return True
        except (FileNotFoundError, json.JSONDecodeError):
            return False

    # ─── Stats ─────────────────────────────────────────────

    def stats(self) -> dict:
        valid = len([p for p in self.proxies if p.is_valid])
        return {
            "total": len(self.proxies),
            "valid": valid,
            "by_type": {
                "http": len([p for p in self.proxies if p.type == "http"]),
                "socks4": len([p for p in self.proxies if p.type == "socks4"]),
                "socks5": len([p for p in self.proxies if p.type == "socks5"]),
            },
            "avg_score": sum(p.score for p in self.proxies) / max(len(self.proxies), 1),
            "cache_age": time.time() - self.last_refresh,
        }


# ─── UA Rotation ─────────────────────────────────────────────────
UA_LIST = [
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
]

# ─── Quick test ──────────────────────────────────────────────────
if __name__ == "__main__":
    async def test():
        pool = ProxyPool()
        # Try cache first
        if not pool.load_cache():
            await pool.populate_pool()
        print(f"\nPool stats: {json.dumps(pool.stats(), indent=2)}")
        
        best = pool.get_best()
        if best:
            print(f"\nBest proxy: {best.url} (score={best.score:.1f})")
        
        # Validate if pool is old
        if pool.stats()["cache_age"] > REFRESH_INTERVAL:
            print("\n[*] Pool stale, re-validating...")
            await pool.validate_pool()

    asyncio.run(test())
