# Design: Directory + Search round + 2 bug fixes

**Date:** 2026-06-28
**Source:** `/sc:design` from `claudedocs/figma-directory-search-round-requirements/`.
**Status:** Design only — no implementation (next: `/sc:implement`).
**Backend:** No DB work. `directory_search` RPC, `directory_businesses_app_view`, `directory_business_detail_view` + profiles are all live (this round is frontend-only).

---

## 0. Key insight — "6 states" = 1 screen, 3 body modes

The Figma "6 search states" are combinations of two **search-bar visual states** (focused / blurred) × three **body modes**. They are NOT six screens:

| Figma frame | search bar | body mode |
|---|---|---|
| 2.1 Browse / 3.1 Default | idle | **browse** (all, certified-first) |
| 3.2 Selected Unpopulated | focused, empty | **browse** |
| 3.3 Selected Populated | focused, query | **results** |
| 3.4 Deselected Populated | blurred, query | **results** |
| 3.5 Sel. Populated No Results | focused, query | **no-results** (+ Ask-community) |
| 3.6 Desel. Populated No Results | blurred, query | **no-results** |

→ Build **one `DirectoryScreen`** with a controlled `SearchBar` (its own focused/blurred style) and a body that switches **browse | results | no-results**. Derived purely from `(debouncedQuery, results, loading)`; focus only restyles the bar.

---

## 1. Routing & navigation (Epic NAV)

**Today:** `app/_layout.tsx` Stack → `(tabs)` group (single `index`=Home, hardcoded 1-tab bar) + `app/concierge.tsx` pushed.

**Target file tree:**
```
app/
  _layout.tsx                 (unchanged Stack)
  (tabs)/
    _layout.tsx               REWRITE: 3 Tabs.Screen (index, directory, concierge) + 5-item custom bar
    index.tsx                 Home (unchanged)
    directory.tsx             NEW → <DirectoryScreen/>
    concierge.tsx             MOVED from app/concierge.tsx (now a tab)
  business/
    [uid].tsx                 NEW → <BusinessDetailScreen/> (pushed over tabs, like concierge was)
```

**Tab bar model** — render from a static config, not from `state.routes`, so external-link tabs can be non-route buttons:
```ts
const TABS = [
  { key: 'index',     label: 'Home',       icon: HouseSvg,        kind: 'route' },
  { key: 'directory', label: 'Directory',  icon: SquaresSvg,      kind: 'route' },
  { key: 'concierge', label: 'Concierge',  icon: GiftSvg,         kind: 'route' },
  { key: 'community', label: 'Community',  icon: PeopleSvg,       kind: 'link', href: LINKS.facebook },
  { key: 'newsletter',label: 'Newsletter', icon: SocialSpreadSvg, kind: 'link', href: LINKS.newsletter },
];
```
- `route` items: navigate via the existing tabPress→navigate path; active = `state.index` matches.
- `link` items: `openLink(href)` on press, never navigate, never "active".
- Icons: the 5 SVGs already in `assets/icons/` (`house, squaresThreeCircle, gift, peopleAvatars, socialSpread`) imported via `react-native-svg-transformer` (metro already configured). Color via `color`/`fill` prop → rust active, muted inactive. Reuse the current bar's cream bg + rust hairline + safe-area padding.
- **Concierge-as-tab:** it loses the pushed back-arrow. `ConciergeScreen`/`AppHeader` must render without a back affordance at tab root (make the back optional). The lead-form confirmation sub-flow is unchanged. (Detail flagged for implement.)

**Decisions resolved:** OQ-1 → Community=Facebook, Newsletter=Substack, both external link tabs (no in-app frame).

---

## 2. Directory feature module (Epics DIR + CARD-H + SEARCH)

```
src/features/directory/
  DirectoryScreen.tsx        AppHeader + SearchBar + body switch (FlatList | NoResults)
  SearchBar.tsx              controlled input (value, onChange, onFocus, onBlur, onClear)
  BusinessCardHorizontal.tsx 104px row card → router.push(`/business/${sourceUid}`)
  useDirectorySearch.ts      state machine hook (browse/results/no-results)
  directoryRepository.ts     browseAll() + search(query) → Result<DirectoryBusiness[]>
  __tests__/…
```

