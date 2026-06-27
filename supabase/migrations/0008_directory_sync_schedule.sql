-- 0008_directory_sync_schedule.sql
-- Schedule the directory sync: pg_cron calls the `sync-directory` Edge Function every
-- 10 minutes via pg_net, passing the X-Sync-Secret header read from Supabase Vault.
--
-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ APPLY ORDER — this migration must run AFTER:                                  │
-- │   1. the `sync-directory` Edge Function is deployed                           │
-- │        supabase functions deploy sync-directory                              │
-- │   2. the trigger secret exists in Vault, e.g.:                                │
-- │        select vault.create_secret('<RANDOM_SECRET>', 'sync_trigger_secret'); │
-- │      AND the same value is set as the function secret:                        │
-- │        supabase secrets set SYNC_TRIGGER_SECRET=<RANDOM_SECRET>              │
-- │ If applied earlier, the cron job simply posts an empty/duplicate secret and  │
-- │ the function returns 401 (harmless) until the secret is set.                  │
-- └─────────────────────────────────────────────────────────────────────────────┘

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove any prior definition so re-applying this migration is idempotent.
do $$
begin
  perform cron.unschedule('sync-directory');
exception when others then
  null; -- no existing job
end;
$$;

select cron.schedule(
  'sync-directory',
  '*/10 * * * *',
  $cron$
  select net.http_post(
    url     := 'https://udbvtigwvhvxszimqlgj.supabase.co/functions/v1/sync-directory',
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
