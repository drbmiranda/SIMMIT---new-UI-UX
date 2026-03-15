export {};

declare global {
  interface Window {
    __ENV?: {
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
      VITE_SUPABASE_QUESTIONS_URL?: string;
      VITE_SUPABASE_QUESTIONS_ANON_KEY?: string;
      VITE_SUPABASE_QUESTIONS_TABLE?: string;
      VITE_GEMINI_API_KEY?: string;
    };
  }
}
