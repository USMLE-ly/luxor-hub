/**
 * LUXOR® Service Worker
 * 
 * - Network-first for media (videos, images) to avoid caching bad responses
 * - Stale-while-revalidate for static assets (fonts, images that don't change)
 * - Network-first for JS/CSS to prevent stale chunk hashes
 * - Stale-while-revalidate for pages
 */

const CACHE_NAME = "luxor-v3";
const STATIC_CACHE = "luxor-static-v3";
const DYNAMIC_CACHE = "luxor-dynamic-v3";

// Install: clear ALL old caches and activate immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: claim all clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Supabase API calls
  if (url.hostname.includes("supabase")) return;

  // Skip edge function calls
  if (url.pathname.includes("/functions/v1/")) return;

  // JS/CSS: network-first (prevents stale chunk hashes)
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    url.pathname.match(/\.(js|css)$/)
  ) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(request).then((cached) => {
          return cached || new Response("Offline", { status: 503 });
        });
      })
    );
    return;
  }

  // Videos: ALWAYS network-first (never cache — videos are large and may change)
  if (url.pathname.match(/\.mp4$/)) {
    event.respondWith(
      fetch(request).then((response) => {
        return response;
      }).catch(() => {
        return new Response("Video unavailable offline", { status: 503 });
      })
    );
    return;
  }

  // Poster images / static images: stale-while-revalidate
  if (
    request.destination === "image" ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp)$/)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          const networkFetch = fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            // If network fails, return cached version if available
            if (cached) return cached;
            // Return a branded fallback for images
            if (request.destination === "image") {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect fill="#10352a" width="400" height="600"/><text fill="#E8C87A" font-family="sans-serif" font-size="18" x="50%" y="50%" text-anchor="middle" dy=".3em">LUXOR®</text></svg>',
                { headers: { "Content-Type": "image/svg+xml" } }
              );
            }
            return new Response("Offline", { status: 503 });
          });
          // Return cached immediately if available, update in background
          return cached || networkFetch;
        });
      })
    );
    return;
  }

  // Fonts: cache-first (fonts never change)
  if (
    request.destination === "font" ||
    url.pathname.match(/\.(woff2?|ttf|eot)$/)
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
        });
      })
    );
    return;
  }

  // Pages: stale-while-revalidate
  if (request.mode === "navigate") {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          const networkFetch = fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            return cached || new Response("Offline", { status: 503 });
          });
          return cached || networkFetch;
        });
      })
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200 && request.url.includes("luxor.ly")) {
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
