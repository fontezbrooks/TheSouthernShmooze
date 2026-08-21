# Concierge brand round — Requirements

**Status:** DRAFT rev 1 — ready for `/sc:design`
**Date:** 2026-08-21 (owner Q&A closed same day)
**Trigger:** PR #50 (`AppHeader` → `t.brand`) exposed that five screens still sit on the legacy Vanilla/daisy surface. Owner: "the concierge form is still legacy but also needs to be updated" — target is the live site's `/homeowners` **Find My Pro** modal.
**Design truth:** the live site (`https://bestelectronicsway.com/homeowners`), per the standing owner decision in `claudedocs/site-reconciliation/report.md` §5 ("live site is design truth"). Tokens: `t.brand` (`src/theme/tokens.ts`). Brand context: `PRODUCT.md`.

---

## 1. What is already specced and shipped (do NOT redo)

E3 / FR-4.1–4.4 of `claudedocs/site-reconciliation/requirements.md`: two-step capture (trade+zip+notes → contact+opt-in), partial lead persisted on step-1 advance, honeypot on both steps, confirmation with preferred-partner reveal (interim partner rule until `conciergeRotation` lands), right-swipe → concierge request. `ConciergeForm.tsx` body is already 11 brand / 1 legacy ref; `PartnerReveal.tsx` is fully brand.

**This round is a visual migration + copy parity pass. It does not change the flow, the lead pipeline, or the data shape.**

## 2. Where the legacy actually lives (measured 2026-08-21)

| Surface | Legacy refs | Shared with |
|---|---|---|
| `concierge/ConciergeScreen.tsx` wrapper | daisy `ImageBackground`, `StrokedHeading`/`StrokedText` (Shrikhand), `surface="legacy"` header | — |
| `lead-form/fields/TextField.tsx` | 2 | swipe `LeadCaptureForm`, contractor wizard (+ `BusinessLookupField`) |
| `lead-form/fields/InputContainer.tsx` | 4 | `TextField`, `BudgetSelect`, `TriangleWarningIcon` |
| `lead-form/fields/BudgetSelect.tsx` | 5 | swipe `LeadCaptureForm` |
| `providers/CategoryChips.tsx` | 5 | swipe `TaskIntake`, `MatchContactScreen`, `DirectoryScreen` |
| `ConciergeForm.tsx` | 1 (`t.colors.error`) | — |

