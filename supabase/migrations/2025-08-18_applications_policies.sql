-- Applications table unique constraint and RLS policies

-- Unique guard to prevent duplicate applications per worker/job
alter table if exists public.applications
  add constraint if not exists applications_unique_worker_job unique (job_id, worker_id);

-- Enable RLS (safe if already enabled)
alter table if exists public.applications enable row level security;

-- Select: worker sees own or job poster sees their jobs' applications
create policy if not exists applications_read
on public.applications for select to authenticated
using (
  auth.uid() = worker_id
  or exists(select 1 from public.jobs j where j.id = applications.job_id and j.user_id = auth.uid())
);

-- Insert: only authenticated worker inserting for themselves
create policy if not exists applications_insert_self
on public.applications for insert to authenticated
with check (auth.uid() = worker_id);

