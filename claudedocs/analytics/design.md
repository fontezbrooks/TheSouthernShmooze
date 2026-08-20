# Analytics + Commit Hygiene — Design (2026-08-19)

Source: `requirements.md` rev 3 (all decisions locked). Two independent tracks.
Track H (hygiene) ships from existing branch `feature/add-biome-ultracite-support`;
Track P (PostHog) branches from main after H1 merges (avoids world-format rebase pain).

---

## Track H — Ultracite/Biome hygiene

### H1 — Repair + config + world-format PR (branch exists, zero commits)

Commit sequence on `feature/add-biome-ultracite-support`:

1. **Repair corruption** (3 sites): delete the duplicated JSX attribute blocks at
   `src/features/home/HomeScreen.tsx:61`,`:73` and
   `src/features/providers/CertifiedProviders.tsx:66` (keep first occurrence,
   delete duplicate). Gate: `tsc --noEmit` clean, 265/265 jest.
2. **biome.json config** (D-A12 + globals):
   ```jsonc
   {
     "linter": { "rules": { "preset": "recommended",
       "style":       { "useFilenamingConvention": "off" },
       "performance": { "noJsxPropsBind": "off" } } },
     "overrides": [
       { "includes": ["**/__tests__/**", "**/*.test.*", "jest.setup*"],
         "javascript": { "globals": ["jest"] } },
       { "includes": ["supabase/functions/**"],
         "javascript": { "globals": ["Deno"] } }
     ]
   }
   ```
   (Exact placement merged into existing biome.json; Biome 2.x `overrides[].includes`.)
   Gate: `bunx ultracite check` error count drops 540 → ~183, zero
   noUndeclaredVariables / useFilenamingConvention / noJsxPropsBind remain.
3. **package.json**: `"lint": "ultracite check"` (A-FR7).
4. **.vscode/settings.json** (A-NFR2):
   ```json
   { "editor.defaultFormatter": "biomejs.biome",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": { "source.fixAll.biome": "explicit",
                                   "source.organizeImports.biome": "explicit" } }
   ```
5. **World-format commit(s)**: the ~170 already-reformatted files, logic-free.
   Split: `chore: biome config + repair` then `style: biome world-format` so blame
   pathologies isolate to one commit. Add the style commit hash to
   `.git-blame-ignore-revs` (new file) + document `git config blame.ignoreRevsFile`.

PR gates: tsc clean; 265/265 jest (watch pnpm-drift gotcha: `ls node_modules/.pnpm`
first); check errors == expected residue (~183); no `expo lint` references left in
docs/CI.

### H2 — Lefthook PR

- deps: `lefthook` (devDependency).
- `lefthook.yml`:
  ```yaml
  pre-commit:
    parallel: true
    jobs:
      - name: ultracite
        run: bunx ultracite fix {staged_files}
        glob: "*.{ts,tsx,js,jsx,json,md}"
        stage_fixed: true
  skip_in_ci: true   # lefthook honors CI env var by default; belt+braces
  ```
- Auto-install (A-FR4/5): `"postinstall": "lefthook install || true"` in
  package.json, guarded: `[ -n \"$CI\" ] || [ -n \"$EAS_BUILD\" ]` short-circuits
  (EAS sets `EAS_BUILD=true`; `|| true` keeps EAS/CI installs green even if binary
  missing). Keep `.github/hooks/ultracite.json` untouched (D-A13).
- Gate: commit with a deliberately misformatted staged file → hook fixes + re-stages;
  `EAS_BUILD=true bun install` → no hook installed.

### H3+ — Burn-down PRs (per rule-family, D-A11)

Order (mechanical → judgment), one PR each or batched by risk:
1. `noEqualsToNull` (7) + `noIncrementDecrement` (15) + `useConsistentArrayType`/
   `useConsistentTypeDefinitions` (2) — safe autofix class.
2. `useTopLevelRegex` (13) + `noNamespaceImport` (6) + `useDestructuring` (10) +
   `useConsistentMethodSignatures` (9).
3. `useAwait` (17) + `noAwaitInLoops` (8) + `noUnnecessaryConditions` (15) —
   semantic review each site (async contracts, RN event loops).
4. `noNestedTernary` (21) — rewrite as early returns/lookup maps.
5. `noNonNullAssertion` (15) + `useExhaustiveDependencies` (4) + `noVoid` (3) +
   `noBitwiseOperators` (4) + `noExcessiveCognitiveComplexity` (3) + singles —
   individual judgment; suppress with `biome-ignore` + reason where the code is
   right (e.g. reanimated patterns; see react-hooks-v6 gotchas memory).
