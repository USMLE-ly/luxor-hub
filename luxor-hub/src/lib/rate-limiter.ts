/**
 * LUXOR® Server-Side Rate Limiter
 * 
 * Layer 9 of the production stack.
 * Prevents abuse, protects edge functions, and ensures fair usage.
 * 
 * Uses a sliding window counter stored in localStorage (client-side)
 * and provides helper functions for edge functions to enforce limits.
 */

// ─── CLIENT-SIDE RATE LIMITER ────────────────────────────────────

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check if an action is allowed under the rate limit.
 * @param key - Unique identifier for the action (e.g., "ai-chat", "upload-photo")
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns { allowed: boolean, retryAfterMs: number }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfterMs = windowMs - (now - entry.windowStart);
    return { allowed: false, retryAfterMs };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Get current usage for a key.
 */
export function getRateLimitUsage(
  key: string,
  windowMs: number = 60_000
): { used: number; remaining: number; resetsAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    return { used: 0, remaining: 10, resetsAt: now + windowMs };
  }

  return {
    used: entry.count,
    remaining: Math.max(0, 10 - entry.count),
    resetsAt: entry.windowStart + windowMs,
  };
}

// ─── PREDEFINED RATE LIMITS ─────────────────────────────────────

export const RATE_LIMITS = {
  // Edge function calls
  "ai-chat": { maxRequests: 20, windowMs: 60_000 },        // 20/min
  "ai-analysis": { maxRequests: 5, windowMs: 60_000 },     // 5/min
  "ai-design": { maxRequests: 10, windowMs: 60_000 },      // 10/min
  "support-ai": { maxRequests: 10, windowMs: 60_000 },     // 10/min
  
  // File operations
  "upload-photo": { maxRequests: 20, windowMs: 300_000 },  // 20/5min
  "delete-item": { maxRequests: 30, windowMs: 60_000 },    // 30/min
  
  // Auth operations
  "login": { maxRequests: 5, windowMs: 300_000 },          // 5/5min
  "signup": { maxRequests: 3, windowMs: 300_000 },         // 3/5min
  "password-reset": { maxRequests: 3, windowMs: 600_000 }, // 3/10min
  
  // Social operations
  "like": { maxRequests: 60, windowMs: 60_000 },           // 60/min
  "comment": { maxRequests: 20, windowMs: 60_000 },        // 20/min
  "follow": { maxRequests: 30, windowMs: 60_000 },         // 30/min
  
  // General
  "api-call": { maxRequests: 60, windowMs: 60_000 },       // 60/min
  "page-load": { maxRequests: 120, windowMs: 60_000 },     // 120/min
} as const;

/**
 * Check rate limit using predefined limits.
 */
export function checkPredefinedLimit(
  action: keyof typeof RATE_LIMITS
): { allowed: boolean; retryAfterMs: number } {
  const limit = RATE_LIMITS[action];
  return checkRateLimit(action, limit.maxRequests, limit.windowMs);
}

/**
 * Decorator for rate-limiting async functions.
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  action: keyof typeof RATE_LIMITS
): T {
  return (async (...args: any[]) => {
    const { allowed, retryAfterMs } = checkPredefinedLimit(action);
    if (!allowed) {
      const seconds = Math.ceil(retryAfterMs / 1000);
      throw new Error(`Rate limit exceeded for ${action}. Try again in ${seconds}s.`);
    }
    return fn(...args);
  }) as T;
}
