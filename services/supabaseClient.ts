import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';
import { getRuntimeEnv } from './runtimeEnv';

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = getRuntimeEnv();

if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  throw new Error('Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.');
}

export const supabase = createClient<Database>(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
