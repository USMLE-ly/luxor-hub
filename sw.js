const CACHE_NAME = 'lexor-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/pwa.js',
  '/pwa-192.png',
  '/pwa-512.png',
  '/favicon.ico',
  '/favicon.png'
];

// ---- INSTALL ----
self.addEventListener('install', (event) => {
  // Enable navigation preload
  if (self.registration.navigationPreload) {
    event.waitUntil(self.registration.navigationPreload.enable());
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ---- ACTIVATE ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// ---- BACKGROUND SYNC ----
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync:', event.tag);
  if (event.tag === 'sync-outfits') {
    event.waitUntil(syncOutfits());
  } else if (event.tag === 'sync-preferences') {
    event.waitUntil(syncPreferences());
  }
});

async function syncOutfits() {
  // Process queued outfit changes from IndexedDB
  const db = await openDB();
  const pending = await db.getAll('sync-queue');
  // ... process each pending change
  console.log('[SW] Synced', pending.length, 'pending changes');
}

async function syncPreferences() {
  console.log('[SW] Syncing preferences...');
}

// ---- PERIODIC BACKGROUND SYNC ----
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic Sync:', event.tag);
  if (event.tag === 'update-wardrobe-summary') {
    event.waitUntil(async function() {
      // Fetch latest wardrobe summary and cache for offline
      const response = await fetch('/api/wardrobe/summary');
      const cache = await caches.open(CACHE_NAME);
      cache.put('/api/wardrobe/summary', response.clone());
      // Show notification if there are updates
      const data = await response.json();
      if (data.alerts?.length > 0) {
        self.registration.showNotification('LUXOR Wardrobe Update', {
          body: data.alerts.join('. '),
          icon: '/pwa-192.png',
          badge: '/pwa-192.png'
        });
      }
    }());
  }
});

// ---- CONTENT INDEXING ----
self.addEventListener('contentdelete', (event) => {
  console.log('[SW] Content deleted:', event.id);
});

// Register content for offline access
async function registerContent() {
  if (!self.registration.index) return;
  try {
    await self.registration.index.add({
      id: 'wardrobe-overview',
      title: 'My Wardrobe',
      description: 'View your complete wardrobe offline',
      category: 'my-wardrobe',
      icons: [{
        src: '/pwa-192.png',
        sizes: '192x192',
        type: 'image/png'
      }],
      url: '/closet',
      launchUrl: '/closet'
    });
  } catch (e) {
    console.log('[SW] Content indexing error:', e);
  }
}

// ---- PUSH NOTIFICATIONS ----
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {
    title: 'LUXOR',
    body: 'You have a new style update!',
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    tag: 'lexor-general'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      image: data.image,
      tag: data.tag || 'lexor-' + Date.now(),
      data: data.data || { url: data.url || '/dashboard' },
      vibrate: [200, 100, 200],
      actions: data.actions || [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      silent: data.silent || false,
      renotify: data.renotify || false,
      requireInteraction: data.requireInteraction || false,
      timestamp: Date.now()
    })
  );
});

// ---- NOTIFICATION CLICK ----
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  
  if (event.action === 'dismiss') return;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus().then((c) => {
            c.postMessage({ type: 'navigate', url });
            return c;
          });
        }
      }
      return clients.openWindow(url);
    })
  );
});

// ---- NOTIFICATION CLOSE ----
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// ---- FETCH with Navigation Preload ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // Supabase API: network only
  if (url.hostname.includes('supabase')) {
    event.respondWith(fetch(request).catch(() => new Response(null, { status: 503 })));
    return;
  }

  // Navigation: network-first with preload response
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(event));
    return;
  }

  // Static assets: cache-first
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|mp4|webm|webp|avif)$/)) {
    event.respondWith(staticAssetHandler(event));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirstHandler(event));
});

async function navigationHandler(event) {
  // Try preload response first
  if (event.preloadResponse) {
    const preload = await event.preloadResponse;
    if (preload) {
      const clone = preload.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      return preload;
    }
  }
  
  // Network first with offline fallback
  try {
    const response = await fetch(event.request);
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
    return response;
  } catch (e) {
    const cached = await caches.match(event.request);
    return cached || caches.match('/offline.html');
  }
}

async function staticAssetHandler(event) {
  // Network-first: deployed fixes load immediately, not from stale cache
  try {
    const response = await fetch(event.request);
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
    return response;
  } catch (e) {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    return new Response(null, { status: 404 });
  }
}

async function networkFirstHandler(event) {
  try {
    const response = await fetch(event.request);
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
    return response;
  } catch (e) {
    const cached = await caches.match(event.request);
    return cached || new Response(null, { status: 503 });
  }
}

// ---- MESSAGE HANDLING ----
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'ADD_TO_CONTENT_INDEX':
      registerContent();
      break;
    case 'REGISTER_SYNC':
      if (payload?.tag) {
        self.registration.sync.register(payload.tag).catch(() => {});
      }
      break;
    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME).then(() => {
        event.ports?.[0]?.postMessage({ success: true });
      });
      break;
    case 'CLEAR_ALL_CACHES':
      caches.keys().then((keys) => {
        Promise.all(keys.map(k => caches.delete(k))).then(() => {
          event.ports?.[0]?.postMessage({ success: true, deleted: keys.length });
        });
      });
      break;
    case 'GET_CACHE_SIZE':
      caches.open(CACHE_NAME).then((cache) => {
        cache.keys().then((keys) => {
          event.ports?.[0]?.postMessage({ size: keys.length });
        });
      });
      break;
  }
});

// ---- INSTALL CONTENT INDEX ON ACTIVATE ----
self.addEventListener('activate', (event) => {
  event.waitUntil(registerContent());
});

// Log SW lifecycle
console.log('[SW] LUXOR Service Worker v2 loaded');
