-- 0004_directory_indexes_view.sql
-- Indexes for common app queries + the clean app-facing view.

-- Full-text search on name/description.
create index if not exists directory_businesses_name_idx
  on public.directory_businesses using gin (to_tsvector('english', coalesce(name, '')));

create index if not exists directory_businesses_description_idx
  on public.directory_businesses using gin (to_tsvector('english', coalesce(description, '')));

-- Geospatial search.
create index if not exists directory_businesses_location_idx
  on public.directory_businesses using gist (location);

-- Fast filtering on flags / score.
create index if not exists directory_businesses_has_coupon_idx
  on public.directory_businesses (has_coupon);

create index if not exists directory_businesses_has_google_marker_idx
  on public.directory_businesses (has_google_marker);

create index if not exists directory_businesses_recommended_score_idx
  on public.directory_businesses (recommended_score);

-- Keep every source parameter queryable through JSONB.
create index if not exists directory_businesses_raw_source_payload_idx
  on public.directory_businesses using gin (raw_source_payload);

create index if not exists directory_business_phone_numbers_normalized_idx
  on public.directory_business_phone_numbers (normalized_phone_number);

-- App-facing view: clean columns + aggregated phone numbers. The app queries this.
-- security_invoker => the view respects the querying role's RLS on the base tables.
create or replace view public.directory_businesses_app_view
  with (security_invoker = true)
as
select
  b.id,
  b.source_uid,
  b.name,
  b.description,
  b.logo_url,
  b.longitude,
  b.latitude,
  b.recommended_score,
  b.has_coupon,
  b.has_google_marker,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'phone_number', p.phone_number,
        'normalized_phone_number', p.normalized_phone_number
      )
      order by p.position
    ) filter (where p.id is not null),
    '[]'::jsonb
  ) as phone_numbers,
  b.created_at,
  b.updated_at
from public.directory_businesses b
left join public.directory_business_phone_numbers p
  on p.business_id = b.id
group by b.id;
