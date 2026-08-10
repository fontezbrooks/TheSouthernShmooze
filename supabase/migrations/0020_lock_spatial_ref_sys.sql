-- 0020: lock down public.spatial_ref_sys (Supabase advisor: RLS disabled in
-- exposed schema).
--
-- spatial_ref_sys is the PostGIS catalog of public EPSG coordinate-system
-- metadata — not user data. The real exposure is that Supabase's default
-- grants let Data API roles read AND write it. Revoking the grants removes
-- that surface entirely; RLS itself usually cannot be enabled here because
-- the table is owned by the extension owner (supabase_admin), not postgres.
--
-- App-safe: our only spatial usage is the generated `location` geography
-- column + GiST index (0003/0004); search RPCs are SECURITY DEFINER (run as
-- the function owner), and geography-type operations don't consult
-- spatial_ref_sys at query time.

revoke all on table public.spatial_ref_sys from anon, authenticated;

-- Best-effort RLS enable — quiets the advisor where ownership permits;
-- harmless no-op (with a notice) where it doesn't.
do $$
begin
  alter table public.spatial_ref_sys enable row level security;
exception
  when insufficient_privilege then
    raise notice
      'spatial_ref_sys owned by extension owner — RLS not enabled; grants revoked above, dismiss the advisor finding.';
end
$$;
