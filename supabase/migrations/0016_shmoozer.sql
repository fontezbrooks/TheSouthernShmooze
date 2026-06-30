-- 0016_shmoozer.sql
-- "The Shmoozer" — Tinder-style swipe lead-funnel (Phase 1).
--
-- V1 matches a Seeker keyword (e.g. "roofing") against existing listing text with the
-- SAME full-text (search_tsv/about_tsv) + trigram (word_similarity) machinery that backs
-- `directory_search` (migrations 0004/0013) — there is NO category taxonomy. The deck
-- score is PURE match confidence (0–100); certified/distance are filters/sort, not score.
--
-- A right-swipe broadcasts an intent-rich lead to many providers. Anonymous Seekers
-- (no account) are kept honest server-side: email verification before the first send,
-- a per-Seeker daily cap, per-business throttling, and dedup. All writes/reads flow
-- through SECURITY DEFINER RPCs (mirroring the `leads` "anon-write-only" posture) — the
-- swipe tables themselves expose NO direct anon access.
--
-- Prereqs (already satisfied in prod): pg_net (0008), pg_trgm (word_similarity in 0013),
-- the Vault secret `sync_trigger_secret`, and the Edge Functions `notify-swipe-lead` /
-- `notify-swipe-verify` deployed with RESEND_API_KEY set.

create extension if not exists pgcrypto;
create extension if not exists pg_net;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Tables
-- ─────────────────────────────────────────────────────────────────────────────

