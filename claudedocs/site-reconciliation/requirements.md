# Requirements — App Reconciliation with the New Southern Shmooze Site

**Date:** 2026-08-09 · **Status:** DRAFT — awaiting owner review
**Basis:** `report.md` (crawl + schema diff). Owner decisions locked 2026-08-09:
MembershipWorks stays upstream (sheet is temporary) · live site is design truth ·
full scope (registry, home/content, Shmoozer, contractor-side) · this round stops at requirements (next: `/sc:design`).

---

## Goals

1. App reflects the new brand (naming, voice, design system) so site and app read as one product.
2. Registry parity: users can browse/filter/search certified businesses with the same taxonomy, tiers, badges, and profile depth as the web registry.
3. Lead funnel parity: concierge "Find My Pro" semantics (one preferred partner) carried into the app, including through the Shmoozer.
4. Contractor audience gets a first-class path in the app (extent per open question Q7).
5. Data pipeline evolves without breaking the app while upstream (MW fields, sheet, ratings job) settles.

Non-goal this round: implementing anything; designing schemas/architecture (that is `/sc:design`).

---

## Functional requirements

### FR-1 Rebrand & naming
- **FR-1.1** Replace all user-facing "Directory" with **"Registry"** ("The Certified Registry"); routes/analytics keys may keep internal names.
- **FR-1.2** Adopt the site design system: Fraunces/Public Sans/Caveat, clay/pine/gold/porch-cream palette, radii 10/16/28, soft card shadows (full token table in report §5). Replaces Shrikhand/Bitter and the 4px hard-offset shadow.
- **FR-1.3** Adopt the site voice in UI copy ("front porch", "neighbors vouching", certification standards wording).
- **FR-1.4** Trust stats surfaced (17,000+ homeowners, 150+ certified, est. 2020) where the design calls for them.

### FR-2 Registry browse & search
- **FR-2.1** Filter by **industry** (38-category taxonomy from registry `categories`).
- **FR-2.2** Filter by **membership tier** (local / established / marketleader / nonprofit).
- **FR-2.3** Sort: Recommended (default; definition pending Q8), Name A–Z, Z–A.
- **FR-2.4** Search by business name (existing word-match search retained/adapted).
- **FR-2.5** Badges per site rules: Shmooze Certified (all), **Top Rated** (data-derived from Google rating), **10+ Years** (data-derived from yearsInBusiness), **Market Leader** (tier), Featured treatment for `featured`.
- **FR-2.6** Card shows Google rating + review count when present (101/162 have it).
- **FR-2.7** Empty-filter state mirrors site: clear-filters + "request a concierge match" escape hatch.

