# Analytics + Commit Hygiene — Requirements (rev 3, 2026-08-19)

Status: **ALL QUESTIONS CLOSED** (Q1–Q10 + A-Q11–13 + B-Q11–14 answered 2026-08-19).
READY FOR `/sc:design`. No open questions remain.

## Part A — Ultracite/Biome formatter + lint

Branch `feature/add-biome-ultracite-support`: Ultracite 7.10.5 + Biome 2.5.6
configured, `bunx ultracite fix` already run. Entire world-format (~170 files)
UNCOMMITTED, zero commits ahead of main.

### Findings (bedrock, verified 2026-08-19)
- Style = tabs + double quotes (biome.json) — new de-facto, world-format applied.
- `eslint.config.js` + `form.html` deleted; scripts `check`/`fix` added; `lint`
  still `expo lint` (configless).
- **`ultracite fix` CORRUPTED 3 JSX sites** (prop-sort duplicated attributes):
  `src/features/home/HomeScreen.tsx:61` + `:73`,
  `src/features/providers/CertifiedProviders.tsx:66` (duplicate
  `ListFooterComponent`). tsc fails 3× TS17001; `CertifiedProviders.test.tsx`
  fails (264/265 pass).
- **540 check errors**: 157 config gaps (127 `jest` test globals, 30 `Deno` in
  supabase/functions — biome.json overrides, zero code change); 101
  `useFilenamingConvention` + 99 `noJsxPropsBind` (both → DISABLE, D-A12);
  ~183 real triage pile (21 noNestedTernary, 17 useAwait, 15 noUnnecessaryConditions,
  15 noNonNullAssertion, 15 noIncrementDecrement, 13 useTopLevelRegex,
  10 useDestructuring, 9 useConsistentMethodSignatures, 8 noAwaitInLoops,
  7 noEqualsToNull, 6 noNamespaceImport, 4 noBitwiseOperators,
  4 useExhaustiveDependencies, 3 noDuplicateJsxProps (= the corruption), 3 noVoid,
  3 noExcessiveCognitiveComplexity, + singles).
- Lefthook NOT installed (no lefthook.yml / hooks / prepare script).
  `.github/hooks/ultracite.json` = Claude Code PostToolUse auto-fix hook
  (agent edits only, not human commits).

### Decisions locked
- **D-A11:** land config + world-format FIRST (one clean PR); burn down the ~183
  remaining errors in follow-up PRs grouped per rule-family.
- **D-A12:** disable `useFilenamingConvention` and `noJsxPropsBind` in biome.json.
- **D-A13:** KEEP the Claude Code PostToolUse auto-fix hook alongside lefthook.

### Requirements
- A-FR1 ✅: biome.json = committed source of truth (tabs, double quotes).
- A-FR2: install **lefthook** for real: dep + `lefthook.yml` pre-commit running
  `ultracite fix` on staged files only; auto-install on `bun install` (A-FR4);
  skip on EAS/CI (A-FR5 — env guard; `eas-build-pre-install.sh` precedent exists).
- A-FR3: world-format PR gate: (1) repair 3 corrupted JSX sites, (2) tsc clean,
  (3) 265/265 jest, (4) biome overrides for jest/Deno globals, (5) D-A12 rule
  disables. Error count 540 → ~183 at merge.
- A-FR6: post-merge burn-down PRs per rule-family (D-A11); auto-fixable batches
  first; judgment rules (noNonNullAssertion, noExcessiveCognitiveComplexity) done
  individually; tests green after each batch.
- A-FR7: `package.json` `lint` → `ultracite check` (eslint gone).
- A-NFR1: pre-commit <~3s (staged-only).
- A-NFR2: commit `.vscode/settings.json` — Biome default formatter +
  format-on-save (kills editor noise-diff class of problem, original Banner.tsx
  incident).

## Part B — PostHog analytics

