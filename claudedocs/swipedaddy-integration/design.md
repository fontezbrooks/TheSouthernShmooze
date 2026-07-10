# Design: swipeDaddy → TheSouthernShmooze Integration

**Status:** DRAFT — awaiting owner approval (2026-07-10)
**Prereq round:** swipeDaddy v0.1.0 complete, device-verified (`claudedocs/swipe-package/design.md`)
**Goal:** Replace the app's hand-rolled swipe mechanics (`SwipeCard.tsx`) with
`@fontezbrooks/swipedaddy`, keeping every product behavior (ST1–ST6, CP1–CP3)
identical. Delete the `assets/swipe-cards/` reference copy in this round.

---

## §1 Current-state map (what the app's deck actually does)

| Behavior | Where | Notes |
|---|---|---|
| Single visible card, remounted per card | `SwipeDeck.tsx:108-114` (`key={current.id}`) | No stack; shared offset resets via remount |
| Pan tracks finger 1:1, ±10° rotation clamp | `SwipeCard.tsx:43-83` | Threshold `0.28 × width`; spring `{damping:20, stiffness:220, mass:0.7}` |
| **Right swipe is GATED** | `SwipeCard.tsx:50-55` + `SwipeScreen.tsx:68-75` | Card springs BACK to center; parent opens `/match-contact` WITHOUT advancing. Backing out = card stays. "Keep swiping" after a confirmed send advances (`SwipeScreen.tsx:63-66`) |
| Left swipe commits | `SwipeCard.tsx:56-59` | Fling off-screen + advance + pass flash (ST3) |
| MATCH/PASS stamps fade with drag | `SwipeCard.tsx:85-101` | Opacity interpolated from `translateX` vs threshold |
| Tap = profile quick view (S8) | `SwipeCard.tsx:66-69` | `Gesture.Exclusive(pan, tap)` |
| Pan engages on clear horizontal | `SwipeCard.tsx:45` | `activeOffsetX([-12, 12])` |
| Buttons Pass/Match | `SwipeDeck.tsx:116-129` | Call the same handlers directly — today the card does NOT animate on button press |
| Deck data = JS pop model | `useSwipeDeck.ts:74-80` | `cards.slice(1)`; `current = cards[0]`; `empty`/`exhausted` derived |
| Featured interleave, confidence ranking | `useSwipeDeck.ts:61`, `featured.ts` | Data concern — unaffected by this round |

**Dependency check (app, SDK 56):** react 19.2.3 / RN 0.85.3 / RNGH 2.31.1 /
reanimated 4.3.1 / worklets 0.8.3 — all satisfy swipeDaddy's peer ranges
(react ≥19, RN ≥0.79, RNGH ≥2.24, reanimated ≥4, worklets ≥0.4). ✅

## §2 Gap analysis — swipeDaddy v0.1 cannot express three app behaviors

swipeDaddy's gesture engine **commits unconditionally**: any threshold cross
flings the card and increments `activeIndex` (`SwipeableCard.tsx:132-146`).

- **G1 — Gated right swipe (blocker).** No way to spring back + defer the
  advance. This is a locked product decision ("confirm every match", commit
  `d4d7f87`) — the app cannot adopt the package without it.
- **G2 — Tap on the active card** (quick view). No tap gesture in v0.1.
- **G3 — Drag-progress cues** (MATCH/PASS stamps). `renderCard(item, index)`
  gets no access to the card's `translateX`.
- **G4 — Feel parity knobs.** Spring config and pan `activeOffsetX` are
  hard-coded in the package; the app's tuned values differ from the demo's.
- **G5 — Layout model.** Package cards are `position:'absolute'` inside a
  container the consumer must size; the app's card currently sizes its parent
  intrinsically (`SwipeDeck.tsx` `deck:{}`). The app must give the deck slot
  an explicit size.

Everything else maps cleanly: payloaded callbacks, `onActiveIndexChange`,
`onDeckEnd` (→ ST6 `exhausted`), append-safe `data`, remount-by-key for
wholesale replace (→ new search), imperative `swipeLeft/Right`.

## §3 swipeDaddy v0.2.0 — API additions (done in the swipeDaddy repo first)

All additions are backward-compatible (minor bump); the example app keeps
identical behavior with zero changes.

