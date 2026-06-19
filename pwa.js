// LUXOR PWA - Elite App Runtime
(function() {
  'use strict';

  // ---- BLANK SCREEN FIX: Unregister ALL stale SWs + CLEAR ALL caches ----
  // Root cause: Lovable deployment hasn't picked up the updated sw.js (still lexor-v2).
  // The old SW uses cache-first strategy which serves stale broken JS bundles.
  // We bypass this entirely from the main thread before the SW can intercept anything.
  (function killStaleServiceWorker() {
    // Step 1: Unregister ALL existing service workers immediately
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(regs) {
        regs.forEach(function(reg) {
          reg.unregister();
          console.log('[PWA] Unregistered stale SW:', reg.scope);
        });
      }).catch(function(e) {
        console.warn('[PWA] Failed to unregister SWs:', e);
      });
    }

    // Step 2: Clear ALL caches (every version, not just lexor-v2)
    if ('caches' in window) {
      caches.keys().then(function(keys) {
        return Promise.all(keys.map(function(key) {
          return caches.delete(key).then(function(deleted) {
            if (deleted) console.log('[PWA] Deleted cache:', key);
            return deleted;
          });
        }));
      }).catch(function(e) {
        console.warn('[PWA] Failed to clear caches:', e);
      });
    }

    // Step 3: Override XMLHttpRequest to add cache-busting for assets
    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      if (typeof url === 'string' && url.match(/\.(js|css|woff2?|png|jpg|svg)$/)) {
        var separator = url.indexOf('?') > -1 ? '&' : '?';
        arguments[1] = url + separator + '_cb=' + Date.now();
      }
      return origOpen.apply(this, arguments);
    };

    // Step 4: Patch fetch() to add cache-busting for same-origin assets
    var origFetch = window.fetch;
    if (origFetch) {
      window.fetch = function(input, init) {
        var url = (typeof input === 'string') ? input : (input instanceof Request ? input.url : '');
        if (url && url.match(/\.(js|css|woff2?|png|jpg|svg)$/) && !url.match(/supabase/)) {
          var separator = url.indexOf('?') > -1 ? '&' : '?';
          var newUrl = url + separator + '_cb=' + Date.now();
          if (typeof input === 'string') {
            return origFetch(newUrl, init);
          } else if (input instanceof Request) {
            return origFetch(new Request(newUrl, input), init);
          }
        }
        return origFetch(input, init);
      };
    }

    // Step 5: Add <meta> tags to disable caching
    var meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(meta);

    var meta2 = document.createElement('meta');
    meta2.httpEquiv = 'Pragma';
    meta2.content = 'no-cache';
    document.head.appendChild(meta2);

    var meta3 = document.createElement('meta');
    meta3.httpEquiv = 'Expires';
    meta3.content = '0';
    document.head.appendChild(meta3);

    console.log('[PWA] Blank screen fix active: SW nuked, caches cleared, cache-busting enabled');
  })();

  // ---- INLINE SERVICE WORKER (self-contained, replaces stale /sw.js) ----
  // Generates a fresh SW with network-first strategy and registers it immediately.
  // This bypasses the stale lexor-v2 sw.js that Lovable refuses to update.
  (function registerFreshSW() {
    if (!('serviceWorker' in navigator)) return;

    var swCode = [
      'const CACHE_NAME = "lexor-v4";',
      'self.addEventListener("install", function(e) { e.waitUntil(self.skipWaiting()); });',
      'self.addEventListener("activate", function(e) {',
      '  e.waitUntil(Promise.all([',
      '    caches.keys().then(function(ks) { return Promise.all(ks.map(function(k) { return caches.delete(k); })); }),',
      '    self.clients.claim()',
      '  ]));',
      '});',
      'self.addEventListener("fetch", function(e) {',
      '  var r = e.request;',
      '  if (r.method !== "GET") return;',
      '  e.respondWith((async function() {',
      '    try {',
      '      var res = await fetch(r);',
      '      var cache = await caches.open(CACHE_NAME);',
      '      cache.put(r, res.clone()).catch(function(){});',
      '      return res;',
      '    } catch(e) {',
      '      var cached = await caches.match(r);',
      '      return cached || new Response(null, { status: 503 });',
      '    }',
      '  })());',
      '});'
    ].join('\n');

    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          var blob = new Blob([swCode], { type: 'application/javascript' });
          var blobUrl = URL.createObjectURL(blob);
          navigator.serviceWorker.register(blobUrl, { scope: '/' }).then(function(reg) {
            console.log('[PWA] Fresh inline SW registered via blob URL');
          }).catch(function(err) {
            console.log('[PWA] Blob SW registration failed, fallback to /sw.js:', err);
            navigator.serviceWorker.register('/sw.js?_cb=' + Date.now(), {
              updateViaCache: 'none'
            }).then(function(reg) {
              console.log('[PWA] Fallback SW registered (checking for update)');
              if (reg.active) {
                reg.update();
              }
            }).catch(function(e2) {
              console.warn('[PWA] Fallback SW registration also failed:', e2);
            });
          });
        } catch(e) {
          console.warn('[PWA] Inline SW generation failed:', e);
        }
      }, 100);
    });
  })();

  let deferredPrompt = null;
  const $$ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$all = (sel, ctx) => (ctx || document).querySelectorAll(sel);
  const docEl = () => document.documentElement;

  // ---- SHOW UPDATE AVAILABLE ----
  function showUpdateAvailable() {
    try {
      const banner = document.getElementById('pwa-update-banner');
      if (banner) {
        banner.style.display = 'flex';
      } else {
        var div = document.createElement('div');
        div.id = 'pwa-update-banner';
        div.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#C8A951;color:#000;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;z-index:9999;font-family:sans-serif;';
        div.innerHTML = '<span style="font-weight:600;">New version available</span><button id="pwa-update-btn" style="background:#000;color:#C8A951;border:none;padding:8px 20px;border-radius:6px;font-weight:600;cursor:pointer;">Update</button>';
        document.body.appendChild(div);
        document.getElementById('pwa-update-btn')?.addEventListener('click', function() {
          if (deferredPrompt) {
            deferredPrompt.prompt();
          } else {
            window.location.reload();
          }
        });
      }
    } catch (e) {
      console.warn('[PWA] Update banner error:', e);
    }
  }

  // ---- SERVICE WORKER UPDATE MONITORING ----
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async function() {
      try {
        var reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;

        reg.addEventListener('updatefound', function() {
          var newSW = reg.installing;
          if (!newSW) return;
          newSW.addEventListener('statechange', function() {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateAvailable();
            }
          });
        });
      } catch (err) {
        console.warn('[PWA] SW update monitoring failed:', err);
      }
    });
  }

  // ---- PERIODIC BACKGROUND SYNC ----
  async function registerPeriodicSync(reg) {
    if (!('periodicSync' in reg)) return;
    try {
      var status = await navigator.permissions.query({ name: 'periodic-background-sync' });
      if (status.state === 'granted') {
        await reg.periodicSync.register('update-wardrobe-summary', {
          minInterval: 24 * 60 * 60 * 1000
        });
        console.log('[PWA] Periodic sync registered');
      }
    } catch (e) {
      console.log('[PWA] Periodic sync not available:', e.name);
    }
  }

  // ---- CONTENT INDEXING ----
  async function registerContentIndex(reg) {
    if (!('index' in reg)) return;
    try {
      navigator.serviceWorker.controller?.postMessage({
        type: 'ADD_TO_CONTENT_INDEX'
      });
    } catch (e) {
      console.log('[PWA] Content indexing not available');
    }
  }

  // ---- BACKGROUND SYNC ----
  async function registerSync(reg, tag) {
    try {
      await reg.sync.register(tag);
    } catch (e) {
      console.log('[PWA] Background sync not available:', tag);
    }
  }

  // ---- INSTALL PROMPT ----
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-install-prompt', { 
      detail: { prompt: e } 
    }));
    if (window.fbq) fbq('track', 'PWAInstallPromptShown');
  });

  window.addEventListener('appinstalled', function() {
    deferredPrompt = null;
    console.log('[PWA] App installed');
    var installBanner = document.getElementById('pwa-install-banner');
    if (installBanner) installBanner.style.display = 'none';
    if (window.gtag) gtag('event', 'install', { app_id: 'com.luxor.app' });
    if (window.fbq) fbq('track', 'PWAInstalled');
  });

  // ---- BADGING API ----
  async function setBadge(count) {
    if (!navigator.setAppBadge) return;
    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
    } catch (e) {}
  }

  // ---- DISPLAY MODE ----
  function getDisplayMode() {
    if (navigator.standalone) return 'standalone';
    if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
    if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
    if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
    if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return 'window-controls-overlay';
    return 'browser';
  }

  function safeDocEl() {
    var el = document.documentElement;
    if (!el) return { classList: { add: function() {}, remove: function() {}, toggle: function() {}, contains: function() { return false; } } };
    return el;
  }

  if (docEl() && getDisplayMode() === 'standalone') {
    docEl().classList.add('pwa-mode');
  }

  if (window.matchMedia) {
    window.matchMedia('(display-mode: standalone)').addEventListener('change', function(e) {
      var el = safeDocEl();
      el.classList.toggle('pwa-mode', e.matches);
    });
  }

  // ---- NETWORK STATUS ----
  function updateNetworkStatus() {
    var isOffline = !navigator.onLine;
    var el = safeDocEl();
    el.classList.toggle('is-offline', isOffline);
    var offlineBanner = document.querySelector('.offline-banner');
    if (offlineBanner) offlineBanner.style.display = isOffline ? 'flex' : 'none';
    
    if (isOffline) {
      setBadge(1);
    } else {
      setBadge(0);
    }
  }

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  if (docEl()) updateNetworkStatus();

  // ---- WAKE LOCK ----
  var wakeLock = null;
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', function() {
          console.log('[PWA] Wake lock released');
        });
      }
    } catch (e) {
      console.log('[PWA] Wake lock not available');
    }
  }

  window.addEventListener('route-change', function(e) {
    if (e.detail?.pathname?.includes('outfit-builder')) {
      requestWakeLock();
    } else if (wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
  });

  // ---- SHARE API ----
  window.shareApp = async function(data) {
    if (!navigator.share) {
      await navigator.clipboard.writeText(data.url || window.location.href);
      return { fallback: 'clipboard' };
    }
    try {
      await navigator.share({
        title: data.title || document.title,
        text: data.text || '',
        url: data.url || window.location.href
      });
      return { shared: true };
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.warn('[PWA] Share failed:', e);
      }
      return { shared: false, error: e };
    }
  };

  // ---- CLIPBOARD ----
  window.copyToClipboard = async function(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e2) {
        console.warn('[PWA] Clipboard fallback failed');
      }
      return true;
    }
  };

  // ---- VIBRATION / HAPTICS ----
  window.haptic = function(pattern) {
    try {
      if (navigator.vibrate) {
        if (pattern === 'light') navigator.vibrate(10);
        else if (pattern === 'medium') navigator.vibrate(20);
        else if (pattern === 'heavy') navigator.vibrate([10, 50, 10]);
        else if (pattern === 'success') navigator.vibrate([10, 30, 10, 30, 10]);
        else if (pattern === 'error') navigator.vibrate([50, 50, 50]);
        else if (pattern === 'click') navigator.vibrate(5);
        else navigator.vibrate(pattern);
      }
    } catch (e) {}
  };

  // ---- REDUCED MOTION ----
  if (window.matchMedia) {
    try {
      var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      var el = safeDocEl();
      el.classList.toggle('reduce-motion', motionQuery.matches);
      motionQuery.addEventListener('change', function(e) {
        safeDocEl().classList.toggle('reduce-motion', e.matches);
      });
    } catch (e) {
      console.log('[PWA] Reduced motion query not available');
    }
  }

  // ---- CONTRAST PREFERENCE ----
  if (window.matchMedia) {
    try {
      var contrastQuery = window.matchMedia('(prefers-contrast: more)');
      var el = safeDocEl();
      el.classList.toggle('high-contrast', contrastQuery.matches);
      contrastQuery.addEventListener('change', function(e) {
        safeDocEl().classList.toggle('high-contrast', e.matches);
      });
    } catch (e) {
      console.log('[PWA] Contrast query not available');
    }
  }

  // ---- EXPOSE PWA APIs ----
  window.pwa = {
    install: async function() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        var result = await deferredPrompt.userChoice;
        deferredPrompt = null;
        return result.outcome;
      }
      return 'not_available';
    },
    canInstall: function() { return !!deferredPrompt; },
    isStandalone: function() { return getDisplayMode() === 'standalone'; },
    isOffline: function() { return !navigator.onLine; },
    setBadge: setBadge,
    clearBadge: function() { return setBadge(0); },
    requestWakeLock: requestWakeLock,
    share: window.shareApp,
    copy: window.copyToClipboard,
    haptic: window.haptic,
    version: '2.2.0'
  };

  console.log('[PWA] Runtime initialized');
  try {
    console.log('[PWA] Display mode:', getDisplayMode());
    console.log('[PWA] Online:', navigator.onLine);
  } catch (e) {}
})();
