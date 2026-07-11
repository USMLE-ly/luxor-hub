/**
 * LUXOR® Support Playbook — Generated alongside features, not after launch.
 * Every feature builds its support playbook in the same sprint.
 * 
 * TIER 1: Automated Resolution (60-70% of volume never reaches your desk)
 * TIER 2: Assisted Triage (unknown issues → packaged context → escalate)
 * TIER 3: Incident Response (multi-user, security, data integrity)
 */

export type Severity = "low" | "medium" | "high" | "critical";
export type Tier = 1 | 2 | 3;
export type Status = "resolved" | "triage" | "escalated" | "incident";

export interface KnownIssue {
  id: string;
  feature: string;
  title: string;
  description: string;
  severity: Severity;
  tier: Tier;
  symptoms: string[];
  automatedFix?: string;
  escalationPath?: string;
  customerMessage: string;
  lastSeen?: string;
  occurrences?: number;
}

export interface FeaturePlaybook {
  feature: string;
  description: string;
  owner: string;
  apis: string[];
  knownIssues: KnownIssue[];
  sla: { responseTime: string; resolutionTime: string };
  monitoring: { endpoints: string[]; alerts: string[] };
}

// ─── FEATURE PLAYBOOKS ───────────────────────────────────────────

export const playbooks: FeaturePlaybook[] = [
  {
    feature: "Authentication",
    description: "Login, signup, password reset, session management via Supabase Auth",
    owner: "Platform",
    apis: ["/auth/v1/token", "/auth/v1/signup", "/auth/v1/recover"],
    knownIssues: [
      {
        id: "AUTH-001",
        feature: "Authentication",
        title: "Password reset email not received",
        description: "User clicks 'Forgot Password' but never receives the reset email",
        severity: "medium",
        tier: 1,
        symptoms: ["User reports no reset email", "Email in spam folder", "Supabase email rate limit hit"],
        automatedFix: "Check Supabase email logs. If rate limited, wait 60s and retry. If email provider (Resend/SendGrid) is down, queue retry.",
        escalationPath: "Check Supabase Dashboard → Auth → Email Logs. Verify SMTP configuration. If provider is down, notify user via in-app banner.",
        customerMessage: "We've sent a new password reset link. Check your spam folder. If you still don't see it within 5 minutes, contact support@luxor.ly.",
      },
      {
        id: "AUTH-002",
        feature: "Authentication",
        title: "Session expires unexpectedly",
        description: "User is logged out mid-session without warning",
        severity: "high",
        tier: 2,
        symptoms: ["User reports being logged out", "JWT token expired", "Supabase project migration caused token invalidation"],
        automatedFix: "Refresh token silently. If refresh fails, redirect to login with 'Session expired' message.",
        escalationPath: "Check if Supabase project was migrated (new project ref). If so, all old tokens are invalid. Force re-login.",
        customerMessage: "Your session expired. Please log in again. We're working on longer session durations.",
      },
      {
        id: "AUTH-003",
        feature: "Authentication",
        title: "Account locked after failed attempts",
        description: "User locked out after too many failed login attempts",
        severity: "medium",
        tier: 1,
        symptoms: ["User reports 'Account locked'", "Multiple failed login attempts in Supabase logs"],
        automatedFix: "After 5 minutes, auto-unlock. Send unlock notification email.",
        escalationPath: "Manual unlock via Supabase Dashboard → Auth → Users → Unban.",
        customerMessage: "Your account was temporarily locked for security. It will unlock in 5 minutes. If you need immediate access, contact support.",
      },
    ],
    sla: { responseTime: "< 1 hour", resolutionTime: "< 4 hours" },
    monitoring: {
      endpoints: ["/auth/v1/token", "/auth/v1/signup"],
      alerts: ["Auth failure rate > 10%", "Password reset failures > 5/hour"],
    },
  },
  {
    feature: "Subscription & Payments",
    description: "PayPal integration, subscription tiers, paywall enforcement",
    owner: "Platform",
    apis: ["/api/payments", "/subscriptions"],
    knownIssues: [
      {
        id: "PAY-001",
        feature: "Payments",
        title: "Payment fails but user charged",
        description: "PayPal webhook missed but payment went through",
        severity: "critical",
        tier: 3,
        symptoms: ["User reports charge but no subscription", "PayPal webhook delivery failed", "Supabase subscription table out of sync"],
        automatedFix: "Reconcile via PayPal API: check actual payment status. If paid, activate subscription manually. If not paid, void charge.",
        escalationPath: "IMMEDIATE: Check PayPal Dashboard → Activity. Verify webhook delivery logs. If webhook failed, manually sync subscription. Notify affected user.",
        customerMessage: "We noticed a payment issue with your account. Your subscription has been activated. If you see an incorrect charge, please contact support immediately.",
      },
      {
        id: "PAY-002",
        feature: "Payments",
        title: "PaywallGate redirect loop",
        description: "User keeps getting redirected to /paywall even with active subscription",
        severity: "high",
        tier: 1,
        symptoms: ["User stuck in redirect loop", "localStorage cache corrupted", "Supabase subscription check returning false"],
        automatedFix: "Clear localStorage subscription cache. Re-query Supabase subscriptions table. If active, grant access.",
        escalationPath: "Check Supabase → subscriptions table. Verify user_id matches. Check if subscription status is 'active'.",
        customerMessage: "We've fixed your access. You should now see your wardrobe. If this persists, try clearing your browser cache.",
      },
      {
        id: "PAY-003",
        feature: "Payments",
        title: "Free tier user hitting paywall",
        description: "New user on free tier redirected to paywall instead of closet",
        severity: "medium",
        tier: 1,
        symptoms: ["New signup can't access closet", "Free tier not in subscriptions table"],
        automatedFix: "Insert free tier subscription record. Verify plan_tier = 'free'.",
        escalationPath: "Check onboarding flow. Verify free tier is auto-created on signup.",
        customerMessage: "Welcome! Your free account is set up. You have full access to your wardrobe.",
      },
    ],
    sla: { responseTime: "< 30 minutes", resolutionTime: "< 2 hours" },
    monitoring: {
      endpoints: ["/api/payments", "/subscriptions"],
      alerts: ["Payment failure rate > 5%", "Webhook delivery failures", "Subscription sync discrepancies"],
    },
  },
  {
    feature: "AI Analysis",
    description: "Style DNA, outfit analysis, trend intelligence via MiMo Vision API",
    owner: "AI/ML",
    apis: ["/functions/v1/analyze-outfit", "/functions/v1/analyze-style-dna", "/functions/v1/trend-intelligence"],
    knownIssues: [
      {
        id: "AI-001",
        feature: "AI Analysis",
        title: "Edge Function returns 500",
        description: "MiMo API key missing or expired, or MiMo API is down",
        severity: "high",
        tier: 1,
        symptoms: ["'Edge Function returned a non-2xx status code' toast", "Console shows 500 on /functions/v1/*"],
        automatedFix: "Check MIMO_API_KEY in Supabase secrets. If expired, rotate key. If MiMo API is down, return cached analysis if available.",
        escalationPath: "Supabase Dashboard → Edge Functions → Secrets. Verify MIMO_API_KEY. Check MiMo API status page.",
        customerMessage: "Our AI is taking a quick break. Your analysis will be ready shortly. Try again in a minute.",
      },
      {
        id: "AI-002",
        feature: "AI Analysis",
        title: "Style DNA analysis hangs",
        description: "Analysis starts but never completes",
        severity: "medium",
        tier: 1,
        symptoms: ["Spinner stuck at 0%", "No response from edge function after 30s"],
        automatedFix: "Timeout after 30s. Return partial results if available. Show retry button.",
        escalationPath: "Check edge function logs in Supabase. Look for MiMo API timeout. Increase timeout if needed.",
        customerMessage: "This analysis is taking longer than usual. We've saved your progress — tap retry to continue.",
      },
      {
        id: "AI-003",
        feature: "AI Analysis",
        title: "Outfit suggestion quality is poor",
        description: "AI returns mismatched or irrelevant outfit suggestions",
        severity: "medium",
        tier: 2,
        symptoms: ["User reports bad suggestions", "Style DNA not loaded", "Weather data missing"],
        automatedFix: "Verify style DNA is loaded. Check if weather API returned data. Re-run with fallback style profile.",
        escalationPath: "Review MiMo prompt templates. Check if user's closet data is complete. Update prompts if needed.",
        customerMessage: "We're refining your style profile. The more you use LUXOR®, the better your suggestions get.",
      },
    ],
    sla: { responseTime: "< 2 hours", resolutionTime: "< 8 hours" },
    monitoring: {
      endpoints: ["/functions/v1/analyze-outfit", "/functions/v1/analyze-style-dna", "/functions/v1/trend-intelligence"],
      alerts: ["Edge function error rate > 10%", "MiMo API latency > 10s", "Analysis timeout rate > 5%"],
    },
  },
  {
    feature: "Wardrobe & Closet",
    description: "Closet management, item upload, categorization",
    owner: "Product",
    apis: ["/rest/v1/closet_items", "/functions/v1/analyze-item"],
    knownIssues: [
      {
        id: "WARD-001",
        feature: "Closet",
        title: "Image upload fails silently",
        description: "User uploads photo but item doesn't appear in closet",
        severity: "high",
        tier: 1,
        symptoms: ["Upload spinner never completes", "Supabase storage quota exceeded", "Image too large"],
        automatedFix: "Compress image client-side to < 5MB. Retry upload. If storage quota exceeded, notify user.",
        escalationPath: "Check Supabase Storage → closet_items bucket. Verify quota. Check if RLS policies allow insert.",
        customerMessage: "We couldn't save that image. Try a smaller photo (under 5MB) and try again.",
      },
      {
        id: "WARD-002",
        feature: "Closet",
        title: "Empty closet after migration",
        description: "User's closet items missing after database migration",
        severity: "critical",
        tier: 3,
        symptoms: ["Closet shows 0 items", "User had items before migration", "Supabase project was migrated"],
        automatedFix: "Check if closet_items table exists in new project. If empty but old project has data, trigger migration.",
        escalationPath: "CRITICAL: Verify data migration completed. Check old vs new Supabase project. Restore from backup if needed.",
        customerMessage: "We're aware some wardrobe data may have been affected. Our team is restoring your items. They'll be back shortly.",
      },
    ],
    sla: { responseTime: "< 1 hour", resolutionTime: "< 4 hours" },
    monitoring: {
      endpoints: ["/rest/v1/closet_items"],
      alerts: ["Upload failure rate > 10%", "Storage quota > 80%"],
    },
  },
  {
    feature: "Weather Integration",
    description: "Weather-based outfit suggestions via get-weather edge function",
    owner: "AI/ML",
    apis: ["/functions/v1/get-weather"],
    knownIssues: [
      {
        id: "WX-001",
        feature: "Weather",
        title: "Weather data unavailable",
        description: "get-weather returns 500 or empty data",
        severity: "medium",
        tier: 1,
        symptoms: ["Weather widget shows 'Unavailable'", "500 error on get-weather endpoint"],
        automatedFix: "Fall back to cached weather data (last 6 hours). If no cache, show 'Weather unavailable' gracefully.",
        escalationPath: "Check weather API key in Supabase secrets. Verify API quota not exceeded. Check edge function logs.",
        customerMessage: "Weather data is temporarily unavailable. Your outfit suggestions are based on your usual preferences.",
      },
    ],
    sla: { responseTime: "< 4 hours", resolutionTime: "< 24 hours" },
    monitoring: {
      endpoints: ["/functions/v1/get-weather"],
      alerts: ["Weather API failures > 5/hour"],
    },
  },
  {
    feature: "Dressing Room & Virtual Try-On",
    description: "Outfit visualization, virtual try-on, style recommendations",
    owner: "Product",
    apis: ["/functions/v1/virtual-tryon", "/functions/v1/style-recommendations"],
    knownIssues: [
      {
        id: "DR-001",
        feature: "Dressing Room",
        title: "ScrollReveal crash on dressing room",
        description: "ReferenceError: ScrollReveal is not defined",
        severity: "critical",
        tier: 1,
        symptoms: ["Red error boundary on /dressing-room", "ReferenceError in console"],
        automatedFix: "Already fixed: ScrollReveal imported from @/components/ui/scroll-reveal. Verify import exists.",
        escalationPath: "Check if scroll-reveal.tsx exports ScrollReveal. If not, re-export from component.",
        customerMessage: "We hit a snag. Our team is on it. Please try refreshing the page.",
      },
    ],
    sla: { responseTime: "< 30 minutes", resolutionTime: "< 2 hours" },
    monitoring: {
      endpoints: ["/functions/v1/virtual-tryon"],
      alerts: ["Error boundary triggers", "ReferenceError in console"],
    },
  },
  {
    feature: "Dashboard",
    description: "User dashboard with trending, weekly plan, weather widget",
    owner: "Product",
    apis: ["/functions/v1/trend-intelligence", "/functions/v1/weekly-capsule"],
    knownIssues: [
      {
        id: "DASH-001",
        feature: "Dashboard",
        title: "Dashboard shows blank page",
        description: "After login, dashboard is empty with no widgets",
        severity: "critical",
        tier: 2,
        symptoms: ["Blank dark background", "Only particles visible", "404/500 on API endpoints"],
        automatedFix: "Show fallback UI with retry button. Log exact failing URLs. Redirect to /closet if dashboard fails.",
        escalationPath: "Check which API endpoints are failing. Verify edge functions are deployed. Check Supabase project migration status.",
        customerMessage: "We're having trouble loading your dashboard. Your wardrobe is still accessible at /closet.",
      },
    ],
    sla: { responseTime: "< 1 hour", resolutionTime: "< 4 hours" },
    monitoring: {
      endpoints: ["/functions/v1/trend-intelligence", "/functions/v1/weekly-capsule"],
      alerts: ["Dashboard load failures", "Widget API errors"],
    },
  },
  {
    feature: "Domain & DNS",
    description: "luxor.ly custom domain, SSL, Vercel deployment",
    owner: "Infrastructure",
    apis: [],
    knownIssues: [
      {
        id: "DNS-001",
        feature: "DNS",
        title: "Domain not resolving (ERR_NAME_NOT_RESOLVED)",
        description: "luxor.ly DNS records not pointing to Vercel",
        severity: "critical",
        tier: 3,
        symptoms: ["Browser shows DNS error", "Site inaccessible", "DNS_PROBE_POSSIBLE"],
        automatedFix: "Verify A record points to 76.76.21.21. Verify CNAME for www points to cname.vercel-dns.com.",
        escalationPath: "URGENT: Check domain registrar DNS settings. Verify A record = 76.76.21.21. Wait for DNS propagation (up to 24h).",
        customerMessage: "We're experiencing a temporary domain issue. You can access the app at the Vercel URL directly while we fix this.",
      },
      {
        id: "DNS-002",
        feature: "DNS",
        title: "Vercel build fails with 'unexpected error'",
        description: "Vercel build runner crashes during file processing",
        severity: "high",
        tier: 2,
        symptoms: ["Build fails immediately after .vercelignore", "No build logs", "Stale deployment served"],
        automatedFix: "Check .vercelignore for patterns that exclude critical files. Ensure package.json, vercel.json, build.sh are NOT excluded.",
        escalationPath: "Verify .vercelignore doesn't exclude: package.json, vercel.json, build.sh, scripts/, luxor-hub/src/. Force redeploy.",
        customerMessage: "We're deploying a fix. The site will be back up in a few minutes.",
      },
    ],
    sla: { responseTime: "< 15 minutes", resolutionTime: "< 1 hour" },
    monitoring: {
      endpoints: ["https://luxor.ly"],
      alerts: ["SSL certificate expiry", "DNS resolution failure", "Build failure"],
    },
  },
];

