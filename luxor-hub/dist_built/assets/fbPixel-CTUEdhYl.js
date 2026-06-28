const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid"];
const STORAGE_KEY = "lexor_utm";
const captureUTMParams = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
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
      utm.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
      return utm;
    }
    return null;
  } catch {
    return null;
  }
};
const getStoredUTMParams = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};
const getUTMParamsForPixel = () => {
  const utm = getStoredUTMParams();
  if (!utm) return {};
  const params = {};
  if (utm.utm_source) params.traffic_source = utm.utm_source;
  if (utm.utm_medium) params.traffic_medium = utm.utm_medium;
  if (utm.utm_campaign) params.campaign_name = utm.utm_campaign;
  if (utm.fbclid) params.fbclid = utm.fbclid;
  return params;
};
const trackEvent = (eventName, params) => {
  if (typeof window.fbq === "function") {
    const utmParams = getUTMParamsForPixel();
    const mergedParams = { ...utmParams, ...params };
    if (Object.keys(mergedParams).length > 0) {
      window.fbq("track", eventName, mergedParams);
    } else {
      window.fbq("track", eventName);
    }
  }
};
export {
  captureUTMParams as c,
  trackEvent as t
};
