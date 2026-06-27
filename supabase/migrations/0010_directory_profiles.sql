-- 0010_directory_profiles.sql
-- Business profile ingestion + fuzzy search backend (Epics B + C).
--
-- Adds a per-business profile table (the MW /account/{uid}/profile data — the "About"
-- text is the keyword corpus, plus detail-screen fields), weighted full-text + trigram
-- search infrastructure, a public `directory_search` RPC, a detail view, and the
-- service-role helpers the `sync-profiles` Edge Function uses.

create extension if not exists pg_trgm;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Profile table (1:1 with directory_businesses by source_uid; cascades on delete)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.directory_business_profiles (
  source_uid    text primary key
                  references public.directory_businesses(source_uid) on delete cascade,
  about_text    text,                 -- About HTML stripped to plain text (SEARCH CORPUS)
  about_html    text,                 -- sanitized About HTML for the detail screen
  website       text,                 -- `web`
  contact_name  text,                 -- `ctc`
  address       jsonb,                -- `adr` (ad1, cit, sta, zip, cot, con)
  socials       jsonb,                -- normalized `pfu` + `pfk`
  deal          jsonb,                -- `cpn` (title, text, image) or null
  gallery       jsonb,                -- `pfz` array of {s,l}
  raw_profile   jsonb not null,       -- full response minus secrets (`_mk` stripped)
  fetched_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Keep updated_at fresh on UPDATE (reuse the trigger fn from 0003).
drop trigger if exists directory_business_profiles_set_updated_at on public.directory_business_profiles;
create trigger directory_business_profiles_set_updated_at
  before update on public.directory_business_profiles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Weighted search vectors (generated → always fresh). name=A, tagline=B, about=C.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.directory_businesses
  add column if not exists search_tsv tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored;

alter table public.directory_business_profiles
  add column if not exists about_tsv tsvector generated always as (
    setweight(to_tsvector('english', coalesce(about_text, '')), 'C')
  ) stored;

-- 3) Indexes: GIN for full-text, trigram for typo tolerance.
create index if not exists directory_businesses_search_tsv_idx
  on public.directory_businesses using gin (search_tsv);
create index if not exists directory_profiles_about_tsv_idx
  on public.directory_business_profiles using gin (about_tsv);
create index if not exists directory_businesses_name_trgm_idx
  on public.directory_businesses using gin (name gin_trgm_ops);
create index if not exists directory_profiles_about_trgm_idx
  on public.directory_business_profiles using gin (about_text gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) RLS: profiles are public-read (like the directory); writes are service-role only.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.directory_business_profiles enable row level security;

drop policy if exists "Allow public read profiles" on public.directory_business_profiles;
create policy "Allow public read profiles"
  on public.directory_business_profiles
  for select to anon, authenticated using (true);

grant select on public.directory_business_profiles to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) Detail-screen read path (business + profile + phones).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace view public.directory_business_detail_view
  with (security_invoker = true)
as
select
  b.source_uid,
  b.name,
  b.description,
  b.logo_url,
  b.longitude,
  b.latitude,
  b.recommended_score,
  b.has_coupon,
  b.has_google_marker,
  p.about_text,
  p.about_html,
  p.website,
  p.contact_name,
  p.address,
  p.socials,
  p.deal,
  p.gallery,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'phone_number', ph.phone_number,
        'normalized_phone_number', ph.normalized_phone_number
      )
      order by ph.position
    ) filter (where ph.id is not null),
    '[]'::jsonb
  ) as phone_numbers
from public.directory_businesses b
left join public.directory_business_profiles p on p.source_uid = b.source_uid
left join public.directory_business_phone_numbers ph on ph.business_id = b.id
group by b.id, p.source_uid;

