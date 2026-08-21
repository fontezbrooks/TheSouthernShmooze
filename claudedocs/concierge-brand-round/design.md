# Concierge brand round — Design

**Status:** rev 1 — ready for `/sc:implement`
**Inputs:** `requirements.md` (this dir, rev 1, all owner decisions closed 2026-08-21); `PRODUCT.md`; `src/theme/tokens.ts` (`t.brand`); live site `/homeowners` modal copy (captured in requirements FR-3).
**Scope guard:** visual migration + copy parity + "Something else" trade. **No** change to flow, schema, `submitConcierge`, edge functions, partner rule, analytics events.

---

## 1. Shape of the change

Two commits on one branch `design/concierge-brand`:

| Commit | What | Blast radius |
|---|---|---|
| **C1 — form primitives → `t.brand`** | `InputContainer`, `FloatingLabel`, `PaddedErrorMessage`, `TextField`, `BudgetSelect`, `CategoryChip(s)` + one new typography token | Concierge, swipe `LeadCaptureForm`/`TaskIntake`/`MatchContact`, contractor wizard (+`BusinessLookupField`), Directory chips. Bleed accepted (D5). APIs unchanged except two **additive optional** props. |
| **C2 — Concierge surface + copy + "Something else"** | `ConciergeScreen`, `ConciergeForm`, `PartnerReveal`, new `StepIndicator` | Concierge only. Drops `surface="legacy"` on its `AppHeader`. |

C1 is reviewable and shippable alone (it is the forms keystone); C2 depends on C1.

## 2. Token map (legacy → brand), with measured contrast

| Element | Legacy | Brand | Ratio |
|---|---|---|---|
| Input fill | `colors.surface` | `brand.colors.surface` | — |
| Input border rest | `inputBorder #CCCAC9` | `line #E4D6BE` | — |
| Input border **focused** | (none) | `clay` | 5.83 on surface (non-text, ≥3 ✓) |
| Input border error | `error` | `brand.colors.error` (same hex) | — |
| Input radius | `radii.input` 4 | `brandRadii.sm` 10 | — |
| Label / placeholder | `muted #757371`, Bitter 16 | `textSoft`, Public Sans 16 | **7.73** on surface ✓ |
| Value text | Bitter 16 `text` | `brand.typography.body` + `brand.colors.text` | 15.31 ✓ |
| Leading icon / chevron | `muted` | `textSoft` | — |
| Error box | Vanilla bg, black caption | `porchCream` bg, `brand.colors.text` caption, `error` icon | 13.69 ✓ |
| Chip unselected | surface + `inputBorder` 1px, captionSemi | surface + `line` hairline, **new `brand.typography.label`** | 15.31 ✓ |
| Chip selected | `rust` fill, `rustDark` border, white | `clay` fill, magnolia label, no border | **5.74** ✓ |
| Budget option selected | `rust` label | `clay` label | 5.83 ✓ |
| Budget sheet | surface, radius 12 | surface, `brandRadii.md` 16, `brand.shadow.card` | — |
| Screen base | daisy over Vanilla | `brand.colors.bg` magnolia | — |
| Kicker / title | Shrikhand stroked | Caveat `accent` (clay) + Fraunces `displayXL` | 5.74 / 15.06 ✓ |
| Step heading / sub-copy | bodySemi stroked | `displayM` + `body` | ✓ |
| Step indicator | — | caption `textSoft` + 2 segments `clay`/`line` | 7.61 ✓ |

**New token (missing-token fix, not a one-off):** `brandTypography.label = { fontFamily: brandFonts.bodySemi, fontSize: 14, lineHeight: 18, color: brandColors.text }`. Used by chips and the checkbox label; replaces the `bodySemi`+fontSize-14 override pattern BusinessCard used. The existing brand-tokens test iterates `brandTypography` generically → covered.

## 3. Component specs (C1)