Every PR: tests green, tsc clean, error count monotonically down.

---

## Track P — PostHog analytics

### P0 — Prereqs (owner/console, no code)
- Rename PostHog project 418261 → "The Southern Shmooze" (cosmetic).
- EAS env vars (production + preview): `EXPO_PUBLIC_POSTHOG_KEY`,
  `EXPO_PUBLIC_POSTHOG_HOST` (plain visibility — public token).
- Supabase function secrets: `POSTHOG_PROJECT_KEY` (same phc_ token),
  `POSTHOG_HOST` — for P4.

### P1 — SDK foundation

**Deps**: `posthog-react-native` + peers `expo-file-system`, `expo-application`,
`expo-device`, `expo-localization` (verify versions against Expo 56 at implement).

**Files**:
- `src/lib/analytics/posthog.ts` — client factory:
  ```ts
  import PostHog from "posthog-react-native";
  // key/host from Constants.expoConfig.extra (app.config.ts pattern, like supabase)
  // returns undefined when key missing OR (__DEV__ && !EXPO_PUBLIC_POSTHOG_DEBUG)
  // options: { host, captureAppLifecycleEvents: true,
  //            featureFlagsRequestTimeoutMs: 3000 }
  ```
- `src/lib/analytics/AnalyticsProvider.tsx` — wraps SDK `PostHogProvider`
  (autocapture: { captureScreens: true } for expo-router `$screen`); renders
  children unwrapped when client undefined (jest/dev-off path — B-FR7; B-NFR1:
  mount non-blocking, no await on splash path).
- `src/lib/analytics/events.ts` — **typed event map** (single source of truth):
  ```ts
  export type AnalyticsEvent = {
    registry_search_performed: { filter_category?: string; filter_tier?: string;
      filter_badges?: string[]; results_count: number; empty_state_rendered: boolean };
    shmoozer_card_rendered: { pro_business_id: string; pro_business_name: string;
      pro_tier?: string; pro_rating?: number; card_index: number };
    shmoozer_card_swiped: { pro_business_id: string; pro_tier?: string;
      swipe_direction: "left" | "right"; session_swipe_count: number };
    shmoozer_match_triggered: { pro_business_id: string; concierge_request_id: string };
    find_my_pro_initiated: Record<string, never>;
    find_my_pro_step_1_completed: { requested_category: string;
      partial_lead_recorded: boolean; zip_prefix: string };
    find_my_pro_submitted: { matched_pro_id?: string };
    partner_call_button_clicked: { pro_business_id: string;
      call_placement_source: "find_my_pro_completion" | "profile_view" | "swiper_match_popup" };
    profile_rendered_gracefully: { pro_business_id: string; has_photos: boolean;
      has_editorial_story: boolean; has_active_deal: boolean };
    external_google_reviews_opened: { pro_business_id: string };
    contractor_portal_started: { entry_point: "home_banner" | "registry_footer" };
    contractor_qualification_submitted: { applicant_trade: string;
      instant_qualification_response: "approved" | "flagged" | "review" };
  };
  ```
  PII guard BY TYPE: no email/name/phone/notes fields exist in the map; zip only as
  `zip_prefix` (3 digits, `zip.slice(0,3)`).
- `src/lib/analytics/useAnalytics.ts` — `track<K>(event: K, props: AnalyticsEvent[K])`
  + `identify(email, { user_type: "homeowner"|"contractor"; … })` + `useFlag(key)`
  thin wrappers over SDK hooks; ALL no-ops when client undefined.

**Wiring**: `app.config.ts` extra gains `posthogKey`/`posthogHost` (supabase
pattern); `.env.example` gains the two EXPO_PUBLIC lines + comments;
`app/_layout.tsx` mounts `AnalyticsProvider` inside ThemeProvider, outside Stack.

**Jest**: `jest.setup` mock of `src/lib/analytics/useAnalytics` exporting spy
`track`/`identify`; provider renders children (client undefined under jest —
B-FR7 covers it; mock exists for assertion access).

### P2 — Event instrumentation

