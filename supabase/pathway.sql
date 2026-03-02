create table if not exists public.pathway_checkpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sort_order integer not null,
  title text not null,
  focus text not null,
  status text not null check (status in ('dominada','atencao','bloqueada')),
  window_label text not null,
  note text not null,
  source text not null default 'auto',
  generated_for_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pathway_checkpoints_user_date_idx
  on public.pathway_checkpoints (user_id, generated_for_date, sort_order);

alter table public.pathway_checkpoints enable row level security;

create policy "Pathway checkpoints are readable by owner"
  on public.pathway_checkpoints
  for select
  using (auth.uid() = user_id);

create policy "Pathway checkpoints are insertable by owner"
  on public.pathway_checkpoints
  for insert
  with check (auth.uid() = user_id);

create policy "Pathway checkpoints are updatable by owner"
  on public.pathway_checkpoints
  for update
  using (auth.uid() = user_id);

create policy "Pathway checkpoints are deletable by owner"
  on public.pathway_checkpoints
  for delete
  using (auth.uid() = user_id);
