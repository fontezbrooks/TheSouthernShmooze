# Design — App Reconciliation with the New Southern Shmooze Site

**Date:** 2026-08-10 · **Status:** DRAFT — awaiting owner approval → `/sc:implement E1`
**Inputs:** `report.md` (crawl + §8 rendered addendum), `requirements.md` (FR/NFR/US), owner answers Q1–Q8 (2026-08-10).

---

## 1. Decision log (owner, 2026-08-10)

| Q | Decision |
|---|---|
| Q1/Q2 | **Defer all directory schema/pipeline changes until the site is live.** Sheet is temporary scaffolding. Re-check at launch. (Count check done — §2.) |
| Q3 | **Supabase sync ingests the worker feed** (endpoint may change; app must not couple to it). Pros/cons in §3. |
| Q4 | Reviews are Google-sourced. **Correction (verified):** reading = Google Places integration; the site's "Write a Review" form CANNOT create a Google review (no such Google API exists) — it stores first-party. App approach in §6. |
| Q5 | Membership: **link-out** (no in-app pricing/checkout → no Apple IAP exposure). |
| Q6 | **Yes** — right-swipe creates a concierge request routed to one preferred partner; `conciergeRotation` participates in deck ordering. |
| Q7 | **Contractor wizard native** in the app. |
| Q8 | "Recommended" sort keys on `tier` (`marketleader` first). |

## 2. DB vs sheet reconciliation (Q1/Q2 check, run 2026-08-10)

- `directory_businesses`: **200** rows. Sheet: **162**. Name-overlap ≥ **146** (true overlap higher — several diffs are name-variant pairs, e.g. "#1 Handyman - YourHandymanAtlanta.Com" ↔ "YourHandymanAtlanta.Com").
- **Only-in-DB (~54):** overwhelmingly non-home-service members — mortgage, CPA/bookkeeping, photography, tutoring, yoga, pet care, bike shop, events. The sheet **filters MW membership down to the 38 home-service trades**.
- **Only-in-sheet (~10–14 real):** Atlanta Pro Network, Yardsy, GranCo Granite, Vaden's Painting, etc. — newer members and/or manual additions not yet in MW sync.

**Conclusion: the sheet is a curated export of data we already have** (trade-filtered, plus editorial fields layered on: note, tier, deal, serviceArea). Supports Q1's defer decision — no urgent pipeline change; verify again at launch.

## 3. Q3 — worker endpoint vs current MW sync (pros/cons)

| | Consume worker directly (app → worker) | Supabase ingests worker (chosen) | Current MW-only sync |
|---|---|---|---|
| Coupling | App releases coupled to a **temporary URL** (`jonah-eda.workers.dev`) — breaks silently when it moves | Sync URL is a server-side env var — endpoint move = config change, zero app releases | No new dependency |
| Data | Gets tier/trade/rating/note today | Same, once ingested | Missing ALL new fields |
| Freshness | 30-min CDN cache, always current | Sync cadence (existing infra: scheduled + content-hash reconcile) | MW-only |
| Offline/perf | No cache layer, no RLS, no joins with app tables (leads, shmoozer state) | Full SQL/PostGIS/RLS; joins with leads + swipe state | Same |
| Failure mode | Worker down → app degraded live | Worker down → stale-but-served data | — |
| Auth | Open today; if worker adds auth later, app keys ship in binary | Server-side secret | — |
| Field-back risk | — | One transform to maintain (like `directory-transform.ts` today) | — |

Verdict matches owner call: **ingest**. The existing sync architecture (import batches, content-hash reconcile, scheduled functions) is exactly the right chassis — post-launch, add a second source function `sync-registry` beside `sync-directory`, keyed on `slug`, merging onto MW rows (name-match + manual mapping table for variants found in §2).

## 4. Phasing — the load-bearing consequence of Q1

Everything below splits into **NOW** (site pre-launch; no directory schema changes) and **AT-LAUNCH** (site live; schema round unlocked).

### NOW phases (each = one branch + PR, per standing workflow)

**E1 — Design-system rebrand (foundation, no backend)**
- `src/theme/tokens.ts`: new palette (`clay #A8472B/#8A3820`, `pine #26402F/#1B2E21`, `gold #C98F2B/#E7B85A`, `peach #EFA85F/#F9E0BE`, `porchCream #FBF1E1`, `magnolia #FFFDF8`, `ink #2A2420/#5B5148`, `line #E4D6BE`), radii `{sm:10, md:16, lg:28, pill:999}`, soft shadows (`card: 0 8 20 -10 rgba(42,36,32,.18)`, `pin: 0 12 24 -12 …,.35`) replacing the 4px hard-offset.
- `typography.ts`: Fraunces (display 700; ramp anchored to measured desktop 59/44/18.4 → scaled for mobile), Public Sans (body 400/500/700), Caveat (accent). Fonts via `expo-font`/`@expo-google-fonts`.
- Old tokens kept exported under a `legacy` namespace during migration; components move over screen-by-screen in E2–E7 (NFR-1: no big-bang restyle).
- Gate: tsc/lint/tests + visual pass on ThemeProvider consumers.

**E2 — Registry rename + restyle (existing data only)**
- All user-facing "Directory"→"Registry", "Certified Providers" copy → "Shmooze Certified" language; DirectoryScreen/BusinessCard/business-detail restyled to E1 tokens (card anatomy from report §8.3, minus tier/rating features that need new data).
- Explicitly OUT: category/tier filters, badges, ratings, deals — they need AT-LAUNCH data.

