/**
 * LEXOR® Security Module — Runtime Integrity Checks
 * Version: 2.1.2
 * 
 * IMPORTANT: This module does NOT run any code at import time.
 * All initialization happens lazily when startMonitoring() is called.
 */

export interface SecurityEvent {
  reason: string;
  time: number;
  type: 'devtools' | 'hooking' | 'prototype' | 'root' | 'emulator' | 'tamper';
}

export class SecurityModule {
  private static instance: SecurityModule | null = null;
  private integrityInterval: ReturnType<typeof setInterval> | null = null;
  private compromised = false;
  private listeners: Array<(event: SecurityEvent) => void> = [];
  private initialized = false;

  private constructor() {
    // No side effects in constructor — everything starts lazily
  }

  static getInstance(): SecurityModule {
    if (!SecurityModule.instance) {
      SecurityModule.instance = new SecurityModule();
    }
    return SecurityModule.instance;
  }

  /** Must be called once before startMonitoring to set up listeners */
  private ensureInitialized(): void {
    if (this.initialized) return;
    this.initialized = true;
    try {
      window.addEventListener('lexor:security', ((e: CustomEvent) => {
        try {
          const detail = e.detail || {};
          this.handleViolation({
            reason: detail.reason || 'hook',
            time: detail.time || Date.now(),
            type: 'hooking'
          });
        } catch {}
      }) as EventListener);
    } catch {}
  }

  /** Subscribe to security events */
  onSecurityEvent(callback: (event: SecurityEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /** Start periodic integrity checks */
  startMonitoring(intervalMs = 10000): void {
    if (this.integrityInterval) return;
    this.ensureInitialized();

    this.integrityInterval = setInterval(() => {
      try {
        if (this.detectDevTools()) {
          this.handleViolation({
            reason: 'DevTools detected',
            time: Date.now(),
            type: 'devtools'
          });
        }
        if (this.detectHooking()) {
          this.handleViolation({
            reason: 'Code hooking detected',
            time: Date.now(),
            type: 'hooking'
          });
        }
      } catch {
        // Silently ignore — WebView may restrict some APIs
      }
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.integrityInterval) {
      clearInterval(this.integrityInterval);
      this.integrityInterval = null;
    }
  }

  /** Detect DevTools via multiple methods */
  private detectDevTools(): boolean {
    try {
      const wThreshold = window.outerWidth - window.innerWidth > 160;
      const hThreshold = window.outerHeight - window.innerHeight > 160;
      if (wThreshold || hThreshold) return true;
      try {
        if ((window.console as any)?.firebug) return true;
      } catch {}
      return false;
    } catch {
      return false;
    }
  }

  /** Detect JS hooking frameworks */
  private detectHooking(): boolean {
    try {
      const hooks = [
        '__REACT_DEVTOOLS_GLOBAL_HOOK__',
        '__VUE_DEVTOOLS_GLOBAL_HOOK__',
        '__REDUX_DEVTOOLS_EXTENSION__'
      ];
      for (const key of hooks) {
        if ((window as any)[key]) return true;
      }
      if (typeof (window as any).Frida !== 'undefined') return true;
    } catch {}
    return false;
  }

  /** Handle detected security violation */
  private handleViolation(event: SecurityEvent): void {
    try {
      if (this.compromised) return;
      this.compromised = true;
      this.listeners.forEach(l => l(event));
      window.dispatchEvent(new CustomEvent('lexor:security-compromised', {
        detail: event
      }));
    } catch {
      // Never throw
    }
  }

  /** Check device security via native bridge */
  async isDeviceSecure(): Promise<boolean> {
    try {
      const bridge = (window as any).WebViewBridge;
      if (typeof bridge?.isDeviceSecure === 'function') {
        return await Promise.resolve(bridge.isDeviceSecure());
      }
      return true;
    } catch {
      return true;
    }
  }

  /** Get security report from native layer */
  async getSecurityReport(): Promise<string> {
    try {
      const bridge = (window as any).WebViewBridge;
      if (typeof bridge?.getSecurityReport === 'function') {
        return await Promise.resolve(bridge.getSecurityReport());
      }
      return 'Security bridge not available';
    } catch {
      return 'Security bridge not available';
    }
  }

  /** Check if currently compromised */
  isCompromised(): boolean {
    return this.compromised;
  }

  /** Reset compromised state */
  reset(): void {
    this.compromised = false;
  }
}

// Export singleton — but NO code runs at module level
export const security = SecurityModule.getInstance();
export default security;
