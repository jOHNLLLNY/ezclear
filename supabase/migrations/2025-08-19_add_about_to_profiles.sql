-- Add 'about' column to profiles if missing and reload PostgREST schema
alter table if exists public.profiles
  add column if not exists about text;

comment on column public.profiles.about is 'Short bio/description shown on profile';

-- Optionally expand public_contractors view to include about (safe)
-- drop view if exists public.public_contractors;
-- create or replace view public.public_contractors as
-- select
--   p.id as id,
--   coalesce(p.full_name, split_part(a.email,'@',1)) as full_name,
--   p.city,
--   p.avatar_url,
--   p.headline,
--   p.about,
--   p.primary_service,
--   p.rating,
--   p.user_type,
--   p.is_active
-- from public.profiles p
-- join auth.users a on a.id = p.id
-- where p.user_type = 'worker' and p.is_active = true;

select pg_notify('pgrst', 'reload schema');

