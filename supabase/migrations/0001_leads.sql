-- 0001_leads.sql
-- Lead form submissions for The Southern Shmooze. Public form: written via the anon
-- key with INSERT-only RLS. See docs/architecture/README.md §8.

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  first_name         text not null,
  last_name          text not null,
  email              text not null,
  phone              text not null,
  address            text not null,
  budget             text[] not null default '{}',
  project_start_date date,
  project_details    text not null,
  file_path          text,
  status             text not null default 'new'
);

-- Boundary validation (defense in depth; the client also validates with zod).
alter table public.leads
  drop constraint if exists leads_email_format,
  drop constraint if exists leads_budget_values,
  drop constraint if exists leads_status_values;

alter table public.leads
  add constraint leads_email_format
    check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  add constraint leads_budget_values
    check (budget <@ array['lt_1000', '1000_5000', 'gt_5000']::text[]),
  add constraint leads_status_values
    check (status in ('new', 'contacted', 'closed'));

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- Row Level Security: anon may INSERT only, and only with status 'new'.
-- No SELECT/UPDATE/DELETE policies => denied for anon. Owners read via the
-- dashboard or a service-role key (out of scope for the app).
alter table public.leads enable row level security;

drop policy if exists "anon can insert leads" on public.leads;
create policy "anon can insert leads"
  on public.leads
  for insert
  to anon
  with check (status = 'new');
