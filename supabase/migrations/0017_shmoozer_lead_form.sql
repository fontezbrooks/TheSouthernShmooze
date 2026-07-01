-- 0017_shmoozer_lead_form.sql
-- The Shmoozer's first-swipe gate becomes a Concierge-style lead form instead of an email
-- OTP: the Seeker fills contact + budget + details once (prefilled from onboarding), and a
-- right-swipe sends the targeted lead immediately. This removes the OTP flow entirely.
--
-- Since no verification email is sent anymore, the anon "mail relay" risk that the OTP
-- rate limits guarded is gone. The remaining guards on submit_swipe_lead (per-Seeker daily
-- cap, per-business throttle, dedup) still bound abuse of the actual lead send.

-- 1) Task gains a free-text details field (the form's "Project details").
alter table public.swipe_tasks add column if not exists details text;

-- 2) Save the captured contact (marks verified without OTP) AND persist the possibly-edited
--    budget/details onto the task, in one call. SECURITY DEFINER — anon has no table access.
drop function if exists public.save_swipe_contact(uuid, uuid, text, text, text, text, text);
create function public.save_swipe_contact(
  p_session_token uuid,
  p_task_id       uuid,
  p_name          text,
  p_email         text,
  p_phone         text,
  p_budget        text default null,
  p_details       text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if p_session_token is null
     or v_email = ''
     or v_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
     or coalesce(btrim(p_name), '') = '' then
    return jsonb_build_object('status', 'rejected', 'reason', 'name and a valid email are required');
  end if;

  insert into public.swipe_contacts (session_token, name, email, phone, verified, updated_at)
  values (p_session_token, btrim(p_name), v_email, p_phone, true, now())
  on conflict (session_token) do update set
    name       = excluded.name,
    email      = excluded.email,
    phone      = excluded.phone,
    verified   = true,
    updated_at = now();

  -- Persist the form's budget/details onto the caller's task (best-effort; scoped by session).
  if p_task_id is not null then
    update public.swipe_tasks
       set budget  = coalesce(p_budget, budget),
           details = coalesce(p_details, details)
     where id = p_task_id and session_token = p_session_token;
  end if;

  return jsonb_build_object('status', 'ok');
end;
$$;

grant execute on function public.save_swipe_contact(uuid, uuid, text, text, text, text, text)
  to anon, authenticated;

-- 3) Retire the OTP verification RPCs (superseded by the form + save_swipe_contact).
drop function if exists public.request_contact_verification(uuid, text, text, text);
drop function if exists public.confirm_contact_verification(uuid, text);

-- 4) Recreate the lead-notify trigger so the owner email includes the project details.
create or replace function public.notify_swipe_lead_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret  text;
  v_payload jsonb;
begin
  select decrypted_secret into v_secret
    from vault.decrypted_secrets where name = 'sync_trigger_secret';
  if v_secret is null then
    return new;
  end if;

  select jsonb_build_object(
    'lead_id',       new.id,
    'created_at',    new.created_at,
    'confidence',    new.confidence,
    'business_uid',  new.business_uid,
    'business_name', v.name,
    'keyword',       t.keyword,
    'budget',        t.budget,
    'timing',        t.timing,
    'details',       t.details,
    'radius_km',     t.radius_km,
    'contact_name',  c.name,
    'contact_email', c.email,
    'contact_phone', c.phone
  )
  into v_payload
  from public.swipe_tasks t
  left join public.swipe_contacts c on c.session_token = new.session_token
  left join public.directory_businesses_app_view v on v.source_uid = new.business_uid
  where t.id = new.task_id;

  perform net.http_post(
    url     := 'https://udbvtigwvhvxszimqlgj.supabase.co/functions/v1/notify-swipe-lead',
    headers := jsonb_build_object('Content-Type', 'application/json', 'X-Sync-Secret', v_secret),
    body    := jsonb_build_object('record', v_payload)
  );

  return new;
end;
$$;