The stroke treatment exists only because of the daisy tile; when the tile goes, the stroke goes with it (same call as Home, PR #48).

## 3. Decisions (owner, 2026-08-21)

| # | Decision | Answer |
|---|---|---|
| D1 | Scope tier | **Tier 2 — visual migration + site copy parity.** Not Tier 3 (no landing content in the tab). |
| D2 | SMS-consent checkbox (TCPA) | **Skip.** No SMS pipeline exists in app or edge functions; showing consent for messages that never come is a false promise. Newsletter opt-in only. Revisit when sending exists. |
| D3 | Trade input | **Keep 8 suggested chips + add "Something else" free-text.** Full 38-category picker waits for FR-8.1 at-launch data. |
| D4 | PR #50 | **Merge now as-is.** `surface="legacy"` prop is self-deleting per screen; Concierge drops its override in this round. FAQ / About / Wizard / Match-contact keep theirs until they migrate. |
| D5 | Shared primitives bleed | **Migrate shared, accept bleed** (same playbook as `Button`, PR #51). Inputs on swipe / wizard / directory restyle while their wrappers stay legacy. |
| D6 | "Full name" (site) vs First/Last (app) | **Keep First/Last** — deliberate deviation. `leads.first_name/last_name`, the partial-lead `NOT NULL` relaxation, and `_shared/lead-email.ts` are all split-shaped; a single field would be a DB + edge change for a cosmetic gain. *(Claude's call from the data; owner may flip.)* |

## 4. Functional requirements

### FR-1 Concierge screen surface → `t.brand`
- FR-1.1 Drop the daisy `ImageBackground`; page base = `brand.colors.bg` (magnolia), matching Home.
- FR-1.2 Replace `StrokedText`/`StrokedHeading` kicker + title with the Home pattern: Caveat accent kicker + Fraunces headline (`brand.typography.accent` + `displayXL`/`displayL`).
- FR-1.3 Remove `surface="legacy"` from the Concierge `AppHeader`.
- FR-1.4 Keep `KeyboardAvoidingView` / scroll / `keyboardShouldPersistTaps` behaviour unchanged.

### FR-2 Shared field primitives → `t.brand`
- FR-2.1 `InputContainer`: surface fill, `line` hairline, `brandRadii.sm`, focus ring in `clay`, error in `brand.colors.error`; inside-label / placeholder in `textSoft`. **Placeholder contrast ≥ 4.5:1** (textSoft on surface = 7.73 ✓).
- FR-2.2 `TextField`: label + helper + error typography from `brandTypography` (`bodySemi` label, `caption` helper/error); keep RHF `Controller` contract and all props.
- FR-2.3 `BudgetSelect`: same container; selected state `peachSoft` fill + `clayDark` label (6.16:1); unselected `surface` + `line`.
- FR-2.4 `CategoryChips`: pill, surface + `line` hairline; selected = `clay` fill + magnolia label (5.74:1). Keep the `onSelect`/`selected` API (4 consumers).
- FR-2.5 `ConciergeForm` last legacy ref (`t.colors.error`) → `brand.colors.error`.
- FR-2.6 No change to validation, schema (`conciergeSchema.ts`), or `submitConcierge` payload.

### FR-3 Copy parity with the site modal
Verbatim from `/homeowners` Find My Pro (fetched 2026-08-21):
- FR-3.1 Step 1: heading **"What do you need done?"** + sub-copy **"Tell us the job and where you are. Takes about a minute."** Fields: trade, **"Zip code"**, **"Anything else about the job? (optional)"**. CTA **"Next"**.
- FR-3.2 Step 2: heading **"Almost there"** + sub-copy **"How should your pro reach you?"** + supporting line **"Your matched pro will use this to get in touch. We never sell your info."** Fields: First name, Last name (D6), **"Email"**, **"Phone"** with help text **"The one pro we match you with will use this to reach you. We never sell your number."** Newsletter checkbox label **"Send me occasional Shmooze tips and trusted local pro recommendations. No spam, unsubscribe anytime."** CTAs **"See My Match"** + **"← Back"**.
- FR-3.3 Success: title **"You're all set"**, heading **"We're on it."**, sub-copy **"We've received your request. Your Shmooze preferred partner will reach out to you shortly. Keep an eye on your phone and email."** Section **"Prefer someone else?"** with copy **"These are the Shmooze preferred partners for your project. One of them will be in contact with you shortly. Prefer to reach out now? Go right ahead."** above the existing partner card(s). Link **"See every certified pro in the directory"** → `/directory`. Primary CTA **"Done"** (replaces "Back Home"). Drop "Submit Another Request" unless owner objects (site has no equivalent).
- FR-3.4 Step progress: a visible two-step indicator ("Step 1 of 2") — the site modal shows progress; app currently has none.

### FR-4 Trade input (D3)
- FR-4.1 Keep `SUGGESTED_CATEGORIES` chips.
- FR-4.2 Add a **"Something else"** chip that reveals a free-text trade input (`TextField`, required when chosen). Value flows into the existing `trade` string — no schema change.
- FR-4.3 Validation copy stays "Select a trade".

### FR-5 Analytics
- FR-5.1 No new events. Existing `find_my_pro_*` events and identify-on-step-2 (PR #44) must keep firing — covered by existing tests in `useConciergeForm`.

## 5. Non-functional requirements
- NFR-1 WCAG AA: every new colour pair measured (table in FR-2). Dynamic Type: no fixed `height` on inputs/CTAs — `minHeight` only (review lesson, PR #52).
- NFR-2 44×44 targets on chips, checkbox row, back link.
- NFR-3 Zero behaviour regressions: all existing lead-form / swipe / wizard tests green; lint pile must not grow.
- NFR-4 Screens that merely *consume* the primitives (swipe, wizard, directory) are **not** otherwise touched in this round.

## 6. User stories / acceptance
- **US-1 (homeowner):** I open Concierge and it looks like the same app as Home — magnolia, Fraunces, clay. *Accept: no daisy, no stroked text, header seamless with page.*
- **US-2 (homeowner):** The form tells me what I'm doing and why at each step, in the site's words. *Accept: FR-3.1–3.3 copy present verbatim; "Step 1 of 2" visible.*
- **US-3 (homeowner):** My trade isn't in the 8 chips; I tap "Something else" and type it. *Accept: request submits with my typed trade.*
- **US-4 (homeowner, a11y):** Large text size — nothing clips. *Accept: inputs and CTAs grow.*
- **US-5 (owner):** Swipe intake and the wizard still work and their inputs now look brand. *Accept: existing suites green; visual spot-check.*

## 7. Out of scope (explicit)
- Landing content in the Concierge tab (Tier 3) — **no**.
- SMS consent / sending (D2) — **no**.
- 38-category taxonomy picker (FR-8.1, at-launch) — **no**.
- Single "Full name" field (D6) — **no**.
- FAQ / About / Contractor wizard / Match-contact wrappers — separate rounds (wizard + match-contact ride with swipe cluster #4).
- Any change to `leads` schema, edge functions, or partner-selection rule.

## 8. Open questions
| # | Question | Blocking? |
|---|---|---|
| Q1 | D6 — confirm keeping First/Last (vs site's single "Full name"). | No — proceeds as First/Last. |
| Q2 | Success screen: keep "Submit Another Request" as a secondary link, or drop to match the site ("Done" only)? | No — default drop. |
| Q3 | "Step 1 of 2" indicator: text only, or a two-segment bar? | No — design decides. |

## 9. Sequencing
1. Merge **#50** (D4).
2. This round — one branch, likely two commits: (a) primitives → brand (shared, bleed accepted), (b) Concierge wrapper + copy parity + "Something else".
3. After: FAQ + About (smallest remaining legacy); then swipe cluster #4 (+ wizard, match-contact, `Banner`, `PhysicalPressable`).

**Next step:** `/sc:design` against this doc.
