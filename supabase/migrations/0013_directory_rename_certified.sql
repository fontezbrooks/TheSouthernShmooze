-- 0013_directory_rename_certified.sql
-- Epic A (rename) + Epic B (certified-first ordering).
--
-- The directory feed's `xgm` flag is the website's CERTIFIED STAR (the card template
-- renders `[xgm?<img src=".../K3mthhU.png">]`). It was imported into a misleadingly named
-- column `has_google_marker` (a wrong guess at import time). This migration renames it to
-- `is_certified` everywhere and makes certified businesses sort first in search.
--
-- A base-column rename does NOT rename a view's projected output column, and a function's
-- RETURNS-TABLE column name cannot be changed in place. So every dependent view and the
-- `directory_search` function are DROPPED and recreated. Function bodies are string
-- literals (not dependency-tracked), so `directory_sync_apply` is recreated too — otherwise
-- it would silently break at call time when it references the now-renamed column.
--
-- Epic C (content-hash reconciliation) lands separately in 0014.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Rename the base column + its index.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.directory_businesses
  rename column has_google_marker to is_certified;

alter index if exists public.directory_businesses_has_google_marker_idx
  rename to directory_businesses_is_certified_idx;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) App-facing view: recreate with `is_certified` (re-grant — see 0005).
-- ─────────────────────────────────────────────────────────────────────────────
drop view if exists public.directory_businesses_app_view;
create view public.directory_businesses_app_view
  with (security_invoker = true)
as
select
  b.id,
  b.source_uid,
  b.name,
  b.description,
  b.logo_url,
  b.longitude,
  b.latitude,
  b.recommended_score,
  b.has_coupon,
  b.is_certified,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'phone_number', p.phone_number,
        'normalized_phone_number', p.normalized_phone_number
      )
      order by p.position
    ) filter (where p.id is not null),
    '[]'::jsonb
  ) as phone_numbers,
  b.created_at,
  b.updated_at
from public.directory_businesses b
left join public.directory_business_phone_numbers p
  on p.business_id = b.id
group by b.id;

grant select on public.directory_businesses_app_view to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Detail-screen view: recreate with `is_certified` (re-grant — see 0010).
-- ─────────────────────────────────────────────────────────────────────────────
drop view if exists public.directory_business_detail_view;
create view public.directory_business_detail_view
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
  b.is_certified,
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
-- 4) Fuzzy search RPC: recreate with `is_certified` return column + CERTIFIED-FIRST
--    ordering (Epic B). All certified rows sort above non-certified, then by the prior
--    relevance chain. Must drop first: the RETURNS-TABLE column name changed.
-- ─────────────────────────────────────────────────────────────────────────────
drop function if exists public.directory_search(text, integer);
create function public.directory_search(q text, lim integer default 30)
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
  is_certified       boolean,
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
    v.recommended_score, v.has_coupon, v.is_certified, v.phone_numbers,
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
  order by v.is_certified desc, rank desc, b.recommended_score desc nulls last, b.name
  limit greatest(1, least(coalesce(lim, 30), 50));
$$;

