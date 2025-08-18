-- Enable pgvector and create embeddings tables for AI copilot
create extension if not exists vector;

create table if not exists public.profile_embeddings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  embedding vector(1536),
  updated_at timestamptz default now()
);

create table if not exists public.job_embeddings (
  job_id uuid primary key references public.jobs(id) on delete cascade,
  embedding vector(1536),
  updated_at timestamptz default now()
);

create index if not exists profile_embeddings_idx on public.profile_embeddings using ivfflat (embedding vector_l2_ops);
create index if not exists job_embeddings_idx on public.job_embeddings using ivfflat (embedding vector_l2_ops);

