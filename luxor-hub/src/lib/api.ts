/**
 * API base URL — single source of truth.
 *
 * - Local dev:     Vite proxy forwards /api → localhost:5000
 * - Vercel (luxor.ly): empty string → relative /api paths → vercel.json rewrites → Replit
 * - Replit preview: empty string → relative paths work because Vercel proxy is in play
 *
 * All fetch calls MUST use this function. Never hardcode a domain.
 */
export function getApiUrl(): string {
  // Explicit dev override via .env
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // Local dev: Vite proxy handles /api → localhost:5000
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "";
  }

  // All other environments (Vercel, Replit preview, production): use relative paths.
  // Vercel's rewrites in vercel.json proxy /api/* to the Flask backend.
  return "";
}
