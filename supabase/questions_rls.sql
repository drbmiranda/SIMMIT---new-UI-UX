-- RLS policies for question bank tables
-- Run this in Supabase SQL Editor for the project that contains
-- public.provas, public.questoes and public.respostas_usuarios.

-- Enable RLS
alter table public.provas enable row level security;
alter table public.questoes enable row level security;
alter table public.respostas_usuarios enable row level security;

-- Grants for API roles
grant usage on schema public to anon, authenticated;
grant select on table public.provas to anon, authenticated;
grant select on table public.questoes to anon, authenticated;
grant select, insert, update, delete on table public.respostas_usuarios to authenticated;

-- Public read for question catalog

drop policy if exists "Public can read provas" on public.provas;
create policy "Public can read provas"
  on public.provas
  for select
  using (true);

drop policy if exists "Public can read questoes" on public.questoes;
create policy "Public can read questoes"
  on public.questoes
  for select
  using (true);

-- User-owned progress records

drop policy if exists "Users can read own respostas" on public.respostas_usuarios;
create policy "Users can read own respostas"
  on public.respostas_usuarios
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own respostas" on public.respostas_usuarios;
create policy "Users can insert own respostas"
  on public.respostas_usuarios
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own respostas" on public.respostas_usuarios;
create policy "Users can update own respostas"
  on public.respostas_usuarios
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own respostas" on public.respostas_usuarios;
create policy "Users can delete own respostas"
  on public.respostas_usuarios
  for delete
  using (auth.uid() = user_id);
