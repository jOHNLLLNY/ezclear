-- Saved contractors table
create table if not exists public.saved_contractors (
  user_id uuid not null references public.profiles(id) on delete cascade,
  contractor_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, contractor_id)
);

alter table public.saved_contractors enable row level security;

-- RLS: owner can read/write own saved contractors
create policy if not exists "owner rw"
  on public.saved_contractors
  for all
  using (auth.uid() = user_id);

-- Optionally allow contractors to see who saved them (commented out by default)
-- create policy if not exists "contractor can see who saved them"
--   on public.saved_contractors
--   for select
--   using (auth.uid() = contractor_id);

-- Prompt PostgREST to reload schema
select pg_notify('pgrst', 'reload schema');

