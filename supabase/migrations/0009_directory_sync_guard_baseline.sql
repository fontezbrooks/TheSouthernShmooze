-- 0009_directory_sync_guard_baseline.sql
-- Fix (PR #9 review, P1): seed the anomalous-drop guard baseline when it is null.
--
-- In 0007, `directory_sync_state.last_good_count` starts null and the drop guard is
-- only evaluated when it is NOT null. So on the FIRST run after the migration (or any
-- time the state row is reset), a partial-but-valid MembershipWorks response (e.g. 40 of
-- 184 members) would skip the guard, proceed to the mirror-delete, wipe most of the
-- already-seeded directory, and then record that short list as the new baseline.
--
-- Fix: when there is no recorded baseline, fall back to the CURRENT directory size as the
-- baseline so a partial feed cannot shrink an already-populated directory. A genuinely
-- empty table (count 0) keeps the baseline null so the very first full seed is allowed.
--
-- This `create or replace` only changes the guard preamble; the rest of the body is
-- identical to 0007.

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

  -- No recorded baseline yet (first run after migration, or a reset state row): fall back
  -- to the current directory size so a partial feed can't wipe an already-seeded directory.
  -- A truly empty table (count 0) leaves the baseline null so the first full seed proceeds.
  if v_last_good is null then
    select count(*) into v_last_good from public.directory_businesses;
    if v_last_good = 0 then
      v_last_good := null;
    end if;
  end if;

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
