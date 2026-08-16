import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Hard format guard: a configured URL must look like https://<project-ref>.supabase.co
// (catches typos such as .com, a missing https://, or a trailing slash in the middle).
// NOTE: it cannot detect a deleted/paused project — a well-formed hostname can still
// return NXDOMAIN. The reachability probe below covers that case.
const SUPABASE_URL_PATTERN = /^https:\/\/[a-z0-9_-]+\.supabase\.co\/?$/;

if (SUPABASE_URL && !SUPABASE_URL_PATTERN.test(SUPABASE_URL)) {
  throw new Error(
    `[LUXOR CONFIG ERROR] VITE_SUPABASE_URL is invalid or malformed. ` +
    `Current value: "${SUPABASE_URL}". Expected format: https://<project-ref>.supabase.co`,
  );
}


if (!isSupabaseConfigured) {
  console.warn(
    '[SUPABASE] Environment variables missing — app running in offline/mock mode.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file or Vercel dashboard.'
  );
} else {
  console.info('[SUPABASE] Auth endpoint:', SUPABASE_URL);

  // Non-blocking reachability probe: ANY HTTP response means the host resolves.
  // A network error means the project is deleted/paused or the URL is wrong —
  // this is exactly what surfaces as the login "Network error" toast.
  fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/health`)
    .then((res) => console.info(`[SUPABASE] Auth endpoint reachable (HTTP ${res.status})`))
    .catch((err) =>
      console.error(
        '[SUPABASE] Auth endpoint UNREACHABLE — project deleted/paused or VITE_SUPABASE_URL is wrong. Login will fail with "Network error".',
        SUPABASE_URL,
        err?.cause ?? err,
      ),
    );
}

export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_PUBLISHABLE_KEY || 'placeholder-key',
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: isSupabaseConfigured,
    },
  }
);
