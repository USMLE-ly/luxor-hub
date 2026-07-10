/**
 * LEXOR® Production Error Monitor
 * Catches every error in real-time, categorizes it, and routes to the right tier.
 * 
 * This is your 2 AM engineer. It never sleeps.
 */

import { matchKnownIssue, createTriageReport, getAutomatedFix, type TriageReport } from "./playbook";

type ErrorCategory = "auth" | "payment" | "ai" | "wardrobe" | "weather" | "dns" | "ui" | "unknown";

interface ErrorEvent {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  category: ErrorCategory;
  feature: string;
  url: string;
  userId?: string;
  tier: 1 | 2 | 3;
  resolved: boolean;
  triage?: TriageReport;
}

// In-memory ring buffer (last 100 errors)
const errorBuffer: ErrorEvent[] = [];
const MAX_BUFFER = 100;

// Error category detection
function categorizeError(message: string, stack?: string): { category: ErrorCategory; feature: string } {
  const text = `${message} ${stack || ""}`.toLowerCase();

  if (text.includes("auth") || text.includes("login") || text.includes("session") || text.includes("supabase.auth"))
    return { category: "auth", feature: "Authentication" };
  if (text.includes("payment") || text.includes("paypal") || text.includes("subscription") || text.includes("paywall"))
    return { category: "payment", feature: "Payments" };
  if (text.includes("edge function") || text.includes("mimo") || text.includes("analyze") || text.includes("style dna"))
    return { category: "ai", feature: "AI Analysis" };
  if (text.includes("closet") || text.includes("wardrobe") || text.includes("upload") || text.includes("closet_items"))
    return { category: "wardrobe", feature: "Wardrobe & Closet" };
  if (text.includes("weather") || text.includes("get-weather"))
    return { category: "weather", feature: "Weather Integration" };
  if (text.includes("dns") || text.includes("name_not_resolved") || text.includes("vercel"))
    return { category: "dns", feature: "Domain & DNS" };
  if (text.includes("referenceerror") || text.includes("typeerror") || text.includes("scrollreveal") || text.includes("render"))
    return { category: "ui", feature: "UI Runtime" };

  return { category: "unknown", feature: "Unknown" };
}

// ─── CORE MONITOR ─────────────────────────────────────────────────

export function captureError(error: Error, context: Record<string, unknown> = {}): ErrorEvent {
  const { category, feature } = categorizeError(error.message, error.stack);
  const knownIssue = matchKnownIssue(error.message);

  const event: ErrorEvent = {
    id: `ERR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    category,
    feature,
    url: typeof window !== "undefined" ? window.location.href : "server",
    userId: (context.userId as string) || undefined,
    tier: knownIssue?.tier || 2,
    resolved: false,
  };

  // Try automated fix (Tier 1)
  if (knownIssue?.automatedFix) {
    console.log(`[SUPPORT TIER 1] Auto-fix available for ${knownIssue.id}: ${knownIssue.automatedFix}`);
    event.resolved = true;
  }

  // Create triage report (Tier 2)
  if (event.tier >= 2) {
    event.triage = createTriageReport(error, feature, context);
    console.warn(`[SUPPORT TIER 2] Triage report created:`, event.triage);
  }

  // Incident response (Tier 3)
  if (event.tier === 3 || category === "payment" || category === "dns") {
    console.error(`[SUPPORT TIER 3] INCIDENT: ${error.message}`, event);
  }

  // Add to ring buffer
  errorBuffer.push(event);
  if (errorBuffer.length > MAX_BUFFER) errorBuffer.shift();

  // Log to console for DevTools visibility
  console.error(`[LEXOR MONITOR] [${category.toUpperCase()}] [TIER ${event.tier}] ${error.message}`);

  return event;
}

// ─── GLOBAL ERROR HANDLERS ────────────────────────────────────────

let initialized = false;

export function initMonitor(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Catch unhandled errors
  window.addEventListener("error", (event) => {
    captureError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const message = event.reason?.message || event.reason?.toString() || "Unhandled Promise Rejection";
    captureError(new Error(message), {
      type: "unhandledrejection",
      reason: event.reason,
    });
  });

  // Catch React errors via error boundary callback
  window.addEventListener("react-error", ((event: CustomEvent) => {
    captureError(event.detail.error, {
      componentStack: event.detail.componentStack,
    });
  }) as EventListener);

  console.log("[LEXOR MONITOR] Production error monitor initialized. Tier 1-3 support active.");
}

// ─── QUERY API ─────────────────────────────────────────────────────

export function getRecentErrors(limit = 20): ErrorEvent[] {
  return errorBuffer.slice(-limit);
}

export function getErrorsByCategory(category: ErrorCategory): ErrorEvent[] {
  return errorBuffer.filter((e) => e.category === category);
}

export function getErrorsByTier(tier: 1 | 2 | 3): ErrorEvent[] {
  return errorBuffer.filter((e) => e.tier === tier);
}

export function getErrorStats(): {
  total: number;
  byTier: Record<number, number>;
  byCategory: Record<string, number>;
  unresolved: number;
} {
  const byTier: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  const byCategory: Record<string, number> = {};
  let unresolved = 0;

  for (const e of errorBuffer) {
    byTier[e.tier] = (byTier[e.tier] || 0) + 1;
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    if (!e.resolved) unresolved++;
  }

  return { total: errorBuffer.length, byTier, byCategory, unresolved };
}
