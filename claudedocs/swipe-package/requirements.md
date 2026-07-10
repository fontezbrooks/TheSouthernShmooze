# Swipe-Deck Package — Requirements (Experiment)

**Date:** 2026-07-09 · **Status:** DRAFT — awaiting owner approval
**Source code:** `assets/swipe-cards/` in this repo, copied from
[enzomanuelmangano/demos](https://github.com/enzomanuelmangano/demos.git) (swipe-cards demo).

## 1. Goal

Extract the demo's card-swipe mechanic into a **standalone, reusable package**
that a planned system of swipe-centric apps can install and drive with their
own card content. This is an experiment repo, independent of TheSouthernShmooze's
shipped swipe feature.

## 2. Locked decisions (owner-confirmed 2026-07-09)

- **D1 Distribution:** new standalone GitHub repo containing the package plus
  an Expo example app; consuming apps install via git URL
  (`bun add github:fontezbrooks/<repo>`). npm publishing is deferred until the
  API stabilizes.
- **D2 API scope:** **headless**. The package exports the deck mechanics only;
  card visuals are the consumer's job. `expo-image`, `pressto`, and
  `@expo/vector-icons` are banned from the package — they may appear only in
  the example app.
- **D3 Adoption:** TheSouthernShmooze does **not** switch to this engine now
  (TestFlight testing in progress). Swapping its deck is a possible later round.

## 3. Functional requirements

- **F1 Generic data.** `SwipeDeck<T>` accepts `data: T[]` and
  `renderCard(item: T, index: number)` — no baked-in images or card chrome.
  (Demo currently hard-codes `IMAGES` in both the hook and the card.)
- **F2 Gesture mechanics preserved.** Pan-to-swipe with the demo's feel:
  rotation interpolation, spring exit past the width/3 threshold, spring-back
  otherwise, stacked-deck presentation (per-card offset/scale/opacity behind
  the active card).
- **F3 Imperative controls.** A controls hook/ref exposing `swipeLeft()`,
  `swipeRight()`, `reset()`, and the current `activeIndex`, so consumers can
  wire their own buttons (as the demo's screen does).
- **F4 Swipe callbacks.** `onSwipeLeft(item, index)` / `onSwipeRight(item, index)`
  (demo has per-card `onSwipeLeft/Right` with no payload — the package must
  pass the item) plus a deck-level "exhausted" signal when the last card leaves.
- **F5 Tunable presentation.** Stack constants that are currently magic numbers
  (visible-window `< 5`, `23`px offset, `0.07` scale step, rotation range,
  exit distance `width * 1.5`) become optional, defaulted props.
- **F6 Reset semantics.** `reset()` restores the full deck with the demo's
  staggered animation; pending timeouts are cleaned up on unmount (bug in the
  copied `reset`: the second guard re-checks `translateX` instead of
  `translateY` — fix during port).

## 4. Non-functional requirements

- **N1 Minimal peer deps.** Only `react-native-reanimated`,
  `react-native-gesture-handler`, `react-native-worklets`, `react`,
  `react-native`. Current (non-deprecated) versions; the copied code is already
  reanimated-v4-era (`scheduleOnRN`), which is the baseline to keep.
- **N2 Modernization process (owner's stated workflow).** Port the code
  working **as-is first**, then treat **every lint error and warning as a
  work item** while updating dependencies — functionality must not regress
  during modernization. (e.g. the copied hook already carries a misplaced
  `eslint-disable` for `exhaustive-deps` on a `timeouts.current` cleanup;
  `forwardRef` can drop once the package targets React 19 ref-as-prop.)
- **N3 TypeScript strict**, exported types for all public API
  (`SwipeDeckProps<T>`, ref type, controls type).
- **N4 Tests.** Jest + RNTL unit tests for the controls hook and deck behavior
  (advance, callbacks with payload, reset, exhausted), mirroring this repo's
  reanimated-mocking approach.
- **N5 Example app.** The Expo example app reproduces the original demo
  (image cards + like/close/reload buttons) purely as a *consumer* of the
  package — proof the headless API is sufficient.
- **N6 Expo + bare compatibility goal.** No Expo-only imports in the package
  itself (F2's deps are all bare-RN compatible).

## 5. Out of scope

- npm publishing, semver automation (until API stabilizes)
- Replacing TheSouthernShmooze's `src/features/swipe` deck (D3)
- Card content components, buttons, theming (D2 — example app only)
- Vertical/4-direction swipe, undo/rewind — record as future candidates only

## 6. Open questions (answer before design)

- **Q1** Repo/package name? (e.g. `swipe-deck`, `@fontezbrooks/swipe-deck`)
- **Q2** License — the source demos repo's license must be checked and
  attribution carried in the README.
- **Q3** Does `activeIndex` need to be observable by consumers as a Reanimated
  SharedValue (for their own animations), plain state, or both?

## 7. Acceptance criteria

1. A fresh Expo app can `bun add` the package from GitHub, render a deck of
   arbitrary components, and drive it by gesture and by buttons.
2. Example app is visually/behaviorally equivalent to the original demo.
3. Zero lint errors **and warnings** in the package at current dependency
   versions; `tsc --noEmit` clean; tests green.
4. TheSouthernShmooze is untouched apart from `assets/swipe-cards` (reference
   copy may be deleted once the repo exists).
