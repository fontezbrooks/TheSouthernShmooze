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

-- PostGIS also grants SELECT to PUBLIC, which anon/authenticated inherit —
-- revoking only the direct role grants would leave read access intact
-- (review: PR #37). NOTE: REVOKE only removes grants made by roles the
-- executing role can act for; verify with the query below after `db push`
-- and dismiss the advisor finding if the PUBLIC grant is extension-owned:
--   select grantee, privilege_type
--   from information_schema.role_table_grants
--   where table_name = 'spatial_ref_sys';
revoke all on table public.spatial_ref_sys from public;
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
