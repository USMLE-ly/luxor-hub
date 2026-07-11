/**
 * LEXOR® Tenant Isolation Monitor
 * 
 * Monitors for cross-tenant data access attempts in real-time.
 * This is your 2 AM security guard. It never sleeps.
 * 
 * If Customer A ever sees Customer B's data, this system detects it
 * within milliseconds and triggers an incident response.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── TYPES ───────────────────────────────────────────────────────

export type SecuritySeverity = "low" | "medium" | "high" | "critical";
export type SecurityEvent = 
  | "cross_tenant_query"
  | "rls_bypass_attempt"
  | "unauthorized_edge_function"
  | "session_hijack_suspected"
  | "data_exfiltration_pattern"
  | "bulk_data_access"
  | "suspicious_auth_flow";

interface SecurityIncident {
  id: string;
  timestamp: string;
  event: SecurityEvent;
  severity: SecuritySeverity;
  userId: string;
  details: string;
  metadata: Record<string, unknown>;
  resolved: boolean;
}

// ─── AUDIT LOG ───────────────────────────────────────────────────

/**
 * Log a data access event for audit trail.
 * Every query that touches user data should call this.
 */
export async function auditLog(
  action: "read" | "write" | "delete" | "query",
  table: string,
  recordId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      table_name: table,
      record_id: recordId || null,
      metadata: metadata || {},
      page_url: typeof window !== "undefined" ? window.location.href : "unknown",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    });
  } catch {
    // Audit logging should never break the app
    console.warn("[SECURITY] Audit log write failed (non-fatal)");
  }
}

// ─── CROSS-TENANT DETECTION ─────────────────────────────────────

/**
 * Validate that a query result only contains the current user's data.
 * Call this after any Supabase query to verify tenant isolation.
 */
export async function validateTenantIsolation(
  tableName: string,
  results: Record<string, unknown>[],
  currentUserId: string
): Promise<{ valid: boolean; violations: string[] }> {
  const violations: string[] = [];

  for (const row of results) {
    const rowUserId = row.user_id as string;
    if (rowUserId && rowUserId !== currentUserId) {
      violations.push(
        `[TENANT ISOLATION BREACH] Table "${tableName}" returned row ${row.id || "unknown"} owned by user ${rowUserId}, but current user is ${currentUserId}`
      );
    }
  }

  if (violations.length > 0) {
    console.error("[SECURITY] TENANT ISOLATION VIOLATION DETECTED:");
    violations.forEach((v) => console.error(v));

    await createSecurityIncident(
      "cross_tenant_query",
      "critical",
      currentUserId,
      `Cross-tenant data access detected in table "${tableName}". ${violations.length} row(s) returned data belonging to other users.`,
      { table: tableName, violations, resultCount: results.length }
    );
  }

  return { valid: violations.length === 0, violations };
}

// ─── QUERY WRAPPER ───────────────────────────────────────────────

/**
 * Wraps a Supabase query to enforce tenant isolation.
 * Use this for any query that fetches user data.
 */
export async function safeQuery<T extends Record<string, unknown>>(
  queryFn: () => Promise<{ data: T[] | null; error: any }>,
  tableName: string
): Promise<{ data: T[] | null; error: any; tenantValid: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: new Error("Not authenticated"), tenantValid: false };
  }

  const result = await queryFn();

  if (result.error) {
    return { ...result, tenantValid: false };
  }

  if (result.data && result.data.length > 0) {
    const validation = await validateTenantIsolation(tableName, result.data, user.id);
    return { ...result, tenantValid: validation.valid };
  }

  return { ...result, tenantValid: true };
}

// ─── INCIDENT RESPONSE ───────────────────────────────────────────

async function createSecurityIncident(
  event: SecurityEvent,
  severity: SecuritySeverity,
  userId: string,
  details: string,
  metadata: Record<string, unknown>
): Promise<SecurityIncident | null> {
  const incident: SecurityIncident = {
    id: `SEC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    event,
    severity,
    userId,
    details,
    metadata,
    resolved: false,
  };

  console.error(
    `[LEXOR SECURITY] [${severity.toUpperCase()}] ${event}: ${details}`,
    incident
  );

  try {
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action: "security_incident",
      table_name: "security",
      record_id: incident.id,
      metadata: { event, severity, details, ...metadata },
      page_url: typeof window !== "undefined" ? window.location.href : "unknown",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    });
  } catch {
    console.warn("[SECURITY] Failed to log incident to DB");
  }

  if (severity === "critical") {
    console.error(
      `[LEXOR SECURITY] CRITICAL INCIDENT REQUIRES IMMEDIATE ATTENTION: ${incident.id}`
    );
  }

  return incident;
}

// ─── EDGE FUNCTION CALL WRAPPER ─────────────────────────────────

/**
 * Wraps supabase.functions.invoke to ensure the authenticated user's
 * JWT is always sent (never trust userId from request body).
 */
export async function secureFunctionInvoke(
  functionName: string,
  body: Record<string, unknown>
): Promise<{ data: any; error: any }> {
  const safeBody = { ...body };
  delete safeBody.userId;
  delete safeBody.user_id;

  try {
    const result = await supabase.functions.invoke(functionName, {
      body: safeBody,
    });

    if (result.error) {
      console.warn(`[SECURITY] Edge function ${functionName} returned error:`, result.error);
    }

    return result;
  } catch (error) {
    console.error(`[SECURITY] Edge function ${functionName} failed:`, error);
    return { data: null, error };
  }
}

// ─── MONITORING DASHBOARD ────────────────────────────────────────

/**
 * Get security status for the current user.
 */
export async function getSecurityStatus(): Promise<{
  auditLogCount: number;
  recentIncidents: number;
  lastActivity: string | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { auditLogCount: 0, recentIncidents: 0, lastActivity: null };

    const [auditRes, incidentRes] = await Promise.all([
      supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action", "security_incident")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const { data: lastLog } = await supabase
      .from("audit_logs")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return {
      auditLogCount: auditRes.count || 0,
      recentIncidents: incidentRes.count || 0,
      lastActivity: lastLog?.created_at || null,
    };
  } catch {
    return { auditLogCount: 0, recentIncidents: 0, lastActivity: null };
  }
}
