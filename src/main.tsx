import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error logging for diagnostics
if (typeof window !== "undefined") {
  (window as any).__luxorErrors = [];

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const err = event.reason;
    const errorInfo = {
      message: err?.message || "Unhandled Promise Rejection",
      stack: err?.stack || "",
      time: new Date().toISOString(),
    };
    console.warn("[LUXOR] Unhandled rejection:", errorInfo);
    (window as any).__luxorErrors.push(errorInfo);
    
    // Try to log to Android native bridge if available
    try {
      if ((window as any).AndroidBridge) {
        (window as any).AndroidBridge.logError(
          errorInfo.message,
          errorInfo.stack
        );
      }
    } catch (e) {
      // Ignore bridge errors
    }
  });

  // Capture global errors
  window.onerror = function (message, source, lineno, colno, error) {
    const errorInfo = {
      message: typeof message === "string" ? message : message?.message || "Unknown error",
      stack: error?.stack || `${source}:${lineno}:${colno}`,
      time: new Date().toISOString(),
    };
    console.warn("[LUXOR] Global error:", errorInfo);
    (window as any).__luxorErrors.push(errorInfo);
    
    // Try to log to Android native bridge
    try {
      if ((window as any).AndroidBridge) {
        (window as any).AndroidBridge.logError(
          errorInfo.message,
          errorInfo.stack
        );
      }
    } catch (e) {
      // Ignore bridge errors
    }
    
    return false; // Let default handler run
  };
}

// Ensure the DOM is ready
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("[LUXOR] Root element not found!");
} else {
  try {
    createRoot(rootElement).render(<App />);
  } catch (e) {
    console.error("[LUXOR] Fatal render error:", e);
    // Show a simple fallback if React completely fails to mount
    rootElement.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0A0A0B;color:#C8A951;font-family:sans-serif;padding:20px;text-align:center;">
        <h1 style="font-size:2rem;font-weight:bold;margin-bottom:1rem;">LUXOR®</h1>
        <p style="color:#888;margin-bottom:1rem;">Unable to start the application.</p>
        <button onclick="location.reload()" style="background:#C8A951;color:#000;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-weight:600;">Reload App</button>
      </div>
    `;
  }
}