**E3 — Concierge "Find My Pro" flow**
- Lead-form → two-step per FR-4.1 (trade+zip+notes → contact+opt-in), confirmation screen with preferred-partner reveal (FR-4.3).
- **Partial-lead capture:** app-owned `leads` table addition (allowed — Q1 defers *directory* schema only, leads are app domain): insert on step-1 completion, upgrade to full lead on submit. Mirrors site's `/api/partial-lead` semantics; reuses `notify-lead` plumbing.
- Preferred-partner selection interim rule (until `conciergeRotation` data lands): existing certified/pinned logic; swap to rotation at-launch.

**E4 — Shmoozer semantic alignment (Q6, phase 1)**
- Right-swipe (already gated via `onSwipeRightIntent`) → confirmation sheet becomes a **concierge request** framing ("Your Shmooze preferred partner will reach out") wired into E3's lead pipeline with the swiped business pinned as the partner.
- Deck ordering hook prepared (`orderDeck(cards)`) with current heuristic; `conciergeRotation` plugs in at-launch.

**E5 — Contractor side, native (Q7 + Q5)**
- New route group + "I run a business" entry (home + registry footer).
- **Check My Fit wizard** native: steps per report §3.2. Submissions POST to the worker's `/api/submit-application` + `/api/places` (CORS `*`, POST allowed — verified §8.1 headers) **through a thin Supabase edge-function proxy** (`submit-application`) so the temporary worker URL stays server-side (same Q3 logic; endpoint move = env change).
- Membership levels: content screen WITHOUT prices → **link-out** to site `/join` in external browser (Q5). No checkout, no pricing tables in-app (App Store review safety).
- Gate: wizard happy path + validation + offline error states tested.

**E6 — Content parity**
- FAQ screen: dual-audience tabs, 10 sections (report §8.4); About/press; community links (Facebook group, podcast, newsletter, meetup). Static content module (typed constants) — updatable via normal release; no CMS this round.

### AT-LAUNCH phases (unlock when site ships on the real domain)

**L1 — Verify & map:** re-run §2 reconciliation; confirm final API host; confirm which fields MW carries vs registry feed carries (old Q1).
**L2 — Schema round (design sketch, final design then):**
- `directory_businesses` additions: `slug` (unique, backfilled from name-mapping), `trade`, `tier`, `featured`, `editorial_note`, `service_area`, `zips text[]`, `years_in_business`, `licensed_insured`, `deal_text`, `photos jsonb`, `rating numeric`, `review_count int`, `rating_source`, `google_maps_uri`, `concierge_rotation bool`. Registry-view regenerated; identity bridge table `registry_slug_map(source_uid, slug)` for the §2 name variants.
- New edge function `sync-registry` (worker feed, env-var URL, import-batch + content-hash pattern reused); ratings refresh piggybacks the feed (site refreshes them for us — no direct Places calls from our side).
**L3 — Registry features:** category filter (38), member filter (All/Market Leaders/Top Rated/Nonprofits — badge groups per §8.3), Recommended sort = `tier='marketleader'` first (Q8), then featured, then rating (confirm exact tiebreak at L1); badges; ratings + deals on cards/detail.
**L4 — Shmoozer data alignment:** `conciergeRotation` into deck ordering; geo re-check (MW sync keeps lat/long today, so distance survives; if launch data drops geo, decide zip-centroid fallback here).
**L5 — Profile depth:** editorial note, photos, Google rating + Maps link; reviews per §6.

## 5. Architecture snapshot

```
NOW:      MembershipWorks ──sync-directory──▶ Supabase ──▶ App
          Worker endpoints (submit-application, places) ──edge proxy──▶ Contractor wizard
AT-LAUNCH: + Registry feed (worker/site API) ──sync-registry──▶ same Supabase tables (slug-keyed merge)
```

App never talks to `*.workers.dev` directly — every worker dependency sits behind a Supabase edge function with the URL as an env var (Q3 principle applied uniformly).

## 6. Reviews design (Q4, corrected)

- **Read:** display `rating`/`review_count` from synced data (L2). Review texts: the feed doesn't carry them; if wanted at L5, the sync caches the same Places Details payload the worker uses (5 most-relevant reviews) — server-side key, never in the app binary.
- **Write:** an in-app "Review on Google" button deep-links to Google's write-review URL (derivable from `googleMapsUri`/place id) — the ONLY way a real Google review can be created. The site's first-party review form is site-owned; the app does not replicate it this round (revisit if owner wants first-party reviews as a product feature — needs storage + moderation decisions).

## 7. Risks

- **R1 Worker URL churn** (named "temporary" by design) — mitigated everywhere via edge-function proxies + env vars.
- **R2 Sheet/DB name variants** break slug↔uid mapping at L2 — mitigation: mapping table + manual review of the ~30 variant/unmatched rows from §2.
- **R3 Rebrand regression surface** — every screen touched; mitigated by E1 legacy-token namespace + per-epic visual gates + owner TestFlight passes.
- **R4 Wizard endpoint contract undocumented** — before E5 implementation, capture one real `/api/submit-application` request from the site (devtools pass) to pin the payload shape.
- **R5 App Store**: even link-out membership content must avoid "purchase digital service" framing; wizard collects business info only — review E5 copy against guideline 3.1.1 before submission.

## 8. Epic order & gates

E1 → E2 → E3 → E4 (E5, E6 parallel after E1) — each: branch + PR, tsc/lint/tests green, owner visual check. AT-LAUNCH epics gated on site going live at the real domain.

**Next:** owner approves → `/sc:implement E1`.
