-- 0014_directory_content_hash_reconcile.sql
-- Epic C: content-hash change detection + precise profile re-fetch.
--
-- MembershipWorks exposes NO per-member "last updated" timestamp, so we detect change by
-- hashing each member's persisted projection (clean business row + phones) in the shared
-- transform and comparing it to the stored hash on sync. The upsert uses a CONDITIONAL
-- `do update ... where hash is distinct from excluded`, so unchanged rows are never
-- rewritten (no churn) and never returned — the RETURNING set IS the changed set.
--
-- When a member is new or changed, `needs_profile_refetch` is flagged so `sync-profiles`
-- re-pulls its About/search corpus. An AFTER trigger on directory_business_profiles clears
-- the flag on ANY profile write (success upsert OR failure stub), so the flag is a one-shot
-- "refetch now" signal that can't re-introduce the 0012 retry-starvation bug.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) New columns: per-member content hash + the one-shot refetch flag + telemetry.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.directory_businesses
  add column if not exists source_content_hash   text,
  add column if not exists needs_profile_refetch boolean not null default false;

-- Partial index: the due-picker filters on this flag; only flagged rows matter.
create index if not exists directory_businesses_needs_profile_refetch_idx
  on public.directory_businesses (needs_profile_refetch)
  where needs_profile_refetch;

alter table public.directory_sync_runs
  add column if not exists unchanged integer;       -- members present in feed but not changed

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Clear the refetch flag on any profile write (success OR recorded failure).
--    This is what prevents a permanent refetch loop: a failed fetch still writes a stub
--    via directory_record_profile_failure, clearing the flag → row falls back to the
--    normal error backoff in directory_profiles_due.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.clear_profile_refetch_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.directory_businesses
     set needs_profile_refetch = false
   where source_uid = new.source_uid
     and needs_profile_refetch;          -- guard: skip no-op writes
  return null;
end;
$$;

drop trigger if exists directory_profiles_clear_refetch on public.directory_business_profiles;
create trigger directory_profiles_clear_refetch
  after insert or update on public.directory_business_profiles
  for each row execute function public.clear_profile_refetch_flag();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Due-picker: add the flag clause (changed members refetch now). Missing-first,
--    then flagged, then the existing stale / error-backoff rules (superset of 0012).
-- ─────────────────────────────────────────────────────────────────────────────
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
     or b.needs_profile_refetch
     or (p.fetch_error is null
         and p.fetched_at < now() - make_interval(days => greatest(0, p_stale_days)))
     or (p.fetch_error is not null
         and p.fetched_at < now() - interval '1 day')
  order by p.fetched_at asc nulls first, b.name
  limit greatest(1, least(coalesce(p_limit, 25), 100));
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) Atomic apply (final): hash-diff change detection, scoped phone replacement,
--    refetch flagging, unchanged telemetry. Supersedes the 0013 body.
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
  v_changed   integer := 0;
  v_unchanged integer := 0;
  v_removed   integer := 0;
  v_touched   text[];
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

  -- 1) UPSERT by source_uid. The conditional DO UPDATE ... WHERE makes the RETURNING set
  --    exactly the new+changed rows: unchanged rows (same hash) are not rewritten/returned.
  with up as (
    insert into public.directory_businesses (
      source_uid, name, description, logo_url, longitude, latitude,
      recommended_score, has_coupon, is_certified, source_content_hash,
      needs_profile_refetch, raw_source_payload
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
      b->>'source_content_hash',
      true,                                  -- new row → flag for first profile fetch
      coalesce(b->'raw_source_payload', '{}'::jsonb)
    from jsonb_array_elements(p_records) r
    cross join lateral (select r->'business' as b) j
    on conflict (source_uid) do update set
      name               = excluded.name,
      description        = excluded.description,
      logo_url           = excluded.logo_url,
      longitude          = excluded.longitude,
      latitude           = excluded.latitude,
      recommended_score  = excluded.recommended_score,
      has_coupon         = excluded.has_coupon,
      is_certified       = excluded.is_certified,
      source_content_hash = excluded.source_content_hash,
      raw_source_payload = excluded.raw_source_payload,
      needs_profile_refetch = true           -- reached only when the row actually changes ↓
    where directory_businesses.source_content_hash
            is distinct from excluded.source_content_hash
    returning source_uid, (xmax = 0) as inserted
  )
  select
    coalesce(array_agg(source_uid), '{}'::text[]),
    count(*) filter (where inserted),
    count(*) filter (where not inserted)
  into v_touched, v_added, v_changed
  from up;

  -- members present in the feed but unchanged (matched, not rewritten).
  v_unchanged := greatest(v_valid - v_added - v_changed, 0);

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

  -- 3) REPLACE PHONES for NEW+CHANGED rows only (phones are part of the hash, so unchanged
  --    members keep their existing phone rows — no churn).
  if array_length(v_touched, 1) is not null then
    delete from public.directory_business_phone_numbers p
     using public.directory_businesses b
     where p.business_id = b.id
       and b.source_uid = any(v_touched);

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
    where b.source_uid = any(v_touched)
      and ph->>'phone_number' is not null
    on conflict (business_id, phone_number) do nothing;
  end if;

  -- 4) Update baseline + write the success audit row (same txn).
  update public.directory_sync_state
     set last_good_count = v_valid,
         last_success_at = now(),
         last_run_at     = now()
   where id;

  insert into public.directory_sync_runs
    (status, fetched_count, valid_count, added, updated, unchanged, removed, duration_ms)
  values ('ok', p_fetched_count, v_valid, v_added, v_changed, v_unchanged, v_removed, p_duration_ms);

  return jsonb_build_object('status', 'ok', 'added', v_added, 'updated', v_changed,
                            'unchanged', v_unchanged, 'removed', v_removed,
                            'valid_count', v_valid);
end;
$$;
