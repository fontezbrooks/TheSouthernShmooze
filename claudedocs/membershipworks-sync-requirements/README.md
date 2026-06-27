# Requirements: MembershipWorks → App Directory Auto-Sync

**Date:** 2026-06-27
**Source:** `/sc:brainstorm` requirements discovery (grounded in live endpoint verification)
**Status:** Requirements specification only — no architecture/code (next: `/sc:design`)
**Predecessor:** `claudedocs/research-membershipworks-sync/README.md`

---

## 1. Goal

The app's **Certified Providers** list must stay automatically in sync with the Southern Shmooze MembershipWorks (MW) directory — the same source the website renders — so that adding, editing, or removing a member in MW is reflected in the app **without any change to the owner's workflow** (hard requirement). The owner continues to do exactly what they do today in MW; everything else is automated and invisible to them.

## 2. Confirmed facts (verified 2026-06-27)

- **Endpoint:** `GET https://api.membershipworks.com/v2/directory?_rf=Members&_st=`
- **Auth:** none. Only requires header `x-org: 33993` and a `shmoozeatl.com` `origin`/`referer`. No API key, cookie, or token.
- **Completeness:** a **single request returns the entire directory** (184 members). No pagination. (`_re: 837` is total *accounts* in the org; only the 184 publicly-listed members appear in the feed.)
- **Shape:** identical to the existing seed file — per-member fields `uid, nam, cnm, ir5, cpn, lgo.s, loc[lng,lat], phn[], xgm`. The existing `scripts/directory-import/transform.ts` maps these unchanged.
- **Field coverage (184 members):** geocode `loc` present on **105** (~57%), logo on 168, phone on 181, recommended `ir5` on 37. **~43% of providers have no map coordinates** — the app must tolerate null lat/long.
- The response embeds MW's own Google Maps key (`_mk`); the importer already strips it. Not our key; not stored.

## 3. Locked decisions (from this session)

| Decision | Choice | Implication |
|---|---|---|
| **Freshness** | Within minutes (frequent poll) | Scheduled sync runs roughly every ~10 min; no event wiring required. |
| **Removals** | Remove immediately — mirror the website | Each run diffs the feed; providers absent from the feed are deleted from the app. |
| **Hosting** | Supabase-native (`pg_cron` + Edge Function) | Self-contained in the existing Supabase project; `transform.ts` logic ported to Deno. No new infra/accounts. |

## 4. Functional requirements

- **FR1 — Scheduled fetch.** A Supabase-hosted job runs on a fixed schedule (target ~every 10 min) and GETs the MW directory endpoint with the required `x-org` header and `shmoozeatl.com` origin/referer.
- **FR2 — Transform.** Each member record is mapped to the app's clean schema using the existing field semantics (uid→source_uid, nam→name, cnm→description, lgo.s→logo_url, loc→longitude/latitude, ir5→recommended_score, cpn→has_coupon, xgm→has_google_marker, phn[]→phone rows), including HTML-entity decoding of text fields.
- **FR3 — Upsert (add + update).** Records are upserted into `directory_businesses` keyed by `source_uid` (idempotent), and phone numbers replaced transactionally (reuse migration `0006` `directory_replace_phones`). New members appear; edited members update.
- **FR4 — Removal (mirror).** After a successful, validated fetch, any `directory_businesses` row whose `source_uid` is **not** in the current feed is removed (and its child phone rows cleaned up), so the app exactly matches the live MW directory.
- **FR5 — App reads unchanged.** The app continues to query `directory_businesses_app_view`; no app-side change is required for data freshness.
- **FR6 — Decommission manual flow.** The manual "copy JSON from Chrome console → run Bun script" process is no longer the update path (may remain as a one-off/backfill tool).

## 5. Non-functional requirements

