-- 0005_directory_rls.sql
-- Directory is public-READ. Imports run with the service-role key (bypasses RLS).
-- No public insert/update/delete. Import batches stay private (RLS on, no policy).

alter table public.directory_import_batches        enable row level security;
alter table public.directory_businesses            enable row level security;
alter table public.directory_business_phone_numbers enable row level security;

-- Public read on businesses.
drop policy if exists "Allow public read businesses" on public.directory_businesses;
create policy "Allow public read businesses"
  on public.directory_businesses
  for select
  to anon, authenticated
  using (true);

-- Public read on phone numbers.
drop policy if exists "Allow public read phone numbers" on public.directory_business_phone_numbers;
create policy "Allow public read phone numbers"
  on public.directory_business_phone_numbers
  for select
  to anon, authenticated
  using (true);

-- directory_import_batches: no policy => anon/authenticated denied. Service role only.

-- Ensure read privileges exist for the public roles (RLS still gates rows).
grant select on public.directory_businesses             to anon, authenticated;
grant select on public.directory_business_phone_numbers to anon, authenticated;
grant select on public.directory_businesses_app_view    to anon, authenticated;