### 2.1 Data layer — `directoryRepository`
Reuse `getSupabase`, `Result/ok/err`, and **`toBusiness`** (the RPC + view share the app-view shape).
```ts
browseAll(): Result<DirectoryBusiness[]>     // from view, ORDER BY is_certified desc, recommended_score desc, name
search(q: string): Result<DirectoryBusiness[]> // supabase.rpc('directory_search', { q, lim: 50 })
```
- `directory_search` already returns `is_certified` + the app-view columns + `rank` (ignored by `toBusiness`) and is ordered certified-first server-side.
- **Browse (OQ-2):** `directory_businesses_app_view` has ~184 small rows; fetch once into a `FlatList` (no pagination needed at this size). Order is NOT guaranteed by the view alone → apply `.order('is_certified',{ascending:false}).order('recommended_score',{ascending:false}).order('name')` on the select (same chain as `providerRepository.fetchMore`).
- One shared `FlatList` renders either `browseList` or `results` (OQ-4 → yes, shared).

### 2.2 State machine — `useDirectorySearch`
```
state: { query, isFocused, browse: DirectoryBusiness[], results: DirectoryBusiness[]|null,
         loading, loadingResults, error }
derived mode:
  debounced(query).length < 2   → 'browse'           (show browse)
  results === null              → keep prior (loadingResults spinner)
  results.length > 0            → 'results'
  results.length === 0          → 'no-results'
```
- `browseAll()` runs once on mount.
- Query is **debounced ~250ms** (`useDebounce` from patterns) then `search()`; guard min 2 chars (RPC returns nothing below that anyway). Drop stale responses (track latest query / `active` flag like `useProviders`).
- Clearing the query (× or empty) → back to `'browse'`.

### 2.3 `SearchBar.tsx`
Rounded rust pill (`borderRadius: radii.pill`, ~48 tall, 2px `rustDark` border), magnifier (`Icon name="search"` — ADD to Feather map → `'search'`), placeholder "Search by service type…" (`colors.muted`), text `body`. Show a clear **×** (`Icon` Feather `'x'`) when `value.length>0`. Controlled props; focus toggles a highlighted border. (Matches node `47:15903`.)

### 2.4 `BusinessCardHorizontal.tsx` (node `40:7337`)
Exact Figma spec:
- Row, height **104**, full width; `PhysicalPressable` → `router.push('/business/'+sourceUid)`.
- **Logo** 104×104, `borderRadius 8`, left; briefcase placeholder (`Icon briefcaseFilled`) when no `logoUrl`.
- **Body** flex-1, column, `gap 4`, padding `12/8`, justify-center:
  - **Certified chip** (only when `isCertified`): SOLID pill `bg #C18D22` (token `colors.yellow`=Yellow500? confirm), white star + "Certified" (`captionSemiXS`, white). NOTE this is a *solid* chip, distinct from the Home card's light `Chip` — add a `solid`/`filled` variant to `Chip` or a small inline chip.
  - **Name** `cardTitle` (Bitter ExtraBold 12) black, `numberOfLines={2}`.
  - **Tagline** `caption` (Bitter Regular 12) `#302B27`, **`numberOfLines={2}` + ellipsis** (Epic FIX-2).
  - **Chips row** (outlined 20×20 circles, border `#602A00`): `thumbsUp` and `tag`. **Mapping (OQ):** `tag` ← `hasCoupon`; `thumbsUp` ← reviews flag — we have no clean "reviews" field, candidate = `recommended_score != null` (the `ir5` "Recommended" flag). Recommend: `tag`←`hasCoupon`, `thumbsUp`←`recommended_score!=null`; confirm at implement.
- **No phone button** (unlike the vertical card).

### 2.5 `DirectoryScreen.tsx`
`ImageBackground` (daisy) + `AppHeader` + `SearchBar` (pinned) + body:
- `browse`/`results` → `FlatList` of `BusinessCardHorizontal` (gap 16, padding 16), loading spinner, error text.
- `no-results` → centered `displayXS` "No results" + `caption` "Please try your search again" + the **Ask-community `Banner`** (Epic COMM).

---

## 3. Ask-the-community on no-results (Epic COMM)
Reuse the Home banner verbatim — same component + asset:
```tsx
<Banner layout="imageLeft" image={bannerCommunity}
        title="Ask the community"
        subtitle="Get recommendations and connect with locals."
        cta={{ label: "Join the Facebook Group" }}
        onPress={() => openLink(LINKS.facebook)} />
```
Render it below the "No results / try again" copy on both no-results states. (Home banner unchanged — D3.)

---

