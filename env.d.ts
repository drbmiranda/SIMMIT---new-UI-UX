export {};

declare global {
  interface RuntimeWindowEnv {
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_ANON_KEY?: string;
    VITE_SUPABASE_QUESTIONS_URL?: string;
    VITE_SUPABASE_QUESTIONS_ANON_KEY?: string;
    VITE_SUPABASE_QUESTIONS_TABLE?: string;
    VITE_GEMINI_API_KEY?: string;
    VITE_APP_URL?: string;
  }

  interface Window {
    __ENV?: RuntimeWindowEnv;
    ENV?: RuntimeWindowEnv;
  }
}
