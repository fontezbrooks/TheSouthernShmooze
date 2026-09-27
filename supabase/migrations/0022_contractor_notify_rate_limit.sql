-- 0022: rate-limit contractor notification email sends.
-- contractor-wizard is callable with the public anon JWT, so replayed accepted
-- submissions could consume Resend quota and spam recipients. Cap notifications
-- at 30 per hour globally and 3 per 24 hours for each applicant bucket.

create table if not exists public.contractor_notify_events (
  id         bigint generated always as identity primary key,
  bucket     text        not null,
  created_at timestamptz not null default pg_catalog.now()
);

create index if not exists contractor_notify_events_created_at_idx
  on public.contractor_notify_events (created_at);

create index if not exists contractor_notify_events_bucket_created_at_idx
  on public.contractor_notify_events (bucket, created_at);

alter table public.contractor_notify_events enable row level security;
revoke all on table public.contractor_notify_events from public, anon, authenticated;

create or replace function public.contractor_notify_allow(p_bucket text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Maximum notification events allowed across all buckets in one hour.
  c_global_hourly_limit constant integer := 30;
  -- Maximum notification events allowed for one applicant bucket in 24 hours.
  c_bucket_daily_limit constant integer := 3;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('contractor_notify_allow')
  );

  delete from public.contractor_notify_events
   where created_at < pg_catalog.now() - interval '7 days';

  if (
    select pg_catalog.count(*)
      from public.contractor_notify_events
     where created_at > pg_catalog.now() - interval '1 hour'
  ) >= c_global_hourly_limit then
    return false;
  end if;

  if (
    select pg_catalog.count(*)
      from public.contractor_notify_events
     where bucket = p_bucket
       and created_at > pg_catalog.now() - interval '24 hours'
  ) >= c_bucket_daily_limit then
    return false;
  end if;

  insert into public.contractor_notify_events (bucket)
  values (p_bucket);

  return true;
end;
$$;

revoke execute on function public.contractor_notify_allow(text)
  from public, anon, authenticated;
grant execute on function public.contractor_notify_allow(text) to service_role;
