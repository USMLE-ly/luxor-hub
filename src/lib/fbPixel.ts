// Facebook Pixel utility
import { getUTMParamsForPixel } from "@/lib/utmTracker";

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

export const FB_PIXEL_ID = '1567409157678795';

export const pageview = () => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
};

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window.fbq === 'function') {
    const utmParams = getUTMParamsForPixel();
    const mergedParams = { ...utmParams, ...params };
    if (Object.keys(mergedParams).length > 0) {
      window.fbq('track', eventName, mergedParams);
    } else {
      window.fbq('track', eventName);
    }
  }
};
