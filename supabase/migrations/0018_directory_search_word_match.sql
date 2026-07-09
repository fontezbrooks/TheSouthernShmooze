-- 0018: Directory search precision — word match only (requirements §13, SR1).
--
-- WHY: the 0013 predicate ORed three `word_similarity(...) > 0.3` trigram
-- branches over name/description/about_text. On short queries the trigram net
-- accepts almost anything — "lawn" false-matched profiles that merely mention
-- "Lawrenceville" — so searches surfaced businesses that never contain the
-- query at all (observed on device 2026-07-09).
--
-- CHANGE: the full-text branch becomes the SOLE predicate. Results must
-- contain the query word — stemmed ("lawn" ↔ "lawns"), case-insensitive, with
-- websearch semantics for multi-word queries. Trigram typo-tolerance is
-- intentionally dropped (owner decision SR1); the swipe deck's matching
-- (`directory_swipe_deck`, 0016) is intentionally untouched (SR2).
--
-- Signature and RETURNS TABLE are identical to 0013, so `create or replace`
-- suffices and the client (`directoryRepository.search`) needs no changes.

create or replace function public.directory_search(q text, lim integer default 30)
returns table (
  id                 uuid,
  source_uid         text,
  name               text,
  description        text,
  logo_url           text,
  longitude          double precision,
  latitude           double precision,
  recommended_score  integer,
  has_coupon         boolean,
  is_certified       boolean,
  phone_numbers      jsonb,
  created_at         timestamptz,
  updated_at         timestamptz,
  rank               real
)
language sql
stable
security invoker
set search_path = public
as $$
  with args as (
    select websearch_to_tsquery('english', coalesce(q, '')) as tsq,
           length(btrim(coalesce(q, '')))                    as qlen
  )
  select
    v.id, v.source_uid, v.name, v.description, v.logo_url, v.longitude, v.latitude,
    v.recommended_score, v.has_coupon, v.is_certified, v.phone_numbers,
    v.created_at, v.updated_at,
    ts_rank_cd(b.search_tsv || coalesce(p.about_tsv, ''::tsvector), a.tsq)::real as rank
  from args a
  join public.directory_businesses b on a.qlen >= 2
  left join public.directory_business_profiles p on p.source_uid = b.source_uid
  join public.directory_businesses_app_view v on v.source_uid = b.source_uid
  where (b.search_tsv || coalesce(p.about_tsv, ''::tsvector)) @@ a.tsq
  order by v.is_certified desc, rank desc, b.recommended_score desc nulls last, b.name
  limit greatest(1, least(coalesce(lim, 30), 50));
$$;

grant execute on function public.directory_search(text, integer) to anon, authenticated;
