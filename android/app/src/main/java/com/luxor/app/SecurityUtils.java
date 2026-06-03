package com.luxor.app;

import android.app.ActivityManager;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.os.Build;

import android.provider.Settings;
import android.util.Base64;
import android.util.Log;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.List;

/**
 * LEXOR Security — Enterprise-grade protection suite
 * Guards against: root, emulation, tampering, debugging, hooking
 */
public class SecurityUtils {
    private static final String TAG = "LEXOR-Security";
    private static final String EXPECTED_SIGNATURE = "5D4DC5770B82CBAAEBB9DAB62B0708EBB5D919EE53834654F8492000638074B9";
    
    private final Context context;
    private boolean compromised = false;
    private final StringBuilder report = new StringBuilder();

    public SecurityUtils(Context context) {
        this.context = context;
    }

    /** Run full security audit — returns true if device/app is secure */
    public boolean audit() {
        compromised = false;
        report.setLength(0);

        checkRoot();
        checkEmulator();
        checkDebugging();
        checkTampering();
        checkHooking();
        checkDeveloperSettings();
        checkAdb();
        
        if (compromised) {
            Log.w(TAG, "⚠ Security compromised: " + report.toString());
        } else {
            Log.i(TAG, "✅ Security audit passed");
        }
        return !compromised;
    }

    public String getReport() { return report.toString(); }
    public boolean isCompromised() { return compromised; }

    // ============================================================
    // 1. ROOT DETECTION
    // ============================================================
    private void checkRoot() {
        // Check for root binaries
        String[] rootPaths = {
            "/sbin/su", "/system/bin/su", "/system/xbin/su",
            "/data/local/xbin/su", "/data/local/bin/su",
            "/system/sd/xbin/su", "/system/bin/failsafe/su",
            "/data/local/su", "/su/bin/su",
            "/system/xbin/busybox", "/system/bin/busybox",
            "/system/xbin/magisk", "/system/bin/magisk",
            "/data/adb/magisk", "/data/adb/su"
        };
        for (String path : rootPaths) {
            if (new File(path).exists()) {
                report.append("Root binary: ").append(path).append("; ");
                compromised = true;
                return;
            }
        }

        // Check for root packages
        try {
            List<PackageInfo> packages = context.getPackageManager()
                .getInstalledPackages(PackageManager.MATCH_UNINSTALLED_PACKAGES);
            for (PackageInfo pkg : packages) {
                String name = pkg.packageName.toLowerCase();
                if (name.contains("supersu") || name.contains("magisk") ||
                    name.contains("superuser") || name.contains("kingroot") ||
                    name.contains("kingoroot")) {
                    report.append("Root app: ").append(pkg.packageName).append("; ");
                    compromised = true;
                    return;
                }
            }
        } catch (Exception ignored) {}

        // Check for test-keys (custom ROMs often have test keys)
        String buildTags = Build.TAGS;
        if (buildTags != null && buildTags.contains("test-keys")) {
            report.append("Test-keys build; ");
            compromised = true;
        }
    }

    // ============================================================
    // 2. EMULATOR DETECTION
    // ============================================================
    private void checkEmulator() {
        // Common emulator properties
        if (Build.FINGERPRINT != null && 
            (Build.FINGERPRINT.contains("generic") || 
             Build.FINGERPRINT.contains("vbox") ||
             Build.FINGERPRINT.contains("emu"))) {
            report.append("Emulator fingerprint; ");
            compromised = true;
        }

        if (Build.MODEL != null &&
            (Build.MODEL.contains("google_sdk") || 
             Build.MODEL.contains("Emulator") ||
             Build.MODEL.contains("Android SDK"))) {
            report.append("Emulator model; ");
            compromised = true;
        }

        if (Build.MANUFACTURER != null &&
            (Build.MANUFACTURER.contains("Genymotion") ||
             Build.MANUFACTURER.contains("unknown"))) {
            report.append("Emulator manufacturer; ");
            compromised = true;
        }

        // Check for emulator specific files
        String[] emulatorFiles = {
            "/system/lib/libc_malloc_debug_qemu.so",
            "/system/lib64/libc_malloc_debug_qemu.so",
            "/system/bin/qemu-props",
            "/dev/socket/qemud",
            "/dev/qemu_pipe"
        };
        for (String path : emulatorFiles) {
            if (new File(path).exists()) {
                report.append("Emulator file: ").append(path).append("; ");
                compromised = true;
                return;
            }
        }

        // Check for Genymotion
        if (Build.BRAND != null && Build.BRAND.contains("generic") &&
            Build.DEVICE != null && Build.DEVICE.contains("generic")) {
            report.append("Genymotion detected; ");
            compromised = true;
        }
    }

