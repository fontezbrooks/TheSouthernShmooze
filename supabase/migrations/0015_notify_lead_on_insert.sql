-- 0015_notify_lead_on_insert.sql
-- Email a Concierge lead when it is inserted: an AFTER INSERT trigger on `leads`
-- calls the `notify-lead` Edge Function via pg_net, passing the new row as JSON and
-- the shared `X-Sync-Secret` header (read from Vault). pg_net queues the request and
-- delivers it after commit, so a slow/failed email never blocks the submission; if the
-- insert rolls back, the queued request rolls back with it (no email for a failed lead).
--
-- Prereqs (already satisfied in prod): pg_net enabled (0008/0011), the Vault secret
-- `sync_trigger_secret` exists, and the `notify-lead` function is deployed with
-- RESEND_API_KEY set. Auth reuses the existing SYNC_TRIGGER_SECRET — no new secret.

create extension if not exists pg_net;

create or replace function public.notify_lead_on_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret text;
begin
  select decrypted_secret
    into v_secret
    from vault.decrypted_secrets
   where name = 'sync_trigger_secret';

  -- Not configured → no-op rather than break the insert.
  if v_secret is null then
    return new;
  end if;

  perform net.http_post(
    url     := 'https://udbvtigwvhvxszimqlgj.supabase.co/functions/v1/notify-lead',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'X-Sync-Secret', v_secret
    ),
    body    := jsonb_build_object('record', to_jsonb(new))
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_lead_on_insert on public.leads;
create trigger trg_notify_lead_on_insert
  after insert on public.leads
  for each row
  execute function public.notify_lead_on_insert();
