/**
 * LUXOR® Service Worker
 * 
 * Layer 10 (Caching/CDN) + Layer 13 (Availability/Recovery)
 * 
 * - Cache-first for static assets (fonts, images, CSS, JS)
 * - Network-first for API calls with offline fallback
 * - Stale-while-revalidate for pages
 */

const CACHE_NAME = "lexor-v1";
const STATIC_CACHE = "lexor-static-v1";
const DYNAMIC_CACHE = "lexor-dynamic-v1";

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/favicon.png",
  "/manifest.webmanifest",
  "/og-image.png",
];

// Install: pre-cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {
        // Non-critical if some fail
        console.log("[SW] Some precache assets unavailable");
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Supabase API calls (let them go to network)
  if (url.hostname.includes("supabase")) return;

  // Skip edge function calls
  if (url.pathname.includes("/functions/v1/")) return;

  // Static assets: cache-first
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image" ||
    url.pathname.match(/\.(woff2?|ttf|eot|css|js|png|jpg|jpeg|gif|svg|ico|mp4)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          // Return offline placeholder for images
          if (request.destination === "image") {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#1a2e2a" width="200" height="200"/><text fill="#c9a84c" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">LUXOR®</text></svg>',
              { headers: { "Content-Type": "image/svg+xml" } }
            );
          }
          return new Response("Offline", { status: 503 });
        });
      })
    );
    return;
  }

  // Pages: stale-while-revalidate
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          return cached || new Response("Offline", { status: 503 });
        });
        return cached || networkFetch;
      })
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.url.includes("luxor.ly")) {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || new Response("Offline", { status: 503 });
        });
      })
  );
});
