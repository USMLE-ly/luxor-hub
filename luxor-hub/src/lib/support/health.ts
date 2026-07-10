/**
 * LEXOR® System Health Check
 * Lightweight health probes for all critical services.
 * Run on page load + periodically to detect issues before users report them.
 */

export interface HealthCheck {
  service: string;
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  lastChecked: string;
  error?: string;
}

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || "";

// ─── INDIVIDUAL CHECKS ────────────────────────────────────────────

async function checkSupabase(): Promise<HealthCheck> {
  const start = performance.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: SUPABASE_ANON },
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Math.round(performance.now() - start);
    return {
      service: "Supabase",
      status: res.ok ? "healthy" : "degraded",
      latencyMs,
      lastChecked: new Date().toISOString(),
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (e: any) {
    return {
      service: "Supabase",
      status: "down",
      latencyMs: Math.round(performance.now() - start),
      lastChecked: new Date().toISOString(),
      error: e.message,
    };
  }
}

async function checkEdgeFunctions(): Promise<HealthCheck> {
  const start = performance.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/get-weather`, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
      signal: AbortSignal.timeout(10000),
    });
    const latencyMs = Math.round(performance.now() - start);
    return {
      service: "Edge Functions",
      status: res.ok || res.status === 400 ? "healthy" : "degraded",
      latencyMs,
      lastChecked: new Date().toISOString(),
      error: res.ok || res.status === 400 ? undefined : `HTTP ${res.status}`,
    };
  } catch (e: any) {
    return {
      service: "Edge Functions",
      status: "down",
      latencyMs: Math.round(performance.now() - start),
      lastChecked: new Date().toISOString(),
      error: e.message,
    };
  }
}

async function checkDomain(): Promise<HealthCheck> {
  const start = performance.now();
  try {
    const res = await fetch(window.location.origin, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Math.round(performance.now() - start);
    return {
      service: "Domain (luxor.ly)",
      status: res.ok ? "healthy" : "degraded",
      latencyMs,
      lastChecked: new Date().toISOString(),
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (e: any) {
    return {
      service: "Domain (luxor.ly)",
      status: "down",
      latencyMs: Math.round(performance.now() - start),
      lastChecked: new Date().toISOString(),
      error: e.message,
    };
  }
}

// ─── FULL HEALTH CHECK ────────────────────────────────────────────

export async function runHealthCheck(): Promise<HealthCheck[]> {
  const results = await Promise.all([checkSupabase(), checkEdgeFunctions(), checkDomain()]);
  return results;
}

export function getOverallStatus(checks: HealthCheck[]): "operational" | "degraded" | "major_outage" {
  if (checks.every((c) => c.status === "healthy")) return "operational";
  if (checks.some((c) => c.status === "down")) return "major_outage";
  return "degraded";
}
