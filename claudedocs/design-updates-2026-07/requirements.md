# Design Update Round — July 2026 — Requirements Specification

**Source:** Written instructions from the designer (no Figma file this round).
**Guiding principle:** The existing implemented design is the visual reference. Everything built must match the spirit of the current design system (`src/theme/tokens.ts`, `typography.ts`, 4px hard-offset shadows, Shrikhand/Bitter, Banner/Button/AppHeader primitives).
**Icon rule:** If a requirement calls for an icon we don't have, do NOT create one — document it in the Missing Icons register below and decide case by case.

**Status:** Requirements locked (11 decisions confirmed by owner 2026-07-09). No open questions — copy drafts in §9a await approval; they do not block design/implementation start.

---

## 1. Global

| ID | Requirement | Decision |
|----|-------------|----------|
| G1 | Rename "Shmoozer" → **"Find Your Perfect Local Match"** in ALL user-facing copy (screens, buttons, headers, modals, empty states). | **Copy only.** Code identifiers (`src/features/swipe`, routes, storage keys) and Supabase edge functions (`notify-swipe-lead`) stay unchanged. |

## 2. Home (`src/features/home/HomeScreen.tsx`, `app/(tabs)/index.tsx`)

| ID | Requirement | Notes / Decision |
|----|-------------|------------------|
| H1 | Add a **Match block** and a **Newsletter block** to the Home layout. | Newsletter moves from tab bar (H2) to a Home block. |
| H2 | **Replace the Newsletter tab with a "Match" tab** in the tab bar (`app/(tabs)/_layout.tsx`). | **Match tab opens the swipe deck** (current `app/swipe.tsx` entry, with the new type-only overlay, S1). Newsletter tab (external Substack link) removed. |
| H3 | Top card image → `assets/NewImage.png`. | Asset exists ✓ |
| H4 | Top card: larger "Reach out" button. | |
| H5 | Top card: brand it **Concierge**. | Resolved: the name IS "Concierge" for now — no separate persona name. |
| H6 | Certified providers: add a button on the right side of the section header. | |
| H7 | Certified providers: replace "See More →" with **auto-loading batches of ~5**. | **NOT a layout change.** Horizontal scroll and placement stay exactly as-is; a batch of ~5 providers auto-appends as the user nears the end, instead of the See More button. |
| H8 | "Ask the community": much tighter header line height. | |
| H9 | "Ask the community": larger button. | |
| H10 | Search bar: tapping it opens the **Directory** with the search field **already focused — keyboard up, typing immediately**. | Confirmed. Fixes today's double-tap: user currently must tap the Directory search bar again before typing. |
| H11 | That opened page has a **back arrow**. | AppHeader `showBack` affordance exists. |

## 3. Concierge (`src/features/concierge/`, `app/(tabs)/concierge.tsx`)

| ID | Requirement | Notes |
|----|-------------|-------|
| C1 | Add Concierge name + branding at the top of the screen. | Resolved: brand as **"Concierge"** (no separate persona name for now). |

## 4. Directory (`src/features/directory/`, `app/(tabs)/directory.tsx`)