### 3.1 `InputContainer` — `src/features/lead-form/fields/InputContainer.tsx`
```ts
interface InputContainerProps {
  children: ReactNode;
  disabled?: boolean;
  error?: string;
  floated: boolean;
  /** NEW, optional. Drives the clay focus ring. TextField passes its focus state. */
  focused?: boolean;
  /** NEW, optional. Caption under the field when there is no error (site: phone help). */
  helperText?: string;
  icon?: IconName;
  label: string;
  multiline?: boolean;
  trailing?: ReactNode;
}
```
- Border: `error ? brand.error : focused ? brand.clay : brand.line`; width 1; radius `brandRadii.sm`.
- Below the box: `error ? <PaddedErrorMessage/> : helperText ? <Text caption textSoft/> : null`.
- Heights: keep `minHeight` 58 / 131 (already min, Dynamic-Type safe). Nested ternary in `content` style → resolve to a small `contentStyle(multiline, isFloated)` helper (lint: `noNestedTernary`).

### 3.2 `FloatingLabel` — `src/components/ui/FloatingLabel.tsx`
- `t.typography.body` → `t.brand.typography.body`; default colour `t.colors.muted` → `t.brand.colors.textSoft`. Animation untouched (transform-only, UI thread).

### 3.3 `PaddedErrorMessage` — `src/components/ui/PaddedErrorMessage.tsx`
- bg `brand.colors.porchCream`, radius `brandRadii.sm`, icon `brand.colors.error`, text `brand.typography.caption` + `brand.colors.text`. Keep `accessibilityLiveRegion="polite"`.

### 3.4 `TextField` — `src/features/lead-form/fields/TextField.tsx`
```ts
// additive
helperText?: string;
```
- Pass `focused` + `helperText` through to `InputContainer`.
- `placeholderTextColor` → `brand.colors.textSoft`; input style `[brand.typography.body, { color: brand.colors.text }, multiline && styles.multiline]`.
- Everything else (RHF `Controller`, `autoComplete`, `required` no-op) unchanged.

### 3.5 `BudgetSelect` — `src/features/lead-form/fields/BudgetSelect.tsx`
- Icons `textSoft`; value text brand body/ink; selected option `clay`; sheet `surface` + `brandRadii.md` + `brand.shadow.card`; option rows `minHeight: 48` (was padding-only) for targets. Keep `Modal`.

### 3.6 `CategoryChip` / `CategoryChips` — `src/features/providers/CategoryChips.tsx`
- Chip: `minHeight: 36` (was `height`), padding 14, radius pill; rest = surface + `line` hairline; selected = `clay` fill, `bg` label, `borderColor` transparent. Text `brand.typography.label`.
- **API unchanged.** `CategoryChips` keeps `categories`, `onSelect`, `selected`.

## 4. Component specs (C2)

### 4.1 `ConciergeScreen`
- `ImageBackground` → `View` with `backgroundColor: brand.colors.bg`.
- Heading block: `<Text accent clay>Concierge</Text>` + `<Text displayXL accessibilityRole="header">Find My Pro</Text>` (Home hero pattern). `StrokedText`/`StrokedHeading` imports removed.
- `AppHeader`: drop `surface="legacy"`.
- `KeyboardAvoidingView` / `ScrollView` / `keyboardShouldPersistTaps` unchanged. Content padding: 16 H, 16 top, 44 bottom, gap 24 (as today).

### 4.2 `StepIndicator` — NEW `src/features/lead-form/StepIndicator.tsx`
```ts
interface StepIndicatorProps { step: 1 | 2; total: 2 }
```
- Row: caption `textSoft` **"Step {step} of {total}"** + two 4pt segments (`clay` for ≤ step, `line` otherwise), radius pill, `accessibilityRole="progressbar"`, `accessibilityValue={{ min: 0, max: total, now: step }}`.
- Rendered by `ConciergeForm` above each step's heading; absent on success.

