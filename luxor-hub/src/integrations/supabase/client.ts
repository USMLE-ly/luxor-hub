import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://zmqfcyweqllmupszbppd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_X7EDgWhQM21N7ykgjLQKbQ_IfvkjGbU';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
