-- Additional policies to manage applications lifecycle

-- Worker can update own application (e.g., withdraw) and delete their own application
create policy if not exists applications_update_self
on public.applications for update to authenticated
using (auth.uid() = worker_id)
with check (auth.uid() = worker_id);

create policy if not exists applications_delete_self
on public.applications for delete to authenticated
using (auth.uid() = worker_id);

-- Hirer (job poster) can update status of applications to their jobs (e.g., shortlist/decline)
create policy if not exists applications_update_by_poster
on public.applications for update to authenticated
using (
  exists(
    select 1 from public.jobs j
    where j.id = applications.job_id
      and coalesce(j.user_id, j.poster_id) = auth.uid()
  )
);

