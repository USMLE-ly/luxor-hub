// UTM Parameter Tracking Utility
// Captures UTM params from URL and stores them for conversion attribution

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid'] as const;
const STORAGE_KEY = 'lexor_utm';

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
  landing_page?: string;
  timestamp?: string;
}

export const captureUTMParams = (): UTMParams | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm: UTMParams = {};
    let hasUTM = false;

    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) {
        utm[key] = value;
        hasUTM = true;
      }
    }

    if (hasUTM) {
      utm.landing_page = window.location.pathname;
      utm.timestamp = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
      return utm;
    }

    return null;
  } catch {
    return null;
  }
};

export const getStoredUTMParams = (): UTMParams | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const getUTMParamsForPixel = (): Record<string, string> => {
  const utm = getStoredUTMParams();
  if (!utm) return {};

  const params: Record<string, string> = {};
  if (utm.utm_source) params.traffic_source = utm.utm_source;
  if (utm.utm_medium) params.traffic_medium = utm.utm_medium;
  if (utm.utm_campaign) params.campaign_name = utm.utm_campaign;
  if (utm.fbclid) params.fbclid = utm.fbclid;
  return params;
};
