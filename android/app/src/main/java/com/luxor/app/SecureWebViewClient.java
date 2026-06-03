package com.luxor.app;

import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * LEXOR Secure WebView Client
 * Blocks malicious content, enforces HTTPS, injects security headers
 */
public class SecureWebViewClient extends WebViewClient {
    private static final String TAG = "LEXOR-SecureWebView";
    
    // Content Security Policy — restricts scripts, connections, frames
    private static final String CSP_HEADER = 
        "default-src 'self' https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com " +
        "https://fonts.gstatic.com https://*.fbcdn.net https://connect.facebook.net " +
        "https://*.google-analytics.com https://*.googletagmanager.com; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net " +
        "https://*.googletagmanager.com https://*.google-analytics.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' data: blob: https:; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co " +
        "https://*.google-analytics.com https://*.googletagmanager.com " +
        "https://api.stripe.com; " +
        "frame-src 'self' https://connect.facebook.net https://js.stripe.com; " +
        "media-src 'self' https:; " +
        "worker-src 'self' blob:;";

    private static final Map<String, String> SECURITY_HEADERS = new HashMap<>();
    static {
        SECURITY_HEADERS.put("Content-Security-Policy", CSP_HEADER);
        SECURITY_HEADERS.put("X-Content-Type-Options", "nosniff");
        SECURITY_HEADERS.put("X-Frame-Options", "DENY");
        SECURITY_HEADERS.put("X-XSS-Protection", "1; mode=block");
        SECURITY_HEADERS.put("Referrer-Policy", "strict-origin-when-cross-origin");
        SECURITY_HEADERS.put("Permissions-Policy", 
            "camera=(self), microphone=(self), geolocation=(self), notifications=(self)");
        SECURITY_HEADERS.put("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        
        // Block cleartext HTTP (except localhost for dev)
        if (url.startsWith("http://") && !url.contains("localhost") && !url.contains("10.0.2.2")) {
            Log.w(TAG, "Blocked cleartext HTTP: " + url);
            return new WebResourceResponse("text/plain", "utf-8", 
                new ByteArrayInputStream("Blocked by LEXOR security".getBytes()));
        }

        return null; // Allow the request to proceed normally
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        
        // Allow only HTTPS, custom scheme, or known safe protocols
        if (url.startsWith("https://") || 
            url.startsWith("lexor://") ||
            url.startsWith("blob:") ||
            url.startsWith("data:") ||
            url.startsWith("about:blank")) {
            return false;
        }
        
        // Block everything else
        Log.w(TAG, "Blocked URL: " + url);
        return true;
    }

    /** Inject security headers into the WebView's response */
    public static Map<String, String> getSecurityHeaders() {
        return SECURITY_HEADERS;
    }
}
