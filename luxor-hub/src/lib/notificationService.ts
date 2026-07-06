/* ------------------------------------------------------------------ */
/*  Notification Service — Browser push + re-engagement nudges        */
/*  Inspired by ntfy.sh pub/sub model but using the browser's built-in */
/*  Notification API (permission already granted during onboarding).   */
/* ------------------------------------------------------------------ */

const SENT_LOG_KEY = "luxor_notif_sent_log";

interface NtfyPayload {
  topic: string;
  message: string;
  title?: string;
  priority?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
  click?: string;  // URL to open when tapped
  attach?: string; // image URL
  icon?: string;
}

/* ------------------------------------------------------------------ */
/*  Dedup log — prevents sending the same notification twice          */
/* ------------------------------------------------------------------ */
function wasSent(id: string): boolean {
  try {
    const log = JSON.parse(localStorage.getItem(SENT_LOG_KEY) || "[]");
    return log.includes(id);
  } catch { return false; }
}

function markSent(id: string) {
  try {
    const log: string[] = JSON.parse(localStorage.getItem(SENT_LOG_KEY) || "[]");
    log.push(id);
    // Keep only last 200 entries
    if (log.length > 200) log.splice(0, log.length - 200);
    localStorage.setItem(SENT_LOG_KEY, JSON.stringify(log));
  } catch {}
}