    // ============================================================
    // 3. DEBUG DETECTION
    // ============================================================
    private void checkDebugging() {
        // Check if app is debuggable
        if ((context.getApplicationContext().getApplicationInfo().flags & 
             android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            report.append("Debuggable app; ");
            compromised = true;
        }

        // Check for debugger
        if (android.os.Debug.isDebuggerConnected() || 
            android.os.Debug.waitingForDebugger()) {
            report.append("Debugger attached; ");
            compromised = true;
        }

        // Check if ADB is enabled
        if (Settings.Global.getInt(context.getContentResolver(),
            Settings.Global.ADB_ENABLED, 0) == 1) {
            report.append("ADB enabled; ");
        }
    }

    // ============================================================
    // 4. TAMPER DETECTION (APK Signature Verification)
    // ============================================================
    private void checkTampering() {
        try {
            PackageInfo pkgInfo;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pkgInfo = context.getPackageManager()
                    .getPackageInfo(context.getPackageName(), 
                        PackageManager.GET_SIGNING_CERTIFICATES);
                if (pkgInfo.signingInfo != null) {
                    Signature[] sigs = pkgInfo.signingInfo.getApkContentsSigners();
                    if (sigs != null && sigs.length > 0) {
                        String currentSig = getSignatureHash(sigs[0]);
                        if (!EXPECTED_SIGNATURE.equals(currentSig)) {
                            report.append("Signature mismatch! Expected=")
                                .append(EXPECTED_SIGNATURE).append(" Got=")
                                .append(currentSig).append("; ");
                            compromised = true;
                        }
                    }
                }
            } else {
                @SuppressWarnings("deprecation")
                Signature[] sigs = context.getPackageManager()
                    .getPackageInfo(context.getPackageName(),
                        PackageManager.GET_SIGNATURES).signatures;
                if (sigs != null && sigs.length > 0) {
                    String currentSig = getSignatureHash(sigs[0]);
                    if (!EXPECTED_SIGNATURE.equals(currentSig)) {
                        report.append("Signature mismatch; ");
                        compromised = true;
                    }
                }
            }
        } catch (Exception e) {
            report.append("Signature check failed: ").append(e.getMessage()).append("; ");
            compromised = true;
        }
    }

    private String getSignatureHash(Signature signature) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(signature.toByteArray());
            StringBuilder hex = new StringBuilder();
            for (byte b : digest) {
                hex.append(String.format("%02X", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            return "";
        }
    }

    // ============================================================
    // 5. HOOKING DETECTION (Frida, Xposed, Substrate)
    // ============================================================
    private void checkHooking() {
        // Check for Xposed
        try {
            ClassLoader cl = context.getClassLoader();
            Class.forName("de.robv.android.xposed.XposedBridge");
            report.append("Xposed detected; ");
            compromised = true;
            return;
        } catch (ClassNotFoundException | NoClassDefFoundError ignored) {}

        // Check for Xposed modules
        String[] xposedPaths = {
            "/data/data/de.robv.android.xposed.installer/",
            "/system/framework/XposedBridge.jar",
            "/system/lib/libsigchain.so"
        };
        for (String path : xposedPaths) {
            if (new File(path).exists()) {
                report.append("Xposed path: ").append(path).append("; ");
                compromised = true;
                return;
            }
        }

        // Check for Frida
        try {
            // Frida typically maps its agent library
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(new ProcessBuilder()
                    .command("cat", "/proc/self/maps")
                    .redirectErrorStream(true)
                    .start().getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("frida-agent") || 
                    line.contains("frida-helper") ||
                    line.contains("frida-server")) {
                    report.append("Frida detected; ");
                    compromised = true;
                    break;
                }
            }
            reader.close();
        } catch (Exception ignored) {}

        // Check for Frida by port scanning
        try {
            Process process = new ProcessBuilder()
                .command("cat", "/proc/net/tcp")
                .redirectErrorStream(true)
                .start();
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains(":1F90") || // port 8080
                    line.contains(":113A") || // port 4444 (old frida)
                    line.contains(":27042") || line.contains(":6996")) { // frida ports
                    report.append("Frida port detected; ");
                    compromised = true;
                    break;
                }
            }
            reader.close();
        } catch (Exception ignored) {}

        // Check for Substrate
        try {
            Class.forName("com.saurik.substrate.MS$2");
            report.append("Substrate detected; ");
            compromised = true;
        } catch (ClassNotFoundException | NoClassDefFoundError ignored) {}

        // Check for Cydia Substrate
        if (new File("/data/data/com.saurik.substrate/").exists()) {
            report.append("Substrate installed; ");
            compromised = true;
        }
    }

    // ============================================================
    // 6. DEVELOPER SETTINGS
    // ============================================================
    private void checkDeveloperSettings() {
        try {
            int devOptions = Settings.Global.getInt(
                context.getContentResolver(),
                Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0);
            if (devOptions == 1) {
                report.append("Developer options enabled; ");
            }
        } catch (Exception ignored) {}
    }

    // ============================================================
    // 7. ADB STATUS
    // ============================================================
    private void checkAdb() {
        try {
            int adbEnabled = Settings.Global.getInt(
                context.getContentResolver(),
                Settings.Global.ADB_ENABLED, 0);
            if (adbEnabled == 1) {
                report.append("ADB enabled; ");
            }
        } catch (Exception ignored) {}
    }

    // ============================================================
    // PUBLIC HELPERS
    // ============================================================
    
    /** Check if running on a secure connection */
    public static boolean isSecureConnection(Context context) {
        // Check for VPN
        try {
            ActivityManager am = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
            if (am != null) {
                for (ActivityManager.RunningAppProcessInfo process : am.getRunningAppProcesses()) {
                    if (process.processName.contains("vpn") || 
                        process.processName.contains("tun")) {
                        return false;
                    }
                }
            }
        } catch (Exception ignored) {}
        return true;
    }

    /** Secure flag for preventing screenshots in sensitive views */
    public static int getSecureFlag() {
        return android.view.WindowManager.LayoutParams.FLAG_SECURE;
    }

    /** Check if the device has a locked bootloader */
    public static boolean isBootloaderLocked() {
        try {
            String unlocked = getSystemProperty("ro.boot.verifiedbootstate");
            if (unlocked != null && !unlocked.equals("green")) {
                return false;
            }
        } catch (Exception ignored) {}
        return true;
    }

    private static String getSystemProperty(String name) {
        try {
            Process process = new ProcessBuilder()
                .command("getprop", name)
                .redirectErrorStream(true)
                .start();
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()));
            String value = reader.readLine();
            reader.close();
            return value;
        } catch (IOException e) {
            return null;
        }
    }
}
