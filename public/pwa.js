// LUXOR PWA - Elite App Runtime
(function() {
  'use strict';

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
        // Create a minimal update banner on the fly
        const div = document.createElement('div');
        div.id = 'pwa-update-banner';
        div.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#C8A951;color:#000;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;z-index:9999;font-family:sans-serif;';
        div.innerHTML = '<span style="font-weight:600;">New version available</span><button id="pwa-update-btn" style="background:#000;color:#C8A951;border:none;padding:8px 20px;border-radius:6px;font-weight:600;cursor:pointer;">Update</button>';
        document.body.appendChild(div);
        document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
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

  // ---- SERVICE WORKER REGISTRATION ----
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('[PWA] SW registered:', reg.scope);

        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          if (!newSW) return;
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateAvailable();
            }
          });
        });

        registerPeriodicSync(reg);
        registerContentIndex(reg);
        registerSync(reg, 'sync-outfits');
        registerSync(reg, 'sync-preferences');

      } catch (err) {
        console.warn('[PWA] SW registration failed:', err);
      }
    });
  }

  // ---- PERIODIC BACKGROUND SYNC ----
  async function registerPeriodicSync(reg) {
    if (!('periodicSync' in reg)) return;
    try {
      const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
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
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-install-prompt', { 
      detail: { prompt: e } 
    }));
    if (window.fbq) fbq('track', 'PWAInstallPromptShown');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    console.log('[PWA] App installed');
    const installBanner = document.getElementById('pwa-install-banner');
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
    try {
      return window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser';
    } catch (e) {
      return 'browser';
    }
  }

  function safeDocEl() {
    const el = docEl();
    return el || document.body || document.head || { classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } } };
  }

  if (docEl() && getDisplayMode() === 'standalone') {
    docEl().classList.add('pwa-mode');
  }

  if (window.matchMedia) {
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      const el = safeDocEl();
      el.classList.toggle('pwa-mode', e.matches);
    });
  }

  // ---- NETWORK STATUS ----
  function updateNetworkStatus() {
    const isOffline = !navigator.onLine;
    const el = safeDocEl();
    el.classList.toggle('is-offline', isOffline);
    const offlineBanner = document.querySelector('.offline-banner');
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
  let wakeLock = null;
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          console.log('[PWA] Wake lock released');
        });
      }
    } catch (e) {
      console.log('[PWA] Wake lock not available');
    }
  }

  window.addEventListener('route-change', (e) => {
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
        const ta = document.createElement('textarea');
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
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const el = safeDocEl();
      el.classList.toggle('reduce-motion', motionQuery.matches);
      motionQuery.addEventListener('change', (e) => {
        safeDocEl().classList.toggle('reduce-motion', e.matches);
      });
    } catch (e) {
      console.log('[PWA] Reduced motion query not available');
    }
  }

  // ---- CONTRAST PREFERENCE ----
  if (window.matchMedia) {
    try {
      const contrastQuery = window.matchMedia('(prefers-contrast: more)');
      const el = safeDocEl();
      el.classList.toggle('high-contrast', contrastQuery.matches);
      contrastQuery.addEventListener('change', (e) => {
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
        const result = await deferredPrompt.userChoice;
        deferredPrompt = null;
        return result.outcome;
      }
      return 'not_available';
    },
    canInstall: () => !!deferredPrompt,
    isStandalone: () => getDisplayMode() === 'standalone',
    isOffline: () => !navigator.onLine,
    setBadge,
    clearBadge: () => setBadge(0),
    requestWakeLock,
    share: window.shareApp,
    copy: window.copyToClipboard,
    haptic: window.haptic,
    version: '2.1.0'
  };

  console.log('[PWA] Runtime initialized');
  try {
    console.log('[PWA] Display mode:', getDisplayMode());
    console.log('[PWA] Online:', navigator.onLine);
  } catch (e) {}
})();
