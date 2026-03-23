type RuntimeEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_QUESTIONS_URL?: string;
  VITE_SUPABASE_QUESTIONS_ANON_KEY?: string;
  VITE_SUPABASE_QUESTIONS_TABLE?: string;
  VITE_GEMINI_API_KEY?: string;
  VITE_APP_URL?: string;
};

type WindowRuntimeEnv = RuntimeEnv | undefined;

export const getRuntimeEnv = (): RuntimeEnv => {
  const win = typeof window !== "undefined" ? (window as Window & { __ENV?: WindowRuntimeEnv; ENV?: WindowRuntimeEnv }) : undefined;
  const windowEnv = win?.__ENV ?? win?.ENV;

  return {
    VITE_SUPABASE_URL:
      windowEnv?.VITE_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY:
      windowEnv?.VITE_SUPABASE_ANON_KEY ??
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPABASE_QUESTIONS_URL:
      windowEnv?.VITE_SUPABASE_QUESTIONS_URL ??
      import.meta.env.VITE_SUPABASE_QUESTIONS_URL,
    VITE_SUPABASE_QUESTIONS_ANON_KEY:
      windowEnv?.VITE_SUPABASE_QUESTIONS_ANON_KEY ??
      import.meta.env.VITE_SUPABASE_QUESTIONS_ANON_KEY,
    VITE_SUPABASE_QUESTIONS_TABLE:
      windowEnv?.VITE_SUPABASE_QUESTIONS_TABLE ??
      import.meta.env.VITE_SUPABASE_QUESTIONS_TABLE,
    VITE_GEMINI_API_KEY:
      windowEnv?.VITE_GEMINI_API_KEY ?? import.meta.env.VITE_GEMINI_API_KEY,
    VITE_APP_URL:
      windowEnv?.VITE_APP_URL ?? import.meta.env.VITE_APP_URL,
  };
};