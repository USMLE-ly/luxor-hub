package com.luxor.app;

import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.JavascriptInterface;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;
import android.util.Log;

public class MainActivity extends BridgeActivity {

    private static final String CHANNEL_ID = "luxor_notifications";
    private static final String CHANNEL_NAME = "LUXOR Notifications";
    private static final String CHANNEL_DESC = "Style alerts, outfit suggestions, and AI recommendations";

    private SecurityUtils securityUtils;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        securityUtils = new SecurityUtils(this);
        boolean secure = securityUtils.audit();

        if (!secure) {
            Log.w("LUXOR-Security", 
                "⚠ Running on potentially compromised device: " + 
                securityUtils.getReport());
        }

        // 1. Edge-to-edge display
        EdgeToEdge.enable(this);

        // 2. Window insets handling
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(
            getWindow(), getWindow().getDecorView()
        );
        insetsController.setAppearanceLightStatusBars(false);
        insetsController.setAppearanceLightNavigationBars(false);

        // 3. Prevent screenshots and screen recording
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);

        // 4. Create notification channels
        createNotificationChannels();

        // 5. WebView configuration (runs after bridge init)
        getBridge().getWebView().post(() -> configureWebView(getBridge().getWebView()));
    }

    /**
     * Configure WebView with security settings balanced for app functionality.
     * Does NOT replace Capacitor's built-in WebViewClient (which handles
     * WebViewAssetLoader for serving local assets). Replacing it would cause
     * a blank screen because the app content would never load.
     */
    private void configureWebView(WebView webView) {
        if (webView == null) return;
        
        WebSettings settings = webView.getSettings();

        // Security: disable unwanted access
        settings.setAllowFileAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setAllowContentAccess(false);

        // JavaScript must be enabled
        settings.setJavaScriptEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setDomStorageEnabled(true);

        // Disable form auto-fill
        settings.setSavePassword(false);
        settings.setSaveFormData(false);

        // Disable zoom controls
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // Allow mixed content (needed for Capacitor local http://localhost)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // Enable WebGL / Three.js features
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Hardware acceleration for WebGL
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // Remove dangerous JS interfaces
        webView.removeJavascriptInterface("accessibility");
        webView.removeJavascriptInterface("accessibilityTraversal");

        // CRITICAL: Do NOT call webView.setWebViewClient() here.
        // Capacitor's bridge has its own WebViewClient that handles
        // WebViewAssetLoader for serving local files over the configured scheme.
        // Replacing it breaks asset loading and causes a blank screen.

        // Add JS bridge for error logging from web app
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void logError(String message, String stack) {
                Log.e("LUXOR-JS", "JS Error: " + message + "\n" + stack);
            }
            @JavascriptInterface
            public void logInfo(String message) {
                Log.i("LUXOR-JS", message);
            }
        }, "AndroidBridge");

        // Disable long-press selection
        webView.setOnLongClickListener(v -> {
            WebView.HitTestResult result = webView.getHitTestResult();
            if (result != null && result.getType() == WebView.HitTestResult.UNKNOWN_TYPE) {
                return true;
            }
            return false;
        });

        Log.i("LUXOR-Security", "✅ WebView configured");
    }

    @android.webkit.JavascriptInterface
    public String getSecurityReport() {
        return securityUtils != null ? securityUtils.getReport() : "Security not initialized";
    }

    @android.webkit.JavascriptInterface
    public boolean isDeviceSecure() {
        return securityUtils == null || !securityUtils.isCompromised();
    }

    private void createNotificationChannels() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            android.app.NotificationChannel channel = new android.app.NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                android.app.NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription(CHANNEL_DESC);
            channel.enableLights(true);
            channel.enableVibration(true);
            channel.setShowBadge(true);

            android.app.NotificationChannel styleChannel = new android.app.NotificationChannel(
                "luxor_style_alerts",
                "Style Alerts",
                android.app.NotificationManager.IMPORTANCE_DEFAULT
            );
            styleChannel.setDescription("Daily style recommendations and trend alerts");

            android.app.NotificationChannel socialChannel = new android.app.NotificationChannel(
                "luxor_social",
                "Social",
                android.app.NotificationManager.IMPORTANCE_LOW
            );
            socialChannel.setDescription("Friend activity and community updates");

            android.app.NotificationManager manager = getSystemService(android.app.NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
                manager.createNotificationChannel(styleChannel);
                manager.createNotificationChannel(socialChannel);
            }
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (securityUtils != null) {
            boolean secure = securityUtils.audit();
            if (!secure) {
                Log.w("LUXOR-Security", 
                    "⚠ Security check on resume: " + securityUtils.getReport());
            }
        }
        // Clear notification badges when app opens
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            android.app.NotificationManager manager = getSystemService(android.app.NotificationManager.class);
            if (manager != null) {
                manager.cancelAll();
            }
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
    }
}
