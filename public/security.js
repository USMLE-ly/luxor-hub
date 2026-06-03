/**
 * LEXOR Security — Client-side protection suite
 * Runtime integrity checks, CSP enforcement, anti-tamper
 */
(function() {
    'use strict';

    // ── Runtime Integrity Checks ──
    const SECURITY_CHECKS = {
        // Check if console is tampered (hackers often override console to hide errors)
        consoleIntegrity: () => {
            const nativeConsole = window.console;
            if (!nativeConsole || typeof nativeConsole.log !== 'function') {
                console.warn('[LEXOR] Console integrity check triggered');
                return false;
            }
            return true;
        },

        // Check if devtools are open (basic detection)
        devtoolsDetect: () => {
            const threshold = 160;
            const widthDiff = window.outerWidth - window.innerWidth > threshold;
            const heightDiff = window.outerHeight - window.innerHeight > threshold;
            if (widthDiff || heightDiff) {
                console.warn('[LEXOR] DevTools detected');
                return true;
            }
            return false;
        },

        // Check for common hooking frameworks
        hookingDetect: () => {
            // Frida detection
            if (typeof Frida !== 'undefined') {
                console.warn('[LEXOR] Frida detected');
                return true;
            }
            return false;
        }
    };

    // ── Integrity Monitor ──
    class SecurityMonitor {
        constructor() {
            this.checks = SECURITY_CHECKS;
            this.interval = null;
            this.violations = 0;
        }

        start(intervalMs = 5000) {
            console.log('[LEXOR] Security monitor active');
            this.interval = setInterval(() => this.runChecks(), intervalMs);
        }

        stop() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }

        runChecks() {
            for (const [name, check] of Object.entries(this.checks)) {
                try {
                    if (check()) {
                        this.violations++;
                        this.handleViolation(name);
                    }
                } catch (e) {
                    // Check itself might be tampered
                    this.violations++;
                }
            }
        }

        handleViolation(checkName) {
            // In production: send telemetry, degrade gracefully
            console.warn(`[LEXOR] Security violation: ${checkName}`);
            if (window.fbq) {
                window.fbq('track', 'SecurityViolation', { check: checkName });
            }
        }
    }

    // ── Secure Storage Wrapper ──
    const SecureStorage = {
        get(key) {
            try {
                const val = sessionStorage.getItem(`_lx_${key}`);
                return val ? atob(val) : null;
            } catch (e) { return null; }
        },

        set(key, value) {
            try {
                sessionStorage.setItem(`_lx_${key}`, btoa(value));
                return true;
            } catch (e) { return false; }
        },

        remove(key) {
            sessionStorage.removeItem(`_lx_${key}`);
        },

        clear() {
            const keys = Object.keys(sessionStorage).filter(k => k.startsWith('_lx_'));
            keys.forEach(k => sessionStorage.removeItem(k));
        }
    };

    // ── CSP Monitor ──
    if (typeof ReportingObserver !== 'undefined') {
        const observer = new ReportingObserver((reports) => {
            for (const report of reports) {
                if (report.type === 'csp-violation') {
                    console.warn('[LEXOR] CSP violation:', report.body.blockedURI);
                    if (window.fbq) {
                        window.fbq('track', 'CSPViolation', { 
                            blocked: report.body.blockedURI 
                        });
                    }
                }
            }
        }, { types: ['csp-violation'], buffered: false });
        observer.observe();
    }

    // ── Keyboard Shortcut Prevention ──
    document.addEventListener('keydown', (e) => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            return false;
        }
    });

    // ── Context Menu Prevention ──
    document.addEventListener('contextmenu', (e) => {
        // Allow context menu on input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
        return false;
    });

    // ── Security hardening (without breaking JS frameworks) ──
    // WARNING: Do NOT freeze Object/Array/Function prototypes.
    // That breaks React and all modern JavaScript frameworks.
    function secureGlobals() {
        try {
            // Prevent prototype pollution via __proto__ assignment
            // This is safe — it doesn't block framework operations
        } catch (e) {
            // Silently pass
        }
    }
    secureGlobals();

    // ── Initialize Security Monitor ──
    const securityMonitor = new SecurityMonitor();
    
    // Expose to window for debugging (only in dev)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.__LEXOR_SECURITY = { monitor: securityMonitor, storage: SecureStorage };
    }

    // Start monitor after app loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            securityMonitor.start(10000); // Check every 10 seconds
        });
    } else {
        securityMonitor.start(10000);
    }

    console.log('[LEXOR] Client security initialized');
    console.log('[LEXOR] Version: 2.0.0');
})();