grant execute on function public.directory_search(text, integer) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) Sync RPC: recreate referencing `is_certified` (body otherwise identical to 0009).
--    Epic C will replace this again in 0014 with hash-based change detection.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.directory_sync_apply(
  p_records           jsonb,
  p_max_drop_fraction numeric default 0.40,
  p_min_count_floor   integer default 50,
  p_fetched_count     integer default null,
  p_duration_ms       integer default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_valid     integer := jsonb_array_length(coalesce(p_records, '[]'::jsonb));
  v_last_good integer;
  v_added     integer := 0;
  v_updated   integer := 0;
  v_removed   integer := 0;
begin
  select last_good_count into v_last_good from public.directory_sync_state where id;

  if v_last_good is null then
    select count(*) into v_last_good from public.directory_businesses;
    if v_last_good = 0 then
      v_last_good := null;
    end if;
  end if;

  -- ── SAFETY GUARD: never let a bad/partial fetch wipe the directory ──
  if v_valid = 0 then
    update public.directory_sync_state set last_run_at = now() where id;
    insert into public.directory_sync_runs (status, reason, fetched_count, valid_count, duration_ms)
    values ('skipped_guard', 'zero valid records', p_fetched_count, 0, p_duration_ms);
    return jsonb_build_object('status', 'skipped_guard', 'reason', 'zero valid records',
                              'added', 0, 'updated', 0, 'removed', 0, 'valid_count', 0);
  end if;

  if v_last_good is not null
     and v_valid < v_last_good
     and (v_last_good - v_valid) > greatest(p_min_count_floor, ceil(v_last_good * p_max_drop_fraction))
  then
    update public.directory_sync_state set last_run_at = now() where id;
    insert into public.directory_sync_runs (status, reason, fetched_count, valid_count, duration_ms)
    values ('skipped_guard',
            format('anomalous drop %s -> %s', v_last_good, v_valid),
            p_fetched_count, v_valid, p_duration_ms);
    return jsonb_build_object('status', 'skipped_guard',
                              'reason', format('anomalous drop %s -> %s', v_last_good, v_valid),
                              'added', 0, 'updated', 0, 'removed', 0, 'valid_count', v_valid);
  end if;

  -- 1) UPSERT businesses by source_uid. (xmax = 0) distinguishes inserts from updates.
  with up as (
    insert into public.directory_businesses (
      source_uid, name, description, logo_url, longitude, latitude,
      recommended_score, has_coupon, is_certified, raw_source_payload
    )
    select
      b->>'source_uid',
      b->>'name',
      b->>'description',
      b->>'logo_url',
      (b->>'longitude')::double precision,
      (b->>'latitude')::double precision,
      (b->>'recommended_score')::integer,
      coalesce((b->>'has_coupon')::boolean, false),
      coalesce((b->>'is_certified')::boolean, false),
      coalesce(b->'raw_source_payload', '{}'::jsonb)
    from jsonb_array_elements(p_records) r
    cross join lateral (select r->'business' as b) j
    on conflict (source_uid) do update set
      name              = excluded.name,
      description       = excluded.description,
      logo_url          = excluded.logo_url,
      longitude         = excluded.longitude,
      latitude          = excluded.latitude,
      recommended_score = excluded.recommended_score,
      has_coupon        = excluded.has_coupon,
      is_certified      = excluded.is_certified,
      raw_source_payload = excluded.raw_source_payload
    returning (xmax = 0) as inserted
  )
  select
    count(*) filter (where inserted),
    count(*) filter (where not inserted)
  into v_added, v_updated
  from up;

  -- 2) MIRROR-DELETE: remove businesses no longer present in the feed (phones cascade via FK).
  with del as (
    delete from public.directory_businesses b
    where not exists (
      select 1
      from jsonb_array_elements(p_records) r
      where r->'business'->>'source_uid' = b.source_uid
    )
    returning 1
  )
  select count(*) into v_removed from del;

  -- 3) REPLACE PHONES for the incoming set (delete + re-insert in this same txn).
  delete from public.directory_business_phone_numbers p
   using public.directory_businesses b
   where p.business_id = b.id
     and b.source_uid in (
       select r->'business'->>'source_uid' from jsonb_array_elements(p_records) r
     );

  insert into public.directory_business_phone_numbers
    (business_id, phone_number, normalized_phone_number, position)
  select
    b.id,
    ph->>'phone_number',
    ph->>'normalized_phone_number',
    coalesce((ph->>'position')::integer, 0)
  from jsonb_array_elements(p_records) r
  join public.directory_businesses b
    on b.source_uid = r->'business'->>'source_uid'
  cross join lateral jsonb_array_elements(coalesce(r->'phones', '[]'::jsonb)) ph
  where ph->>'phone_number' is not null
  on conflict (business_id, phone_number) do nothing;

  -- 4) Update baseline + write the success audit row (same txn).
  update public.directory_sync_state
     set last_good_count = v_valid,
         last_success_at = now(),
         last_run_at     = now()
   where id;

  insert into public.directory_sync_runs
    (status, fetched_count, valid_count, added, updated, removed, duration_ms)
  values ('ok', p_fetched_count, v_valid, v_added, v_updated, v_removed, p_duration_ms);

  return jsonb_build_object('status', 'ok', 'added', v_added, 'updated', v_updated,
                            'removed', v_removed, 'valid_count', v_valid);
end;
$$;
