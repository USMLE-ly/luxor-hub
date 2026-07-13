import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('[SUPABASE] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in environment variables');
}

export const supabase = createClient<Database>(
  SUPABASE_URL ?? '',
  SUPABASE_PUBLISHABLE_KEY ?? '',
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