### 4.3 `ConciergeForm` — copy + "Something else"
**Step 1 ("job")**
- `StepIndicator step=1` → heading `displayM` **"What do you need done?"** → sub-copy `body textSoft` **"Tell us the job and where you are. Takes about a minute."**
- Trade block: `CategoryChips categories={[...SUGGESTED_CATEGORIES, OTHER_TRADE]}` where `const OTHER_TRADE = "Something else"`. Local `const [isOther, setIsOther] = useState(false)`.
  - `onSelect(c)`: if `c === OTHER_TRADE` → `setIsOther(true); field.onChange("")`; else → `setIsOther(false); field.onChange(c)`.
  - `selected = isOther ? OTHER_TRADE : field.value`.
  - When `isOther`: render `<TextField control={stepOneForm.control} name="trade" label="What kind of pro do you need?" autoCapitalize="words" />` directly under the chips. **No schema change** — free text flows into the same `trade` string; "Select a trade" validation still fires on empty.
  - `isOther` resets to false on `reset()` (success → done) — keyed by step remount already handles the view; reset state explicitly in the `reset` path via a `key` on the job View tied to a `formEpoch` counter from the hook **or** simpler: derive `isOther` from `field.value` not in `SUGGESTED_CATEGORIES` && field touched — *reject*: typed text equal to a chip label would flip. Use the explicit state + reset on `step === "job"` remount (the `key="step-job"` View remounts per step; move `useState` into a small `TradePicker` child component rendered inside it so state dies with the step). **Decision: `TradePicker` child component owns `isOther`.**
- Zip + notes `TextField`s unchanged. CTA **"Next"** (Button primary).
- Error text under chips: `brand.colors.error` (last legacy ref, FR-2.5); render via `Text`, not `StrokedText`.

**Step 2 ("contact")**
- `StepIndicator step=2` → heading **"Almost there"** → sub-copy **"How should your pro reach you?"** → supporting `caption textSoft` **"Your matched pro will use this to get in touch. We never sell your info."**
- Fields: First name, Last name (D6), Email, Phone with `helperText="The one pro we match you with will use this to reach you. We never sell your number."`
- Newsletter checkbox: label text **"Send me occasional Shmooze tips and trusted local pro recommendations. No spam, unsubscribe anytime."** (already), rendered via `Text` (`brand.typography.caption`), row `minHeight: 44`.
- Error banner: `Text` body `clay` in `line`-bordered box (replace `StrokedText`).
- CTAs: `Button label="← Back" variant="wide"` + `Button label="See My Match" variant="primary"` (submitting → "Submitting…"). Order: Back above See My Match as today? **Site: primary then Back.** → primary first, Back second.

**Success** → `PartnerReveal` (4.4).

### 4.4 `PartnerReveal`
```ts
interface PartnerRevealProps {
  /** "Done" — resets the flow THEN navigates, so the tab-preserved screen does not re-render success. */
  onDone: () => void;
  /** "See every certified pro in the directory" */
  onSeeDirectory: () => void;
}
```
- Remove `onSubmitAnother` + the "Submit Another Request" button (requirements Q2 default). `ConciergeForm` wires `onDone={() => { reset(); onBackHome(); }}`; `ConciergeScreen` supplies `onSeeDirectory={() => router.push("/directory")}`.
- Card copy (site verbatim): kicker-less `displayM` **"We're on it."**; body **"We've received your request. Your Shmooze preferred partner will reach out to you shortly. Keep an eye on your phone and email."** (period, not em-dash).
- Partner block: heading `bodySemi` **"Prefer someone else?"** + body **"These are the Shmooze preferred partners for your project. One of them will be in contact with you shortly. Prefer to reach out now? Go right ahead."** above the existing partner row (logo, name, tel link). Keep `partner_call_button_clicked` tracking exactly.
- Below card: `Text` link `clay` **"See every certified pro in the directory"** (`accessibilityRole="link"`, minHeight 44) → `onSeeDirectory`; then `Button label="Done" variant="primary"` → `onDone`.
- `accessibilityLiveRegion="polite"` on the wrap stays.