grant select on public.directory_business_detail_view to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6) Fuzzy search RPC: full-text (weighted name>tagline>about) blended with trigram
--    typo tolerance. A row qualifies if EITHER matches. Returns the app-view shape
--    plus a rank. Read-only over public data → safe for anon. <2 chars → no rows.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.directory_search(q text, lim integer default 30)
returns table (
  id                 uuid,
  source_uid         text,
  name               text,
  description        text,
  logo_url           text,
  longitude          double precision,
  latitude           double precision,
  recommended_score  integer,
  has_coupon         boolean,
  has_google_marker  boolean,
  phone_numbers      jsonb,
  created_at         timestamptz,
  updated_at         timestamptz,
  rank               real
)
language sql
stable
security invoker
set search_path = public
as $$
  with args as (
    select websearch_to_tsquery('english', coalesce(q, '')) as tsq,
           lower(btrim(coalesce(q, '')))                     as ql,
           length(btrim(coalesce(q, '')))                    as qlen
  )
  select
    v.id, v.source_uid, v.name, v.description, v.logo_url, v.longitude, v.latitude,
    v.recommended_score, v.has_coupon, v.has_google_marker, v.phone_numbers,
    v.created_at, v.updated_at,
    (
      ts_rank_cd(b.search_tsv || coalesce(p.about_tsv, ''::tsvector), a.tsq) * 1.0
      + greatest(
          word_similarity(a.ql, b.name),
          word_similarity(a.ql, coalesce(b.description, '')),
          word_similarity(a.ql, coalesce(p.about_text, ''))
        ) * 0.4
    )::real as rank
  from args a
  join public.directory_businesses b on a.qlen >= 2
  left join public.directory_business_profiles p on p.source_uid = b.source_uid
  join public.directory_businesses_app_view v on v.source_uid = b.source_uid
  where
    (b.search_tsv || coalesce(p.about_tsv, ''::tsvector)) @@ a.tsq
    or word_similarity(a.ql, b.name) > 0.3
    or word_similarity(a.ql, coalesce(b.description, '')) > 0.3
    or word_similarity(a.ql, coalesce(p.about_text, '')) > 0.3
  order by rank desc, b.recommended_score desc nulls last, b.name
  limit greatest(1, least(coalesce(lim, 30), 50));
$$;

grant execute on function public.directory_search(text, integer) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7) Profile-sync support (service-role only): which profiles are due, and a run log.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.directory_profile_sync_runs (
  id          uuid primary key default gen_random_uuid(),
  ran_at      timestamptz not null default now(),
  status      text not null,        -- 'ok' | 'failed'
  processed   integer,
  updated     integer,
  failed      integer,
  reason      text,
  duration_ms integer
);
create index if not exists directory_profile_sync_runs_ran_at_idx
  on public.directory_profile_sync_runs (ran_at desc);

alter table public.directory_profile_sync_runs enable row level security; -- no policy => service-role only

-- Businesses whose profile is missing or stale, oldest first (missing first).
create or replace function public.directory_profiles_due(
  p_limit integer default 25,
  p_stale_days integer default 7
) returns table (source_uid text)
language sql
stable
security definer
set search_path = public
as $$
  select b.source_uid
  from public.directory_businesses b
  left join public.directory_business_profiles p on p.source_uid = b.source_uid
  where p.source_uid is null
     or p.fetched_at < now() - make_interval(days => greatest(0, p_stale_days))
  order by p.fetched_at asc nulls first, b.name
  limit greatest(1, least(coalesce(p_limit, 25), 100));
$$;

create or replace function public.directory_log_profile_run(
  p_status      text,
  p_processed   integer default null,
  p_updated     integer default null,
  p_failed      integer default null,
  p_reason      text    default null,
  p_duration_ms integer default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.directory_profile_sync_runs
    (status, processed, updated, failed, reason, duration_ms)
  values (p_status, p_processed, p_updated, p_failed, p_reason, p_duration_ms);
end;
$$;

-- Lock the service-role helpers down (the Edge Function uses the service key).
revoke all on function public.directory_profiles_due(integer, integer) from public, anon, authenticated;
grant execute on function public.directory_profiles_due(integer, integer) to service_role;

revoke all on function public.directory_log_profile_run(text, integer, integer, integer, text, integer)
  from public, anon, authenticated;
grant execute on function public.directory_log_profile_run(text, integer, integer, integer, text, integer)
  to service_role;
