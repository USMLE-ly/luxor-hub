/**
 * LUXOR® Resilience Layer
 * 
 * Layer 13 of the production stack: Availability and Recovery.
 * 
 * - Auto-retry with exponential backoff
 * - Graceful degradation for failed API calls
 * - Data backup/export functionality
 * - Offline queue for failed mutations
 */

import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

// ─── AUTO-RETRY WITH EXPONENTIAL BACKOFF ─────────────────────────

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry an async function with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30_000,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = Math.min(
          baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
          maxDelayMs
        );

        console.warn(
          `[LUXOR RETRY] Attempt ${attempt + 1}/${maxRetries} failed: ${lastError.message}. Retrying in ${Math.round(delay)}ms...`
        );

        onRetry?.(attempt + 1, lastError);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// ─── GRACEFUL DEGRADATION ───────────────────────────────────────

/**
 * Execute a function with a fallback value if it fails.
 */
export async function withFallback<T>(
  fn: () => Promise<T>,
  fallback: T | (() => T),
  options?: { logError?: boolean; errorMessage?: string }
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (options?.logError !== false) {
      console.warn(
        `[LUXOR DEGRADE] ${options?.errorMessage || "Operation failed"}, using fallback:`,
        error
      );
    }
    return typeof fallback === "function"
      ? (fallback as () => T)()
      : fallback;
  }
}

/**
 * Supabase query with automatic fallback.
 */
export async function resilientQuery<T>(
  queryFn: () => Promise<{ data: T[] | null; error: any }>,
  fallback: T[] = [],
  options?: { retries?: number }
): Promise<T[]> {
  return withRetry(
    async () => {
      const { data, error } = await queryFn();
      if (error) throw error;
      return data || fallback;
    },
    {
      maxRetries: options?.retries ?? 2,
      baseDelayMs: 500,
    }
  ).catch(() => fallback);
}

// ─── OFFLINE QUEUE ───────────────────────────────────────────────

interface QueuedMutation {
  id: string;
  table: string;
  action: "insert" | "update" | "delete";
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

const QUEUE_KEY = "lexor_offline_queue";
const MAX_QUEUE_SIZE = 50;
const MAX_RETRIES = 3;

/**
 * Queue a mutation for later execution (when back online).
 */
export function queueMutation(
  table: string,
  action: "insert" | "update" | "delete",
  data: Record<string, unknown>
): void {
  try {
    const queue = getQueue();
    
    // Prevent duplicates
    const duplicate = queue.find(
      (q) => q.table === table && q.action === action && JSON.stringify(q.data) === JSON.stringify(data)
    );
    if (duplicate) return;

    // Prevent queue overflow
    if (queue.length >= MAX_QUEUE_SIZE) {
      queue.shift(); // Remove oldest
    }

    queue.push({
      id: `Q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      table,
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
    });

    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // localStorage might be full or unavailable
  }
}

/**
 * Process the offline queue when back online.
 */
export async function processOfflineQueue(): Promise<{ processed: number; failed: number }> {
  if (!isSupabaseConfigured) return { processed: 0, failed: 0 };

  const queue = getQueue();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  let processed = 0;
  let failed = 0;
  const remaining: QueuedMutation[] = [];

  for (const mutation of queue) {
    try {
      let result;
      switch (mutation.action) {
        case "insert":
          result = await supabase.from(mutation.table).insert(mutation.data);
          break;
        case "update":
          result = await supabase
            .from(mutation.table)
            .update(mutation.data)
            .eq("id", (mutation.data as any).id);
          break;
        case "delete":
          result = await supabase
            .from(mutation.table)
            .delete()
            .eq("id", (mutation.data as any).id);
          break;
      }

      if (result?.error) throw result.error;
      processed++;
    } catch (error) {
      mutation.retries++;
      if (mutation.retries < MAX_RETRIES) {
        remaining.push(mutation);
      } else {
        failed++;
        console.error(`[LUXOR QUEUE] Mutation ${mutation.id} failed after ${MAX_RETRIES} retries:`, error);
      }
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { processed, failed };
}

function getQueue(): QueuedMutation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── DATA BACKUP / EXPORT ────────────────────────────────────────

/**
 * Export all user data as a JSON backup.
 */
export async function exportUserData(): Promise<Blob> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const [profile, style, clothing, outfits, calendar, wearLogs, chatMessages, designs] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("style_profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("clothing_items").select("*").eq("user_id", user.id),
    supabase.from("outfits").select("*").eq("user_id", user.id),
    supabase.from("calendar_events").select("*").eq("user_id", user.id),
    supabase.from("wear_logs").select("*").eq("user_id", user.id),
    supabase.from("chat_messages").select("*").eq("user_id", user.id),
    supabase.from("fashion_designs").select("*").eq("user_id", user.id),
  ]);

  const backup = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    userId: user.id,
    email: user.email,
    data: {
      profile: profile.data,
      styleProfile: style.data,
      clothingItems: clothing.data || [],
      outfits: outfits.data || [],
      calendarEvents: calendar.data || [],
      wearLogs: wearLogs.data || [],
      chatMessages: chatMessages.data || [],
      fashionDesigns: designs.data || [],
    },
  };

  return new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
}

/**
 * Download the backup file.
 */
export async function downloadBackup(): Promise<void> {
  const blob = await exportUserData();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lexor-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── ONLINE/OFFLINE MONITORING ───────────────────────────────────

let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

export function getOnlineStatus(): boolean {
  return isOnline;
}

export function initResilience(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("online", () => {
    isOnline = true;
    console.log("[LUXOR RESILIENCE] Back online — processing offline queue...");
    processOfflineQueue().then(({ processed, failed }) => {
      if (processed > 0) console.log(`[LUXOR RESILIENCE] Synced ${processed} queued mutations`);
      if (failed > 0) console.warn(`[LUXOR RESILIENCE] ${failed} mutations failed after retries`);
    });
  });

  window.addEventListener("offline", () => {
    isOnline = false;
    console.log("[LUXOR RESILIENCE] Gone offline — mutations will be queued");
  });

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      console.log("[LUXOR RESILIENCE] Service worker registered:", reg.scope);
    }).catch((err) => {
      console.warn("[LUXOR RESILIENCE] Service worker registration failed:", err);
    });
  }
}
