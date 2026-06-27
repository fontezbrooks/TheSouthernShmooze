# Requirements: New Figma round — Nav bar, Directory + fuzzy search, Business detail, Concierge

**Date:** 2026-06-27
**Source:** `/sc:brainstorm` requirements discovery (grounded in Figma frames + live MW data)
**Figma (source of truth):** file `FfIC5LTSKfdAt22ToHqlDA` ("New Southern Shmooze App")
- Home `40-6174` · Concierge `40-6135` · Directory `40-7270`
**Status:** Requirements + task breakdown only — no architecture/code (next: `/sc:design` or `/sc:workflow` per epic)

---

## 1. Context & confirmed findings

The designer added components starting at the "V2 - Directory + Search" section: a **new bottom nav bar**, a **Directory screen with search**, an implied **business-detail screen**, plus a **Concierge** tweak.

**Nav bar (5 tabs)** — maps cleanly to `assets/icons`:
| Tab | Icon (`assets/icons`) | Destination |
|---|---|---|
| Home | `house.svg` | internal (existing) |
| Directory | `squaresThreeCircle.svg` | **new internal screen** |
| Concierge | `gift.svg` | internal (existing form; currently a pushed route `app/concierge.tsx`) |
| Community | `peopleAvatars.svg` | external → Facebook group (`LINKS.facebook`) |
| Newsletter | `socialSpread.svg` | external → Substack (`LINKS.newsletter`) |

**Search corpus — SOLVED.** The service keywords aren't in the directory feed, but MW exposes a per-business profile:
`GET https://api.membershipworks.com/v2/account/{uid}/profile` + `x-org: 33993` + shmoozeatl origin/referer (no auth). Sample saved at `output/profile.json`. It contains:
- `_st.dir[0]` "About" → an HTML block (~1.3 KB for Grantlanta) with the **exact bold keywords** ("residential and commercial landscaping, lawn care, garden design, lawn mowing, mulch installation, …") → **this is the fuzzy-search corpus**.
- Rich detail-screen data: full address `adr`, `web` (website), socials `pfu` (bbb/fbk/igm/ylp/goo), `pfk` (labelled links), deal `cpn` (`cpd` text + `cpa` image), photo gallery `pfz` (5 images), contact `ctc`.
- ⚠️ Embeds MW's Google Maps key `_mk` — must be stripped (same pattern as the directory feed).
- No structured categories/tags — keywords live in the About prose, so search indexes free text.

**Locked decisions (this session):**
- Result tap → **new in-app business-detail screen** (not the website).
- Search → **typo-tolerant fuzzy, server-side** (Postgres pg_trgm + full-text).
- Concierge → **add disabled-until-valid Submit** (the current app Submit is always enabled; Figma shows it disabled). Plus re-skin to new components.
- This is **a lot → break into tasks** (epics below).

---

## 2. Epics & task breakdown

Dependency order at a glance: **B (profile ingest)** unblocks **C (search over About text)** and **E (detail screen)**. **A, D-list, F, G** are independent and can land early.

### EPIC A — Bottom navigation bar (frontend)
Replace the current 2-tab layout (`app/(tabs)/`: Home + the pushed `concierge.tsx`) with the 5-tab bar.
- A1. Add the 5 SVG icons as components (svg-transformer pipeline already set up).
- A2. Build the 5-tab bar matching Figma (active = rust; inactive states; labels).
- A3. Move **Concierge** into the tab bar (from pushed route → tab); keep deep entry from Home banner working.
- A4. **Community** & **Newsletter** tabs fire external links (`LINKS.facebook` / `LINKS.newsletter`) — *open question: in-app browser vs system browser, and do they "stay" on the current tab?*
- A5. Wire **Directory** tab → new Directory screen (Epic D).