```ts
// types.ts — additions only
type SwipeDeckConfig = {
  // ...existing six knobs...
  /** Spring for card motion (return-to-center + exit). Default: current withSpring default. */
  spring?: WithSpringConfig;
  /** Pan activation offset (px) so taps/vertical moves don't grab the pan. Default: none. */
  activationOffsetX?: number;
};

type SwipeDeckProps<T> = {
  // renderCard gains an optional 3rd arg — drag progress of THAT card:
  // translateX / (width × swipeThresholdRatio); 0 centered, ±1 at threshold, unclamped.
  renderCard: (item: T, index: number, progress: SharedValue<number>) => ReactNode;
  /**
   * GATED MODE (G1): when set, a GESTURE right-swipe does not commit — the card
   * springs back to center and this fires instead. The imperative
   * ref.swipeRight() still commits (fling + advance), which is how the consumer
   * completes a confirmed match. Left swipes always commit. Omitted = v0.1 behavior.
   */
  onSwipeRightIntent?: (item: T, index: number) => void;
  /** Tap on the ACTIVE card (composed as Gesture.Exclusive(pan, tap)). */
  onCardPress?: (item: T, index: number) => void;
};
```

**Internal mechanics (`SwipeableCard.tsx`):**
- `onFinalize` right-cross: if intent mode → `withSpring(0)` both axes +
  `scheduleOnRN(intent)`; no `activeIndex` write. Left path unchanged.
- Tap: `Gesture.Tap().onEnd` guarded by `currentActiveIndex.value === index`;
  composed with pan via `Gesture.Exclusive` only when a handler is present.
- Progress: `useDerivedValue(() => translateX.value / (width * ratio))`.
  `renderCard` moves from `SwipeDeck` into `SwipeableCard` (the card owns the
  shared value) — internal refactor, public API unchanged apart from the new arg.
- `spring`/`activationOffsetX` thread through the existing config merge.

**v0.2 tests (extend the 7-test suite):** intent mode doesn't advance + fires
payload; imperative `swipeRight` still commits in intent mode; `onCardPress`
fires for active card only; progress arg present. Gates: tsc / eslint
`--max-warnings 0` / jest. Tag `v0.2.0`.

## §4 App adapter design

### 4.1 Data flow: replace the pop model with an index model
`useSwipeDeck` keeps ALL fetch/task/interleave logic but stops slicing:

- `cards` — full interleaved deck, passed once to the package as `data`.
- `advance()` → internal `index` state (mirrored FROM the package via
  `onActiveIndexChange`, single source of truth = package `activeIndex`).
- `current = cards[index] ?? null`; `exhausted = settled && hadCards && index >= cards.length`
  (also signaled by `onDeckEnd`); `empty` unchanged.
- Hook's public shape (`SwipeDeckState`) keeps the same fields + gains
  `setIndex` (wired to `onActiveIndexChange`) — existing tests update, not rewrite.

### 4.2 Component mapping
| Today | After |
|---|---|
| `SwipeCard.tsx` (gesture engine) | **DELETED** — package owns gestures |
| `SwipeDeck.tsx` render branch | Thin: keeps loading/error/ST5/ST6 states + buttons; deck branch renders package `<SwipeDeck>` |
| `DeckCardView`, `ConfidenceBadge`, `ProfileQuickView`, `SwipeScreen`, session/contact flow | **UNCHANGED** |

Package usage sketch (inside app `SwipeDeck.tsx`):
```tsx
<SwipeDeck
  key={deckKey}                      // task-derived: new search = wholesale replace = remount
  ref={deckRef}
  data={cards}
  keyExtractor={(c) => c.id}
  renderCard={(card, _i, progress) => (
    <>
      <DeckCardView card={card} />
      <SwipeStamps progress={progress} />   {/* MATCH/PASS overlays, extracted from old SwipeCard */}
    </>
  )}
  onSwipeRightIntent={(card) => onLike(card)}   // gesture right → contact page, NO advance
  onSwipeLeft={() => onPass()}                  // gesture left → pass flash (already advanced)
  onCardPress={(card) => onCardPress(card)}     // quick view (S8)
  onActiveIndexChange={setIndex}
  onDeckEnd={markExhausted}
  config={APP_DECK_CONFIG}
  cardStyle={styles.cardSlot}
/>
```

```ts
const APP_DECK_CONFIG = {
  visibleCards: 1, stackOffsetY: 0, stackScaleStep: 0,   // parity: single-card look
  maxRotationRad: (10 * Math.PI) / 180,                  // ±10°
  swipeThresholdRatio: 0.28,
  exitDistanceRatio: 1.5,
  spring: { damping: 20, stiffness: 220, mass: 0.7 },
  activationOffsetX: 12,
};
```
Port-first principle: parity config now; the visible card **stack** is a
one-line upgrade (`visibleCards: 3` + offsets) for a later owner decision.

### 4.3 Wiring the gated flow
- Gesture/button **Match** → `onSwipeRightIntent` → `session.setPending` +
  `router.push("/match-contact")` (unchanged from `SwipeScreen.tsx:68-75`).
- **"Keep swiping"** after a confirmed send → `deckRef.current?.swipeRight()`
  — commits with a fling (small UX upgrade: the matched card now animates away).
