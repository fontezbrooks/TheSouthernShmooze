# Site Reconciliation Report — New southernshmooze.com vs TheSouthernShmooze App

**Date:** 2026-08-09
**Source crawled:** https://bestelectronicsway.com/ (temporary host; will move to the Southern Shmooze domain at release)
**Pages analyzed:** `/`, `/homeowners`, `/faq`, `/about`, `/directory`, `/contractors`, plus discovered `/join` and `/pro/:slug`
**Data compared:** `claudedocs/registry_response.json` (registry export, 162 businesses) vs Supabase directory schema + app types

---

## 1. Site overview

The new site is a **Nuxt** app (server-rendered marketing pages; registry, pro profiles, and FAQ content render client-side). It replaces the old MembershipWorks-embedded site with a fully custom experience. Old GoHighLevel/LeadConnector infrastructure is still reachable as a fallback for unknown routes — the redesign is a parallel build, not a re-skin.

### Information architecture

| Route | Nav label | Purpose |
|---|---|---|
| `/` | (Home) | Dual-audience brand home: "I need a pro" vs "I run a home service business" |
| `/homeowners` | Find a Pro | Homeowner landing + **Find My Pro** concierge modal (lead funnel) |
| `/contractors` | For Businesses | Contractor funnel + **Check My Fit** instant-qualification wizard |
| `/join` | — | Membership level picker + MembershipWorks checkout |
| `/directory` | **Registry** | "The Certified Registry" — search/filter/sort, client-rendered from registry data |
| `/pro/:slug` | — | Business profile: editorial note, badges, live Google reviews, contact |
| `/faq` | FAQ | Dual-tab: For Homeowners / For Contractors |
| `/about` | About | Founder story (Grant Wallace), press, community stats |

### API surface (site backend)

`/api/registry`, `/api/reviews`, `/api/concierge-request`, `/api/partial-lead`, `/api/places`, `/api/search-assist`, `/api/submit-application`.
Note: plain GETs to `/api/*` 301-redirect to the old-site fallback — the endpoints are not open GETs (method/header gated). The app cannot assume it can consume them as-is.

---

## 2. Brand & positioning changes

- **Voice:** "Atlanta's front porch." Neighbors vouching for neighbors; anti-lead-gen positioning ("never sold to five contractors").
- **Naming: "Directory" is now "Registry"** ("The Certified Registry"). App uses "Directory" throughout.
- **Concierge model sharpened:** homeowner is matched with **one** "Shmooze preferred partner," not a list. If that pro can't take the job, the request auto-passes to the next trusted pro. Registry FAQ: *Market Leader means that business takes our concierge requests directly* — matches `conciergeRotation` field (26 businesses).
- **Trust stats used everywhere:** 17,000+ homeowners, 150+ certified businesses, 35 trades, est. 2020. Press: WABE, Atlanta News First.
- **Certification standards** (five, quoted repeatedly): pride in the work, integrity/accountability, reliability/communication, commitment to Atlanta, community participation.
- **Ecosystem:** Facebook group is "the beating heart"; podcast, newsletter, monthly meetups; sister companies Grantlanta Lawn + Peace of Mind Recycling; **Growth Studio** (Atlanta Pro Network) as the marketing-services upsell.

### Membership tiers (new, public pricing)

| Tier | Price | Adds |
|---|---|---|
| Certified (base) | Free | Badge; vetting |
| Local Business | $25/mo | Registry listing, profile page, live Google rating, weekly spotlights |
| Established Business | $50/mo | Front-page placement, online-presence audit + strategy call, headshot |
| Market Leader | $100/mo | **Concierge leads routed directly**, pinned featured slot, quarterly audit, podcast priority |
| Nonprofit | Free forever | 501(c)(3) level |

Annual billing = 2 months free. Checkout runs through **MembershipWorks** (confirms MW remains the membership backend).

---

## 3. Key user flows (new functionality)

