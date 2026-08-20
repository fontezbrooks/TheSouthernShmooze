/**
 * The directory transform now lives in a runtime-agnostic shared module so the Bun
 * importer and the Deno `sync-directory` Edge Function use ONE implementation (no drift).
 * This file is a thin re-export to preserve existing import paths.
 *
 * Canonical source: supabase/functions/_shared/directory-transform.ts
 */
export * from "../../supabase/functions/_shared/directory-transform";
