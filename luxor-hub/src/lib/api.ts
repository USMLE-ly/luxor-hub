/**
 * Returns the backend API base URL.
 *
 * - Local dev:   Vite proxy forwards /api → localhost:5000
 * - Production:  vite preview does NOT proxy, so we must hit Flask
 *                directly on port 5000 (Flask runs alongside Vite
 *                via start.sh → gunicorn).
 *
 * VITE_PUBLIC_API_URL is intentionally IGNORED in production because it
 * points to port 80 (Vite) which has no /api routes.
 */
export function getApiUrl(): string {
  // Explicit dev override
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // Local dev: Vite proxy handles /api
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  // Production: talk directly to Flask on port 5000
  return `${window.location.protocol}//${window.location.hostname}:5000`;
}
