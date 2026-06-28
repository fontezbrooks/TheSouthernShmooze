# Requirements: Directory + Search round (new Figma file) + 2 bug fixes

**Date:** 2026-06-28
**Source:** `/sc:brainstorm` — grounded in Figma file `20TKWh3HoNWqa2l7f2YYbR` ("searchbar Southern Shmooze App") + live code.
**Status:** Requirements + acceptance criteria only — no design/code (next: `/sc:design` or `/sc:workflow`).
**Decision:** ONE combined round (bug fixes + full Directory/Search build).
**Figma is the source of truth** — this file SUPERSEDES `FfIC5LTSKfdAt22ToHqlDA` and all prior files.

---

## 1. Confirmed findings (Figma vs. code)

**Bugs**
- **B1 — Shrikhand display text clips at the top.** `typography.displayS` = `fontSize 32 / lineHeight 33` (`src/theme/typography.ts:23`) → ~1px leading; iOS clips ascenders of the heavy italic display font ("Let us help you plan", "Ask the community"). `displayL` 56/64 and `displayXS` 24/30 are tight too. Banner renders the title with `t.typography.displayS` directly (`Banner.tsx`). **One token fix cascades everywhere.**
- **B2 — Card descriptions reserve 3 lines.** `BusinessCard` tagline = `numberOfLines={3}` + `tagline: { minHeight: 54 }` (`BusinessCard.tsx`) → fixed gap before the "Certified" badge on ≤2-line copy. Designer: cap ALL descriptions to 2 lines + ellipsis.

**New (none built yet)**
- App today: Home + pushed Concierge route only; bottom bar is **hardcoded to a single "Home" tab** (`app/(tabs)/_layout.tsx`).
- Figma adds: a 5-tab **NavBar**, a **Directory** screen, a **Search bar**, a **Business Card Horizontal** (386×106), **6 search states**, and an **"Ask the community"** banner.
- Backend is READY: `directory_search(q, lim)` RPC (typo-tolerant, **certified-first**), `directory_businesses_app_view`, and `directory_business_detail_view` + profiles all exist and are live.

**Figma frame map (file `20TKWh3HoNWqa2l7f2YYbR`)**
- `2.1 Directory Browse - Default` `40:7270` (Form `40:7272`) — search bar + 7 horizontal cards + NavBar.
- `3.1–3.6 Directory Search` states `41:13363 / 41:13546 / 41:13729 / 41:13912 / 41:14095 / 41:14278`.
- Search Bar component `47:15903`. "Ask the community" `40:6199`. Home `40:6174`.

## 2. Locked decisions (this session)
| # | Decision |
|---|---|
| D1 | One combined round (both fixes + Directory/Search/NavBar/cards/detail). |
| D2 | Directory = **one screen, browse-all default** (lists all businesses certified-first); the search bar transitions it through the 6 states in place. |
| D3 | Keep the existing Home "Ask the community" banner (→ Facebook). **Also** render the same banner/CTA on the **no-results** search states (below "No results / try again"). The Community NavBar tab opens the same Facebook destination. |
| D4 | Card tap → **in-app business-detail screen**, but a **bare-minimum PLACEHOLDER** (real design specs come later): reuse the existing detail view + profile data, styled to match current components. |

## 3. Functional requirements

### Epic FIX-1 — Shrikhand display clipping
- **FR-1.1** Display text (`displayL/displayS/displayXS`) must render full ascenders with no top clipping on iOS (and Android).
- **FR-1.2** Fix at the typography-token level so every consumer (Banner, StrokedHeading, headers) benefits; preserve the Figma visual size/rhythm as closely as possible.
- **FR-1.3** Verify on a device/simulator — clipping is not visible in `tsc`/jest (see [[verify-expo-runtime]]).

### Epic FIX-2 — 2-line description cap
- **FR-2.1** Cap business descriptions to **2 lines + tail ellipsis** on the vertical `BusinessCard` AND the new horizontal card.
- **FR-2.2** Remove the reserved 3rd line so the gap between description and the Certified badge tightens on short copy (match Figma spacing).

### Epic NAV — 5-tab bottom NavBar
- **FR-3.1** Replace the hardcoded single-Home tab bar with 5 tabs: **Home, Directory, Concierge, Community, Newsletter** — each with its Figma icon + label, active = rust.
- **FR-3.2** Home → existing; Directory → new screen; Concierge → existing form; **Community → external Facebook** (`LINKS.facebook`); Newsletter → external Substack (`LINKS.newsletter`).
- **FR-3.3** External tabs open the link (no in-app screen) without breaking tab state.

