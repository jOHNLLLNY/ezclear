-- 1) Ensure jobs.photos exists and is an array of text (public URLs)
alter table public.jobs
  add column if not exists photos text[] default '{}'::text[];

-- 2) Generic attachments table
create table if not exists public.job_attachments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  kind text not null check (kind in ('photo','file')),
  path text not null,
  url text,
  created_at timestamptz not null default now()
);
create index if not exists idx_job_attachments_job on public.job_attachments(job_id);

-- 3) Job status and closed_at (Completed flow)
alter table public.jobs
  add column if not exists status text not null default 'open' check (status in ('open','completed','closed'));

alter table public.jobs
  add column if not exists closed_at timestamptz;

-- 4) Profiles normalized display name
alter table public.profiles
  add column if not exists display_name text;

update public.profiles
set display_name = coalesce(display_name, full_name, company_name, username, 'New Contractor')
where display_name is null;

