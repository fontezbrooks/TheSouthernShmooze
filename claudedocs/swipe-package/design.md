# swipeDaddy — Design

**Date:** 2026-07-09 · **Status:** DRAFT — awaiting owner approval
**Requirements:** `./requirements.md` (F1–F6, N1–N6, D1–D3)

## 0. Open-question resolutions (supersede requirements §6)

- **Q1 Name:** GitHub repo `swipeDaddy`, package `@fontezbrooks/swipedaddy`.
- **Q2 License (BLOCKER RESOLVED):** the demos repo uses a **custom proprietary
  license**, not MIT. It permits use/modification inside your own apps and
  "deployment across multiple projects for internal use," but forbids
  redistributing the code — original or modified — as a standalone package
  (§1.2 a/c), sale or no sale. **Owner decision: the repo stays PRIVATE
  forever and is never published to npm under this code.** README carries
  attribution to Enzo Manuel Mangano + a DO-NOT-PUBLISH notice. (Paths to a
  public package later: clean-room rewrite or written permission.)
  Amends **D1**: git-install stays, npm publishing is off the table, repo private.
- **Q3 activeIndex exposure:** **both** forms. The ref exposes the Reanimated
  `SharedValue` (UI-thread reads for consumers animating other UI in sync with
  swipes), and `onActiveIndexChange(index)` provides a plain JS callback for
  ordinary React state. Cost of both ≈ one `useAnimatedReaction`.
- **Q2 corollary — API data is the primary use case:** the deck must accept
  data that arrives asynchronously and **grows** (paginated fetches), not just
  a static array (see §4).

## 1. Repo layout

```
swipeDaddy/                     (PRIVATE GitHub repo)
├── src/                        # the package — TS source shipped as-is, no build step
│   ├── index.ts                # public exports only
│   ├── SwipeDeck.tsx           # <SwipeDeck<T>> — the one public component
│   ├── SwipeableCard.tsx       # internal: gesture + transforms
│   ├── use-swipe-controls.ts   # internal: refs, imperative controls
│   ├── types.ts                # SwipeDeckProps<T>, SwipeDeckRef, SwipeDeckConfig
│   └── defaults.ts             # DEFAULT_CONFIG (the demo's magic numbers, named)
├── __tests__/                  # jest-expo + RNTL
├── example/                    # Expo app; imports ../src via metro watchFolders
├── package.json                # @fontezbrooks/swipedaddy, main: "src/index.ts", peerDeps
├── tsconfig.json               # strict
├── eslint.config.js            # eslint-config-expo flat; CI treats warnings as errors (N2)
└── README.md                   # usage + attribution + DO-NOT-PUBLISH license note
```

- **No build step**: Expo/Metro transpiles TS inside `node_modules` via
  babel-preset-expo, so consuming apps can git-install raw TS source.
  **Verify in a real consuming app during P1** (risk R3). Add
  `react-native-builder-bob` only if that assumption fails.
- Peer deps (N1): `react`, `react-native`, `react-native-reanimated` (v4),
  `react-native-gesture-handler`, `react-native-worklets`. Nothing else.
  `expo-image`, `pressto`, `@expo/vector-icons` are devDeps of `example/` only.

## 2. Public API

```ts
export type SwipeDeckConfig = {
  visibleCards: number;         // default 5    (demo: index - active < 5)
  stackOffsetY: number;         // default 23   (px per depth level)
  stackScaleStep: number;       // default 0.07 (scale loss per depth level)
  maxRotationRad: number;       // default Math.PI / 20
  swipeThresholdRatio: number;  // default 1/3  (of window width)
  exitDistanceRatio: number;    // default 1.5  (× window width)
};

export type SwipeDeckRef = {
  swipeLeft: () => void;
  swipeRight: () => void;
  reset: () => void;
  activeIndex: SharedValue<number>;   // Q3: UI-thread observable
};

export type SwipeDeckProps<T> = {
  data: T[];                                   // F1; may grow over time (§4)
  renderCard: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string;  // default: index
  onSwipeLeft?: (item: T, index: number) => void;     // F4: payload included
  onSwipeRight?: (item: T, index: number) => void;
  onActiveIndexChange?: (index: number) => void;      // Q3: JS-thread callback
  onDeckEnd?: () => void;                             // F4: last card left
  config?: Partial<SwipeDeckConfig>;                  // F5
  cardStyle?: StyleProp<ViewStyle>;   // size/position of the card slot
};

export const SwipeDeck: <T>(props: SwipeDeckProps<T> & { ref?: Ref<SwipeDeckRef> }) => ReactNode;
```

