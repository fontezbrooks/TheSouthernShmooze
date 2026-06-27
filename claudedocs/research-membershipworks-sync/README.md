# Research: Auto-syncing MembershipWorks members into the Southern Shmooze app

**Date:** 2026-06-27
**Depth:** deep
**Status:** Research report only — no implementation (per `/sc:research` boundaries)

---

## Executive Summary

**The problem.** Certified Providers on the website auto-update because Squarespace embeds MembershipWorks (MW) and reads MW's live directory feed. Our app does **not** — its provider list was seeded once from a JSON blob the developer copied out of the Chrome network tab. We need the app to update whenever the owner creates a member in MW, **with zero change to the owner's workflow** (they keep doing exactly what they do today in MW).

**The key finding.** The JSON that was manually downloaded **is the MembershipWorks public directory API feed** — the same feed Squarespace renders. It is served by MW's CDN/API, keyed by the organization ID, and (because the directory profile is public for display on the website) is reachable **without the owner doing anything**. That means the app can pull the *exact same source of truth as the website*, on a schedule, server-side — no owner involvement, no workflow change.

**Recommendation (high confidence):** **Scheduled full-directory re-sync.** A server-side job (Supabase `pg_cron` + `pg_net`, or a scheduled Edge Function / external cron) periodically refetches the full MW directory feed and upserts it into `directory_businesses` using the **already-built, already-tested `transform.ts` + idempotent upsert-by-`source_uid`** logic. This is the only option that (a) requires nothing from the owner, (b) reuses validated code, and (c) correctly handles edits **and removals** (lapsed/expired members drop off the website — a create-only event feed would never remove them from the app).

The owner's existing **Zapier → Slack** automation is a useful *optional enhancement* (use it as a "something changed, re-sync now" ping for near-real-time freshness) but should **not** be the primary data path, because the Zapier per-member payload almost certainly cannot carry all the directory-display fields the app needs, and it can't express deletions.

---

## How the data flows today

### Website (works, auto-updates)
```
Owner confirms payment -> Owner creates member in MembershipWorks
   -> MW marks member "listed in directory"
   -> Squarespace page embeds MW widget -> reads MW live directory feed
   -> Website Certified Providers list updates automatically
```

### App (broken — one-time manual seed)
```
Developer opened the site -> Chrome DevTools network tab
   -> copied the MW directory JSON response (output/directory_response.json)
   -> bun run scripts/directory-import/import.ts -> Supabase directory_businesses
   -> app reads directory_businesses_app_view
   [X] never updates again
```

### What the captured feed actually is (verified from `output/directory_response.json`)
```jsonc
{
  "typ": "a",
  "usr": [
    {
      "uid": "67abb394a58a47dd5100f925",        // MW member id -> our source_uid (upsert key)
      "nam": "- Nailed it Roofing & Remodeling", // business name
      "cnm": "Voted Southern Shmooze local fav…",// description/tagline
      "ir5": 1,                                   // recommended score (1-5)
      "cpn": 1,                                   // has coupon
      "lgo": { "s": "https://cdn.membershipworks.com/u/<uid>_lgl.jpg?<ts>" }, // logo on MW CDN
      "loc": [-84.2967457, 33.7088688],           // [lng, lat] - geocoded BY MW
      "phn": ["7702415648"],                      // phone(s)
      "xgm": 1                                     // google marker flag
    }
    // …
  ]
}
```
- This is the **MemberFindMe / MembershipWorks directory feed** (note the `cdn.membershipworks.com` logo host).
- The file contains **182 records**, but the directory is ~837 members -> **the feed is paginated**; a real sync must page through all results, not grab one page.
- Fields like `loc` (geocoding) and `lgo` (CDN-hosted, cache-busted logo URL) are **directory-rendering artifacts MW computes** — they are exactly what the app's `BusinessCard` needs, and exactly what a generic "new member" event payload would *not* include.

---

## What MembershipWorks actually offers (evidence)

