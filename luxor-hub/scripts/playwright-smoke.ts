/**
 * Playwright smoke test — runs headless Chromium against the dev server.
 * Detects: page crashes, infinite loops, unhandled errors, blank screens.
 * Filters out benign React dev warnings (missing keys, etc.) which don't
 * appear in production builds.
 *
 * Usage: npx tsx scripts/playwright-smoke.ts [url]
 */
import { chromium } from "playwright";

const TARGET_URL = process.argv[2] || "http://localhost:8080/";
const TIMEOUT_MS = 30_000;
const IDLE_MS = 5_000;

// Known benign React dev warnings (don't appear in production)
const BENIGN_PATTERNS = [
  /Each child in a list should have a unique "key" prop/,
  /findDOMNode is deprecated/,
  /React does not recognize the .* prop on a DOM element/,
  /validateDOMNesting/,
  /Encountered two children with the same key/,
  /Warning: .* is using incorrect casing/,
];

interface Finding {
  severity: "error" | "warn";
  message: string;
}

function isBenign(text: string): boolean {
  return BENIGN_PATTERNS.some((p) => p.test(text));
}

async function run() {
  const findings: Finding[] = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === "error" && !isBenign(text)) {
      findings.push({ severity: "error", message: `Console error: ${text.slice(0, 200)}` });
    }
  });

  page.on("crash", () => {
    findings.push({ severity: "error", message: "Page crashed (renderer process died)" });
  });

  page.on("pageerror", (err) => {
    const msg = err.message || String(err);
    if (!isBenign(msg)) {
      findings.push({ severity: "error", message: `Uncaught exception: ${msg.slice(0, 200)}` });
    }
  });

  page.on("requestfailed", (req) => {
    const url = req.url();
    if (url.includes("/api/") || url.endsWith(".js") || url.endsWith(".css")) {
      findings.push({
        severity: "warn",
        message: `Failed request: ${req.failure()?.errorText || "unknown"} — ${url}`,
      });
    }
  });

  console.log(`[SMOKE] Loading ${TARGET_URL}...`);

  try {
    await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: TIMEOUT_MS });
  } catch (err: any) {
    findings.push({ severity: "error", message: `Navigation failed: ${err.message}` });
  }

  try {
    await page.waitForLoadState("networkidle", { timeout: IDLE_MS });
  } catch {
    findings.push({ severity: "warn", message: `Page did not reach networkidle within ${IDLE_MS}ms (possible loop)` });
  }

  // Check for #root having content
  const rootContent = await page.evaluate(() => {
    const root = document.getElementById("root");
    return root ? root.innerHTML.length : 0;
  });
  console.log(`[SMOKE] #root innerHTML length: ${rootContent}`);
  if (rootContent < 50) {
    findings.push({ severity: "error", message: `#root has only ${rootContent} chars — blank/crash screen` });
  }

  // Check for infinite loop indicators
  const maxCallStack = consoleLogs.some((l) => l.includes("Maximum call stack size exceeded"));
  if (maxCallStack) {
    findings.push({ severity: "error", message: "Infinite loop detected (Maximum call stack size exceeded)" });
  }

  // Check final URL
  const finalUrl = page.url();
  console.log(`[SMOKE] Final URL: ${finalUrl}`);

  // Screenshot
  const screenshotPath = "/tmp/smoke-test-screenshot.png";
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`[SMOKE] Screenshot saved: ${screenshotPath}`);

  await browser.close();

  // Report
  console.log(`\n[SMOKE] === RESULTS ===`);
  const errors = findings.filter((f) => f.severity === "error");
  const warns = findings.filter((f) => f.severity === "warn");
  console.log(`[SMOKE] ${errors.length} error(s), ${warns.length} warning(s)`);
  for (const f of findings) {
    console.log(`[SMOKE] [${f.severity.toUpperCase()}] ${f.message}`);
  }

  if (errors.length > 0) {
    console.log(`\n[SMOKE] ❌ FAILED`);
    process.exit(1);
  }
  console.log(`\n[SMOKE] ✅ PASSED`);
  process.exit(0);
}

run().catch((err) => {
  console.error(`[SMOKE] Fatal: ${err.message}`);
  process.exit(1);
});