- **Pass button** → `deckRef.current?.swipeLeft()` (upgrade: button press now
  animates the card; today it just unmounts).
- Cancel/back from contact page → nothing called → card already sprang back. ✅

### 4.4 Layout (G5)
The deck slot gets explicit size: `deck` container becomes a sized View
(`flex` between the term pill and the action row), and `cardStyle` overrides
the package default to `{ width: '100%', height: '100%' }`. Visual check
against the current build is a phase gate.

## §5 Install & distribution (private git dep, no tokens in files)

**UPDATED at I2a — the https forms do NOT work with bun.** Verified findings:
- bun rewrites any `github.com` https git URL to the UNAUTHENTICATED tarball
  API (404 for private repos) and ignores both `GITHUB_TOKEN` and the gh git
  credential helper.
- bun also mangles the `bun add "@scope/name@git+ssh://…"` form into a garbage
  URL — pass the **bare git URL only** and let bun read the name from the
  cloned package.json.

**Working setup (in place since I2a):**
- App `package.json`:
  `"@fontezbrooks/swipedaddy": "git+ssh://git@github.com/fontezbrooks/swipeDaddy.git#v0.2.0"`
  — pinned to the tag; bumping = editing the ref. Install/update with
  `bun add "git+ssh://git@github.com/fontezbrooks/swipeDaddy.git#v0.2.0"`.
- **Local:** the machine's existing `~/.ssh/id_ed25519` is registered as a
  **read-only deploy key** on the swipeDaddy repo ("fontez-macbook read-only
  install") — no token in any file, key grants access to that one repo only.
- **EAS builds:** provide the SSH key via an EAS **file secret** + an
  `eas-build-pre-install` hook that installs it (`~/.ssh` + `ssh-agent` +
  github.com in `known_hosts`). Replaces the `.netrc` plan (bun never uses
  netrc for github URLs). Verify with a preview build at I4.
- Never the token-in-URL form in committed files (prior session's leak lesson).

## §6 Phases

| Phase | Repo | Scope | Gate |
|---|---|---|---|
| **I1** | swipeDaddy | v0.2.0: intent mode, tap, progress arg, spring/activation config + tests; tag | tsc / lint 0-warnings / jest; example unchanged |
| **I2a** | app | Spike: install the dep, import `SWIPEDADDY_VERSION`, boot the app | R1/R2/R6 verified before any refactor |
| **I2b** | app | Hook index-model refactor + adapter (`SwipeStamps` extraction, config, wiring) + tests (use the reanimated jest-mock recipe already proven in swipeDaddy) | tsc / expo lint / jest green |
| **I3** | app | Delete `SwipeCard.tsx` + `assets/swipe-cards/`; docs | grep: no imports remain |
| **I4** | both | Owner device parity check (ST1–ST6 walkthrough) + EAS preview build (R3) | owner sign-off |

## §7 Risks

- **R1 — Raw-TS transpile under SDK 56 metro.** Proven zero-config on SDK 57
  (v0.1 R3 smoke test); SDK 56 expected fine but unverified → that's what I2a is for.
- **R2 — worklets 0.8.3 vs 0.10.x.** Package uses only `scheduleOnRN`
  (peer floor ≥0.4 was set for it); confirm the export exists at I2a.
- **R3 — EAS private-git auth.** New plumbing; a failed preview build blocks
  I4, not the local round.
- **R4 — Feel parity.** Same threshold basis (window width), same spring, same
  rotation clamp — but withTiming-wrapped stack transforms in the package add
  an opacity/entry animation the old card didn't have. Device check decides;
  worst case add a `stackAnimation: false` knob to v0.2.
- **R5 — Rapid re-entry on the gated swipe.** Intent can fire while the card is
  mid-spring or twice fast; `session.setPending` overwrites safely and the
  router push is the same screen — add an explicit test (stale-state re-entry
  guard pattern from the prior round applies).
- **R6 — TS version skew.** App's tsc must typecheck the package's TS-6-era
  source via `types: src/index.ts`; syntax used is standard — verify at I2a.

## §8 Acceptance criteria

1. Full behavioral parity: ST1–ST6 + CP1–CP3 walkthrough passes on device —
   gated match (cancel keeps the card), pass flash, MATCH/PASS stamps, quick
   view tap, new-search reset, end-of-deck → directory handoff.
2. `SwipeCard.tsx` and `assets/swipe-cards/` deleted; no reanimated gesture
   code remains in `src/features/swipe/` except the stamp overlays.
3. Gates green in BOTH repos (tsc, lint zero-warnings, jest).
4. EAS preview build installs the private dep and produces a working binary.
5. swipeDaddy example app unchanged in behavior (v0.2 is additive).