-- Time-bound paid placement. A featured provider gets a labeled slot in the deck and
-- STILL shows its true confidence (boost position, never fake the number).
create table if not exists public.provider_promotions (
  id           uuid primary key default gen_random_uuid(),
  business_uid text not null,                 -- → directory_businesses.source_uid
  tier         text not null default 'featured',
  starts_at    timestamptz not null default now(),
  ends_at      timestamptz,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists provider_promotions_business_uid_idx
  on public.provider_promotions (business_uid) where active;

-- One Seeker session's verified contact (captured once on the first right-swipe).
create table if not exists public.swipe_contacts (
  session_token      uuid primary key,
  name               text,
  email              text,
  phone              text,
  verified           boolean not null default false,
  verify_code        text,
  verify_expires_at  timestamptz,
  verify_attempts    integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- One task per intake (keyword + where + budget/timing). Broadcast = N leads / task.
create table if not exists public.swipe_tasks (
  id            uuid primary key default gen_random_uuid(),
  session_token uuid not null,
  keyword       text not null,
  origin_lat    double precision,
  origin_lng    double precision,
  radius_km     integer not null default 25,
  budget        text,                          -- lt_1000 | 1000_5000 | gt_5000 (or null)
  timing        text,                          -- asap | this_week | flexible (or null)
  created_at    timestamptz not null default now()
);
create index if not exists swipe_tasks_session_token_idx
  on public.swipe_tasks (session_token);

-- One row per right-swipe; broadcast rows share task_id. confidence is a snapshot.
create table if not exists public.swipe_leads (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid not null references public.swipe_tasks(id) on delete cascade,
  session_token uuid not null,
  business_uid  text not null,
  confidence    integer not null,
  status        text not null default 'sent',  -- sent → confirmed → closed
  created_at    timestamptz not null default now(),
  unique (task_id, business_uid)               -- dedup: no double-send per task
);
create index if not exists swipe_leads_session_token_idx
  on public.swipe_leads (session_token);
create index if not exists swipe_leads_business_created_idx
  on public.swipe_leads (business_uid, created_at);

alter table public.swipe_leads
  drop constraint if exists swipe_leads_status_values,
  drop constraint if exists swipe_leads_confidence_range;
alter table public.swipe_leads
  add constraint swipe_leads_status_values
    check (status in ('sent', 'confirmed', 'closed')),
  add constraint swipe_leads_confidence_range
    check (confidence between 0 and 100);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) RLS: lock every table down. No anon/authenticated policies => no direct access.
--    All access is via the SECURITY DEFINER RPCs below (the safe extension of the
--    `leads` insert-only posture to support anonymous read-back by session_token).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.provider_promotions enable row level security;
alter table public.swipe_contacts      enable row level security;
alter table public.swipe_tasks         enable row level security;
alter table public.swipe_leads         enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Deck RPC — fuzzy keyword → confidence, distance filter, throttle, featured flag.
--    SECURITY DEFINER: it reads swipe_leads (throttle) + provider_promotions, which
--    anon cannot. Returns the app-view columns (so the client reuses `toBusiness`)
--    PLUS confidence / distance_km / is_featured / matched_terms.
-- ─────────────────────────────────────────────────────────────────────────────
drop function if exists public.directory_swipe_deck(text, double precision, double precision, integer, text, uuid, text[], integer, integer);
create function public.directory_swipe_deck(
  p_keyword        text,
  p_lat            double precision default null,
  p_lng            double precision default null,
  p_radius_km      integer default 25,
  p_budget         text default null,
  p_session_token  uuid default null,
  p_exclude        text[] default null,
  p_min_confidence integer default 30,
  p_limit          integer default 30
)
returns table (
  id                uuid,
  source_uid        text,
  name              text,
  description       text,
  logo_url          text,
  longitude         double precision,
  latitude          double precision,
  recommended_score integer,
  has_coupon        boolean,
  is_certified      boolean,
  phone_numbers     jsonb,
  created_at        timestamptz,
  updated_at        timestamptz,
  confidence        integer,
  distance_km       double precision,
  is_featured       boolean,
  matched_terms     jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  with args as (
    select
      lower(btrim(coalesce(p_keyword, '')))               as ql,
      websearch_to_tsquery('english', coalesce(p_keyword, '')) as tsq
  ),
  scored as (
    select
      v.id, v.source_uid, v.name, v.description, v.logo_url, v.longitude, v.latitude,
      v.recommended_score, v.has_coupon, v.is_certified, v.phone_numbers,
      v.created_at, v.updated_at,
      -- PURE match confidence: greatest trigram overlap of the keyword against any
      -- listing text, +0.25 when the full-text query also hits (multi-word/stemmed),
      -- clamped to 100. Deterministic → reproducible "87%".
      round(100 * least(1.0,
        greatest(
          word_similarity(a.ql, b.name),
          word_similarity(a.ql, coalesce(b.description, '')),
          word_similarity(a.ql, coalesce(p.about_text, ''))
        )
        + case
            when (b.search_tsv || coalesce(p.about_tsv, ''::tsvector)) @@ a.tsq then 0.25
            else 0
          end
      ))::integer as confidence,
      -- Haversine km from the task origin (null when either side lacks coordinates).
      case
        when p_lat is null or p_lng is null or v.latitude is null or v.longitude is null
          then null
        else 6371 * acos(least(1, greatest(-1,
          cos(radians(p_lat)) * cos(radians(v.latitude)) *
          cos(radians(v.longitude) - radians(p_lng))
          + sin(radians(p_lat)) * sin(radians(v.latitude))
        )))
      end as distance_km,
      exists (
        select 1 from public.provider_promotions pr
        where pr.business_uid = v.source_uid
          and pr.active
          and pr.starts_at <= now()
          and (pr.ends_at is null or pr.ends_at > now())
      ) as is_featured,
      (
        select count(*) from public.swipe_leads sl
        where sl.business_uid = v.source_uid
          and sl.created_at > now() - interval '24 hours'
      ) as lead_count_24h,
      a.ql as ql
    from args a
    join public.directory_businesses b on true
    join public.directory_businesses_app_view v on v.source_uid = b.source_uid
    left join public.directory_business_profiles p on p.source_uid = b.source_uid
  )
  select
    s.id, s.source_uid, s.name, s.description, s.logo_url, s.longitude, s.latitude,
    s.recommended_score, s.has_coupon, s.is_certified, s.phone_numbers,
    s.created_at, s.updated_at,
    s.confidence,
    s.distance_km,
    s.is_featured,
    to_jsonb(string_to_array(nullif(s.ql, ''), ' ')) as matched_terms
  from scored s
  where s.confidence >= greatest(0, coalesce(p_min_confidence, 30))
    -- per-business throttle: hide over-subscribed providers (max 25 leads / 24h)
    and s.lead_count_24h < 25
    -- radius filter, but never hide providers that simply lack coordinates
    and (p_lat is null or p_lng is null or s.distance_km is null
         or s.distance_km <= coalesce(p_radius_km, 25))
    and (p_exclude is null or s.source_uid <> all (p_exclude))
  order by s.confidence desc, s.is_certified desc, s.name
  limit greatest(1, least(coalesce(p_limit, 30), 50));
$$;

grant execute on function public.directory_swipe_deck(text, double precision, double precision, integer, text, uuid, text[], integer, integer)
  to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) Contact verification — email OTP via Resend (gates the first send).
-- ─────────────────────────────────────────────────────────────────────────────
drop function if exists public.request_contact_verification(uuid, text, text, text);
create function public.request_contact_verification(
  p_session_token uuid,
  p_name          text,
  p_email         text,
  p_phone         text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code   text := lpad((floor(random() * 1000000))::int::text, 6, '0');
  v_secret text;
begin
  if p_session_token is null
     or coalesce(btrim(p_email), '') = ''
     or p_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return jsonb_build_object('status', 'rejected', 'reason', 'invalid email');
  end if;

  insert into public.swipe_contacts (
    session_token, name, email, phone, verified, verify_code, verify_expires_at,
    verify_attempts, updated_at
  )
  values (
    p_session_token, p_name, lower(btrim(p_email)), p_phone, false, v_code,
    now() + interval '15 minutes', 0, now()
  )
  on conflict (session_token) do update set
    name              = excluded.name,
    email             = excluded.email,
    phone             = excluded.phone,
    verified          = false,
    verify_code       = excluded.verify_code,
    verify_expires_at = excluded.verify_expires_at,
    verify_attempts   = 0,
    updated_at        = now();

  -- Email the code (best-effort; pg_net delivers after commit). No-op if unconfigured.
  select decrypted_secret into v_secret
    from vault.decrypted_secrets where name = 'sync_trigger_secret';
  if v_secret is not null then
    perform net.http_post(
      url     := 'https://udbvtigwvhvxszimqlgj.supabase.co/functions/v1/notify-swipe-verify',
      headers := jsonb_build_object('Content-Type', 'application/json', 'X-Sync-Secret', v_secret),
      body    := jsonb_build_object('email', lower(btrim(p_email)), 'code', v_code)
    );
  end if;

  return jsonb_build_object('status', 'sent');
end;
$$;

grant execute on function public.request_contact_verification(uuid, text, text, text)
  to anon, authenticated;

drop function if exists public.confirm_contact_verification(uuid, text);
create function public.confirm_contact_verification(
  p_session_token uuid,
  p_code          text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.swipe_contacts;
begin
  select * into v_row from public.swipe_contacts where session_token = p_session_token;

  if v_row.session_token is null then
    return jsonb_build_object('status', 'rejected', 'reason', 'no pending verification');
  end if;
  if v_row.verified then
    return jsonb_build_object('status', 'verified');
  end if;
  if v_row.verify_expires_at is null or v_row.verify_expires_at < now() then
    return jsonb_build_object('status', 'rejected', 'reason', 'code expired');
  end if;
  if v_row.verify_attempts >= 5 then
    return jsonb_build_object('status', 'rejected', 'reason', 'too many attempts');
  end if;

  if v_row.verify_code is distinct from btrim(p_code) then
    update public.swipe_contacts
       set verify_attempts = verify_attempts + 1, updated_at = now()
     where session_token = p_session_token;
    return jsonb_build_object('status', 'rejected', 'reason', 'incorrect code');
  end if;

  update public.swipe_contacts
     set verified = true, verify_code = null, verify_expires_at = null, updated_at = now()
   where session_token = p_session_token;

  return jsonb_build_object('status', 'verified');
end;
$$;

grant execute on function public.confirm_contact_verification(uuid, text)
  to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) Task creation + guarded lead submit.
-- ─────────────────────────────────────────────────────────────────────────────
drop function if exists public.create_swipe_task(uuid, text, double precision, double precision, integer, text, text);
create function public.create_swipe_task(
  p_session_token uuid,
  p_keyword       text,
  p_lat           double precision default null,
  p_lng           double precision default null,
  p_radius_km     integer default 25,
  p_budget        text default null,
  p_timing        text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_session_token is null or coalesce(btrim(p_keyword), '') = '' then
    raise exception 'session token and keyword are required';
  end if;
  insert into public.swipe_tasks (session_token, keyword, origin_lat, origin_lng, radius_km, budget, timing)
  values (p_session_token, btrim(p_keyword), p_lat, p_lng, coalesce(p_radius_km, 25), p_budget, p_timing)
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.create_swipe_task(uuid, text, double precision, double precision, integer, text, text)
  to anon, authenticated;

-- A right-swipe. SECURITY DEFINER enforces ALL abuse rules atomically:
-- verified contact | per-Seeker daily cap (30) | per-business throttle (25/24h) | dedup.
drop function if exists public.submit_swipe_lead(uuid, uuid, text, integer);
create function public.submit_swipe_lead(
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
            greatest(0, least(100, coalesce(p_confidence, 0))));
  exception when unique_violation then
    return jsonb_build_object('status', 'duplicate');
  end;

  return jsonb_build_object('status', 'ok');
end;
$$;

grant execute on function public.submit_swipe_lead(uuid, uuid, text, integer)
  to anon, authenticated;

-- The anonymous Seeker's ONLY read path: their own leads + live status, by session_token.
drop function if exists public.get_my_swipe_leads(uuid);
create function public.get_my_swipe_leads(p_session_token uuid)
returns table (
  business_uid text,
  name         text,
  logo_url     text,
  confidence   integer,
  status       text,
  created_at   timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select sl.business_uid, v.name, v.logo_url, sl.confidence, sl.status, sl.created_at
  from public.swipe_leads sl
  left join public.directory_businesses_app_view v on v.source_uid = sl.business_uid
  where sl.session_token = p_session_token
  order by sl.created_at desc;
$$;

grant execute on function public.get_my_swipe_leads(uuid) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6) Notify the owner inbox on each swipe lead (R-1: no business emails yet).
--    Assembles a rich payload (task + contact + business) so the email is useful.
-- ─────────────────────────────────────────────────────────────────────────────
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

drop trigger if exists trg_notify_swipe_lead_on_insert on public.swipe_leads;
create trigger trg_notify_swipe_lead_on_insert
  after insert on public.swipe_leads
  for each row
  execute function public.notify_swipe_lead_on_insert();
