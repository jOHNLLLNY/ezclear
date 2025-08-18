
alter table public.notifications
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists type text,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists data jsonb,
  add column if not exists "read" boolean default false,
  add column if not exists created_at timestamptz default now();

alter table public.notifications alter column type set default 'general';
create index if not exists notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (user_id) where "read" = false;



-- If threads table does not exist, create a minimal one
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id),
  hire_id uuid references public.profiles(id),
  contractor_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- === Schema additions for hiring & messaging flows ===

-- Jobs: hired contractor reference
alter table public.jobs
  add column if not exists hired_contractor_id uuid references public.profiles(id);

-- Threads: link to job and ensure uniqueness per job
alter table public.threads
  add column if not exists job_id uuid references public.jobs(id);
create unique index if not exists threads_job_unique on public.threads(job_id) where job_id is not null;

-- Notifications: support job linkage and payload json
alter table public.notifications
  add column if not exists job_id uuid references public.jobs(id),
  add column if not exists payload jsonb;

-- Applications table naming note:
-- If your table is named public.applications instead of public.job_applications,
-- adjust the policies below accordingly.

-- Enable RLS (safe if already enabled)
alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.threads enable row level security;
alter table public.notifications enable row level security;

-- ========================= Policies =========================
-- Helper: create policy if missing
-- We use DO blocks to avoid errors on repeated runs

-- Jobs: poster can update; anyone authenticated can select
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='jobs' and policyname='jobs_select_all_auth'
  ) then
    create policy jobs_select_all_auth on public.jobs for select to authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='jobs' and policyname='jobs_update_by_poster'
  ) then
    create policy jobs_update_by_poster on public.jobs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

-- Job applications: applicant or poster can select; applicant inserts; poster updates (e.g., status)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='job_applications' and policyname='job_apps_select_related'
  ) then
    create policy job_apps_select_related on public.job_applications for select to authenticated
      using (
        applicant_id = auth.uid()
        or exists (select 1 from public.jobs j where j.id = job_applications.job_id and j.user_id = auth.uid())
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='job_applications' and policyname='job_apps_insert_applicant'
  ) then
    create policy job_apps_insert_applicant on public.job_applications for insert to authenticated
      with check (applicant_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='job_applications' and policyname='job_apps_update_by_poster'
  ) then
    create policy job_apps_update_by_poster on public.job_applications for update to authenticated
      using (exists (select 1 from public.jobs j where j.id = job_applications.job_id and j.user_id = auth.uid()))
      with check (exists (select 1 from public.jobs j where j.id = job_applications.job_id and j.user_id = auth.uid()));
  end if;
end $$;

-- Threads: participants can select; any authenticated can insert (upsert used in app)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='threads' and policyname='threads_select_participants'
  ) then
    create policy threads_select_participants on public.threads for select to authenticated
      using (auth.uid() = hire_id or auth.uid() = contractor_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='threads' and policyname='threads_insert_auth'
  ) then
    create policy threads_insert_auth on public.threads for insert to authenticated with check (auth.uid() is not null);
  end if;
end $$;

-- ====== Close job RPC (idempotent) ======
alter table public.jobs add column if not exists closed_at timestamptz;

create or replace function public.close_job(p_job_id uuid, p_user uuid)
returns void as $$
  update public.jobs
     set status = 'closed', closed_at = now()
   where id = p_job_id and (poster_id = p_user or user_id = p_user) and status in ('open','in_progress','active','assigned');
$$ language sql security definer;

revoke all on function public.close_job(uuid,uuid) from public;
grant execute on function public.close_job(uuid,uuid) to authenticated;


-- Notifications: recipient can select/update; any authenticated can insert
-- (App inserts server-side; ensure anon disabled in prod)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='notifications_select_by_owner'
  ) then
    create policy notifications_select_by_owner on public.notifications for select to authenticated using (user_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='notifications_update_by_owner'
  ) then
    create policy notifications_update_by_owner on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='notifications_insert_auth'
  ) then
    create policy notifications_insert_auth on public.notifications for insert to authenticated with check (auth.uid() is not null);
  end if;
end $$;
