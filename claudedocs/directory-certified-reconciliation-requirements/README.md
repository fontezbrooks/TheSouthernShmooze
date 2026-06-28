# Requirements: Certified badge fix · Certified-first ordering · Change-detection reconciliation

**Date:** 2026-06-27
**Source:** `/sc:brainstorm` requirements discovery (grounded in `output/directory_response.json`, `output/profile.json`, live schema + sync code)
**Status:** Requirements + acceptance criteria only — no schema/code design (next: `/sc:design` per epic)
**Scope:** Database/back-end only. Prerequisite to the new Figma front-end round.

---

## 1. Context & confirmed findings

Investigated the source feed, profile sample, current schema (migrations `0003`–`0012`), the shared transform, and the app repository.

**F1 — The certified star is `xgm`, and it is ALREADY in the DB under the wrong name.**
The directory feed ships the website's own card template, which proves the semantics:
```
[xgm? <img src="https://i.imgur.com/K3mthhU.png" w=30 h=30>]   ← certified star
[cpn? Deal icon]   [ir5? Recommended icon]
```
`xgm` is currently mapped to the column **`has_google_marker`** (`supabase/functions/_shared/directory-transform.ts:186`).
- 38 of 182 members have `xgm: 1`; the rest omit the key entirely (correctly nullable/false today).
- The value is present and correct on every row — this is a **rename**, not a re-import.
- Side note (out of scope): `ir5` is the "Recommended" *flag*, not a numeric score, yet it is stored as `recommended_score`. Flagged for a later round.

**F2 — Certified-first ordering touches two code paths, neither of which uses it today:**
- Search: `directory_search` RPC (migration `0010`) → `order by rank desc, recommended_score desc, name`.
- Directory/providers page: `src/features/providers/providerRepository.ts:60` → pinned 3 by name, then `recommended_score desc, name asc`.

**F3 — MembershipWorks exposes NO per-member "last updated" timestamp.**
Member keys are only `cnm, cpn, ir5, lgo, loc, nam, phn, uid, xgm`; `profile.json` adds no reliable timestamp (only a coupon `_ts` and a logo-URL cache-buster `...lgl.jpg?1767559646`). Therefore change-detection cannot depend on a server timestamp.
- The existing `sync-directory` cron already re-fetches the **entire** directory feed each run and upserts via the guarded RPC, so directory-level field changes (incl. the `cnm` tagline) are **already reconciled**.
- The real gap is the rich **profile** (About HTML / search corpus, address, socials, deal, gallery), which only refreshes on a staleness timer (`fetched_at < now() - stale_days`) with no change detection.

## 2. Locked decisions (this session)

| # | Decision |
|---|---|
| D1 | Rename `has_google_marker` → **`is_certified`** across schema, view, sync RPC, app view, TS types, and tests. No data backfill — values already present. |
| D2 | **Hard certified-first everywhere**: all certified rank above all non-certified, in BOTH the directory/browse page and search results, before existing tiebreakers. |
| D3 | **Content-hash each directory record** for change detection: on hash change, upsert that member AND mark its profile stale so the About/search corpus re-fetches. |

## 3. Functional requirements

### Epic A — Certified field reconciliation (D1)
- **FR-A1** Rename the column `has_google_marker` → `is_certified` (boolean, not-null, default false) in `directory_businesses`.
- **FR-A2** Update the transform field name `has_google_marker` → `is_certified` (still sourced from `xgm`, still `1 → true`, absent → false).
- **FR-A3** Update every dependent object: app view (`0004`), profiles view + `directory_search` return (`0010`), sync RPC (`0007`/`0009`), index (`0004`), TS types (`src/lib/database.ts`, `providerTypes.ts`), and all tests.
- **FR-A4** The app-facing field becomes `isCertified` (replacing `hasGoogleMarker`).
- **FR-A5** No `has_google_marker` references remain anywhere in the repo after this epic.

### Epic B — Certified-first ordering (D2)
- **FR-B1** `directory_search` RPC: order by `is_certified desc` first, then existing `rank desc, recommended_score desc, name`.
- **FR-B2** Directory/providers listing (`providerRepository.fetchMore`): order by `is_certified desc`, then `recommended_score desc, name asc`.
- **FR-B3** The pinned three providers remain pinned at the top, ahead of the certified-first ordering of the remainder (assumption — see Open Questions).
- **FR-B4** Ordering must remain stable/deterministic (full tiebreaker chain ending in `name`).

### Epic C — Content-hash change-detection & reconciliation (D3)
- **FR-C1** Compute a stable content hash per member from its normalized persisted projection (clean business row + phone rows), not the raw feed payload, so cosmetic feed reordering does not cause churn.
- **FR-C2** Persist the hash per member; on sync, compare incoming vs stored hash to classify each member as new / changed / unchanged.
- **FR-C3** When a member's hash changes (or the member is new), its profile is marked stale so `sync-profiles` re-fetches the About/search corpus on its next run.
- **FR-C4** Unchanged members must NOT trigger a profile re-fetch (avoid hammering the MW profile endpoint).
- **FR-C5** Reconciliation remains compatible with the existing guarded sync RPC (the large-change-set safety guard from `0009` must still apply).
- **FR-C6** Sync run telemetry (`directory_*_sync_runs`) should record counts of changed vs unchanged members.

## 4. Non-functional requirements
- **NFR-1** Backward-compatible migration: rename + hash column added without data loss; existing 182 rows keep their certified values.
- **NFR-2** Idempotent: re-running a sync with an unchanged feed produces zero changed members and zero profile re-fetches.
- **NFR-3** Transform stays runtime-agnostic (Deno + Bun, zero deps) — the hash function included.
- **NFR-4** ≥80% test coverage on new/changed transform + reconciliation logic; rename verified by a "no `has_google_marker` remains" check.
- **NFR-5** Profile re-fetch volume bounded — change-triggered refresh plus the existing staleness timer, never a full profile re-pull every tick.

## 5. Acceptance criteria
- **AC-1** A member with `xgm: 1` surfaces as `is_certified = true` / `isCertified: true`; a member without `xgm` is `false`. (38 certified / 182 total.)
- **AC-2** `grep -r has_google_marker` over the repo returns nothing.
- **AC-3** In both search and the directory page, every certified business appears above every non-certified business, with stable secondary ordering.
- **AC-4** Editing one member's directory field in the feed and re-running sync flips exactly that member to "changed" and queues exactly that member's profile for re-fetch; all others stay "unchanged" with no profile re-fetch.
- **AC-5** Re-running sync against an identical feed reports 0 changed and triggers 0 profile re-fetches.

## 6. Open questions (resolve in /sc:design)
- **OQ-1 (pinned vs certified):** Confirm FR-B3 — do the pinned three always sit above certified ordering, or should they also obey certified-first? (Assumed: pinned stay first.)
- **OQ-2 (hash scope):** Should the hash include the logo URL? The cache-buster changes on every logo update — legitimate, but means a logo swap alone re-fetches the profile. Acceptable? (Assumed: include logo_url; logo changes are real changes.)
- **OQ-3 (stale signal):** Mechanism to "mark profile stale" — null out `profiles.fetched_at`, add a `dirty`/`needs_refetch` flag, or store the directory hash on the profile row and compare? (Design choice.)
- **OQ-4 (`ir5` mislabel):** Confirm the `recommended_score`-vs-flag correction is deferred to a separate round, not bundled here.

---

**Next step:** `/sc:design` for Epic A (rename migration + dependents), then Epic C (hash + reconciliation), then Epic B (ordering). A is a prerequisite for B.
