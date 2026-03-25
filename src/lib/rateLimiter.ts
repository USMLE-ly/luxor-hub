const lastCalls: Record<string, number> = {};

/**
 * Client-side rate limiter to prevent rapid-fire API calls.
 * Returns true if the action can proceed, false if it's too soon.
 */
export function canProceed(key: string, cooldownMs: number = 3000): boolean {
  const now = Date.now();
  const last = lastCalls[key];
  if (last && now - last < cooldownMs) {
    return false;
  }
  lastCalls[key] = now;
  return true;
}

/**
 * Returns remaining cooldown in milliseconds, or 0 if ready.
 */
export function cooldownRemaining(key: string, cooldownMs: number = 3000): number {
  const last = lastCalls[key];
  if (!last) return 0;
  const remaining = cooldownMs - (Date.now() - last);
  return remaining > 0 ? remaining : 0;
}
