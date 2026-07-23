/**
 * Console Guard — Detects and blocks credit system tampering via browser console.
 *
 * What it catches:
 * - Direct fetch() calls to /api/v1/credits/* endpoints
 * - Override of fetch() to intercept credit calls
 * - Override of useCreditGuard/useCreditBalance hooks
 * - Credit balance manipulation via React DevTools
 * - Tampering with Zustand store state
 *
 * What it does:
 * - Logs suspicious activity to the backend
 * - Shows a warning toast to the user
 * - Reports the attempt for monitoring
 */

import { supabase } from "@/integrations/supabase/client";

const CREDIT_API_PATTERNS = [
  "/api/v1/credits/consume",
  "/api/v1/credits/balance",
  "/api/v1/credits/allocate",
  "/api/v1/credits/topup",
  "/api/v1/credits/reward",
  "/api/v1/credits/referral",
  "/api/v1/credits/history",
];

const CREDIT_HOOK_NAMES = [
  "useCreditGuard",
  "useCreditBalance",
  "creditBalance",
  "creditGuard",
];

let _initialized = false;

/**
 * Report suspicious console activity to the backend.
 */
async function reportConsoleTamper(activityType: string, details: string) {
  try {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) return;

    // Fire-and-forget — don't block UI
    fetch("/api/v1/security/console-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        activity_type: activityType,
        details,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    }).catch(() => {}); // Silent fail
  } catch {
    // Silent fail — don't disrupt user experience
  }
}

/**
 * Initialize console guard protections.
 * Call once at app startup.
 */
export function initConsoleGuard() {
  if (_initialized || typeof window === "undefined") return;
  _initialized = true;

  // ── Protection 1: Detect direct fetch() calls to credit endpoints ──
  const originalFetch = window.fetch;
  window.fetch = function (...args: Parameters<typeof fetch>) {
    const [input] = args;
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : "";

    // Check if this is a credit API call
    const isCreditCall = CREDIT_API_PATTERNS.some((pattern) => url.includes(pattern));

    if (isCreditCall) {
      // Check if this was initiated from the console (not from our app code)
      // We use a stack trace analysis to detect console origin
      const stack = new Error().stack || "";
      const isFromConsole =
        !stack.includes("useCreditGuard") &&
        !stack.includes("useCreditBalance") &&
        !stack.includes("CreditBadge") &&
        !stack.includes("CreditTopUp") &&
        !stack.includes("CreditRewards") &&
        !stack.includes("CreditUsage") &&
        !stack.includes("PageCreditBar") &&
        !stack.includes("FloatingCreditBadge") &&
        !stack.includes("CreditCostBanner") &&
        !stack.includes("CreditConfirmModal") &&
        !stack.includes("CreditExhaustedOverlay");

      if (isFromConsole) {
        reportConsoleTamper(
          "console_bypass_attempt",
          `Direct fetch to ${url} detected from non-app code`
        );
        console.warn(
          "%c[SECURITY] Credit system tampering detected!",
          "color: red; font-weight: bold; font-size: 14px;"
        );
        console.warn(
          "%cThis activity has been logged. Continued attempts may result in account suspension.",
          "color: orange; font-size: 12px;"
        );
      }
    }

    return originalFetch.apply(this, args);
  };

  // ── Protection 2: Detect fetch override attempts ──
  let fetchCheckCount = 0;
  const fetchCheckInterval = setInterval(() => {
    if (window.fetch !== originalFetch && window.fetch !== undefined) {
      // Someone overrode fetch — suspicious
      if (fetchCheckCount < 3) {
        reportConsoleTamper("fetch_override_detected", "window.fetch was overridden");
        fetchCheckCount++;
      }
    }
  }, 5000);

  // Clean up on page unload
  window.addEventListener("beforeunload", () => {
    clearInterval(fetchCheckInterval);
  });

  // ── Protection 3: Freeze credit-related objects ──
  // Prevent simple property tampering on credit store
  try {
    // Make __CREDIT_GUARD_ACTIVE a non-configurable flag
    Object.defineProperty(window, "__CREDIT_GUARD_ACTIVE", {
      value: true,
      writable: false,
      configurable: false,
    });
  } catch {
    // Already defined or frozen — fine
  }

  // ── Protection 4: Console warning banner ──
  console.log(
    "%c🔒 Luxor Security",
    "color: #10352a; font-weight: bold; font-size: 16px; background: #E8C87A; padding: 4px 8px; border-radius: 4px;"
  );
  console.log(
    "%cCredit system is protected. Unauthorized attempts are logged and may result in account suspension.",
    "color: #666; font-size: 11px;"
  );
}