### Decisions locked (all questions closed)
- **B-D1 (Q1, PARTIALLY DONE BY OWNER):** PostHog org **"The Southern Shmooze"**
  EXISTS (id 019e146c-72a3…, separate from Gulch's App Daddy Studios org) with
  project **418261** (token `phc_rUS77…`), and `.env` ALREADY carries that token
  in `EXPO_PUBLIC_POSTHOG_KEY` + host in `EXPO_PUBLIC_POSTHOG_HOST`. Also present:
  `POSTHOG_API_KEY` (`phx_…` private key — server-side use, must NEVER ship in
  client bundle; not EXPO_PUBLIC so safe). Remaining: rename project
  "Default project" → "The Southern Shmooze" (cosmetic), add POSTHOG entries to
  `.env.example` (currently absent).
- **B-D2 + B-D11 (Q2/B-Q11):** identify BOTH audiences. Bedrock: iOS ATT prompt is
  required only for cross-company tracking (IDFA / third-party data linking);
  first-party `identify()` with an email the user typed into the app's own form
  requires NO OS prompt or notification. Owner's condition met → contractor email
  on wizard submit AND homeowner email on concierge step-2 submit. Consequence:
  App Store privacy label declares analytics data "linked to identity" (static
  App Store disclosure, not a runtime prompt). PII in person properties via
  identify only; NEVER in event properties; event zip = 3-digit prefix.
- **B-D3 (Q3):** taxonomy source of truth = `southern-shmooze-posthog-schema.csv`
  + implementation guide (both in claudedocs/analytics/). Events:
  `registry_search_performed`, `shmoozer_card_rendered`, `shmoozer_card_swiped`,
  `shmoozer_match_triggered`, `find_my_pro_initiated`, `find_my_pro_step_1_completed`,
  `find_my_pro_submitted`, `partner_call_button_clicked`,
  `profile_rendered_gracefully`, `external_google_reviews_opened`,
  `contractor_portal_started`, `contractor_qualification_submitted`,
  `registry_sync_completed` + properties per CSV. Four dashboards:
  (1) Homeowner Acquisition & Discovery, (2) Find My Pro funnel,
  (3) Contractor Growth & Qualification, (4) Registry Sync & Ops.
- **B-D4 (Q4):** session replay OFF v1.
- **B-D5 (Q5):** feature flags ON at init; first use = gate AT-LAUNCH L1–L5.
- **B-D6 + B-D12 (Q6/B-Q12, VERIFIED against pipeline):** local env = `.env`
  (gitignored, .gitignore:69). `eas.json` has NO env blocks → EAS builds read
  **EAS environment variables** (server-side, same path that delivers
  `EXPO_PUBLIC_SUPABASE_*` and the `SWIPEDADDY_SSH_KEY` file secret to build
  workers). Wiring: `app.config.ts` `extra` follows the existing supabase pattern
  (`process.env.EXPO_PUBLIC_POSTHOG_KEY` etc.). REQUIRED ACTION at implement:
  add `EXPO_PUBLIC_POSTHOG_KEY/HOST` to EAS env for production (and preview)
  profiles — TestFlight builds get nothing from local `.env`.
- **B-D7 (Q7):** native only.
- **B-D8 (Q8):** Claude drafts App Store privacy-label answers. Baseline shifts to
  "linked to identity" per B-D11 (email + usage data).
- **B-D13 (B-Q13):** server-side events IN SCOPE v1 — supabase edge functions emit
  `registry_sync_completed` etc. (Deno-compatible capture: posthog-node via npm:
  specifier or raw `/capture` HTTP; design decides). `POSTHOG_API_KEY` already in
  env for any private-API needs; capture itself uses the project `phc_` token.
- **B-D14 (B-Q14):** UTM capture = deep-link-only v1, limitation documented; no
  attribution SDK.

### Requirements
- B-FR1: token wiring — `app.config.ts` extra (supabase pattern) + `.env.example`
  POSTHOG entries + EAS env vars for build profiles (B-D12); project rename
  cosmetic task.
- B-FR2: `posthog-react-native` + Expo peers (expo-file-system/application/device/
  localization), init once at root provider; lifecycle autocapture + `$screen` via
  expo-router; flags enabled (B-D5); replay off (B-D4); native only (B-D7).
- B-FR3: anonymous default; `identify()` contractor (wizard submit) + homeowner
  (concierge step-2) with email person property + `user_type` (B-D11).
- B-FR4: CSV taxonomy (B-D3). Adjustments: `atlanta_neighborhood` → app collects
  ZIP (map/substitute at design); `$initial_utm_*` only via deep links (B-D14);
  `concierge_request_id` = swipe_leads insert id.
- B-FR5: four dashboards per B-D3 (scorecards top, trend lines, description cards).
- B-FR6: PII in person props via identify only; never event props; event zip
  3-digit prefix.
- B-FR7: capture off under jest + `__DEV__` unless `EXPO_PUBLIC_POSTHOG_DEBUG=1`.
- B-FR8 (new, B-D13): edge-function capture module shared across sync-directory/
  sync-profiles for `registry_sync_completed` (+ failure states), project token via
  function env, never blocks the sync on capture failure.
- B-NFR1: init off the splash critical path. B-NFR2: SDK offline queue/batching.
  B-NFR3: privacy label per B-D8/B-D11. B-NFR4: provider mock in jest; per-funnel
  requirement-driven event tests.

## Next step
`/sc:design` — both parts. Suggested epic seams: Part A (H1 repair+config+format
PR, H2 lefthook, H3+ burn-down per family) fully independent of Part B (P1 SDK
foundation, P2 event taxonomy, P3 identify+privacy label, P4 server-side capture,
P5 dashboards + flags).