### 3.1 Find My Pro (homeowner concierge) — replaces simple lead form
1. **Step 1:** what do you need done — trade select, zip, optional notes. *(Captured to `/api/partial-lead` even if abandoned.)*
2. **Step 2:** name, email, phone + newsletter opt-in.
3. **Confirmation with match reveal:** shows "Your Shmooze preferred partners" — the actual matched business(es) with direct contact, "one of them will be in contact shortly."

App today: lead form exists but no partial-lead capture and no preferred-partner reveal.

### 3.2 Check My Fit (contractor qualification wizard)
Multi-step: contact info → **Google Places business lookup** (`/api/places`; picks listing to verify reviews) → years in business + licensed/insured → service area + website → marketing diagnostics (lead source, biggest challenge, review count, desired help) → **live Google rating check** → instant fit recommendation → opens `/join` welcome page. Free, no card.

App today: nothing contractor-facing.

### 3.3 Registry browse
Search by name; filter by industry (38 categories), membership tier; sort **Recommended** (default) / A–Z / Z–A. Badges: **Shmooze Certified** (all), **Top Rated** and **10+ Years** ("come straight from real data and can't be bought"), **Market Leader** (concierge routing). Each listing links to `/pro/:slug` with live Google reviews.

App today: search by word-match + pinned names; no category/tier filters, no badges of this taxonomy, no ratings.

---

## 4. Data schema divergence

### 4.1 New registry payload (`registry_response.json`)

Top level: `businesses[162]`, `categories[38]`, `source: "sheet"`, `updatedAt`, `count`, `googleRated: 101`, `ratingsUpdatedAt`.

**`source: "sheet"` — the new registry is fed from a spreadsheet, not the MembershipWorks API.** Google ratings are batch-refreshed separately (`ratingsUpdatedAt` ≠ `updatedAt`).

Per business:

