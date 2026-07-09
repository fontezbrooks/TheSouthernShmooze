# Design Update Round — July 2026 — Technical Design

**Requirements:** `./requirements.md` (all IDs referenced below). **Status:** APPROVED (owner, 2026-07-09) with one amendment — brand glyph SVGs provided in `./icons.md` (§8).

Design principle: reuse the existing primitives (`Banner`, `Button`, `AppHeader`, `Icon`, `CenteredSheet`, `StrokedHeading`, hard-shadow `Shell`) — every new surface is composed from them. No token changes required this round (verified: all changes express in existing colors/radii/typography; H8's line-height is a per-usage override, not a token edit).

---

## 0. Key discoveries from code analysis

1. **H10 is already implemented** — `HomeScreen.tsx:32` pushes `/directory?focus=1`; `DirectoryScreen.tsx:36-43` focuses via `useFocusEffect` + 50ms timeout. The reported "second tap needed" is a **bug**: the 50ms delay races the tab-navigation transition/keyboard. Fix, don't build.
2. **D3 partially attempted** — `SearchBar.tsx:161` already zeroes `paddingVertical`. Residual misalignment comes from `typography.body`'s `lineHeight` inside the fixed 48px pill (and Android `includeFontPadding`). Fix at the component, not the token.
3. **"Tags" have a concrete source**: the `SUGGESTED` category list in `TaskIntake.tsx:14-23` (Landscaping, Roofing, …) — extract to a shared constant; the same `Chip` UI already exists there.
4. **Feather icons are already the app's fallback icon system** (`Icon.tsx:82-91`). Mapping additional Feather glyphs (chevron-left, heart, globe, facebook, instagram) is NOT "creating icons" — the true missing-artwork set shrinks to brand glyphs only (§8).
5. **`useProviders` already has paging** (`pinned` + `more` + `loadMore` + `hasMore`) — H7 is a rendering change only.
6. **"Confirm every match" (PR #18, Option B)** is current behavior — every right-swipe opens the prefilled contact form. CP1 relocates that form to a page; the flow logic is unchanged.

---

## 1. Epic map (implementation order)

| Epic | Scope | Requirements | Risk |
|------|-------|--------------|------|
| **E1 — Copy & polish re-skin** | Rename + small visual/copy fixes across screens | G1, H3, H4, H5, H8, H9, C1, D3, S3(copy), S5, S6 | Low |
| **E2 — Home structure** | Blocks, tab swap, provider rail, search focus fix | H1, H2, H6, H7, H10(fix), H11 | Med |
| **E3 — Directory** | Header removal, pinned icon CTA, tags, `?q=` param | D1, D2, D4, (+`?q=` for ST6) | Med |
| **E4 — Swipe flow** | Overlay intake, term chip, quick view, matches removal, page states | S1, S2, S4, S7, S8, S9, ST1–ST6 | High |
| **E5 — Contact page** | Modal → routed page | CP1, CP2, CP3 | Med (depends on E4's session plumbing) |
| **E6 — Profile** | Full BusinessDetail restructure | P1–P9 | Med (screen is a self-declared placeholder — free rein) |

E1 ships first (biggest visible win, lowest risk). E2/E3/E6 are independent of each other. E5 follows E4.

---

## 2. E1 — Copy & polish

| Req | File | Change |
|-----|------|--------|
| G1 | `DirectoryScreen.tsx:61` ("Try The Shmoozer!"), `SwipeScreen.tsx:115` ("The Shmoozer"), any other user-visible "Shmoozer" | → "Find Your Perfect Local Match" (button copy may shorten to "Find Your Match" where space-constrained — flag at PR). Code identifiers untouched. |
| H3 | `src/theme/assets.ts` + `HomeScreen.tsx:36` | Register `NewImage.png` in theme assets; swap `bannerHelp`. |
| H4 | `src/components/ui/Banner.tsx` | Add a `ctaSize?: "md" \| "lg"` prop (default `md` = today); Home help banner passes `lg`. |
| H5 | `HomeScreen.tsx:37` | Banner gets a `kicker` prop (small Shrikhand overline) rendering **"Concierge"** above the title. |
| H8 | `Banner.tsx` title style | `lineHeight` override prop for the title (community banner passes a tight value). Token untouched. |
| H9 | `HomeScreen.tsx:50` | Community banner CTA uses the same `ctaSize="lg"`. |
| C1 | `ConciergeScreen.tsx:38` | "Concierge" brand kicker above "Let's Plan Something Awesome" (same kicker treatment as H5 — one visual language). |
| D3 | `SearchBar.tsx` | On the input + `SearchBarButton` text: explicit `lineHeight` matched to font size, `includeFontPadding: false` (Android), `textAlignVertical: "center"`. Verify on both platforms. |
| S3 | `FiltersModal.tsx:29-30` | `heading="What are you looking for?"`, `submitLabel="Find my match"` (draft A, pending approval). |
| S5 | `SwipeScreen.tsx:115` | Remove the title text from the header entirely — chevron left, functional buttons right. |
| S6 | `SwipeScreen.tsx:104-114` | Replace "‹ Back" text with `<Icon name="chevronLeft" size={28}/>` (new Feather mapping `chevronLeft → "chevron-left"` in `Icon.tsx` — one line). 44px hit target kept via existing `hitSlop`. |

## 3. E2 — Home structure

**H1 + H2 — blocks & tab swap**
- `app/(tabs)/_layout.tsx:33-51`: replace the newsletter `TabItem` with `{ key: "match", label: "Match", icon: <match glyph — §8>, kind: "push", href: "/swipe" }`. New `kind: "push"` handled in `AppTabBar.onPress` via `router.push` (import `useRouter`; the existing `kind: "link"` pattern shows the shape).
- `HomeScreen.tsx`: two new `Banner` instances —
  - **Match block** (after CertifiedProviders): title/copy re-uses swipe voice, CTA → `router.push("/swipe")`.
  - **Newsletter block** (bottom): CTA → `openLink(LINKS.newsletter)` (link constant already exists, `src/lib/links.ts`).
  - No banner artwork exists for these two → Missing Icons register (§8); ship text-first `Banner` (layout `imageLeft` with no image is supported? verify — else a compact variant).

**H6 — section header button**
- `CertifiedProviders.tsx:31`: header becomes a row — `StrokedHeading` left + small pill `Button` ("View all" → `/directory`) right. This takes over the See More tile's job, which H7 deletes.

**H7 — auto-loading rail (mechanics only)**
- `CertifiedProviders.tsx:40-72`: horizontal `ScrollView` → horizontal `FlatList` with `data={[...pinned, ...more]}`, `onEndReached={loadMore}`, `onEndReachedThreshold={0.5}`, `ListFooterComponent={loadingMore ? spinner : null}`. Delete the See More tile (`:54-71`) and `t.typography.seeMore` usage. `useProviders` untouched (verify `PAGE_SIZE === 5`; adjust constant if not — one line in `providerRepository`).

**H10 (fix) + H11**
- `DirectoryScreen.tsx:36-43`: replace the bare 50ms timeout with `InteractionManager.runAfterInteractions` + focus retry (or `autoFocus` on a keyed remount). Acceptance: from Home tap, keyboard is up without a second tap, on iOS and Android, including the second visit.
- Back arrow when arriving from Home: covered by D2's header design (E3) — Home passes `?from=home` (or reuse `focus=1`) and the Directory search row shows a chevron that `router.back()`s.

## 4. E3 — Directory

**D2 — header removal**: `DirectoryScreen.tsx:51` remove `<AppHeader/>`; `searchWrap` gets `paddingTop: insets.top + 8` (`useSafeAreaInsets`). Search row: `[chevron (only when ?from param present)] [SearchBar flex:1] [match icon button]`.

**D1 — pinned icon CTA**: replace the full-width `Button` (`:60-65`) with a 48px circular hard-shadow icon button (reuse `Shell`'s shadow recipe or `PhysicalPressable`) sitting right of the SearchBar. `accessibilityLabel="Find Your Perfect Local Match"`. Glyph: interim Feather `heart` — flagged §8.

**D4 — tags row**: new `CategoryChips` component (extracted `Chip` + `SUGGESTED` from `TaskIntake` → shared `src/features/providers/categories.ts`). Horizontal scroll row under the search bar; tap → `s.setQuery(category)` (selected state = query matches). Keep visible in all modes so users pivot searches; selected chip reflects current query.

**`?q=` param** (for ST6): `DirectoryScreen` accepts `q` search param → seeds `s.setQuery(q)` on focus (same `useFocusEffect` pattern as `focus`).

## 5. E4 — Swipe flow

**S1/S2 — type-only intake as overlay**
- `TaskIntake.tsx` is gutted to keyword + category chips only (radius/budget/timing UI deleted; submit sends `radiusKm: 25, budget: null, timing: null` defaults — `SwipeTask` type unchanged, no backend impact).
- `SwipeScreen.tsx:150-151`: instead of rendering `TaskIntake` inline as the page body, a null task opens the **FiltersModal automatically** (`CenteredSheet` overlay) over a dimmed empty deck. One intake surface, two triggers (first entry + filters button) — S1 and S2 collapse into the same component, already how `FiltersModal` reuses `TaskIntake`.
- Cancel/dismiss with no task → `router.back()` (can't swipe without a task).

**S4 — surface the search term**: pill under the header: `Icon search` + `task.keyword` (+ tap → opens filters). Also passed to the contact page (CP3).

**S7 + S9 — matches removal**
- Delete `app/matches.tsx`, `src/features/swipe/MatchesScreen.tsx`, header Matches button (`SwipeScreen.tsx:128-138`).
- Dead code sweep: `SwipeMatch`, `MyLeadRow`, `toMatch` (`swipeTypes.ts:64-93`) and the `get_my_swipe_leads` client call in `swipeRepository` become unused → remove from the client. **Server-side data and RPC untouched** (per requirements: data kept).
- S7 resolves by deletion — with no matches list, no header affordance is needed; match feedback lives in the ST2/ST4 states.

**S8 — profile quick view**: new `ProfileQuickView.tsx` — `CenteredSheet` + condensed detail (square logo, name, certified badge, tagline, address, call button, "View full profile" → `/business/[uid]`). Data via existing `businessDetailRepository.fetchByUid`. Trigger: tap on the card (non-swipe tap; `SwipeCard` gains `onPress`).

**ST1–ST6 state machine** (all rendered inside the deck area; session flags in `SwipeSessionProvider`):

| State | Trigger | Treatment |
|-------|---------|-----------|
| ST1 First match | first right-swipe of session | → contact page (E5), returning shows ST2 with celebratory copy ("Your first match!" tone — copy at PR) |
| ST2 Match confirmation | lead sent OK | Replaces today's banner (`SwipeScreen.tsx:53`): confirmation card state with "Keep swiping" continue affordance |
| ST3 Pass confirmation | left-swipe | Lightweight transient feedback (brief overlay/animation on advance — no blocking UI) |
| ST4 Non-first match | later right-swipes | Same contact page, prefilled → one-tap send (existing Option B flow), then ST2 |
| ST5 No matches | deck loads empty | Distinct empty state (exists at `SwipeDeck.tsx:57-70`; restyle + new copy) |
| ST6 End of deck | last card swiped | New state: "That's it for matches — here's the full directory" + Button → `/directory?q={task.keyword}` |

`useSwipeDeck` already distinguishes `empty` (ST5) — add `exhausted` (had cards, ran out → ST6). Session tracks `hasMatchedBefore` (ST1 vs ST4) — `swipeStorage` persistence already exists for contact; extend.

## 6. E5 — Contact page (CP1–CP3)

- New route **`app/match-contact.tsx`** (thin) → `MatchContactScreen` in `src/features/swipe/`.
- Extract the form body of `LeadCaptureModal.tsx` into `LeadCaptureForm.tsx` (shared); the screen wraps it with `AppHeader showBack` + plain bg. Delete the modal wrapper once the page lands.
- **Navigation/state**: `SwipeSessionProvider` must be reachable from both `/swipe` and `/match-contact` → mount it in `app/_layout.tsx` (verify current mount point; move if it sits in `app/swipe.tsx`). Pending card travels in session context (not params — card object too rich).
- CP2: header "It's a match!" + detail "Share your details and they'll reach out to you." (draft A, replaces "Send your details" at `LeadCaptureModal.tsx:97-101`).
- CP3: chips row at top showing the task (`keyword` always; budget/timing chips when set) — reuse `CategoryChips` chip visual, non-interactive.
- Back (arrow or hardware) = cancel: return to deck without sending, card stays current.

## 7. E6 — Profile (P1–P9)

`BusinessDetailScreen.tsx` restructure (screen is explicitly a placeholder — `:28-32`). New section order, all inside the existing surface-card language, dividers between sections (`StyleSheet.hairlineWidth`, `t.colors.divider`):

```
[AppHeader showBack]                        (P2: no daisy ImageBackground — plain bg)
[header row: 72px square logo | name + badges]   (P1, P3)
[address — captionSemi, top]                (P5)
────────────────────────────────
[links section: icon+label buttons]         (P6)
────────────────────────────────
[gallery — larger cards, horizontal]        (P7)
────────────────────────────────
[phones list]
[description / aboutText]                   (P8)
[sticky call bar — bottom, safe-area]       (P4)
```

- **P4**: sticky footer bar (absolute bottom + `insets.bottom`), primary phone = `phones[0]`; if >1 phone, tap opens a phone picker (simple ActionSheet); hidden when no phone. ScrollView gets bottom padding so content clears it.
- **P3**: `CertifiedBadge` component replaces the inline mustard pill (`:100-117`); other badges (coupon/recommended) reuse `CardBadge`.
- **P6**: `LinkButton` row component — icon + label pill. Icon mapping: website→Feather `globe`, facebook→`facebook`, instagram→`instagram`; BBB / Yelp / Google Business / GA SoS → **designer-provided brand glyphs** (`./icons.md`, integration in §8). Renders only links present in `detail.socials`/`website` (requirement: render what exists — GA SoS still has no data source, so its glyph is wired but dormant until upstream data appears). `SOCIAL_LABELS` (`businessDetailTypes.ts`) maps keys → display names; shorten labels for pills ("Better Business Bureau" → "BBB").

## 8. Icons Register — RESOLVED

**Brand glyphs (P6) — PROVIDED** by the owner in `./icons.md` (BBB, Yelp, Google Business, GA Secretary of State). Integration plan:
- Source is web-DOM JSX → convert each to a standalone `.svg` file (kebab-case attributes) in `src/components/ui/icons/`: `brand-bbb.svg`, `brand-yelp.svg`, `brand-google-business.svg`, `brand-ga-sos.svg` — imported through the existing metro SVG-transformer pipeline (same as `home-05.svg`).
- These are **fixed-palette brand marks**, not `currentColor` glyphs — register in `Icon.tsx` CUSTOM (`brandBbb`, `brandYelp`, `brandGoogleBusiness`, `brandGaSos`) with the `color` prop ignored.
- ⚠️ Verify on device: the `<text>` elements (BBB ★ row, "GA", "SECRETARY OF STATE") reference Arial/Georgia — confirm they render acceptably with native font fallback at pill size (~20px); if illegible that small, the label text beside the glyph carries the name anyway.

Still interim (approved as-is):

| Need | Approved interim |
|------|------------------|
| Match tab glyph (H2) + Directory pinned CTA (D1) | Feather `heart` |
| Match/Newsletter Home block art (H1) | Text-first banners, no image |

Covered by Feather (already in app): chevron-left (S6), globe/facebook/instagram (P6), search, x.

## 9. Cross-cutting

- **New components:** `CategoryChips` (shared), `ProfileQuickView`, `LeadCaptureForm` (extraction), `MatchContactScreen`, `LinkButton` (profile). Deleted: `MatchesScreen`, See More tile, `LeadCaptureModal` wrapper (post-E5).
- **Routing changes:** +`/match-contact`, −`/matches`; `?q=` on directory; new tab `kind:"push"`.
- **No token/typography file changes.** No Supabase/migration changes. No new dependencies.
- **Testing (per epic, jest-expo):** H7 rail paging (`onEndReached` → `loadMore`, footer spinner); H10 focus behavior; D4/CategoryChips tap→query; TaskIntake defaults (radius 25, null budget/timing); ST1–ST6 state transitions (deck hook + screen); CP1 back-cancels-without-send; P6 renders-only-present links; P4 hidden-when-no-phone. Gates: `tsc --noEmit`, `expo lint`, `jest` per epic.
- **A11y:** every icon-only button gets `accessibilityLabel` (D1, S6); sticky call bar `accessibilityRole="button"`; state changes announced via existing banner/live-region patterns.

## 9a. Amendment A1/A2 mapping (requirements §12 — owner-designed, Figma 85:3127)

- **A1 Top Card** (`Banner.tsx` + `HomeScreen.tsx`): `imageTop` layout reorders to **title → image → subtitle → CTA**; new `titleAlign?: "left" | "center"` prop (default left; top card passes center — Figma centers "Concierge"). Home help banner: `title="Concierge"` (displayS = Figma Header S 32), no kicker, drop `ctaSize="lg"` (Figma shows standard Button S — H4 superseded). The E1 `kicker` prop loses its only consumer → remove (YAGNI); C1's Concierge-screen kicker is its own Text, unaffected. H9 (community `ctaSize="lg"`) stands.
- **A2 Match block**: copy `assets/Match-cover-logo.svg` → `src/features/home/match-cover-logo.svg` (EAS gitignore rule, same as nav icons); `Banner` gains `imageNode?: ReactNode` rendered in the image slot (raster `image` XOR `imageNode`); Match block switches to `layout="imageLeft"` with the SVG component sized to the 88×169 slot.

## 10. Approval checklist — APPROVED (owner, 2026-07-09)

- [x] Epic split + order (E1→E2/E3/E6→E4→E5)
- [x] §9a copy drafts (option A) from requirements.md
- [x] Interim Feather `heart` for Match tab + Directory CTA
- [x] ~~Label-only pills~~ → **AMENDED**: brand glyphs provided in `./icons.md`; convert + wire per §8 (E6 scope)
- [x] Matches client code removal scope (screen + route + dead RPC wrapper; server data untouched)
- [x] "Confirm every match" flow retained through the new contact page (ST4 = one-tap prefilled)
