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
-- (review: PR #37). REVOKE only removes grants made by roles the executing
-- role can act for, so these can silently no-op when the grant is
-- extension-owned — the assertion at the end of this file catches that
-- instead of letting the migration record a false success.
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
      'spatial_ref_sys owned by extension owner — RLS not enabled; relying on the grant revokes above.';
end
$$;

-- Assert the migration actually closed the surface (review: PR #37). The
-- table is protected if EITHER the Data API roles lost SELECT (revokes took
-- effect) OR RLS is enabled (no policies = deny-all through PostgREST).
-- Only when BOTH protections failed do we fail the migration, so `db push`
-- cannot record a lockdown that never happened.
do $$
begin
  if (has_table_privilege('anon', 'public.spatial_ref_sys', 'select')
      or has_table_privilege('authenticated', 'public.spatial_ref_sys', 'select'))
     and not (select relrowsecurity
              from pg_class
              where oid = 'public.spatial_ref_sys'::regclass) then
    raise exception
      'spatial_ref_sys is still readable by Data API roles and RLS is off — '
      'both the REVOKE and the RLS enable were blocked by extension ownership. '
      'Run the revoke as the table owner (supabase_admin) via the dashboard, '
      'or contact Supabase support; then re-run this migration.';
  end if;
end
$$;
