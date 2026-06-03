# ╔══════════════════════════════════════════════════════════╗
# ║  LEXOR — Enterprise ProGuard Rules                      ║
# ║  Obfuscation · Optimization · Anti-Tamper               ║
# ╚══════════════════════════════════════════════════════════╝

# ── Aggressive Obfuscation ──
-optimizationpasses 5
-allowaccessmodification
-repackageclasses 'l'
-flattenpackagehierarchy 'l'
-overloadaggressively
-mergeinterfacesaggressively

# ── Remove all logging in release ──
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
    public static int i(...);
    public static int w(...);
}
-assumenosideeffects class java.lang.Throwable {
    public void printStackTrace();
}

# ── Remove debug metadata ──
-dontusemixedcaseclassnames
-renamesourcefileattribute 'RELEASE'
-keepattributes !SourceFile,!LineNumberTable,!LocalVariableTable
-keepattributes *Annotation*, Signature, Exception, InnerClasses, EnclosingMethod

# ── Keep application entry point ──
-keep class com.luxor.app.MainActivity { *; }
-keep class com.luxor.app.SecurityUtils { *; }
-keep class com.luxor.app.SecureWebViewClient { *; }

# ── Keep Capacitor bridge interfaces ──
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class * implements com.getcapacitor.Plugin { *; }
-keepclassmembers class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
}

# ── Keep WebView JavaScript interface methods ──
-keepclassmembers class com.luxor.app.MainActivity {
    @android.webkit.JavascriptInterface <methods>;
}

# ── Keep Firebase / FCM ──
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# ── Keep Supabase client ──
-keep class com.supabase.** { *; }

# ── Keep Gson / serialization ──
-keep class com.google.gson.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# ── Keep Kotlin coroutines ──
-keep class kotlinx.coroutines.** { *; }

# ── Keep AndroidX / Jetpack ──
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# ── Strip debugging features ──
-dontskipnonpubliclibraryclasses
-dontskipnonpubliclibraryclassmembers
-verbose
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*

# ── Additional optimizations ──
-keepclassmembers class * {
    *** access$*(...);
}
-keepclassmembernames class * {
    java.lang.Class class$;
    java.lang.Class class$(java.lang.String);
}

# ── Fix R8 missing classes for Firebase KTX ──
-dontwarn com.google.firebase.ktx.**
-keep class com.google.firebase.ktx.** { *; }
