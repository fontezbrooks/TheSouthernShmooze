# Spike: Seed Supabase with the Business Directory

> Requirements spec (via `/sc:brainstorm`) for a **backend-only** spike — no frontend work.
> Builds on the full design at
> [`../../output/Design: Convert Directory JSON into Supabase Postgres Schem.md`](../../output/Design:%20Convert%20Directory%20JSON%20into%20Supabase%20Postgres%20Schem.md).
> This is requirements only — implement with `/sc:design` → `/sc:workflow` → `/sc:implement`.

**Generated:** 2026-06-24

## 1. Goal
Stand up directory infrastructure in Supabase and seed it from
`output/directory_response.json` (MembershipWorks export), exposing clean,
app-friendly columns now and preserving raw source data for the future. No UI yet.

## 2. Source data — validated findings (this file)
- **182** business records; the source claims **837 total** (`_re: 837`) → this is a paginated/partial export.
- All 182 have unique `uid` + `nam` (no records skipped).
- The 9 mapped fields cover **100%** of fields present — nothing lands only in `raw_source_payload`.
- `loc` confirmed `[longitude, latitude]` (Atlanta: lng ≈ -84, lat ≈ 33.7).
- `cpn`/`xgm` always `1` (boolean flags); `phn` ≤ 1 per record (array modeling kept for safety).
- `ir5` is a **1–5 score** (not a flag); kept as integer. Exact business meaning TBD (OQ-1).

## 3. Locked decisions
| # | Decision |
|---|---|
| Scope | Seed **only the 182** records in this file. |
| Idempotency | Importer must be **re-runnable** (upsert by `source_uid`) so the remaining pages can be added later without duplicates. |
| Target | **Same Supabase project** as the lead form. |
| Credentials | Use **`SUPABASE_SERVICE_ROLE_KEY`** (already in gitignored `.env`; correctly not `EXPO_PUBLIC_`). Service-role used **locally/server-side only**, never shipped to the client. |
| Secrets | **Strip `_st._mk`** (Google Maps API key) — and any other secrets — from the stored `raw_top_level_payload`. |
| Read access | Directory is **publicly readable** (anon `SELECT` on businesses + phones); **no** public insert/update/delete. |

## 4. Functional requirements
- **FR-1 Schema** (per design): enable PostGIS; create `directory_import_batches`, `directory_businesses` (with generated `geography` point), `directory_business_phone_numbers`; indexes (FTS on name/description, GiST on location, btree on flags/score, GIN on raw payload); `directory_businesses_app_view`.
- **FR-2 Field mapping** (short → clean): `uid→source_uid`, `nam→name`, `cnm→description`, `lgo.s→logo_url`, `loc[0]→longitude`, `loc[1]→latitude`, `ir5→recommended_score`, `cpn→has_coupon`, `xgm→has_google_marker`; full record → `raw_source_payload`.
- **FR-3 Transforms**: decode HTML entities in `name`/`description` (e.g. `he`); flags `1→true`, missing→`false`; `recommended_score` null when absent; validate lng/lat ranges (else null both, keep raw); phones → child rows with `phone_number` (original) + `normalized_phone_number` (digits-only) + `position`.
- **FR-4 Import batch**: record one `directory_import_batches` row (`source_type=typ`, `source_record_count`, `raw_top_level_payload` = top-level minus `usr` **and minus `_st._mk`/secrets**).
- **FR-5 Importer**: Bun-run TS script (`bun run scripts/import-directory-json.ts <file>`; no `tsx` needed) using the service-role key; upsert businesses by `source_uid`; replace phone rows per business; skip records missing `uid`/`nam` with a logged warning.
- **FR-6 RLS**: enable RLS on all three tables; public `SELECT` policies on `directory_businesses` + `directory_business_phone_numbers`; no public writes; imports via service role only.

## 5. Non-functional requirements
- **Security**: service-role key only in `.env`/local; never in client bundle or committed; strip embedded secrets from stored payload; directory tables public-read only.
- **Idempotency/safety**: re-running the import must not duplicate rows; raw payload never mutated; source JSON file never renamed.
- **Migrations**: delivered as ordered SQL files under `supabase/migrations/` (consistent with existing `0001/0002`).
- **Quality**: small focused files; transforms unit-tested (entity decode, flag/loc/phone mapping); validation queries runnable post-seed.

## 6. Acceptance criteria
- `select count(*) from directory_businesses` = **182**.
- Businesses with location ≈ 104; every business with `phn` has child phone rows.
- `directory_businesses_app_view` returns clean `name/description/logo_url/phone_numbers` (no `nam/cnm/lgo`).
- `raw_top_level_payload` does **not** contain the Maps API key.
- Anon can `SELECT` the view; anon cannot insert/update/delete.
- Re-running the importer leaves counts unchanged (idempotent).

## 7. Open questions (non-blocking)
- **OQ-1**: `recommended_score` (`ir5`, 1–5) — does higher = more recommended (sort desc)? Affects future ranking, not the seed.
- **OQ-2**: remaining ~655 records (to reach 837) — provide more pages / MembershipWorks API later? (Importer will be ready for them.)
- **OQ-3**: keep `output/directory_response.json` in the repo, or treat as transient seed input? (Spec says don't rename it.)

## 8. Next step
`/sc:design` to finalize migration/file layout + importer module boundaries, or
`/sc:workflow` for the phased plan, then `/sc:implement`.
