#!/bin/sh
set -eu

escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

supabase_url="$(escape "${VITE_SUPABASE_URL:-}")"
supabase_anon_key="$(escape "${VITE_SUPABASE_ANON_KEY:-}")"
questions_supabase_url="$(escape "${VITE_SUPABASE_QUESTIONS_URL:-}")"
questions_supabase_anon_key="$(escape "${VITE_SUPABASE_QUESTIONS_ANON_KEY:-}")"
questions_table="$(escape "${VITE_SUPABASE_QUESTIONS_TABLE:-exam_questions}")"
gemini_api_key="$(escape "${VITE_GEMINI_API_KEY:-}")"

cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV = {
  VITE_SUPABASE_URL: "${supabase_url}",
  VITE_SUPABASE_ANON_KEY: "${supabase_anon_key}",
  VITE_SUPABASE_QUESTIONS_URL: "${questions_supabase_url}",
  VITE_SUPABASE_QUESTIONS_ANON_KEY: "${questions_supabase_anon_key}",
  VITE_SUPABASE_QUESTIONS_TABLE: "${questions_table}",
  VITE_GEMINI_API_KEY: "${gemini_api_key}"
};
EOF
