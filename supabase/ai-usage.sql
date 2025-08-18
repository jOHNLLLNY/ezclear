-- AI usage tracking + small fixes

-- 1) ai_usage table and RLS
create table if not exists public.ai_usage(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ym text not null,
  calls int not null default 0,
  tokens_in int not null default 0,
  tokens_out int not null default 0,
  cost_cents int not null default 0,
  updated_at timestamptz default now(),
  unique(user_id, ym)
);

alter table public.ai_usage enable row level security;
create policy if not exists "ai_usage self" on public.ai_usage for select using (auth.uid() = user_id);

-- Increment helper to avoid race conditions (SECURITY DEFINER for server-side only)
create or replace function public.increment_ai_usage(
  p_user uuid,
  p_ym text,
  p_calls int,
  p_tokens_in int,
  p_tokens_out int,
  p_cost_cents int
) returns void language sql security definer as $$
  insert into public.ai_usage(user_id, ym, calls, tokens_in, tokens_out, cost_cents)
  values (p_user, p_ym, p_calls, p_tokens_in, p_tokens_out, p_cost_cents)
  on conflict (user_id, ym)
  do update set
    calls = public.ai_usage.calls + excluded.calls,
    tokens_in = public.ai_usage.tokens_in + excluded.tokens_in,
    tokens_out = public.ai_usage.tokens_out + excluded.tokens_out,
    cost_cents = public.ai_usage.cost_cents + excluded.cost_cents,
    updated_at = now();
$$;
revoke all on function public.increment_ai_usage(uuid,text,int,int,int,int) from public;
grant execute on function public.increment_ai_usage(uuid,text,int,int,int,int) to service_role;

create or replace function public.sum_ai_cost_cents(p_ym text)
returns table(sum bigint) language sql security definer as $$
  select coalesce(sum(cost_cents),0) from public.ai_usage where ym=p_ym
$$;
revoke all on function public.sum_ai_cost_cents(text) from public;
grant execute on function public.sum_ai_cost_cents(text) to authenticated;

-- 2) small schema fixes for jobs
alter table public.jobs add column if not exists photos text[] default '{}'::text[] not null;
alter table public.jobs add column if not exists closed_at timestamptz;

-- Additional fields per app requirements (safe add)
alter table public.jobs add column if not exists address text;
alter table public.jobs add column if not exists postal_code text;
alter table public.jobs add column if not exists budget numeric;
alter table public.jobs add column if not exists city text;
alter table public.jobs add column if not exists attachments jsonb default '[]'::jsonb;

create or replace function public.close_job(p_job_id uuid, p_user uuid)
returns void language sql security definer as $$
  update public.jobs
     set status='closed', closed_at=now()
   where id=p_job_id and poster_id=p_user and status in ('open','in_progress');
$$;
revoke all on function public.close_job(uuid,uuid) from public;
grant execute on function public.close_job(uuid,uuid) to authenticated;

-- minimal RLS to ensure Hire sees own jobs
create policy if not exists jobs_select_own on public.jobs for select using (poster_id = auth.uid());