/* ------------------------------------------------------------------ */
/*  Send a browser notification (requires granted permission)         */
/* ------------------------------------------------------------------ */
export function sendBrowserNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    url?: string;
    id?: string;        // dedup id — skip if already sent
    silent?: boolean;
  }
): boolean {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return false;
  }

  const dedupId = options?.id || title;
  if (wasSent(dedupId)) return false;

  try {
    const notif = new Notification(title, {
      body: options?.body,
      icon: options?.icon || "/favicon.ico",
      tag: options?.tag || dedupId,
      silent: options?.silent ?? false,
      requireInteraction: true,  // stay until dismissed
    });

    if (options?.url) {
      notif.onclick = () => {
        window.focus();
        window.location.href = options.url!;
      };
    }

    markSent(dedupId);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Send notification via ntfy.sh (for device-side delivery)          */
/*  Users subscribe via ntfy app on their phone to topic "luxor-{uid}"*/
/* ------------------------------------------------------------------ */
export async function sendViaNtfy(payload: NtfyPayload): Promise<boolean> {
  try {
    const resp = await fetch("https://ntfy.sh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: payload.topic,
        message: payload.message,
        title: payload.title || "LEXOR",
        priority: payload.priority || 3,
        tags: payload.tags || [],
        click: payload.click || "https://luxor.ly",
        icon: payload.icon || "https://luxor.ly/favicon.ico",
      }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Engagement notification — re-engage users who haven't visited     */
/* ------------------------------------------------------------------ */
export interface EngagementNudge {
  id: string;
  title: string;
  body: string;
  url: string;
  delayMinutes: number;     // minutes after page load
  condition?: () => boolean; // skip if returns false
}

// ---- Nudge definitions ----
const ENGAGEMENT_NUDGES: EngagementNudge[] = [
  {
    id: "welcome-back",
    title: "👋 Welcome back to LEXOR",
    body: "Your style journey awaits — check out what's new in your closet.",
    url: "/closet",
    delayMinutes: 2,  // 2 minutes — not 6 seconds (was too aggressive for SPA navigation)
  },
  {
    id: "try-dressing-room",
    title: "✨ Mix & Match Today",
    body: "Generate fresh outfit combinations from your closet in the Dressing Room.",
    url: "/dressing-room",
    delayMinutes: 3,  // was 1
  },
  {
    id: "calendar-check",
    title: "📅 Plan Your Week",
    body: "Your outfit calendar is ready — schedule looks for the days ahead.",
    url: "/outfit-calendar",
    delayMinutes: 5,  // was 3
  },
  {
    id: "style-report",
    title: "📊 Your Monthly Style Report",
    body: "See how your style has evolved. New insights waiting for you.",
    url: "/monthly-report",
    delayMinutes: 15,  // was 10
  },
  {
    id: "unlock-premium",
    title: "⭐ Unlock Premium Styling",
    body: "Get AI-powered color analysis, unlimited outfits, and priority support.",
    url: "/paywall",
    delayMinutes: 60,  // was 30
    condition: () => {
      try {
        return !localStorage.getItem("luxor_subscription_active");
      } catch { return true; }
    },
  },
];

// ---- Session guard: only schedule nudges once per page load, not on every SPA navigation ----
let _sessionScheduled = false;

// ---- Page Visibility: detect when user returns from another tab ----
let _visibilityTimer: ReturnType<typeof setTimeout> | null = null;
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // User came back to this tab — schedule a "welcome back" nudge
      if (_visibilityTimer) clearTimeout(_visibilityTimer);
      _visibilityTimer = setTimeout(() => {
        // Only send if user has been away for > 30 min
        try {
          const lastVisit = parseInt(localStorage.getItem("luxor_last_visit") || "0", 10);
          const minutesAway = (Date.now() - lastVisit) / 60000;
          if (minutesAway > 30) {
            sendBrowserNotification("👋 Welcome back to LEXOR", {
              body: "You've been away for a while — your outfits are waiting.",
              url: "/closet",
              id: "vis-welcome-" + Date.now(),
            });
          }
        } catch {}
      }, 5000); // 5s delay after tab becomes visible
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Schedule engagement nudges — call once on app mount               */
/*  Only fires once per session; ignores SPA route changes.           */
/* ------------------------------------------------------------------ */
let engagementTimers: ReturnType<typeof setTimeout>[] = [];

export function scheduleEngagementNudges() {
  // Guard: only schedule nudges once per page load
  if (_sessionScheduled) return;
  _sessionScheduled = true;

  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return;
  }

  // Mark this visit
  try {
    localStorage.setItem("luxor_last_visit", Date.now().toString());
  } catch {}

  ENGAGEMENT_NUDGES.forEach(nudge => {
    if (nudge.condition && !nudge.condition()) return;

    const timer = setTimeout(() => {
      sendBrowserNotification(nudge.title, {
        body: nudge.body,
        url: nudge.url,
        id: nudge.id,
      });
    }, nudge.delayMinutes * 60 * 1000);

    engagementTimers.push(timer);
  });
}

/* ------------------------------------------------------------------ */
/*  Cleanup — call on unmount                                         */
/* ------------------------------------------------------------------ */
export function clearEngagementNudges() {
  engagementTimers.forEach(t => clearTimeout(t));
  engagementTimers = [];
  _sessionScheduled = false; // allow re-schedule on next mount
}
/* ------------------------------------------------------------------ */
/*  Cleanup — call on unmount                                         */
/* ------------------------------------------------------------------ */
export function clearEngagementNudges() {
  engagementTimers.forEach(t => clearTimeout(t));
  engagementTimers = [];
}

/* ------------------------------------------------------------------ */
/*  Trigger a one-off notification for an event                       */
/* ------------------------------------------------------------------ */
export function notifyEvent(eventType: string, metadata?: Record<string, string>) {
  switch (eventType) {
    case "outfit-generated":
      sendBrowserNotification("✨ New Outfit Ready!", {
        body: "Your fresh outfit combination is ready to view in the Dressing Room.",
        url: "/dressing-room",
        id: `outfit-${Date.now()}`,
      });
      break;

    case "outfit-added-calendar":
      sendBrowserNotification("📅 Outfit Planned", {
        body: "Your outfit has been added to the calendar.",
        url: "/outfit-calendar",
        id: `calendar-${Date.now()}`,
      });
      break;

    case "analyze-complete":
      sendBrowserNotification("✅ Style Analysis Complete", {
        body: "Your style recommendations are ready. See what the AI thinks!",
        url: "/style-recommendations",
        id: `analysis-${Date.now()}`,
      });
      break;

    default:
      break;
  }
}

/* ------------------------------------------------------------------ */
/*  ntfy: Helper to get user topic                                    */
/* ------------------------------------------------------------------ */
export function getUserNtfyTopic(userId: string): string {
  return `luxor-${userId}`;
}

/* ------------------------------------------------------------------ */
/*  ntfy: Subscribe via EventSource (in-app real-time notifications)  */
/* ------------------------------------------------------------------ */
export function subscribeToNtfyTopic(
  topic: string,
  onMessage: (msg: string) => void
): () => void {
  const source = new EventSource(`https://ntfy.sh/${topic}/sse`);
  
  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data.message || data.title || "New notification");
    } catch {
      onMessage(event.data);
    }
  };

  source.onerror = () => {
    // Reconnect is automatic for EventSource
  };

  return () => source.close();
}
