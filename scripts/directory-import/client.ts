import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for the directory import (local/server-side ONLY).
 *
 * This module lives under `scripts/` and is never imported by `app/` or `src/`, so the
 * service-role key cannot reach the client bundle. Run scripts with the env file, e.g.:
 *   bun --env-file=.env run scripts/directory-import/import.ts <file>
 */
export function getServiceClient(): SupabaseClient {
  const url = (process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase service credentials. Set SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) ' +
        'and SUPABASE_SERVICE_ROLE_KEY in .env, and run with `bun --env-file=.env run <script>`.',
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