// ─── TIER 1: AUTOMATED RESOLUTION ────────────────────────────────

export function getAutomatedFix(errorId: string): string | undefined {
  for (const playbook of playbooks) {
    const issue = playbook.knownIssues.find((i) => i.id === errorId);
    if (issue?.automatedFix) return issue.automatedFix;
  }
  return undefined;
}

export function matchKnownIssue(errorMessage: string): KnownIssue | null {
  const lower = errorMessage.toLowerCase();
  for (const playbook of playbooks) {
    for (const issue of playbook.knownIssues) {
      for (const symptom of issue.symptoms) {
        if (lower.includes(symptom.toLowerCase()) || lower.includes(issue.title.toLowerCase())) {
          return issue;
        }
      }
    }
  }
  return null;
}

// ─── TIER 2: ASSISTED TRIAGE ─────────────────────────────────────

export interface TriageReport {
  timestamp: string;
  errorId: string;
  feature: string;
  severity: Severity;
  tier: Tier;
  errorMessage: string;
  affectedUser?: string;
  context: Record<string, unknown>;
  recommendation: string;
  playbookRef: string;
}

export function createTriageReport(
  error: Error,
  feature: string,
  context: Record<string, unknown> = {}
): TriageReport {
  const matched = matchKnownIssue(error.message);
  return {
    timestamp: new Date().toISOString(),
    errorId: matched?.id || `UNKNOWN-${Date.now()}`,
    feature,
    severity: matched?.severity || "medium",
    tier: matched?.tier || 2,
    errorMessage: error.message,
    context,
    recommendation: matched?.escalationPath || "Manual investigation required. Check logs for stack trace.",
    playbookRef: matched ? `playbook:${matched.feature}:${matched.id}` : "no-match",
  };
}

// ─── TIER 3: INCIDENT RESPONSE ────────────────────────────────────

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  startedAt: string;
  resolvedAt?: string;
  affectedUsers: number;
  features: string[];
  timeline: { time: string; action: string }[];
  customerMessage: string;
  internalNotes: string;
}

export function createIncident(
  title: string,
  severity: Severity,
  features: string[],
  customerMessage: string
): Incident {
  return {
    id: `INC-${Date.now()}`,
    title,
    severity,
    status: "incident",
    startedAt: new Date().toISOString(),
    affectedUsers: 0,
    features,
    timeline: [{ time: new Date().toISOString(), action: "Incident created" }],
    customerMessage,
    internalNotes: "",
  };
}

// ─── CUSTOMER-FACING MESSAGES ─────────────────────────────────────

export function getCustomerMessage(errorId: string): string {
  const issue = matchKnownIssue(errorId);
  return issue?.customerMessage || "Something went wrong. Our team has been notified and is working on a fix.";
}

export function getStatusPage(): { status: string; features: { name: string; status: string }[] } {
  return {
    status: "operational",
    features: playbooks.map((p) => ({
      name: p.feature,
      status: "operational",
    })),
  };
}
