-- 0011_sync_profiles_schedule.sql
-- Schedule profile ingestion: pg_cron calls the `sync-profiles` Edge Function every
-- 5 minutes via pg_net, passing the X-Sync-Secret header read from Supabase Vault.
-- Each run processes a bounded batch of missing/stale profiles, so the schedule
-- converges the full directory and then just refreshes stale rows + new businesses.
--
-- Prereqs (already satisfied in prod): pg_cron + pg_net enabled (0008), the
-- `sync_trigger_secret` Vault secret exists, and the `sync-profiles` function is deployed.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotent re-apply.
do $$
begin
  perform cron.unschedule('sync-profiles');
exception when others then
  null; -- no existing job
end;
$$;

select cron.schedule(
  'sync-profiles',
  '*/5 * * * *',
  $cron$
  select net.http_post(
    url     := 'https://udbvtigwvhvxszimqlgj.supabase.co/functions/v1/sync-profiles',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Sync-Secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'sync_trigger_secret'
      )
    ),
    body    := '{}'::jsonb
  );
  $cron$
);
