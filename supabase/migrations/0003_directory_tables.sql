-- 0003_directory_tables.sql
-- Business directory schema (MembershipWorks import) + PostGIS.
-- See docs/directory-seed-spike/README.md and the source design doc.

create extension if not exists postgis;
create extension if not exists "pgcrypto";

-- 1) Import batch metadata (one row per JSON import).
create table if not exists public.directory_import_batches (
  id                    uuid primary key default gen_random_uuid(),
  source_name           text not null default 'membershipworks_directory',
  source_type           text,
  source_record_count   integer,
  imported_at           timestamptz not null default now(),
  raw_top_level_payload jsonb not null
);

-- 2) Businesses (app-queryable, clean column names + raw payload for future fields).
create table if not exists public.directory_businesses (
  id                 uuid primary key default gen_random_uuid(),
  import_batch_id    uuid references public.directory_import_batches(id) on delete set null,
  source_uid         text not null unique,
  name               text not null,
  description        text,
  logo_url           text,
  longitude          double precision,
  latitude           double precision,
  location geography(point, 4326) generated always as (
    case
      when longitude is not null and latitude is not null
      then st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
      else null
    end
  ) stored,
  recommended_score  integer,
  has_coupon         boolean not null default false,
  has_google_marker  boolean not null default false,
  raw_source_payload jsonb not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- 3) Phone numbers normalized into a child table (source `phn` is an array).
create table if not exists public.directory_business_phone_numbers (
  id                      uuid primary key default gen_random_uuid(),
  business_id             uuid not null references public.directory_businesses(id) on delete cascade,
  phone_number            text not null,
  normalized_phone_number text,
  position                integer not null default 0,
  created_at              timestamptz not null default now(),
  unique (business_id, phone_number)
);

-- Keep updated_at fresh on UPDATE (upserts re-touch the row).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists directory_businesses_set_updated_at on public.directory_businesses;
create trigger directory_businesses_set_updated_at
  before update on public.directory_businesses
  for each row execute function public.set_updated_at();
