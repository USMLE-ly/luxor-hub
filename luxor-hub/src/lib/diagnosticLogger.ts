/**
 * LUXOR® Diagnostic Logger — safe no-op in production
 * Kept as a stub so existing imports don't crash.
 * Use window.__LUXOR_LOGS in dev console if needed.
 */
const noop = () => {};
const logger = {
  log: noop,
  snapshot: () => [],
  search: () => [],
  print: noop,
  dump: noop,
  clear: noop,
  toggle: noop,
};
export default logger;
