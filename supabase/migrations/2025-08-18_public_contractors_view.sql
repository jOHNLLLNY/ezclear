-- Create a safe public view for contractors and allow reads

-- View with only public fields; maps skills -> services for filtering
create or replace view public_contractors as
select
  id,
  coalesce(display_name, full_name, company_name, username, 'New Contractor') as display_name,
  full_name,
  company_name,
  username,
  avatar_url,
  location,
  rating,
  coalesce(service_slugs, skills, '{}'::jsonb) as services,
  user_type
from public.profiles
where user_type in ('worker','contractor');

-- Allow anon/authenticated to select from the view
grant select on public.public_contractors to anon, authenticated;

-- Helpful indexes on base table
create index if not exists idx_profiles_user_type on public.profiles(user_type);
create index if not exists idx_profiles_skills_gin on public.profiles using gin(skills);

-- If RLS is enabled on profiles, ensure a permissive read policy for public worker fields
alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='profiles' and policyname='read_workers_public'
  ) then
    create policy read_workers_public
    on public.profiles for select
    using (user_type = 'worker');
  end if;
end $$;
