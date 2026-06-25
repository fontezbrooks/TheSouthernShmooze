# The Southern Shmooze — Mobile App MVP Requirements

> Requirements specification produced via `/sc:brainstorm`. Scope: a near‑1:1 native
> Expo React Native replica of https://www.shmoozeatl.com/, centered on the homeowner
> lead form. **Requirements only** — architecture/implementation come next
> (`/sc:design`, `/sc:workflow`).

**Stack:** Expo (React Native, native — **not** PWA) · Bun · iOS + Android · Supabase · `@shopify/react-native-skia`
**Generated:** 2026-06-24

---

## 1. Goal

Build the mobile app version of The Southern Shmooze — an Atlanta community connecting
homeowners with trusted local service businesses. Replicate the website's landing
experience as closely as possible, with the "Let's Plan Something Awesome" lead form
as the functional centerpiece.

## 2. Design Source of Truth

| Asset | Use |
|---|---|
| `design-extract-output/` (designlang) | **Primary** tokens — type scale, motion, gradients, Figma vars, responsive screenshots, `designlang` skill |
| `assets/` | **Brand assets** — `background.png` (daisy pattern), logo, favicon, photos |
| `design-extract-output/screenshots/` (+ `responsive/`) | Visual reference — light·dark × mobile·tablet·desktop·wide |
| `output/shmoozeatl.com/` (Dembrandt) | Secondary cross-check — brand-guide PDF |
| **Live site DOM** | **Authoritative** for form fields and background behavior |

**Branding rule:** reuse site branding by default everywhere (1:1 replication).

Reconciliation (designlang + live site win conflicts):
- **Palette:** background/cream `#e1ded4`, foreground/black `#000000`, secondary blue
  `#0099dd`, accent orange `#f1694f`; neutrals `#333333 #ffffff #efece6 #bbbbbb`.
  (Dembrandt's `#000000` "primary" = buttons/text, not the page background.)
- **Type:** Shrikhand (display/headline), Bitter (serif body), Roboto (UI) — Google Fonts via `@expo-google-fonts`.
- **Radii:** pill buttons (`full`/300px), small input radius. **Motion durations:** 75ms–1s.

## 3. Platforms & Stack
- Expo (React Native), package manager **Bun**, **native app (not PWA)**.
- Targets: **iOS and Android** from day one.
- Backend: **Supabase** — Postgres (`leads`) + Storage (file uploads).
- Animated background overlay: **`@shopify/react-native-skia`**.

---

## 4. Functional Requirements

### FR-1 — Landing screen (full 1:1 replica)
Top-to-bottom:
- **Animated daisy background** (FR-4) behind the hero.
- **Header / nav:** logo + **Membership · Directory · Resources**, social icons, "Browse Directory" button.
- **Hero:** circular "Southern Shmooze" logo badge + headline _"Atlanta's Community for Finding Trusted Local Businesses."_
- **Intro block:** "Welcome to The Southern Shmooze" + "Need a painter, plumber, roofer…" line.
- **Three cards:** 1) Ask the Community, 2) Browse the Directory, 3) Let Us Help (contact form below).
- **Lead form section** (FR-2), then **footer** (© line).

### FR-2 — Lead form "Let's Plan Something Awesome" (centerpiece)
Replicate exactly:

| # | Field | Control | Required |
|---|-------|---------|----------|
| 1 | First Name | text | ✅ |
| 2 | Last Name | text | ✅ |
| 3 | Email | email | ✅ |
| 4 | Phone | tel | ✅ |
| 5 | Address | text | ✅ |
| 6 | Budget | **multi-select checkboxes**: `< $1000` / `$1000 – $5000` / `> $5000` | optional |
| 7 | Project start date | date picker | optional |
| 8 | Project Details | multiline textarea | ✅ |
| 9 | File Upload | file/image picker — **any type** | optional |
| — | _honeypot_ | hidden spam trap | — |

Submit button label: **"Submit"**.

### FR-3 — Submission & validation
- Schema validation (Zod) on all required fields with clear inline errors.
- **Persist to Supabase only** (Postgres + Storage). Loading / success / error states (site currently has none — we add them).
- **Out of scope:** matching the owners' real lead-notification flow — revisit with site owners after the prototype.

### FR-4 — Animated background (two layers)
- **Base (static):** `assets/background.png` daisy/confetti pattern.
- **Overlay (moving):** Squarespace **"Generative Background Art"** — `BackgroundIsometric`, `type: "isometric"`, morphing 2D field. Recreate with a **Skia generative shader** from captured config:
  `speed 12, noiseScale 77, noiseRange 69, lightIntensity 84, light(-42,58,11), scale(76,39,95), morph on, overlayOpacity 0.2, colors lightAccent→accent (cream→orange)`.
- **Omit the on-screen pause button**; **auto-pause when OS reduce-motion is enabled.**

---

## 5. Non-Functional Requirements
- **Visual fidelity:** near-1:1 across phone sizes; verify against responsive screenshots.
- **Accessibility:** labeled inputs, sufficient contrast, reduce-motion fallback, sensible keyboard/return flow.
- **Performance:** Skia overlay at 60fps; optimized background assets.
- **Code quality:** immutable patterns, small focused files (<800 lines), comprehensive error handling, no hardcoded secrets, schema validation at boundaries.
- **Testing:** unit (validation/logic) + integration (submission) + E2E (form happy path); target 80%+ coverage.
- **Resilience:** graceful submit-failure handling with retry.

## 6. Backend (Supabase)
- `leads` table mirroring FR-2 fields + status + timestamp.
- Storage bucket for uploads (any type; sane size cap).
- RLS enabled; secrets via env vars only.

## 7. Out of Scope (MVP)
Business/Neighborhood Directory browsing · Account Login · Membership signup/payments ·
Deals · Newsletter · Podcast · FAQ · Testimonials · real lead-notification flow.
Nav items render but route to placeholders or the live site.

## 8. Acceptance Criteria
- Landing screen visually matches the live site on iOS + Android; daisy base + morphing isometric overlay animate at 60fps; overlay halts under reduce-motion.
- All 11 form fields present and behaving as on the site; required-field validation blocks submit with inline errors.
- Valid submission writes a row to Supabase `leads` and uploads any attached file to Storage; user sees a success state; failures surface a retryable error.

## 9. Remaining Open Items (non-blocking)
- App identity: app name, icon, splash (default: reuse site branding/favicon/logo).
- File-size cap for uploads (suggested default 10–25 MB).
- Nav placeholder behavior: in-app browser to live site vs. "coming soon" (suggest in-app browser).

## 10. Next Step
Run `/sc:design` for architecture (navigation, form/state, Skia overlay shader uniforms,
Supabase schema/storage), or `/sc:workflow` for the implementation plan.
