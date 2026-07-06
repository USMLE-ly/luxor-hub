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

const ENGAGEMENT_NUDGES: EngagementNudge[] = [
  {
    id: "welcome-back",
    title: "👋 Welcome back to LEXOR",
    body: "Your style journey awaits — check out what's new in your closet.",
    url: "/closet",
    delayMinutes: 0.1,  // 6 seconds after page load
  },
  {
    id: "try-dressing-room",
    title: "✨ Mix & Match Today",
    body: "Generate fresh outfit combinations from your closet in the Dressing Room.",
    url: "/dressing-room",
    delayMinutes: 1,
  },
  {
    id: "calendar-check",
    title: "📅 Plan Your Week",
    body: "Your outfit calendar is ready — schedule looks for the days ahead.",
    url: "/outfit-calendar",
    delayMinutes: 3,
  },
  {
    id: "style-report",
    title: "📊 Your Monthly Style Report",
    body: "See how your style has evolved. New insights waiting for you.",
    url: "/monthly-report",
    delayMinutes: 10,
  },
  {
    id: "unlock-premium",
    title: "⭐ Unlock Premium Styling",
    body: "Get AI-powered color analysis, unlimited outfits, and priority support.",
    url: "/paywall",
    delayMinutes: 30,
    condition: () => {
      // Only show if user hasn't subscribed (check localStorage flag)
      try {
        return !localStorage.getItem("luxor_subscription_active");
      } catch { return true; }
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Schedule engagement nudges — call once on app mount               */
/* ------------------------------------------------------------------ */
let engagementTimers: ReturnType<typeof setTimeout>[] = [];

export function scheduleEngagementNudges(clearExisting = true) {
  if (clearExisting) {
    engagementTimers.forEach(t => clearTimeout(t));
    engagementTimers = [];
  }

  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    // No permission — schedule a re-check when main thread is free
    // (user might grant during onboarding later)
    return;
  }

  // Mark visit timestamp
  try {
    localStorage.setItem("luxor_last_visit", Date.now().toString());
  } catch {}

  ENGAGEMENT_NUDGES.forEach(nudge => {
    // Check condition
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