| Event | Site |
|---|---|
| registry_search_performed | `useDirectorySearch.ts` post-results resolve (fire once per settled/debounced query) |
| shmoozer_card_rendered | `useSwipeDeck.ts` top-card change |
| shmoozer_card_swiped / shmoozer_match_triggered | `useSwipeDeck.ts` swipe commit; match = right-swipe lead insert success (`swipeRepository` insert id → concierge_request_id) |
| find_my_pro_initiated | `ConciergeScreen.tsx` form start |
| find_my_pro_step_1_completed | `useConciergeForm.ts` after partial-lead insert resolves (partial_lead_recorded = insert success) |
| find_my_pro_submitted | `useConciergeForm.ts` completion insert success; matched_pro_id = PartnerReveal pick |
| partner_call_button_clicked | `PartnerReveal.tsx` + `LinkButton` call kind + match popup — placement enum |
| profile_rendered_gracefully | `BusinessDetailScreen.tsx` data-loaded effect |
| external_google_reviews_opened | `LinkButton` google-review kind |
| contractor_portal_started | Home banner + registry-footer `LinkPill` onPress (entry_point) |
| contractor_qualification_submitted | `useContractorWizard.ts` submit success (instant_qualification_response from verdict) |

Rules: track AFTER the user action's own work succeeds; never await capture on a
UI path; failures land in SDK offline queue silently.

### P3 — Identify + privacy label

- Contractor: `useContractorWizard` submit success → `identify(email, { user_type:
  "contractor", applicant_trade })`.
- Homeowner: `useConciergeForm` step-2 success → `identify(email, { user_type:
  "homeowner" })`. Distinct id = email; PostHog merges the anonymous device person.
- UTM: deep-link-only (B-D14) — parse cold-start URL once in AnalyticsProvider;
  `$set_once` `$initial_utm_*` when params present.
- **Privacy label draft** (deliverable `claudedocs/analytics/privacy-label.md`):
  Contact Info › Email — linked to identity, app functionality + analytics;
  Identifiers › User ID — linked; Usage Data › Product Interaction — linked;
  "Data Used to Track You": NONE (first-party only, no ATT prompt).

### P4 — Server-side capture (edge functions)

- `supabase/functions/_shared/posthog-capture.ts`:
  ```ts
  // fire-and-forget fetch to `${POSTHOG_HOST}/i/v0/e/`
  // body: { api_key: POSTHOG_PROJECT_KEY, event, distinct_id: "server:sync",
  //         properties: { ...props, $process_person_profile: false } }
  // 2s timeout; errors logged, NEVER thrown — sync must not fail on analytics.
  ```
  Raw fetch, not posthog-node: zero dep, Deno-native, one endpoint.
- `sync-directory` + `sync-profiles` emit `registry_sync_completed { sync_status,
  records_ingested, duration_ms }` (+ `ratings_cache_refreshed` where applicable).
- Env via `supabase secrets set` (P0). Deploy note: both functions REDEPLOY on merge.
- Tests: jest unit on shared module (fetch mocked; assert non-throw on 500/timeout).

### P5 — Dashboards + feature flags (PostHog console via MCP)

Four dashboards, "Shmooze · " naming:
1. **Homeowner Acquisition & Discovery** — scorecards: weekly active devices, app
   opens; trends: searches, empty-state rate (formula empty/all), swipes/session;
   screen paths; retention + lifecycle on Application Opened.
2. **Find My Pro Funnel** — funnel initiated → step_1_completed → submitted;
   conversion scorecard (B/A formula); partial-abandonment trend; partner_call CTR.
3. **Contractor Growth** — portal_started → qualification_submitted funnel;
   breakdown by instant_qualification_response; entry_point split.
4. **Registry Sync & Ops** — sync success rate, duration_ms, records_ingested.
Each dashboard: text tile stating objective (guide best practice).
Flags: create `at-launch-l1-l5` (off) as seed; SDK loads flags from P1; L1–L5 UI
gates on it in the at-launch round.

### Test plan (B-NFR4)
- Per-funnel RTL tests: concierge step1/step2, wizard submit (+identify), swipe
  commit, registry search (once per settled query) — exact event name + props.
- Provider: client undefined under jest → track no-op, children render.
- Edge module: capture failure never rejects sync.

### Sequencing + risk
- Order: P0 → P1 → {P2, P3, P4 parallel} → P5. Track H fully independent; land H1
  BEFORE P1 branches (world-format otherwise makes P PRs unreviewable).
- Risk: posthog-react-native compat with Expo 56/RN 0.85 — verify at P1 install.
- Risk: `$screen` autocapture under expo-router v6 — verify in PostHog activity
  during P1 device pass; fallback = manual `useSegments()` tracker in provider.
- Every epic: branch + PR per owner directive (no direct main commits); owner
  device pass on UX-adjacent epics (P2, P3).
