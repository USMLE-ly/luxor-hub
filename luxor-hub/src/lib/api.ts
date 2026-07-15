/**
 * Returns the backend API base URL.
 * In development, proxies through Vite to localhost:5000.
 * In production (Replit), the Vite preview server does NOT proxy /api,
 * so we must point directly to Flask on port 5000.
 */
export function getApiUrl(): string {
  // Explicit env override always wins
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_PUBLIC_API_URL) return import.meta.env.VITE_PUBLIC_API_URL;

  // Local dev: Vite proxy forwards /api to Flask
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  // Production on Replit: talk directly to Flask on port 5000
  // (vite preview does not support proxy, so we can't go through port 80)
  return `${window.location.protocol}//${window.location.hostname}:5000`;
}
