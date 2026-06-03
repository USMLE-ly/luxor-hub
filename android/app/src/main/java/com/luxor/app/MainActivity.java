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

    private static final String CHANNEL_ID = "lexor_notifications";
    private static final String CHANNEL_NAME = "LEXOR Notifications";
    private static final String CHANNEL_DESC = "Style alerts, outfit suggestions, and AI recommendations";

    private SecurityUtils securityUtils;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // ╔══════════════════════════════════════════════════╗
        // ║   LEXOR SECURITY SUITE — Enterprise Protection  ║
        // ╚══════════════════════════════════════════════════╝
        securityUtils = new SecurityUtils(this);
        boolean secure = securityUtils.audit();

        if (!secure) {
            Log.w("LEXOR-Security", 
                "⚠ Running on potentially compromised device: " + 
                securityUtils.getReport());
        }

        // 1. Edge-to-edge display (Android 15+)
        EdgeToEdge.enable(this);

        // 2. Window insets handling
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(
            getWindow(), getWindow().getDecorView()
        );
        insetsController.setAppearanceLightStatusBars(false);
        insetsController.setAppearanceLightNavigationBars(false);

        // 3. ⚡ SECURE FLAG — Prevent screenshots and screen recording
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);

        // 4. Predictive back gesture (Android 14+)
        // Handled automatically by AndroidX Activity

        // 5. Create notification channels (Android 8+ required)
        createNotificationChannels();

        // 6. WebView configuration (post-bridge init)
        getBridge().getWebView().addOnAttachStateChangeListener(new View.OnAttachStateChangeListener() {
            @Override
            public void onViewAttachedToWindow(View v) {
                configureWebView((WebView) v);
                v.removeOnAttachStateChangeListener(this);
            }
            @Override public void onViewDetachedFromWindow(View v) {}
        });
    }

    /**
     * Configure WebView with security settings balanced for app functionality
     */
    private void configureWebView(WebView webView) {
        if (webView == null) return;
        
        WebSettings settings = webView.getSettings();
        
        // Required for Capacitor with androidScheme: 'https'
        settings.setAllowFileAccess(false);               // No local file access
        settings.setAllowFileAccessFromFileURLs(false);    // No file protocol
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setAllowContentAccess(false);             // No content://
        
        // Secure JavaScript
        settings.setJavaScriptEnabled(true);               // Required for app
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setDomStorageEnabled(true);
        
        // Disable form auto-fill (security risk)
        settings.setSavePassword(false);
        settings.setSaveFormData(false);
        
        // Disable zoom controls (prevents UI manipulation)
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        
        // Disable mixed content (block HTTP on HTTPS pages)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }
        
        // Enable WebGL and related features needed by Three.js/React Three Fiber
        settings.setAllowFileAccess(false);
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // Enable hardware acceleration for WebGL
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        
        // Remove dangerous JS interfaces
        webView.removeJavascriptInterface("accessibility");
        webView.removeJavascriptInterface("accessibilityTraversal");
        
        // Use secure WebView client
        webView.setWebViewClient(new SecureWebViewClient());
        
        // Add JS bridge for error logging from web app
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void logError(String message, String stack) {
                Log.e("LEXOR-JS", "JS Error: " + message + "\n" + stack);
            }
            @JavascriptInterface
            public void logInfo(String message) {
                Log.i("LEXOR-JS", message);
            }
        }, "AndroidBridge");
        
        // Disable long-press selection (prevents text extraction)
        webView.setOnLongClickListener(v -> {
            WebView.HitTestResult result = webView.getHitTestResult();
            if (result != null && result.getType() == WebView.HitTestResult.UNKNOWN_TYPE) {
                return true; // Consume the event
            }
            return false;
        });

        Log.i("LEXOR-Security", "✅ WebView configured");
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
                "lexor_style_alerts",
                "Style Alerts",
                android.app.NotificationManager.IMPORTANCE_DEFAULT
            );
            styleChannel.setDescription("Daily style recommendations and trend alerts");

            android.app.NotificationChannel socialChannel = new android.app.NotificationChannel(
                "lexor_social",
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
        // Re-check security on resume
        if (securityUtils != null) {
            boolean secure = securityUtils.audit();
            if (!secure) {
                Log.w("LEXOR-Security", 
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
        // Ensure FLAG_SECURE is maintained
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
    }
}
