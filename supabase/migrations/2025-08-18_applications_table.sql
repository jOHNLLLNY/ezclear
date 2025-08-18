-- Ensure applications table exists with required columns
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  worker_id uuid not null references public.profiles(id) on delete cascade,
  cover_letter text,
  status text default 'submitted',
  created_at timestamptz default now()
);