### EPIC B — Business profile ingestion (backend)
Fetch + store the rich profile per business so search and the detail screen have data.
- B1. Schema: new table `directory_business_profiles` (1:1 with `directory_businesses` by `source_uid`) — columns for about_text (HTML stripped to text) + about_html, address, website, socials (jsonb), deal (jsonb), gallery (jsonb/text[]), contact_name, raw_profile (jsonb, `_mk` stripped), `updated_at`. RLS public-read like the directory.
- B2. Transform: parse `/v2/account/{uid}/profile` → clean row; strip HTML to a plain `about_text` for indexing; strip `_mk`.
- B3. Ingestion job: fetch profiles for all ~184 businesses and upsert. *Open: fold into the existing `sync-directory` Edge Function (loop, watch the 15s/invocation budget for 184 fetches) vs. a separate scheduled function / batched approach.* Must reuse the safety posture (don't wipe on partial failure).
- B4. Keep in sync as the directory changes (new member → fetch its profile).

### EPIC C — Fuzzy search (backend)
- C1. Enable `pg_trgm`; add GIN trigram + tsvector indexes over `name`, tagline (`description`), and `about_text`.
- C2. Search RPC `directory_search(q text)` → ranked results (name match weighted above tagline above about-text), typo-tolerant (`similarity`/`word_similarity`) + full-text (`websearch_to_tsquery`), multi-word, min-length guard, sensible limit.
- C3. Return the app-view shape (so the Directory list renders rows directly).

### EPIC D — Directory screen (frontend)
- D1. New `app/(tabs)/directory.tsx`: header + search bar (Figma `40-7270`) + full provider list (logo, "Certified" chip, name, tagline).
- D2. Default state = all providers (paged/infinite scroll); typing → debounced call to `directory_search`.
- D3. Loading / empty / no-results states; tapping a row → business-detail screen (Epic E).

### EPIC E — Business-detail screen (frontend)
- E1. New route (e.g. `app/business/[id].tsx`) rendering the profile from Epic B: About text, photo gallery (`pfz`), website + socials links, deal/coupon, phone, address (+ optional map via `loc`), contact.
- E2. Tap targets (call phone, open website/socials, view deal).
- ⚠️ **Needs the Figma detail-screen frame** (not yet provided) — see open questions.

### EPIC F — Home search entry (frontend)
- F1. Add the Home search bar + header search icon (Figma `40-6174`); both route into the Directory search (assumption — confirm).

### EPIC G — Concierge disabled-until-valid Submit (frontend)
- G1. Disable Submit until the form is valid (RHF `formState.isValid` + zod is already wired); disabled styling per Figma `40-6135`.
- G2. Re-skin Concierge to the new components if they changed.

---

## 3. User stories / acceptance criteria (highlights)

- **Search:** *As a user,* typing `residential landscaping` surfaces **Grantlanta Lawn** even though that phrase is only in its About text; `lawn` and a typo like `landscping` also surface it; results rank name matches first. (AC: server-side fuzzy over name+tagline+about_text; ≤ ~300 ms; ranked; tolerant of 1–2 char typos.)
- **Directory:** *As a user,* the Directory tab shows all certified providers and filters as I type; tapping one opens its detail screen.
- **Detail:** *As a user,* a business detail shows the About blurb, photos, website/socials, any deal, and tap-to-call — all in-app.
- **Nav:** *As a user,* the 5-tab bar lets me reach Home, Directory, Concierge in-app and Community/Newsletter externally; the active tab is highlighted.
- **Concierge:** *As a user,* Submit stays disabled until every required field is valid.
- **Data integrity:** profile ingestion strips `_mk`, never persists secrets, and a failed/partial MW fetch doesn't corrupt existing profiles (mirror the directory-sync safety posture).

## 4. Non-functional / constraints
- Reuse the existing patterns: `directory_businesses_app_view` read path, the sync safety guard, svg-transformer assets, RHF+zod, Result-returning repositories.
- Service-role-only writes; public read; no secrets in the bundle.
- ~57% of businesses lack `loc` (map optional/nullable). About text length varies; some businesses may have no profile/About (search + detail must degrade gracefully).
- Keep `tsc` + `jest` green; add unit tests for the profile transform + search ranking.

## 5. Open questions (for `/sc:design`)
1. **Business-detail Figma frame** — please share the node for the detail screen (fields, layout, gallery treatment). Epic E is blocked on it.
2. **Community/Newsletter tabs** — open in the in-app browser or the system browser? Should the tab "stay" highlighted or just fire the link?
3. **Profile ingestion placement** — extend `sync-directory` (loop 184 profile fetches; mind the per-invocation timeout) vs. a separate scheduled/batched job. Cadence (same 10 min, or slower since profiles change rarely)?
4. **Search fields & ranking weights** — confirm corpus = name + tagline + about_text (+ city?); weight order; min query length; debounce (e.g. 250 ms); result cap.
5. **Directory default list** — show all 184 (infinite scroll) or a curated subset until searched?
6. **Deal/coupon** — surface the MW deal (`cpn`) in the detail screen and/or list?
7. **Home search bar** — does it navigate to Directory, or search in place on Home?

## 6. Suggested sequencing
1. **G (Concierge disabled submit)** — tiny, independent, immediate win.
2. **A (nav bar)** + **D-list** (Directory list on existing data) — visible structure fast.
3. **B (profile ingest)** → then **C (fuzzy search)** wired into D, and **E (detail screen)** once the Figma frame arrives.
4. **F (home search entry)** last (depends on D).

---

## Next step
Per `/sc:brainstorm` this stops at requirements. Recommended: run **`/sc:design`** per backend epic (B then C — schema, ingestion placement, search RPC + indexes), and **`/sc:workflow`** to schedule the frontend epics (A, D, E, F, G). Or start now with **G** (smallest) and **A** (nav) since they're unblocked.
