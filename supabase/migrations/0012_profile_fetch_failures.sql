-- 0012_profile_fetch_failures.sql
-- Fix (PR #10 review, P2): prevent retry-starvation in profile ingestion.
--
-- In 0010, a profile that permanently fails to fetch/transform (404, timeout) never gets
-- a row, so it stays in the "missing" set forever. `directory_profiles_due` returns the
-- same failing page (missing, nulls-first) every cron tick, and businesses later in the
-- order are never backfilled.
--
-- Fix: failures now RECORD a row (via directory_record_profile_failure) with fetched_at
-- = now(), an error message, and an attempt counter. That moves the business out of the
-- "missing" set so the next tick advances to others, and `directory_profiles_due` retries
-- errored rows on a short (daily) backoff while refreshing good rows on the normal cadence.

alter table public.directory_business_profiles
  add column if not exists fetch_error text,
  add column if not exists attempts integer not null default 0;

-- Record a failed fetch/transform attempt: stub row on first failure, bump attempts after.
create or replace function public.directory_record_profile_failure(
  p_source_uid text,
  p_error      text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.directory_business_profiles (source_uid, raw_profile, fetched_at, fetch_error, attempts)
  values (p_source_uid, '{}'::jsonb, now(), p_error, 1)
  on conflict (source_uid) do update set
    fetched_at  = now(),
    fetch_error = excluded.fetch_error,
    attempts    = public.directory_business_profiles.attempts + 1;
end;
$$;

-- Re-select rule: missing first; good rows refreshed after p_stale_days; errored rows
-- retried after ~1 day (so transient failures recover without starving the directory).
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
     or (p.fetch_error is null
         and p.fetched_at < now() - make_interval(days => greatest(0, p_stale_days)))
     or (p.fetch_error is not null
         and p.fetched_at < now() - interval '1 day')
  order by p.fetched_at asc nulls first, b.name
  limit greatest(1, least(coalesce(p_limit, 25), 100));
$$;

revoke all on function public.directory_record_profile_failure(text, text)
  from public, anon, authenticated;
grant execute on function public.directory_record_profile_failure(text, text) to service_role;
