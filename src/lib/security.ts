/**
 * LEXOR Security Module — Runtime Integrity Checks
 * Protects against: debugger, devtools, hooking
 * ⚠️ NOTE: Does NOT freeze built-in prototypes — that breaks React/JS frameworks
 */

export class SecurityModule {
  private static instance: SecurityModule;
  private integrityInterval: number | null = null;
  private compromised = false;

  private constructor() {
    // No prototype freezing — that breaks React and all modern JS frameworks
  }

  static getInstance(): SecurityModule {
    if (!SecurityModule.instance) {
      SecurityModule.instance = new SecurityModule();
    }
    return SecurityModule.instance;
  }

  /**
   * Start periodic integrity checks
   */
  startMonitoring(intervalMs = 10000): void {
    if (this.integrityInterval) return;

    this.integrityInterval = window.setInterval(() => {
      if (this.detectDevTools()) {
        this.onCompromised('DevTools detected');
      }
      if (this.detectHooking()) {
        this.onCompromised('Code hooking detected');
      }
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.integrityInterval) {
      clearInterval(this.integrityInterval);
      this.integrityInterval = null;
    }
  }

  /**
   * Detect DevTools via outer/inner window dimension check
   */
  private detectDevTools(): boolean {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    if (widthThreshold || heightThreshold) {
      return true;
    }
    return false;
  }

  /**
   * Detect React/Vue devtools hook presence
   */
  private detectHooking(): boolean {
    try {
      const hooks = ['__REACT_DEVTOOLS_GLOBAL_HOOK__', '__VUE_DEVTOOLS_GLOBAL_HOOK__'];
      for (const key of hooks) {
        if ((window as any)[key]) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Handle compromise detection
   */
  private onCompromised(reason: string): void {
    if (this.compromised) return;
    this.compromised = true;

    // Dispatch event for app to handle
    window.dispatchEvent(new CustomEvent('lexor:security-compromised', {
      detail: { reason, timestamp: Date.now() }
    }));
  }

  /**
   * Check if device is secure via native bridge
   */
  async isDeviceSecure(): Promise<boolean> {
    try {
      if (typeof (window as any).WebViewBridge?.isDeviceSecure === 'function') {
        return (window as any).WebViewBridge.isDeviceSecure();
      }
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Get security report from native layer
   */
  async getSecurityReport(): Promise<string> {
    try {
      if (typeof (window as any).WebViewBridge?.getSecurityReport === 'function') {
        return (window as any).WebViewBridge.getSecurityReport();
      }
      return 'Security bridge not available';
    } catch {
      return 'Security bridge not available';
    }
  }
}

// Export singleton
export const security = SecurityModule.getInstance();
export default security;