## 5. Sequence — "Something else"
```
user taps "Something else" chip
  → TradePicker.isOther = true, RHF trade = ""
  → TextField(name="trade") mounts under chips, autofocus NO (keyboard jump avoided)
user types "Chimney sweep" → RHF trade = "Chimney sweep"
Next → stepOneSchema (min 1) passes → advance() → partial lead {trade:"Chimney sweep", zip, notes}
```
No change to `useConciergeForm`, `submitConcierge`, schema, or events.

## 6. Tests (requirement-driven)
**C1**
- `fields/__tests__/InputContainer.test.tsx` (NEW): rest border `line`; `focused` → `clay`; `error` → `error` + `PaddedErrorMessage` shown and `helperText` hidden; `helperText` shown when no error. (Mock `FloatingLabel` → plain Text: reanimated under jest.)
- `fields/__tests__/TextField.test.tsx` (NEW): typing updates RHF value; `helperText` passes through; label is the `accessibilityLabel`.
- `providers/__tests__/CategoryChips.test.tsx` (NEW): renders all categories; selected chip has `accessibilityState.selected`; press calls `onSelect(label)`.
- Existing: `useConciergeForm`, `submitConcierge`, `conciergeSchema`, swipe/wizard suites must stay green unchanged.

**C2**
- `lead-form/__tests__/ConciergeForm.test.tsx` (NEW; mock `useConciergeForm` like other screen tests): step-1 copy present; "Something else" → trade TextField appears and writes to `trade`; picking a chip after "Something else" hides it; step-2 copy + phone helper present; "See My Match" calls `submit`; success renders `PartnerReveal`.
- `lead-form/__tests__/PartnerReveal.test.tsx` (NEW; mock `providerRepository.fetchPinned`): site copy present; "Done" → `onDone`; directory link → `onSeeDirectory`; tel link tracks `partner_call_button_clicked` with `find_my_pro_completion`.
- `concierge/__tests__/ConciergeScreen.test.tsx` (NEW, light): kicker + header rendered; no `surface="legacy"` (AppHeader mocked, assert prop absent).
- `StepIndicator.test.tsx`: "Step 1 of 2" text + progressbar value.

## 7. Gates
`tsc` clean · full jest green · **lint pile must not grow** (currently 168 on main after #51; C1 removes the legacy nested ternary in `InputContainer`) · every new colour pair in §2 · simulator: Concierge tab reachable? **Not from code** (no tab-switch method — see memory); owner device pass for visuals; Home-tab hot-reload verifies nothing here. Plan on a **device/owner screenshot** step in the PR test plan.

## 8. Risks
| Risk | Mitigation |
|---|---|
| Primitive restyle makes swipe/wizard inputs look brand on Vanilla pages | Accepted (D5). White surface + warm hairline reads fine on both; noted in PR. |
| `FloatingLabel` under jest (reanimated v4 mock gaps) | Mock `FloatingLabel` in field tests; existing `MatchContactScreen` test already mocks `TextField` for this reason. |
| `isOther` state surviving step changes | Owned by `TradePicker` inside the `key="step-job"` View → dies on remount. |
| Dropping "Submit Another Request" breaks tab-preserved reset | `onDone` = `reset()` then navigate — the reset now happens on the only exit. |
| Directory chips get a new token (`label`) and `minHeight` | Visual only; Directory test asserts labels/press, not height. |

## 9. Files
**C1:** `src/theme/typography.ts` (+`label`), `components/ui/FloatingLabel.tsx`, `components/ui/PaddedErrorMessage.tsx`, `features/lead-form/fields/{InputContainer,TextField,BudgetSelect}.tsx`, `features/providers/CategoryChips.tsx`, + 3 new tests.
**C2:** `features/concierge/ConciergeScreen.tsx`, `features/lead-form/{ConciergeForm,PartnerReveal}.tsx`, NEW `features/lead-form/StepIndicator.tsx`, NEW `features/lead-form/TradePicker.tsx` (or inline in ConciergeForm if < 40 lines), + 4 new tests.

**Next:** `/sc:implement` C1, gate, then C2 on the same branch; one PR.
