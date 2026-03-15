import { createClient } from '@supabase/supabase-js';
import { getRuntimeEnv } from './runtimeEnv';

const {
  VITE_SUPABASE_QUESTIONS_URL,
  VITE_SUPABASE_QUESTIONS_ANON_KEY,
  VITE_SUPABASE_QUESTIONS_TABLE,
} = getRuntimeEnv();

export const QUESTIONS_TABLE =
  VITE_SUPABASE_QUESTIONS_TABLE?.trim() || 'questoes';

export const questionsSupabase =
  VITE_SUPABASE_QUESTIONS_URL && VITE_SUPABASE_QUESTIONS_ANON_KEY
    ? createClient(VITE_SUPABASE_QUESTIONS_URL, VITE_SUPABASE_QUESTIONS_ANON_KEY)
    : null;