| Capability | Verdict | Evidence |
|---|---|---|
| **Public directory API feed** (the JSON we already use) | Exists, public for listed members | MW privacy doc: *"the data is still technically available through our API"*; visibility settings *"will block the data through our API as well"* — anything shown in the public directory is fetchable via the API. ([Data Privacy & Security](https://membershipworks.com/data-privacy-security)) The feed's logo host `cdn.membershipworks.com` confirms it's the MW feed. |
| **REST API keyed by Org ID + API Key** | Exists | Zapier setup requires *"Organization ID and API Key"* from *Organization Settings > Apps > Add App > Type: API Key*. ([MW Zapier doc](https://membershipworks.com/zapier-integration-for-new-event-registrations)) |
| **MW Zapier "New Member / New Account" trigger** | Unconfirmed / likely limited | Only documented MW Zapier trigger is **"New Event Registration."** No "New Member" trigger documented. The owner's Slack zap proves *some* member-creation signal exists, but its mechanism is unknown (MW? Stripe? email?). **Must confirm with owner.** ([MW Zapier doc](https://membershipworks.com/zapier-integration-for-new-event-registrations)) |
| **Native MW webhooks (member.created etc.)** | No evidence | No MW developer webhook docs found. (Other products like Membership.io / Memberstack / MemberPress have them — different platforms.) |
| **Bulk export (CSV/spreadsheet)** | Exists, but **manual** | Dashboard -> Export. ([Member List](https://membershipworks.com/features/member-list)) Manual = violates "no workflow change," not viable for automation. |
| **Squarespace <-> MW integration** | via embed snippet (client-side) | MW supplies an HTML5 snippet; the directory renders client-side from the feed. ([CMS integration](https://membershipworks.com/integrating-membership-features-on-your-wordpress-squarespace-weebly-or-html5-website)) This is *why* the website auto-updates and is the same feed we can consume. |

### Zapier -> Supabase (the "action" side, if we use Zapier)
- **No native, first-class Supabase app on Zapier.** Confirmed by Supabase's own Zapier page ("Supabase has not yet built an integration on Zapier") and Zapier community threads.
- Workable Zapier->Supabase paths if needed:
  1. **Webhooks by Zapier -> Supabase REST (PostgREST) upsert** with the service-role key (`POST /rest/v1/directory_businesses` + `Prefer: resolution=merge-duplicates`). Cleanest.
  2. **Webhooks by Zapier -> a Supabase Edge Function** that does the transform + upsert (reuse `transform.ts` logic in Deno).
  3. Zapier's generic **PostgreSQL** action straight into the DB (riskier; bypasses RLS/validation — not recommended).
- Sources: [Supabase Zapier page](https://supabase.com/partners/integrations/zapier), [Supabase x Zapier community](https://community.zapier.com/how-do-i-3/supabase-integration-and-why-it-is-more-than-just-postgres-52720), [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks).

---

## Options analysis

### Option A — Scheduled full-directory re-sync from the MW feed (RECOMMENDED)
A server-side cron refetches the **entire** MW directory feed (all pages) every N minutes/hours and upserts into Supabase via the existing importer.

- **Owner workflow change:** **none.** They never touch Zapier, never know it exists.
- **Reuses:** `scripts/directory-import/transform.ts` + idempotent upsert-by-`source_uid` (already tested) + migration `0006` transactional phone replace.
- **Handles:** new members (yes), edits to existing members (yes — logo/desc/score/phone), **removals** (yes — member lapses -> drops from feed -> diff removes them from app, matching the website).
- **Latency:** minutes–hours (tunable). Adequate for a provider directory.
- **Hosting options (ranked):**
  1. **Supabase `pg_cron` + `pg_net`** calling a **Supabase Edge Function** that fetches+transforms+upserts (all in Supabase, no extra infra). Needs `transform.ts` ported to Deno/TS in the function.
  2. **External scheduled runner** (GitHub Actions cron, Render/Railway cron, a tiny VPS) running the *existing Bun script* unchanged against a live fetch instead of a local file. Lowest porting effort.
- **Risks / unknowns:**
  - Exact feed **URL + pagination params** must be captured (see "Confirm" below). Medium confidence on the precise path; high that it's reachable.
  - If MW later makes the directory members-only, the feed needs the **API key** (owner already can mint one — still no per-member workflow change).
  - Politeness/rate: same call the website makes; schedule modestly (every 15–60 min).

### Option B — Per-member event sync (Zapier "new member" -> Supabase upsert)
When a member is created in MW, a Zap pushes that one member into Supabase.

- **Owner workflow change:** none (owner still just creates the member).
- **Problems:**
  - **Payload completeness:** the Zapier member payload almost certainly **lacks geocoded `loc` and the `cdn.membershipworks.com` logo URL** (directory-render artifacts) -> app cards render without map pin/logo. **Core technical blocker.**
  - **No deletions:** create/update events can't remove lapsed members -> app drifts out of sync with the website over time.
  - **Trigger uncertainty:** a true MW "new member" Zapier trigger isn't documented.
  - **Cost/coupling:** every member burns Zapier tasks; app correctness depends on Zapier uptime.
- **Verdict:** fragile as a *primary* mechanism.

### Option C — Hybrid: Zapier signal triggers a full re-sync (RECOMMENDED enhancement on top of A)
Keep the owner's existing **MW -> Zapier** automation; add **one step**: Zapier calls a Supabase Edge Function whose only job is "re-run the full directory sync now" (Option A's fetch). Zapier carries **no member data** — it's just a doorbell.

- **Owner workflow change:** none. We piggyback on automation that already runs; we don't alter what the owner does.
- **Best of both:** near-real-time freshness (fires on actual member creation) **and** full-list correctness incl. removals (pulls the whole feed, not the event payload).
- **Dependency:** requires the owner/admin to add a step to the existing Zap (a one-time setup task for us/admin, not a change to the *owner's recurring workflow*). If undesirable, Option A's timer alone suffices.

### Option D — Manual export / re-import (status quo)
Rejected: manual, not automatic, doesn't meet the hard requirement.

---

## Recommendation

1. **Build Option A** (scheduled full re-sync) as the backbone — the only path that needs nothing from the owner, reuses proven code, and stays correct on edits and removals.
2. **Layer Option C** if/when near-real-time matters and an admin will add one step to the existing Zap. Until then, a 15–60 min timer (A) meets the requirement.
3. **Do not** rely on Option B (per-member Zapier payload) as the source of truth — payload gaps (geocode/logo) and inability to delete make it unsuitable alone.

Net architecture:
```
[MW directory feed]  --(scheduled fetch, all pages)-->  [Edge Function / Bun job]
        ^                                                      | transform.ts + upsert-by-uid
        |  (optional doorbell)                                 v
   [owner creates member] --> [existing Zap] --> "re-sync now" --> Supabase directory_businesses
                                                                       |
                                                                       v
                                                            app reads directory_businesses_app_view
```

---

## Must-confirm before designing/implementing (open questions)

1. **Exact MW directory feed URL + pagination.** Re-open the site, DevTools -> Network -> find the directory XHR/fetch (response shape `{ "typ":"a", "usr":[…] }`, host likely `api.membershipworks.com` / `cdn.membershipworks.com`). Capture: full URL, query params, how pages are requested (captured file had 182/837 -> pagination exists), and whether any auth header/cookie is required. *(Confidence feed exists & is public: HIGH. Exact path: MEDIUM — needs this capture.)*
2. **What actually triggers the owner's Slack Zap?** Genuine MW "new member" trigger, or Stripe payment, or email parsing? Determines whether Option C's doorbell is available and reliable. **Ask the owner / inspect the Zap.**
3. **Directory visibility:** fully public, or members-only? If members-only, the sync needs the MW **API key** (owner mints one under Organization Settings > Apps — still no per-member workflow change).
4. **Removal semantics:** desired behavior when a member lapses (hard-delete from app vs. soft-hide). Affects the diff step.
5. **Schedule/latency tolerance:** how fresh must the app be — minutes, or is hourly fine? Picks cron cadence and whether Option C is worth it.

---

## Sources
- MembershipWorks — Data Privacy & Security (API exposes public directory data): https://membershipworks.com/data-privacy-security
- MembershipWorks — Zapier Integration (Org ID + API Key; "New Event Registration" trigger): https://membershipworks.com/zapier-integration-for-new-event-registrations
- MembershipWorks — CMS / Squarespace integration (embed snippet, client-side feed): https://membershipworks.com/integrating-membership-features-on-your-wordpress-squarespace-weebly-or-html5-website
- MembershipWorks — Member List / Export: https://membershipworks.com/features/member-list
- MembershipWorks WordPress plugin (MemberFindMe) feature list: https://wordpress.org/plugins/memberfindme
- Supabase — Works With Zapier (no native app; use webhooks/pg_cron/pg_net): https://supabase.com/partners/integrations/zapier
- Supabase — Zapier "Not Yet Supported": https://zapier.com/apps/supabase-upcoming/integrations
- Supabase — Database Webhooks: https://supabase.com/docs/guides/database/webhooks
- Zapier Community — Supabase via Webhooks/Code by Zapier: https://community.zapier.com/how-do-i-3/supabase-integration-and-why-it-is-more-than-just-postgres-52720
- Local evidence: `output/directory_response.json` (feed shape, 182/837 records), `scripts/directory-import/transform.ts` (field mapping), `scripts/directory-import/import.ts` (idempotent upsert).
