export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelayMs = 300,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      const delay = baseDelayMs * 2 ** attempt + Math.random() * 150;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