| ID | Requirement | Decision |
|----|-------------|----------|
| D1 | Find Your Perfect Local Match entry point: **pinned icon-only button in the header**, next to the search bar (always visible, doesn't scroll with list). | Replaces current button. Needs a suitable existing icon — see Missing Icons register. |
| D2 | Hide the header; show **only the search bar at top**, with a back arrow when the user arrived from another page (e.g. Home search, H10/H11). | |
| D3 | TECH: fix vertical alignment of text inside the search bar (currently sits low vs sibling elements). | `src/features/directory/SearchBar.tsx` |
| D4 | Secondary: add **tags** at top. | Tags = existing **provider types/categories** (`providerTypes.ts`) rendered as tappable filter chips. No new data source. |

## 5. Find Your Perfect Local Match — Swiping (`src/features/swipe/`, `app/swipe.tsx`)

| ID | Requirement | Decision |
|----|-------------|----------|
| S1 | Entry: ask **only provider type** (search bar + tags), shown as an **overlay**, not a full page. | Tags = provider types (D4). |
| S2 | Filters overlay: remove all filters except search bar + tags. | |
| S3 | Filters overlay header: conversational copy, not "Filters". | Draft copy in §9a — we draft, owner approves. |
| S4 | Surface the active search term on the cards / match page. | |
| S5 | Header: hide the logo — functional buttons only. | |
| S6 | Back button = **chevron only**, no "Back" text. | Current: text "‹ Back" in `SwipeScreen.tsx`. |
| S7 | Remove "Matches" text from the header; replace with an icon OR move the affordance to the bottom of the page. | Icon TBD — Missing Icons register. |
| S8 | Add a **profile quick-view overlay** (peek at a provider's profile from the deck). | |
| S9 | **Remove the Matches List** (`app/matches.tsx` + its entry points). | **Delete the screen; keep stored match data** (persistence code stays, harmless). |

### 5a. Page states (all must exist and be visually distinct)

| State ID | State |
|----------|-------|
| ST1 | First match |
| ST2 | Match confirmation |
| ST3 | Pass confirmation |
| ST4 | Non-first match |
| ST5 | No matches (empty state) |
| ST6 | "That's it for matches — here's the regular directory" (end-of-deck handoff into directory results) |

## 6. Match Contact Page (`src/features/swipe/LeadCaptureModal.tsx` today)

| ID | Requirement | Notes |
|----|-------------|-------|
| CP1 | Becomes a **separate page with back arrow** — no longer an overlay/modal. | New route needed. |
| CP2 | New header + detail copy. | Draft copy in §9a — we draft, owner approves. |
| CP3 | Show the tags (provider types) from the original filter selection. | |

## 7. Profile (`src/features/business-detail/`, `app/business/[uid].tsx`)

| ID | Requirement | Decision |
|----|-------------|----------|
| P1 | **Square image next to the name** at top (compact avatar layout). | Chosen over full-width square. |
| P2 | Remove the background image. | |
| P3 | Update Certified badge + other badges. | `CertifiedBadge.tsx`, `CardBadge.tsx` |
| P4 | **Sticky call button** at the bottom of the page. | Multi-phone handling TBD in design doc. |
| P5 | Address: updated type style, moved to the **top** of the profile. | |
| P6 | External links → organized section of **buttons + icons**: website, BBB, FB, Google, Insta, Yelp, Google Business, GA Secretary of State. | **Render what exists; hide the rest.** Data today: website, BBB, FB, Google Business, Insta, Yelp (+ free-form links). "Google (search)" and "GA Secretary of State" have NO data source — they cannot appear until upstream data exists. Documented, not built. |
| P7 | Images/gallery: new UI treatment, moved **up** in the section order. | |
| P8 | Description moved to the **bottom**. | |
| P9 | Add section dividers. | |

---

## 8. Missing Icons Register (do NOT create — decide case by case)

Current inventory (`src/components/ui/icons/` + `Icon.tsx`): home, phone-call, heart-hand, users, socialSpread, sale, star, thumbs-up, fileQuestion, briefcase, phone, triangle-warning, plus whatever `Icon.tsx` maps (chevron/search variants — verify exact set during gap analysis).

Likely gaps (to confirm during design phase):

| Needed for | Icon |
|-----------|------|
| H2 — Match tab | Match/heart-spark tab icon |
| D1 — Directory pinned button | Find Your Perfect Local Match glyph |
| S7 — Matches header replacement | Matches icon |
| P6 — Link buttons | Brand icons: BBB, Facebook, Google, Instagram, Yelp, Google Business, GA Secretary of State, globe/website |

## 9. Resolved Questions (owner, 2026-07-09)

1. **Q1 — Concierge branding (H5, C1):** The name IS **"Concierge"** for now. No separate persona name.
2. **Q2 — Copy (S3, CP2):** We draft, owner approves. **Keep it concise.** Drafts in §9a.
3. **Q3 — Home search (H10):** Confirmed — Home search bar opens the Directory in search-active state: **keyboard up, typing immediately**. This also fixes the current double-tap (user must tap the search bar a second time to type).

## 9a. Draft Copy — Awaiting Approval

Voice reference (current app copy): *"It's a match! We've sent your details."*, *"Tell them what you're looking for…"*, *"Send match"*.

**S3 — Filters overlay header** (replaces "Filters" / "Update matches"):

| Option | Header | Submit button |
|--------|--------|---------------|
| A (recommended) | What are you looking for? | Find my match |
| B | Who can we find for you? | Show me matches |

**CP2 — Contact page header + detail** (replaces the bare form):

| Option | Header | Detail line |
|--------|--------|-------------|
| A (recommended) | It's a match! | Share your details and they'll reach out to you. |
| B | You found your match! | Send your info so they can get in touch. |

## 10. Out of Scope (this round)

- Renaming code identifiers, routes, storage keys, Supabase functions (G1 decision).
- Adding GA Secretary of State / Google-search data fields to Supabase or the sync pipeline (P6 decision).
- Creating any new icon artwork (icon rule).
- Home layout restructure around the provider rail (H7 decision — mechanics change only).

## 11. Next Steps

1. Resolve Q1–Q3.
2. Gap analysis + design doc (per `docs/figma-refactor/README.md` workflow): map each requirement to exact components/files, token diff if any.
3. Staged implementation epics (re-skin vs structural), pause for approval before implementing.

## 12. Mid-Round Amendments (owner, 2026-07-09 — after E1–E3 on-device test)

| ID | Amends | Requirement |
|----|--------|-------------|
| A1 | H3/H4/H5/H8 (Top Card) | Top Card is too large. New layout per owner's Figma (RC4 `rctwIFsBZ4f0MpuDqWp3AP` node `85-3127`): **"Concierge" as centered Header S title → photo (124px, radius 8) → helper text ("We'll email recommendations of trusted local businesses based on your specific needs.") → full-width Button S "Reach Out"**. "Let us help you plan" DELETED. The Figma shows the standard 32px Button S — **supersedes H4's larger CTA** on this card (community banner's larger CTA, H9, stands). |
| A2 | H1 (Match block) | Match Home block becomes an **image-left** banner (same shape as Ask-the-community) using `assets/Match-cover-logo.svg` as the left image. Title/copy/CTA unchanged. Technical: the SVG imports as a component via the metro transformer and must live under `src/` (broad `assets/*` gitignore breaks EAS uploads — same reason the nav icons moved); `Banner` needs an SVG-component slot alongside the raster `image` prop. |