`index.ts` exports exactly: `SwipeDeck`, `SwipeDeckProps`, `SwipeDeckRef`,
`SwipeDeckConfig`, `DEFAULT_CONFIG`. Cards and the controls hook stay internal.

## 3. Internal design (mapping from the copied code)

| Copied file | Becomes | Changes |
|---|---|---|
| `index.tsx` (screen) | `example/` app screen | Demo chrome (buttons, pressto, icons, dark bg) moves wholesale to the example; package keeps none of it. |
| `hooks/use-swipe-controls.ts` | `src/use-swipe-controls.ts` | Refs derive from `data.length`, not `IMAGES.length`; `useMemo` deps `[data.length]` with ref-array **growth** (append `createRef`s, never recreate existing — preserves in-flight cards, §4); timeout cleanup kept; misplaced `eslint-disable` resolved properly (N2). |
| `components/Card/index.tsx` | `src/SwipeableCard.tsx` | `image`/`expo-image` → `children` (output of `renderCard`); constants → `config` values via props; **fix `reset()` bug** (second guard checks `translateX`, must check `translateY`) (F6); callbacks re-wired to deck level. |
| `constants.ts` (IMAGES) | deleted | Sample images move to `example/assets/`. |
| — | `src/SwipeDeck.tsx` (new) | Composes the above: maps `data` → `SwipeableCard`s, owns `activeIndex`, exposes `SwipeDeckRef` via `useImperativeHandle`, fires `onSwipeLeft/Right(item, index)`, `onDeckEnd` when `activeIndex` reaches `data.length`, and `onActiveIndexChange` via `useAnimatedReaction` + `scheduleOnRN`. |

Gesture/transform math (pan, rotation interpolation, spring exit/return,
stacked offset/scale/opacity) ports **verbatim** in P2 — the demo's feel is
requirement F2; tuning only moves behind `DEFAULT_CONFIG`.

## 4. API-data flow (Q2)

Two supported patterns, both driven by the controlled `data` prop:

1. **Load-then-render:** fetch, then mount the deck. Trivial case.
2. **Paginated append:** consumer appends pages (`setData(prev => [...prev, ...page])`),
   typically from `onActiveIndexChange` nearing the end. Because `activeIndex`
   only moves forward and card refs are appended (never recreated), growth
   cannot disturb the card mid-gesture. Replacing data wholesale = remount
   (consumer changes the deck's `key`) — documented, not silently supported.

## 5. Delivery plan (phases; each gated on tsc + eslint-zero-warnings + jest)

- **P1 Scaffold:** private repo, package.json/tsconfig/eslint/jest, empty
  example app boots; **git-install smoke test from a scratch Expo app** (R3).
- **P2 Port as-is (owner's process, N2):** copy the three files + images into
  the structure, example reproduces the original demo exactly. No refactors.
- **P3 Headless refactor:** F1/F3/F4/F5/F6 — generic data, config, payloads,
  bug fixes; demo chrome moves to example; example ends visually identical.
- **P4 Modernize:** update all deps to current; burn down **every** lint error
  and warning as its own work item; drop `forwardRef` for React-19 ref-as-prop
  if targets allow; re-verify example behavior after each change.
- **P5 Tests + docs:** N4 test suite (advance, payloads, reset, deck-end,
  append-growth), README with usage, attribution, and the license notice.

## 6. Risks

- **R1 License ceiling:** the package can never go public/npm as-is. Mitigate:
  README notice + `"private": true` in package.json (npm refuses to publish).
- **R2 worklets/reanimated coupling:** `react-native-worklets` majors track
  reanimated 4 — pin compatible ranges in peerDeps.
- **R3 Metro-TS git-install assumption:** verified in P1 before any porting.
- **R4 Ref-array growth under appends:** the one novel piece of logic (not in
  the demo) — gets dedicated tests in P5.