### FR-3 Business profile (app's business-detail screen)
- **FR-3.1** Editorial `note` as the primary description.
- **FR-3.2** Google rating, review count, link to `googleMapsUri`; live reviews if feasible (Q4).
- **FR-3.3** Show `deal` (member deal), `serviceArea`, `website`, phone, `photos[]` gallery when present.
- **FR-3.4** Badge row consistent with FR-2.5 (worker's user-facing chip names: "★ Shmooze Certified", "Top Rated", "Concierge Partner").
- **FR-3.5** **First-party review submission** (site parity): rating + name + email + text form on the profile, matching the worker's "Write a Review" flow.
- **FR-3.6** Concierge deep-link from profile prefilled with pro + trade (site: `/homeowners?pro=X&trade=Y`).

### FR-4 Concierge lead flow ("Find My Pro")
- **FR-4.1** Two-step capture: (a) trade + zip + optional notes; (b) name + email + phone + newsletter opt-in.
- **FR-4.2** **Partial-lead capture**: step-(a) data persisted even if the flow is abandoned (site parity via `/api/partial-lead` semantics).
- **FR-4.3** Confirmation reveals the matched **Shmooze preferred partner(s)** with direct contact options; copy promises contact "shortly."
- **FR-4.4** Routing model: request goes to ONE pro (Market Leader / `conciergeRotation`); auto-pass to next pro if declined (backend behavior — app must display consistently).

### FR-5 Shmoozer alignment
- **FR-5.1** Deck data reflects the new schema (trade taxonomy, tiers, ratings, deals).
- **FR-5.2** Right-swipe/lead semantics reconciled with the one-preferred-partner concierge model (Q6 decides exact behavior).
- **FR-5.3** Distance/geo behavior resolved per Q2 (new data carries no coordinates).

### FR-6 Contractor-side (new)
- **FR-6.1** "I run a business" entry point in the app.
- **FR-6.2** Check My Fit qualification — native or link-out per Q7. If native: multi-step per report §3.2 including Google Business lookup and instant response.
- **FR-6.3** Membership levels presented per Q5's compliance decision (pricing display vs link-out; checkout stays MembershipWorks).

### FR-7 Content parity
- **FR-7.1** FAQ: dual-audience (Homeowners / Contractors) with the site's answer content.
- **FR-7.2** About/press content (founder story, WABE + Atlanta News First).
- **FR-7.3** Community links: Facebook group, podcast, newsletter, monthly meetup.

### FR-8 Data pipeline
- **FR-8.1** App serving layer (Supabase) gains the new fields: slug, trade, tier, featured, note, serviceArea, zips, yearsInBusiness, licensedInsured, deal, photos, rating/reviewCount/ratingSource/googleMapsUri, conciergeRotation.
- **FR-8.2** MembershipWorks remains upstream; mapping plan for MW custom fields + interim ingestion of the sheet-derived registry export until MW carries them (Q1).
- **FR-8.3** Ratings refresh handled as a separate cadence from membership sync (site refreshes ratings independently).
- **FR-8.4** Identity migration plan: `source_uid` ↔ `slug` correspondence maintained so existing rows/leads don't orphan.

---

## Non-functional requirements

- **NFR-1** No functional regressions in existing flows (swipe deck ST1–ST6/CP1–CP3, lead notify functions) during reconciliation — phased delivery, branch + PR per phase.
- **NFR-2** Existing quality gates hold per phase: `tsc --noEmit` clean, lint zero errors on changed files, jest suites green; new features arrive with requirement-driven tests.
- **NFR-3** Pipeline changes must be backward-compatible at the app boundary (old app versions in the field keep working until forced update).
- **NFR-4** Accessibility maintained through the rebrand (contrast on clay/pine over cream; touch targets unchanged).
- **NFR-5** No secrets in the repo; any Google Places/ratings keys live in EAS/Supabase secrets.
- **NFR-6** App Store compliance for membership content (Q5) resolved before contractor-side ships.

---

## User stories (acceptance sketches)

- **US-1 (homeowner):** As an Atlanta homeowner, I filter the Registry to "Plumbing" + "Market Leader" and see only matching certified pros with ratings and badges. *Accept: filters combine; empty state offers concierge.*
- **US-2 (homeowner):** I complete Find My Pro in two steps and immediately see my preferred partner with a call button. *Accept: partial lead recorded if I quit after step 1.*
- **US-3 (homeowner):** On a business profile I read the editorial story, see the deal, and open its Google reviews. *Accept: profile renders gracefully when rating/photos/deal are absent.*
- **US-4 (swiper):** Swiping the Shmoozer, I see the same badges/ratings as the Registry, and matching behaves per the concierge model. *Accept: per Q6 decision.*
- **US-5 (contractor):** As a business owner, I find "I run a business" in the app and can start qualification. *Accept: per Q7 decision; instant response mirrors the site.*
- **US-6 (owner/ops):** Registry data updates flow to the app without an app release. *Accept: sync job ingests upstream changes; ratings refresh independently.*

---

## Open questions (blocking `/sc:design`)

| # | Question | Blocks |
|---|---|---|
| Q1 | Which new fields land in MembershipWorks custom fields vs stay sheet/site-side? Second sync source? | FR-8 |
| Q2 | Geo strategy — no coordinates in new data; Shmoozer distance depends on lat/long | FR-5.3 |
| Q3 | ~~Registry endpoint access~~ **RESOLVED (report §8.1):** open GET on `shmooze-worker.jonah-eda.workers.dev/api/registry`, CORS `*`, 30-min cache. Remaining sub-question: app consumes worker directly vs Supabase sync ingests it | FR-8.2 |
| Q4 | Reviews: worker server-renders a Google review cache + accepts first-party reviews (report §8.2). Remaining: does the worker expose a JSON reviews endpoint the app can use, and where do first-party reviews get stored/moderated? | FR-3.2, FR-3.5 |
| Q5 | Membership pricing/checkout in-app vs link-out (Apple IAP policy) | FR-6.3, NFR-6 |
| Q6 | Shmoozer right-swipe → concierge request? `conciergeRotation` in deck ordering? | FR-5.2 |
| Q7 | Contractor wizard native vs link-out | FR-6 |
| Q8 | Definition of the site's "Recommended" sort | FR-2.3 |

---

**Next step:** owner answers Q1–Q8 (or picks defaults) → `/sc:design` for architecture (schema migration, sync design, component/token mapping, phase plan).
