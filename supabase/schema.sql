-- Kollel Chatzos — run in Supabase SQL Editor
-- Service role key is used from Vercel API routes only (never in the browser).

create extension if not exists "pgcrypto";

create table if not exists public.dedications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  hebrew_name text,
  occasion text,
  amount integer check (amount is null or amount > 0),
  note text,
  source text,
  lang text default 'en'
);

create table if not exists public.partner_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  hebrew_name text,
  contact text not null,
  tier text not null,
  note text,
  lang text default 'en'
);

create table if not exists public.mailing_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique
);

create index if not exists dedications_created_at_idx on public.dedications (created_at desc);
create index if not exists partner_inquiries_created_at_idx on public.partner_inquiries (created_at desc);

alter table public.dedications enable row level security;
alter table public.partner_inquiries enable row level security;
alter table public.mailing_subscribers enable row level security;

-- No public policies — API uses service role key server-side.
