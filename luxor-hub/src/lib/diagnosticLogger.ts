/**
 * LUXOR® Diagnostic Logger
 * 
 * Persistent rotating log that captures component lifecycle, API calls,
 * state changes, and errors. Logs are stored in-memory (ring buffer)
 * and can be flushed to a downloadable file via console:
 *   window.__LUXOR_LOGS.dump()   → downloads .log file
 *   window.__LUXOR_LOGS.print()  → prints to console
 *   window.__LUXOR_LOGS.search("green") → search logs
 * 
 * Log is excluded from GitHub via *.log in .gitignore.
 */

const MAX_ENTRIES = 2000;
const LOG_VERSION = "1.0.0";

interface LogEntry {
  ts: string;
  cat: "LIFECYCLE" | "API" | "STATE" | "ERROR" | "RENDER" | "OVERLAY" | "AUTH" | "SPLASH" | "CREDIT" | "NAV";
  src: string;
  msg: string;
  data?: any;
}

class DiagnosticLogger {
  private entries: LogEntry[] = [];
  private enabled = true;

  log(cat: LogEntry["cat"], src: string, msg: string, data?: any) {
    if (!this.enabled) return;
    const entry: LogEntry = {
      ts: new Date().toISOString().replace("T", " ").slice(0, 23),
      cat,
      src,
      msg,
      data,
    };
    this.entries.push(entry);
    // Ring buffer: drop oldest if over limit
    if (this.entries.length > MAX_ENTRIES) {
      this.entries = this.entries.slice(-MAX_ENTRIES);
    }
    // Also mirror to dev console with color
    if (import.meta.env.DEV) {
      const colors: Record<string, string> = {
        LIFECYCLE: "#4fc3f7",
        API: "#81c784",
        STATE: "#ffb74d",
        ERROR: "#e57373",
        RENDER: "#ce93d8",
        OVERLAY: "#ff5252",
        AUTH: "#fff176",
        SPLASH: "#a1887f",
        CREDIT: "#80cbc4",
        NAV: "#90caf9",
      };
      console.log(
        `%c[${cat}]%c ${src}: ${msg}`,
        `color: ${colors[cat] || "#ccc"}; font-weight: bold`,
        "color: inherit",
        data ?? ""
      );
    }
  }

  /** Snapshot: return last N entries matching optional category filter */
  snapshot(n = 50, cat?: string) {
    let filtered = cat
      ? this.entries.filter((e) => e.cat === cat)
      : this.entries;
    return filtered.slice(-n);
  }

  /** Search logs by keyword */
  search(keyword: string) {
    const lower = keyword.toLowerCase();
    return this.entries.filter(
      (e) =>
        e.msg.toLowerCase().includes(lower) ||
        e.src.toLowerCase().includes(lower) ||
        JSON.stringify(e.data || "").toLowerCase().includes(lower)
    );
  }

  /** Print all entries to console */
  print() {
    console.log(
      `%c══════ LUXOR DIAGNOSTIC LOG (${this.entries.length} entries) ══════`,
      "color: #E8C87A; font-weight: bold; font-size: 14px"
    );
    this.entries.forEach((e) => {
      console.log(
        `%c${e.ts} %c[${e.c}] %c${e.src}: %c${e.msg}`,
        "color: #888",
        "color: #E8C87A; font-weight: bold",
        "color: #4fc3f7",
        "color: inherit",
        e.data ?? ""
      );
    });
  }

  /** Dump logs to downloadable file */
  dump() {
    const content = this.entries
      .map((e) => {
        let line = `${e.ts} [${e.cat}] ${e.src}: ${e.msg}`;
        if (e.data) line += ` | DATA: ${JSON.stringify(e.data, null, 2)}`;
        return line;
      })
      .join("\n");

    const header = [
      `LUXOR® Diagnostic Log v${LOG_VERSION}`,
      `Generated: ${new Date().toISOString()}`,
      `Total entries: ${this.entries.length}`,
      `═══════════════════════════════════════════════════`,
      "",
    ].join("\n");

    const blob = new Blob([header + content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luxor-diagnostic-${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`[DIAG] Dumped ${this.entries.length} entries to file`);
  }

  /** Clear all entries */
  clear() {
    this.entries = [];
    console.log("[DIAG] Log cleared");
  }

  /** Toggle logging on/off */
  toggle() {
    this.enabled = !this.enabled;
    console.log(`[DIAG] Logging ${this.enabled ? "ENABLED" : "DISABLED"}`);
  }
}

// Singleton
const logger = new DiagnosticLogger();

// Expose globally for console access
if (typeof window !== "undefined") {
  (window as any).__LUXOR_LOGS = {
    dump: () => logger.dump(),
    print: () => logger.print(),
    search: (k: string) => logger.search(k),
    snapshot: (n?: number, cat?: string) => logger.snapshot(n, cat),
    clear: () => logger.clear(),
    toggle: () => logger.toggle(),
  };
}



/** DOM Overlay Observer — watches for any fixed/inset-0 elements that could be green screens */
if (typeof window !== "undefined" && typeof MutationObserver !== "undefined") {
  const findOverlays = () => {
    const allElements = document.querySelectorAll("*");
    const overlays: string[] = [];
    allElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (
        style.position === "fixed" &&
        style.inset === "0px" &&
        parseFloat(style.zIndex) >= 50 &&
        el.tagName !== "HTML" &&
        el.tagName !== "BODY"
      ) {
        const rect = el.getBoundingClientRect();
        const bg = style.backgroundColor || style.background || "";
        const isVisible = style.display !== "none" && style.visibility !== "hidden" && parseFloat(style.opacity) > 0;
        if (isVisible) {
          overlays.push(
            `<${el.tagName.toLowerCase()} class="${el.className?.toString().slice(0, 80)}" z=${style.zIndex} bg="${bg.slice(0, 60)}" w=${Math.round(rect.width)} h=${Math.round(rect.height)} />`
          );
        }
      }
    });
    return overlays;
  };

  // Log overlays every 2 seconds
  setInterval(() => {
    const overlays = findOverlays();
    if (overlays.length > 0) {
      logger.log("OVERLAY", "DOM-Observer", `Found ${overlays.length} fixed overlay(s):`, overlays.join("\n"));
    }
  }, 2000);
}

export default logger;
