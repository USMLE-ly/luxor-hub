**v2.2.2 — Black screen FIXED**

Root cause: `MainActivity.configureWebView()` called `webView.setWebViewClient(new SecureWebViewClient())`, which replaced Capacitor's built-in WebViewClient. Capacitor's WebViewClient handles `WebViewAssetLoader` to serve local files over the configured scheme. Without it, the app loads a blank page because no content is served.

**Fixes:**
- Removed `webView.setWebViewClient()` call — Capacitor's bridge now handles asset serving
- Changed `androidScheme` from `"https"` to `"http"` + hostname to `"localhost"` (eliminates TLS/cert issues)
- Changed `mixedContentMode` from `NEVER_ALLOW` to `ALWAYS_ALLOW` (needed for local HTTP)
- Relaxed `network_security_config.xml` base-config to permit cleartext for localhost
- Fixed all LEXOR->LUXOR in notification channels and app name
