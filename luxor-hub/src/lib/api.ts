/**
 * Returns the backend API base URL.
 *
 * - Local dev:     Vite proxy forwards /api → localhost:5000
 * - Vercel (luxor.ly): empty string → relative /api paths → Vercel rewrites → Replit
 * - Replit preview: direct to Flask on port 5000
 */
export function getApiUrl(): string {
  // Explicit dev override
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // Local dev: Vite proxy handles /api
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  // Vercel (luxor.ly): use relative paths so Vercel rewrites proxy to Replit
  // Replit: use direct port 5000
  if (window.location.hostname.includes("replit.app")) {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }

  // Vercel / production: relative paths (empty string)
  return "";
}