| Field | Notes |
|---|---|
| `name`, `slug` | slug is the identity key (drives `/pro/:slug`) — **no uid** |
| `trade` | one of 38 categories (new taxonomy) |
| `note` | long editorial description (marketing copy, not MW's short description) |
| `logo` | still MembershipWorks CDN (`cdn.membershipworks.com`) |
| `tier` | `local` \| `established` \| `marketleader` \| `nonprofit` |
| `featured` | boolean |
| `serviceArea` | city/area name (e.g. "Atlanta", "Cumming") |
| `zips[]` | zip list (empty in sample) |
| `phone`, `website` | unnormalized strings |
| `yearsInBusiness`, `licensedInsured` | strings, mostly empty (from Check My Fit answers, presumably) |
| `deal` | member-deal text (replaces app's `has_coupon` boolean) |
| `photos[]` | gallery (empty in sample) |
| `rating`, `reviewCount`, `ratingSource`, `googleMapsUri` | Google rating cache (101/162 rated) |
| `conciergeRotation` | present on 26 — Market Leader concierge rotation flag |

### 4.2 App schema today (MembershipWorks-driven)

`directory_businesses`: `source_uid` (MW key), `name`, `description`, `logo_url`, `longitude/latitude` + PostGIS `location`, `recommended_score`, `has_coupon`, `is_certified` (MW `xgm` flag), phones child table. App type `DirectoryBusiness`: `sourceUid`, `tagline`, `phoneDisplay`, `hasCoupon`, `isCertified`, `recommended`, geo.

### 4.3 Field-level diff

**New fields the app has no home for:** `trade` (+38-category taxonomy), `tier`, `featured`, `note`, `serviceArea`, `zips`, `yearsInBusiness`, `licensedInsured`, `deal` (text), `photos`, `rating`/`reviewCount`/`ratingSource`/`googleMapsUri`, `conciergeRotation`, `slug`.

**App fields absent from the new data:**
- **`longitude`/`latitude` — GONE.** The Shmoozer's distance feature depends on geo. `serviceArea`/`zips` are the only locality signals.
- `recommended_score` (site's "Recommended" sort presumably derives from tier/featured/rating — unconfirmed).
- `has_coupon` boolean → `deal` free text.
- `is_certified` — vestigial: *everything* in the registry is certified by definition now.
- `source_uid` — identity moves to `slug`.

**Directional decision (owner, 2026-08-09): MembershipWorks stays upstream; the sheet is temporary.** The reconciliation therefore needs a field-mapping plan for when these fields land in MW (custom fields), plus flagged gaps for data MW may never carry (Google rating cache, editorial `note`, `conciergeRotation`) — see open questions.

---

## 5. Design system divergence

| | New site | App today |
|---|---|---|
| Display font | **Fraunces** (serif, opsz 400–900) | Shrikhand |
| Body font | **Public Sans** (400–800) | Bitter |
| Accent font | **Caveat** (handwritten) | — |
| Background | `magnolia #FFFDF8`, `porch-cream #FBF1E1` | `#FFF8EA` |
| Primary accent | `clay #A8472B` / `clay-dark #8A3820` | `rust #994706` / `rustDark #602A00` |
| Secondary | `pine #26402F` / `pine-dark #1B2E21` (deep green — new) | mustard/pumpkin/yellow |
| Gold | `gold-pin #C98F2B` / `gold-light #E7B85A` | mustard `#C18D22` |
| Warm tints | `peach #EFA85F`, `peach-soft #F9E0BE`, `line #E4D6BE` | yellow200 `#FFEABE` |
| Text | `ink #2A2420` / `ink-soft #5B5148` | `#1B1B1C` / `#302B27` |
| Radii | `10 / 16 / 28` + pills (999) | (app tokens differ) |
| Shadows | **Soft blur**: `0 8px 20px -10px rgba(42,36,32,.18)` (card), `0 12px 24px -12px …35` (pin) | **Signature 4px hard offset, no blur** |
| Container | 1180px | — |

Verdict: this is a **rebrand**, not a palette tweak — new type ramp, clay/pine/gold palette replacing rust/mustard/pumpkin, and soft shadows replacing the hard-offset signature. Owner decision: **live site is design truth** (no new Figma expected).

Caveat: token names/values were extracted from server-rendered CSS; component-level specifics (exact type ramp sizes, spacing scale) need a rendered-browser pass or the site's stylesheet — flagged as follow-up.

---

## 6. Gap summary (app work implied)

1. **Registry (was Directory):** rename; 38-category filter; tier filter; sort modes; badge system (Certified / Top Rated / 10+ Years / Market Leader / Featured); Google rating display; deal display; profile screen with editorial `note`, photos, reviews, Google Maps link.
2. **Schema/pipeline:** slug identity, tier/trade/rating/deal/etc. columns; rating-refresh source; geo strategy (see open questions).
3. **Concierge lead flow:** two-step Find My Pro; partial-lead capture; preferred-partner match reveal; single-pro routing tied to `conciergeRotation`.
4. **Shmoozer:** philosophical tension — site says "we match you with ONE pro," the deck browses many. Swipe likely remains the app's native mechanic, but match/lead semantics should align with preferred-partner routing (open question).
5. **Contractor side (new territory):** Check My Fit wizard, membership levels display, join flow. In-app purchase compliance risk (see open questions).
6. **Content parity:** dual-audience FAQ, About/press, community links (Facebook group, podcast, newsletter, meetups), sister-company mentions, Growth Studio mention.
7. **Full rebrand:** tokens, typography, shadows, component restyle per §5.

---

## 7. Open questions

1. **MW field mapping:** which new fields will actually exist in MembershipWorks (custom fields)? Which stay sheet/site-side forever (rating cache, `note`, `conciergeRotation`)? Does the Supabase sync gain a second source?
2. **Geo:** new data has no coordinates. Keep geocoding MW addresses for Shmoozer distance, geocode `serviceArea`/`zips`, or drop distance?
3. **Registry API access:** `/api/registry` rejects plain GETs. How was the export produced (method/auth)? Will the app get endpoint access, or does Supabase remain the app's serving layer (recommended)?
4. **Google reviews in-app:** live reviews via site backend, direct Places API (keys/quota), or the cached `rating`/`reviewCount` only?
5. **Membership purchases in-app:** showing tiers + MembershipWorks checkout inside the app triggers Apple IAP policy questions. Link-out (external purchase link entitlement), webview, or omit pricing from the app?
6. **Shmoozer semantics:** does a right-swipe now create a concierge request routed to one preferred partner? Does `conciergeRotation` drive deck ordering?
7. **Contractor features scope:** native wizard vs link-out to the site for Check My Fit / join?
8. **`recommended_score`:** what is the site's "Recommended" sort actually computed from?

---

## 8. Rendered-browser addendum (2026-08-09, chrome-devtools pass)

Second pass with a real browser (chrome-devtools-mcp; the claude-in-chrome extension was unavailable earlier). Resolves several open questions and adds findings curl could not see.

### 8.1 API origin found — Q3 RESOLVED
The registry does **not** live on the site host. The site fetches
`https://shmooze-worker.jonah-eda.workers.dev/api/registry` — a **Cloudflare Worker**: plain GET, **no auth**, `access-control-allow-origin: *`, `cache-control: public, max-age=1800`. The app (or Supabase sync) can consume it directly. Live response saved as `registry_live.network-response` (matches the export). The site's own `/api/*` 301s were a red herring (those paths fall through to the old GoHighLevel host).

### 8.2 Pro profiles are served by the worker
Registry cards link **cross-origin** to `https://shmooze-worker.jonah-eda.workers.dev/pro/{slug}` — server-rendered by the worker, not the Nuxt site. Profile contents:
- H1 name, trade, chips: `★ Shmooze Certified`, `Top Rated`, **`Concierge Partner`** (the `conciergeRotation` badge's user-facing name).
- "About" = the editorial `note`.
- **"What homeowners say" — live Google reviews server-rendered** (reviewer name, relative date, stars, text). No client fetch: the worker holds the review cache. (Q4: the practical in-app answer is "consume the worker's data," not direct Places calls.)
- **First-party review submission form** — "Write a Review": rating, name, email (not published), text; confirmation "Thank you. Your review is in." **New functionality: Shmooze collects its own reviews.**
- CTAs: `tel:`, Google Maps link, website, and a **prefilled concierge deep-link** `/homeowners?pro={name}&trade={trade}`.

### 8.3 Registry UI verified live
157 cards rendered. Member filter options are badge groups, not raw tiers: **All members / Market Leaders / Top Rated / Nonprofits**. Sort: Recommended / A–Z / Z–A. Card anatomy: trade label → name → stars + review count → note excerpt → chip row → View Profile.

### 8.4 FAQ taxonomy (client-rendered, both audiences)
- **Homeowners:** Finding & Hiring a Pro · Trust & Vetting · Costs & Payments · The Concierge Match · About the Community
- **Contractors:** Joining & Getting Certified · Membership Levels & Pricing · Getting Leads & Referrals · Growth Studio (Marketing) · Reviews, Profiles & Visibility
- Notable: "What happens if my rating is under 4.0?" (a certification rating threshold exists), "What are the earned badges?", "How are concierge leads assigned?"

### 8.5 Measured type ramp (desktop)
H1 Fraunces 700 59.2/64 · H2 Fraunces 700 44/49 · H3 Fraunces 700 18.4/24 · body Public Sans 400 17.3 (`ink-soft`) · accent Caveat 400 24 · buttons Public Sans 700 14.4, pill (999), clay bg `#A8472B`, magnolia text, padding 10×18.

Screenshots: `assets/home-full.jpeg`, `assets/registry.jpeg`.

---

*Crawl artifacts (raw HTML + extracted text) in session scratchpad `crawl/`. Companion doc: `requirements.md`.*
