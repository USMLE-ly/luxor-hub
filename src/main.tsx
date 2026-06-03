import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handlers — prevent crashes from unhandled errors outside React tree
window.onerror = function(_msg, _url, _line, _col, _err) {
  console.warn('[LEXOR] Global error caught (suppressed):', _msg);
  return true; // Prevents default browser error handling
};

window.onunhandledrejection = function(event: PromiseRejectionEvent) {
  console.warn('[LEXOR] Unhandled promise rejection (suppressed):', event.reason);
  event.preventDefault();
};

createRoot(document.getElementById("root")!).render(<App />);
