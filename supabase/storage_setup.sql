-- Storage setup for job-related uploads
-- Create buckets if not exist
select storage.create_bucket('job-photos', jsonb_build_object('public', true)) where not exists (
  select 1 from storage.buckets where id='job-photos'
);
select storage.create_bucket('job-files', jsonb_build_object('public', false)) where not exists (
  select 1 from storage.buckets where id='job-files'
);

-- RLS: allow owners to upload/read their own paths under jobs/{userId}/
-- We use auth.uid() matching path prefix
create policy if not exists "job-photos owners read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'job-photos' and (split_part(name, '/', 2) = auth.uid()::text)
  );

create policy if not exists "job-photos owners write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'job-photos' and (split_part(name, '/', 2) = auth.uid()::text)
  );

create policy if not exists "job-photos owners update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'job-photos' and (split_part(name, '/', 2) = auth.uid()::text)
  );

create policy if not exists "job-files owners read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'job-files' and (split_part(name, '/', 2) = auth.uid()::text)
  );

create policy if not exists "job-files owners write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'job-files' and (split_part(name, '/', 2) = auth.uid()::text)
  );

create policy if not exists "job-files owners update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'job-files' and (split_part(name, '/', 2) = auth.uid()::text)
  );

