import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://zmqfcyweqllmupszbppd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Bjtp9o5dWZYHbF_h3PvKyw_1FQEXxDK';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
