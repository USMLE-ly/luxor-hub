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
  // Local dev: allow VITE_API_URL override from .env (e.g. http://localhost:5000)
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return import.meta.env.VITE_API_URL || "";
  }

  // Production (Vercel, Replit preview, luxor.ly): ALWAYS use relative paths.
  // Vercel rewrites proxy /api/* to the Flask backend. Never use absolute URLs.
  return "";
}