- **NFR1 — Zero owner workflow change.** No new owner action, account, login, or Zapier step is required. (The owner's existing MW→Slack zap is explicitly NOT a dependency.)
- **NFR2 — Safety / no destructive empties.** The removal step (FR4) MUST be guarded: if the fetch fails (non-200), times out, returns malformed JSON, or returns a suspiciously empty/short list (e.g. 0 members, or a large drop vs. last known count), the run aborts WITHOUT deleting anything. The directory must never be wiped by a transient MW outage.
- **NFR3 — Null-tolerant.** Members with missing `loc` (no coordinates), logo, or phone must sync fine; the app already handles null map pins/logos.
- **NFR4 — Idempotent & convergent.** Running the sync repeatedly with an unchanged feed produces no changes and no churn; the DB always converges to the feed.
- **NFR5 — Observability.** Each run records an outcome (timestamp, fetched count, added/updated/removed counts, success/failure + reason) so drift or failures are diagnosable. (A small sync-log table or structured function logs.)
- **NFR6 — Secret handling.** The sync uses the Supabase service-role key available to the Edge Function environment; no secrets are committed. The MW endpoint needs no secret.
- **NFR7 — Politeness.** Polling cadence stays modest (same call the website makes); ~10 min is well within reason for 184 records / ~48 KB.

## 6. User stories / acceptance criteria

- **US1:** *As the owner,* when I add a paid member in MembershipWorks as I always do, *then* within a few minutes that provider appears in the app's Certified Providers — and I did nothing extra.
  - AC: a member added to the MW directory is present in `directory_businesses_app_view` within ≤ ~10–15 min, with name, description, logo (if any), phone, recommended/coupon flags, and coordinates (if any) populated.
- **US2:** *As the owner,* when a member lapses and disappears from my website directory, *then* they also disappear from the app within a few minutes.
  - AC: a `source_uid` removed from the feed is gone from the app within one sync cycle; its phone rows are also removed.
- **US3:** *As the owner,* when I edit a member's logo/description/phone in MW, *then* the app reflects the edit on the next sync.
  - AC: changed fields update in place (same `source_uid`, no duplicate row).
- **US4:** *As a developer,* if MembershipWorks is briefly down or returns garbage, *then* the app's existing directory is left intact.
  - AC: a simulated non-200 / empty / malformed response performs **no deletes and no destructive writes**, and logs a failure.
- **US5:** *As a developer,* I can see the result of the last sync (counts + status) to confirm it's healthy.
  - AC: the most recent run's fetched/added/updated/removed counts and status are retrievable.

## 7. Scope

**In scope:** automated periodic full-directory sync (fetch → transform → upsert → mirror-remove) hosted in Supabase; safety guards; basic run logging.

**Out of scope (this feature):** the Zapier "doorbell" near-real-time trigger (deferred — frequent poll satisfies "within minutes"); any change to MW or the owner's process; app UI changes; backfilling the non-directory accounts (the 837 are not directory members); historical/audit retention of removed providers beyond the soft-vs-hard decision (decision = hard remove).

## 8. Open questions for `/sc:design`

1. **Exact cadence:** confirm ~10 min (vs 5 or 15) for the `pg_cron` schedule.
2. **"Suspiciously empty" threshold (NFR2):** define the guard precisely — e.g. abort delete if fetched count is 0, or if it dropped by more than X% / N vs. the last successful run. Need a stored "last good count."
3. **Removal mechanics:** hard `DELETE` with `ON DELETE CASCADE` for phones vs. explicit cleanup; whether to do the whole add/update/remove pass in one transaction.
4. **Transform port:** `transform.ts` uses the `he` library for HTML-entity decoding — choose a Deno-compatible decode in the Edge Function (or inline). Keep one canonical transform to avoid drift between the Bun script and the function.
5. **Run logging shape (NFR5):** a `directory_sync_runs` table vs. relying on Edge Function logs.
6. **pg_cron → Edge Function invocation:** via `pg_net` HTTP POST to the function URL with the function's auth; confirm the function is restricted (not publicly invocable without the expected secret).
7. **Minor:** seed was 182; live is 184 — first real sync will reconcile (adds 2 + any edits). No action needed, just expected.

---

## Next step

Run **`/sc:design`** to turn these requirements into the concrete architecture: the Edge Function (fetch/transform/upsert/diff-remove + safety guard), the `pg_cron` schedule, the run-log table, and the migration(s). Then `/sc:implement`.
