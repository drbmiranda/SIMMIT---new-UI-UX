type RuntimeEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
};

export const getRuntimeEnv = (): RuntimeEnv => {
  const windowEnv =
    typeof window !== "undefined" ? (window as Window).__ENV : undefined;

  return {
    VITE_SUPABASE_URL:
      windowEnv?.VITE_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY:
      windowEnv?.VITE_SUPABASE_ANON_KEY ??
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_GEMINI_API_KEY:
      windowEnv?.VITE_GEMINI_API_KEY ?? import.meta.env.VITE_GEMINI_API_KEY,
  };
};
