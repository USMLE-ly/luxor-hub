import { useState, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Permission Cache Keys                                              */
/* ------------------------------------------------------------------ */
const NOTIF_CACHE_KEY = "luxor_permission_notification";
const LOCATION_CACHE_KEY = "luxor_permission_location";
const PERMISSION_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export type AppPermissionState = "prompt" | "granted" | "denied" | "unsupported";

interface CachedPermission {
  state: AppPermissionState;
  timestamp: number;
}

interface AppPermissions {
  notification: AppPermissionState;
  location: AppPermissionState;
}

/* ------------------------------------------------------------------ */
/*  Read / Write cached permission                                     */
/* ------------------------------------------------------------------ */
function getCached(key: string): AppPermissionState | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cached: CachedPermission = JSON.parse(raw);
    if (Date.now() - cached.timestamp > PERMISSION_CACHE_TTL) return null;
    return cached.state;
  } catch {
    return null;
  }
}

function setCached(key: string, state: AppPermissionState) {
  try {
    localStorage.setItem(key, JSON.stringify({ state, timestamp: Date.now() }));
  } catch {}
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */
export function useAppPermissions() {
  const [permissions, setPermissions] = useState<AppPermissions>(() => ({
    notification: "prompt",
    location: "prompt",
  }));

  // ── On mount, hydrate from cache + browser API ──
  useEffect(() => {
    const notifCache = getCached(NOTIF_CACHE_KEY);
    const locCache = getCached(LOCATION_CACHE_KEY);

    // Notification: use cache first, then browser API
    let notifState: AppPermissionState = "prompt";
    if (notifCache) {
      notifState = notifCache;
    } else if (typeof Notification !== "undefined") {
      notifState = Notification.permission as AppPermissionState;
    } else {
      notifState = "unsupported";
    }

    // Location: use cache first, else prompt
    let locState: AppPermissionState = "prompt";
    if (locCache) {
      locState = locCache;
    } else if (!navigator.geolocation) {
      locState = "unsupported";
    }

    setPermissions({ notification: notifState, location: locState });
  }, []);

  // ── Request notification permission (once) ──
  const requestNotification = useCallback(async (): Promise<AppPermissionState> => {
    const cached = getCached(NOTIF_CACHE_KEY);
    if (cached) {
      setPermissions(prev => ({ ...prev, notification: cached }));
      return cached;
    }

    if (typeof Notification === "undefined") {
      setPermissions(prev => ({ ...prev, notification: "unsupported" }));
      return "unsupported";
    }

    const result = await Notification.requestPermission();
    const state = result as AppPermissionState;
    setCached(NOTIF_CACHE_KEY, state);
    setPermissions(prev => ({ ...prev, notification: state }));
    return state;
  }, []);

  // ── Request location permission (once) ──
  const requestLocation = useCallback(async (): Promise<AppPermissionState> => {
    const cached = getCached(LOCATION_CACHE_KEY);
    if (cached) {
      setPermissions(prev => ({ ...prev, location: cached }));
      return cached;
    }

    if (!navigator.geolocation) {
      setCached(LOCATION_CACHE_KEY, "unsupported");
      setPermissions(prev => ({ ...prev, location: "unsupported" }));
      return "unsupported";
    }

    try {
      await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      setCached(LOCATION_CACHE_KEY, "granted");
      setPermissions(prev => ({ ...prev, location: "granted" }));
      return "granted";
    } catch {
      setCached(LOCATION_CACHE_KEY, "denied");
      setPermissions(prev => ({ ...prev, location: "denied" }));
      return "denied";
    }
  }, []);

  return {
    permissions,
    requestNotification,
    requestLocation,
  };
}
