-- 0021: submit_swipe_lead returns the lead row id (review: PR #43).
--
-- Every swipe_leads row already has its own generated id (0016), but the RPC
-- only reported { status }. Analytics (shmoozer_match_triggered) needs the
-- real lead id as concierge_request_id — a homeowner matching several
-- businesses from one search shares the task id across all of them, so task
-- id cannot correlate or dedupe against actual leads. The duplicate branch
-- returns the EXISTING row's id for the same reason (a double send must
-- correlate to the one real lead).
--
-- Same signature — create or replace keeps the 0016 grants.

create or replace function public.submit_swipe_lead(
  p_session_token uuid,
  p_task_id       uuid,
  p_business_uid  text,
  p_confidence    integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_verified    boolean;
  v_seeker_24h  integer;
  v_biz_24h     integer;
  v_lead_id     uuid;
begin
  if p_session_token is null or p_task_id is null or coalesce(btrim(p_business_uid), '') = '' then
    return jsonb_build_object('status', 'rejected', 'reason', 'missing fields');
  end if;

  -- 1) Contact must be verified before any send.
  select verified into v_verified from public.swipe_contacts where session_token = p_session_token;
  if coalesce(v_verified, false) = false then
    return jsonb_build_object('status', 'rejected', 'reason', 'contact not verified');
  end if;

  -- 2) Per-Seeker daily cap.
  select count(*) into v_seeker_24h from public.swipe_leads
   where session_token = p_session_token and created_at > now() - interval '24 hours';
  if v_seeker_24h >= 30 then
    return jsonb_build_object('status', 'rejected', 'reason', 'daily limit reached');
  end if;

  -- 3) Per-business throttle.
  select count(*) into v_biz_24h from public.swipe_leads
   where business_uid = p_business_uid and created_at > now() - interval '24 hours';
  if v_biz_24h >= 25 then
    return jsonb_build_object('status', 'rejected', 'reason', 'business unavailable');
  end if;

  -- 4) Insert (unique(task_id,business_uid) dedups concurrent/double sends).
  begin
    insert into public.swipe_leads (task_id, session_token, business_uid, confidence)
    values (p_task_id, p_session_token, p_business_uid,
            greatest(0, least(100, coalesce(p_confidence, 0))))
    returning id into v_lead_id;
  exception when unique_violation then
    select id into v_lead_id from public.swipe_leads
     where task_id = p_task_id and business_uid = p_business_uid;
    return jsonb_build_object('status', 'duplicate', 'lead_id', v_lead_id);
  end;

  return jsonb_build_object('status', 'ok', 'lead_id', v_lead_id);
end;
$$;
