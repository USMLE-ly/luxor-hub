/**
 * Returns the backend API base URL.
 * In development, falls back to localhost:5000.
 * In production, uses the VITE_API_URL env var or the current origin.
 */
export function getApiUrl(): string {
  return (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_PUBLIC_API_URL ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "")
  );
}