## 4. Business detail (Epic DETAIL — placeholder)
```
src/features/business-detail/
  BusinessDetailScreen.tsx     bare-minimum, existing components/tokens
  businessDetailRepository.ts   fetchByUid(uid) → Result<BusinessDetail>
  businessDetailTypes.ts        DetailViewRow + toDetail() VM
app/business/[uid].tsx          route → <BusinessDetailScreen uid={useLocalSearchParams().uid}/>
```
- Query `directory_business_detail_view` `.eq('source_uid', uid).maybeSingle()` → VM: name, logoUrl, description, aboutText/Html, website, contactName, address, socials, deal, gallery, phones, isCertified, hasCoupon.
- Add `DirectoryBusinessDetailRow` to `src/lib/database.ts` (Views).
- **Placeholder layout** (match the app, not pixel-perfect): `AppHeader` w/ back → logo + name + Certified chip → About text (`body`) → phones (call buttons, reuse the card's rust phone button) → website + socials (`openLink`) → gallery (simple horizontal `Image` row). Handle loading / not-found / error (Result).
- `BusinessCardHorizontal` (and optionally the Home vertical card) navigate here via `router.push`.
- **Explicitly deferred:** real visual design — this is scaffolding until specs arrive (D4).

---

## 5. Bug fixes

### FIX-1 — Shrikhand display clipping (`src/theme/typography.ts`)
Root cause: `lineHeight` ≈ `fontSize` clips the italic display font's ascenders on iOS. Give ascender headroom (~1.3×) — applies to all three display variants; every consumer (Banner, `StrokedHeading`, headers) inherits it:
| variant | now (size/lh) | → lineHeight |
|---|---|---|
| displayL | 56 / 64 | **72** |
| displayS | 32 / 33 | **42** |
| displayXS | 24 / 30 | **31** |
- `StrokedHeading` draws 17 copies from the same `base` style, so they stay aligned after the change.
- Banners get slightly taller — acceptable; verify spacing on device.
- If a residual top-clip remains on device, add `paddingTop: ~2` to the display Text (secondary lever). **Device verification is required** (`tsc`/jest can't see this) — see `mem:verify-expo-runtime`.

### FIX-2 — 2-line description cap (`BusinessCard.tsx` + `BusinessCardHorizontal.tsx`)
- Vertical `BusinessCard`: tagline `numberOfLines={3}` → **`2`**; `tagline: { minHeight: 54 }` → **`36`** (2×18). Cards stay equal-height (uniform shrink); the Certified badge sits directly below — closes the gap (B2).
- Horizontal card: tagline `numberOfLines={2}` from the start.

---

## 6. New shared bits
- `Icon`: add Feather `search → 'search'`, `x → 'x'` (close).
- `Chip`: add a `filled` variant (solid `#C18D22` bg + white content) for the horizontal card's Certified pill — OR a small inline chip in the card. Recommend extending `Chip`.
- Nav SVGs: import the 5 `assets/icons/*.svg` as components (svg-transformer); tint via prop.

## 7. Component / data-flow diagram
```
(tabs)/_layout  ──5-item bar──▶ index(Home) · directory · concierge · [Community→FB] · [Newsletter→Substack]
                                      │
                              DirectoryScreen
                                ├ SearchBar ──query──▶ useDirectorySearch ──▶ directoryRepository
                                │                          │                     ├ browseAll()  → app_view (certified-first)
                                │                          │                     └ search(q)    → rpc directory_search
                                ├ mode=browse|results ─▶ FlatList<BusinessCardHorizontal> ──tap──▶ /business/[uid]
                                └ mode=no-results ─────▶ "No results" + Banner(Ask community → FB)
                                                                                         │
                                                                  BusinessDetailScreen ◀─┘ (detail_view + profile, placeholder)
```

## 8. Test plan (≥80% on new logic)
- `directoryRepository`: browseAll order args (`is_certified` first); `search` calls rpc `directory_search` w/ `{q, lim:50}`; Result error paths.
- `useDirectorySearch`: <2 chars → browse; ≥2 + hits → results; ≥2 + none → no-results; clear → browse; debounce + stale-drop.
- `toDetail` mapper; `BusinessCardHorizontal` maps fields + fires navigate.
- Bug fixes: device-verify FIX-1; assert `numberOfLines` props for FIX-2.

## 9. Build order (for /sc:implement)
1. **FIX-1 + FIX-2** (token + card props) — instant visible wins, low risk.
2. **NAV** (routing restructure + 5-tab bar + nav SVG icons) — unblocks Directory tab.
3. **CARD-H + DIR + SEARCH** (repository → hook → SearchBar → card → screen).
4. **COMM** (no-results banner — trivial reuse).
5. **DETAIL** (placeholder screen + route).

## 10. Open items for implement
- OQ (chip mapping): confirm `thumbsUp`←`recommended_score!=null`, `tag`←`hasCoupon`.
- Confirm `colors.yellow` == `#C18D22` (Yellow500) for the solid Certified chip, else add the token.
- Concierge-as-tab: drop the back-arrow at tab root.
- Detail: exact profile sections to surface in the placeholder (default: About + address + website + phones + socials + gallery).
