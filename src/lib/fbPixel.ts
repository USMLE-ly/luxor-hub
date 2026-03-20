// Facebook Pixel utility
// Replace YOUR_PIXEL_ID with your actual Meta Pixel ID

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
    if (params) {
      window.fbq('track', eventName, params);
    } else {
      window.fbq('track', eventName);
    }
  }
};