### Epic DIR — Directory screen (browse-all default)
- **FR-4.1** New Directory screen/route lists ALL businesses, **certified-first** (reuse `directory_businesses_app_view` ordering / repository), rendered as a vertical list of horizontal cards.
- **FR-4.2** Header + search bar pinned at top; list scrolls; NavBar at bottom.
- **FR-4.3** Handle loading / empty / error states (Result pattern, no throws).

### Epic CARD-H — horizontal Business Card
- **FR-5.1** New component (386×106): logo-left (briefcase placeholder when none), "Certified" star pill, name (1–2 lines), 2-line tagline, icon chips; **no phone button**.
- **FR-5.2** Whole card is one physical-press tap target → business-detail screen.

### Epic SEARCH — search bar + 6 states
- **FR-6.1** Search bar component (`47:15903`): rounded rust pill, magnifier, "Search by service type…" placeholder, clear (×) when populated.
- **FR-6.2** Wire to `directory_search` RPC (debounced; min 2 chars; typo-tolerant + certified-first already in backend).
- **FR-6.3** Implement the 6 states: default/browse, selected-empty, selected-populated, deselected-populated, no-results-selected, no-results-deselected — matching the Figma frames.
- **FR-6.4** No-results states show "No results / Please try your search again" + the Ask-the-community CTA (FR-7.1).

### Epic COMM — Ask-the-community on no-results
- **FR-7.1** Render the existing "Ask the community" banner/CTA on the no-results search states; tap → Facebook (`LINKS.facebook`). Reuse the existing Home banner component where practical.

### Epic DETAIL — business-detail screen (placeholder)
- **FR-8.1** New in-app screen reached by tapping a directory card; reads `directory_business_detail_view` + profile (About text/html, address, website, socials, deal, gallery, phones).
- **FR-8.2** **Bare-minimum** layout using existing components/tokens, visually consistent with the app ("match what we're used to"). NOT a pixel-perfect design — a placeholder until real specs arrive.
- **FR-8.3** Loading / missing-profile / error states handled gracefully.

## 4. Non-functional requirements
- **NFR-1** Figma fidelity: use design tokens (`tokens.ts`/`typography.ts`), reuse `Banner`/`Chip`/`PhysicalPressable`/`Icon`; nothing in code that isn't in Figma (per [[figma-refactor]] rule).
- **NFR-2** Immutability, Result-based error handling, small focused files (per coding-style rules).
- **NFR-3** ≥80% test coverage on new logic (search query hook, repository, card mapping); device-verify the display-clip fix + card spacing.
- **NFR-4** Search debounced; browse-all paging/scroll perf acceptable for ~184 rows.
- **NFR-5** Assets: any new bundled icon/SVG → manual transparent export + `react-native-svg-transformer` + `!assets/<file>` gitignore negation (per [[build-status]]).

## 5. Acceptance criteria
- **AC-1** "Let us help you plan" / "Ask the community" / section headers show full glyphs, no top clip, on device.
- **AC-2** A 1-line and a 3-line description both cap at 2 lines (3-line gets ellipsis); the badge sits directly below with consistent spacing.
- **AC-3** NavBar shows 5 working tabs; Directory opens the new screen; Community/Newsletter open external links.
- **AC-4** Directory defaults to a certified-first list of all businesses; typing filters via `directory_search` and walks the 6 states; no-results shows the Ask-the-community CTA.
- **AC-5** Tapping a card opens the placeholder detail screen populated from live profile data; back returns to the list.

## 6. Open questions (resolve in /sc:design)
- **OQ-1** NavBar: confirm Newsletter external target (`LINKS.newsletter` Substack?) and whether Community/Newsletter tabs deep-link out vs. show a brief in-app interstitial (Figma has `5. Community` / `6. Newsletter` frames).
- **OQ-2** Browse-all: load all ~184 at once vs. paginate/infinite-scroll (the existing repo pages by 3 for the Home carousel — Directory likely wants a larger page or full load).
- **OQ-3** Detail screen route shape (`app/business/[uid].tsx`?) and exactly which profile sections to show in the placeholder.
- **OQ-4** Search: should browse-all (empty query) and search share one list component, and does clearing the query return to browse-all?

---
**Next step:** `/sc:design` (recommend designing in this order: FIX-1 + FIX-2 quick wins → NAV → DIR + CARD-H → SEARCH + COMM → DETAIL placeholder).
