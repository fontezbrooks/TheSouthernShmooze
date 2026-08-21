# Client "Greatest Hits" Dashboard — Requirements (rev 2, READY FOR /sc:design)

Brainstorm 2026-08-20. Rev 1 questions Q1–Q9 answered same day by owner; decisions
D1–D9 below supersede the open-question list. Next step: `/sc:design` (tile
selection, copy, layout, duplication plan), then build via PostHog MCP.

## 1. Goal (clarified)

One PostHog dashboard, **"Shmooze App Live Analytics"**, shared by public link with
the Shmooze owner (and, later, whoever they forward it to), that shows in under a
minute that the app's analytics capture real homeowner and contractor behaviour —
"here is what people do, where they drop, what it means." A communication artifact
for non-PostHog readers, not an operator tool.

## 2. Ground truths that shape the spec

| Fact (verified) | Consequence |
|---|---|
| Public share link = anyone with the link, no login, revocable per dashboard ([docs](https://posthog.com/docs/product-analytics/sharing)). | No PII may be visible; link treated as semi-public (D2: forwarding expected). |
| Viewers of a shared dashboard **cannot change date range or filters** — rendering is static. | Dashboard carries its own date-range override (D5: last 30 days) and must read cold. |
| One insight can sit on many dashboards; edits propagate everywhere. | Owner chose **duplicated client-facing insights** (D6) so the client view is decoupled from the internal dashboards. |
| Text tiles render markdown on shared dashboards. | Narrative copy is the main "value" lever. |
| As of 2026-08-20 all client events came from the simulator device pass; real traffic starts after the next production EAS build. | Share NOW (D7) with an explicit lead note that live data begins with the launch build. |
| No test-account filter defined in project 418261; no insight sets `filterTestAccounts`. PostHog branding cannot be hidden on the free plan (D4). | Test traffic stays visible for now (D6, owner validating); release checklist item to filter it. Branding accepted. |

## 3. Decisions (owner, 2026-08-20)

- **D1 Name:** "Shmooze App Live Analytics".
- **D2 Audience:** owner first; expect forwarding to investors/partners → copy is
  conservative, plain-English, no internal ops detail beyond one trust line.
- **D3 Funnels:** all five — Find My Pro funnel, Concierge conversion, Step-2
  completion, Post-submit call-through (7d window), Contractor funnel.
- **D4 Branding:** PostHog branding stays (free plan).
- **D5 Date window:** dashboard-level override = Last 30 days.
- **D6 Test traffic / insight ownership:** create **duplicate client-facing
  insights** (own copies, decoupled from the 19 internal `Shmooze ·` insights).
  **No test-account filter applied now** — owner needs simulator/internal traffic
  visible to validate the dashboard reads well. **Release checklist item:** define
  project test accounts (`$app_namespace = host.exp.Exponent`, `$device_name`
  contains "Simulator") and enable `filterTestAccounts` on every client copy.
  *(Interpretation flagged: owner's answer named "duplicate with the filter" and
  "fine for now" — read as duplicate-now, filter-at-release. Correct if wrong.)*
- **D7 Publish gate:** share immediately; lead text tile states data begins with
  the production launch build.
- **D8 Ops tile:** include exactly one registry-freshness trust signal (e.g.
  "directory refreshed ~144×/day, profiles ~288×/day" — form decided in design).
- **D9 Engagement extras:** retention + screen paths + swipes included from day one.

## 4. Tile inventory (sources to duplicate, by internal short_id)

| Section | Source insights | Count |
|---|---|---|
| Headline numbers | hFJSp6Lj Active devices (7d) · G1bsRj6r App opens (7d) | 2 |
| Homeowner · Find My Pro journey | MOLEjqgY funnel · UkEYVpXc conversion · ARnCyBmH step-2 · VSt4C2d8 call-through | 4 |
| Contractor journey | dmtMfVpR funnel · 6rfvukxy outcomes · 9MZpXUeo entry points | 3 |
| Engagement | YxfEZpzE swipes/session · HnVrrMdF retention · JvF6XUdp screen paths | 3 |
| Trust signal (ops) | one derived from 9bYTRJ1d Runs reported per day | 1 |
| **Insight tiles** | | **13** |
| Text tiles | lead + one per section | 6 |

D3 + D9 push the tile count past rev-1's ≤10 cap; **cap revised to ≤ 14 insight
tiles** (FR8). Design may trim `6rfvukxy`/`9MZpXUeo` if the page reads long.
Out of scope on the client page: registry searches volume, empty-state rate,
lifecycle, sync duration/throughput/success-rate.

## 5. Functional requirements

- **FR1** One new dashboard "Shmooze App Live Analytics", pinned, tagged `shmooze`
  + `client`.
- **FR2** Every insight tile is a **client copy** (name prefix proposal
  `Client ·`, tagged `client`), duplicated from the internal source with identical
  query; internal dashboards untouched.
- **FR3** Narrative: lead text tile (what this is, data starts at launch build,
  30-day window) + one plain-English text tile per section. No analyst jargon.
- **FR4** Section order: Headline → Find My Pro journey → Contractor journey →
  Engagement → Trust signal.
- **FR5** Dashboard-level date-range override = Last 30 days (viewers can't change).
- **FR6** Public sharing ON at build time; link + dashboard id + client insight
  ids recorded in `claudedocs/analytics/dashboards.md`.
- **FR7** No test-account filter now; release checklist entry in `dashboards.md`
  (define test accounts → enable `filterTestAccounts` on all `Client ·` copies).
- **FR8** ≤ 14 insight tiles, ≤ 6 text tiles.
- **FR9** One ops trust tile, worded for outsiders; no other ops content.

## 6. Non-functional requirements

- **NFR1 Privacy:** aggregates only; no person lists, emails, free text, or
  internal ids in copy. Link revocable in one click.
- **NFR2 Honesty:** each section caption states what the number means and its
  one-sentence caveat (conversion windows, "reported runs").
- **NFR3 Zero new instrumentation:** all tiles use the shipped taxonomy.
- **NFR4 Maintainability:** client copies are independent — any future change to
  an internal insight must be mirrored deliberately; `dashboards.md` carries the
  source→copy mapping.
- **NFR5 Repo record:** all ids, link, copy, and release checklist committed via
  branch + PR (workflow directive; no session info in PR body).

## 7. Acceptance criteria

- AC1 Dashboard exists, pinned, tagged; 13 (±1) client-copy insight tiles + text
  tiles in the FR4 order; date override = Last 30 days.
- AC2 Public link opens logged-out, every tile renders (empty-state acceptable
  until launch build, explained by lead text), no errors.
- AC3 No person-identifying data or internal jargon on the shared page.
- AC4 Internal dashboards 2016601–2016604 unchanged (tile count + insight ids).
- AC5 `dashboards.md` updated with link, ids, source→copy map, release checklist;
  PR merged.

## 8. Out of scope (this round)

Embedded analytics / custom page, new events (`request_key` etc.), per-client
auth, email subscriptions, test-account filtering (deferred to release checklist).
