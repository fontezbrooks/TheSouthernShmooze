-- 0007_directory_sync.sql
-- Automated MembershipWorks → app directory sync.
--
-- The `sync-directory` Edge Function fetches the full MW directory feed, transforms it,
-- and calls `directory_sync_apply` with the whole change set. This function applies the
-- set ATOMICALLY (one transaction): a destructive-write guard, upsert, mirror-delete of
-- members no longer in the feed, phone replacement, baseline update, and an audit row.
-- Because it is one plpgsql body, any failure rolls the whole thing back — the live
-- directory can never be left half-updated, and a bad/empty fetch can never wipe it.
--
-- This supersedes the separate `directory_replace_phones` call (0006) for the sync path;
-- its atomic delete+insert guarantee is folded in here.

-- 1) Singleton state: the "last good" baseline used by the safety guard.
create table if not exists public.directory_sync_state (
  id              boolean primary key default true check (id),  -- single row (id = true)
  last_good_count integer,
  last_success_at timestamptz,
  last_run_at     timestamptz
);
insert into public.directory_sync_state (id) values (true) on conflict (id) do nothing;

-- 2) Run audit log (observability — NFR5).
create table if not exists public.directory_sync_runs (
  id            uuid primary key default gen_random_uuid(),
  ran_at        timestamptz not null default now(),
  status        text not null,            -- 'ok' | 'failed' | 'skipped_guard'
  http_status   integer,
  fetched_count integer,                  -- usr.length
  valid_count   integer,                  -- after transform/skip
  added         integer,
  updated       integer,
  removed       integer,
  reason        text,                     -- failure / guard detail
  duration_ms   integer
);
create index if not exists directory_sync_runs_ran_at_idx
  on public.directory_sync_runs (ran_at desc);

-- 3) Service-role-only access. RLS on, no policies => anon/authenticated denied. The
--    apply function is security-definer so it operates regardless; the app never reads these.
alter table public.directory_sync_state enable row level security;
alter table public.directory_sync_runs  enable row level security;

-- 4) Lightweight logger for fetch-stage outcomes (failures / guard skips that never
--    reach `directory_sync_apply`). Bumps last_run_at and writes one audit row.
create or replace function public.directory_log_run(
  p_status      text,
  p_reason      text default null,
  p_http_status integer default null,
  p_fetched     integer default null,
  p_duration_ms integer default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.directory_sync_state set last_run_at = now() where id;
  insert into public.directory_sync_runs (status, reason, http_status, fetched_count, duration_ms)
  values (p_status, p_reason, p_http_status, p_fetched, p_duration_ms);
end;
$$;

-- 5) Atomic apply: guard → upsert → mirror-delete → phones → state → audit, all in one txn.
--    p_records: jsonb array of { "business": <BusinessRow>, "phones": [<PhoneRow>...] }.
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

  -- ── SAFETY GUARD (NFR2): never let a bad/partial fetch wipe the directory ──
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
      recommended_score, has_coupon, has_google_marker, raw_source_payload
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
      coalesce((b->>'has_google_marker')::boolean, false),
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
      has_google_marker = excluded.has_google_marker,
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

-- 6) Lock down: service-role only (the Edge Function uses the service key).
revoke all on function public.directory_log_run(text, text, integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.directory_log_run(text, text, integer, integer, integer)
  to service_role;

revoke all on function public.directory_sync_apply(jsonb, numeric, integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.directory_sync_apply(jsonb, numeric, integer, integer, integer)
  to service_role;
