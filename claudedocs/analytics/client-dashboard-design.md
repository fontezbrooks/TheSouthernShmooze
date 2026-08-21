# "Shmooze App Live Analytics" — Design (rev 1)

Implements `client-dashboard-requirements.md` rev 2 (D1–D9). Build target:
PostHog project 418261 via MCP. Status: READY FOR BUILD on owner approval.

## 1. Architecture in one paragraph

One new dashboard. Every insight tile is a **fresh `Client ·` insight** created with
`insight-create` using the source insight's query verbatim (date range normalised
to 30 days where the source used 7d/8w/14d), `dashboards: [<new id>]`, tag
`client`. Six markdown text tiles carry the narrative. A dashboard-level
`filters.date_from = "-30d"` override makes every tile agree on the window (viewers
cannot change it). Public sharing is enabled last. Internal dashboards
2016601–2016604 and their 19 insights are never touched (AC4).

## 2. Tile plan (order = page order; grid 12 cols, `layouts.sm`)

| # | Tile | Kind | Source → Client copy | Query delta vs source | Size (w×h) |
|---|---|---|---|---|---|
| T0 | Lead text | text | — | — | 12×2 |
| T1 | "At a glance" heading | text | — | — | 12×1 |
| I1 | Client · Active devices (30 days) | BoldNumber, `dau` of `Application Opened` | hFJSp6Lj | `date_from -7d → -30d` | 6×3 |
| I2 | Client · App opens (30 days) | BoldNumber, total `Application Opened` | G1bsRj6r | `-7d → -30d` | 6×3 |
| T2 | "Homeowners: Find My Pro" heading | text | — | — | 12×1 |
| I3 | Client · Find My Pro journey | Funnel steps ×3 | MOLEjqgY | none (-30d, 14d window) | 6×5 |
| I4 | Client · Request completion rate | Funnel steps ×2 | UkEYVpXc | none | 6×5 |
| I5 | Client · Step 2 → submitted, week by week | Funnel trends | ARnCyBmH | `-8w → -30d` | 6×5 |
| I6 | Client · Called a pro after submitting | Funnel steps ×2 (7d window) | VSt4C2d8 | none | 6×5 |
| T3 | "Contractors" heading | text | — | — | 12×1 |
| I7 | Client · Contractor sign-up journey | Funnel steps ×2 | dmtMfVpR | none | 6×5 |
| I8 | Client · Where contractors start | Bar by `entry_point` | 9MZpXUeo | `-8w → -30d` | 6×5 |
| I9 | Client · Qualification outcomes | Stacked bar by `instant_qualification_response` | 6rfvukxy | `-8w → -30d` | 12×4 |
| T4 | "Engagement" heading | text | — | — | 12×1 |
| I10 | Client · Swipes per session | Line, formula A/B | YxfEZpzE | `-8w → -30d` | 6×5 |
| I11 | Client · Weekly return rate | Retention (first-time, weekly) | HnVrrMdF | none (override clips to ~4 cohorts) | 6×5 |
| I12 | Client · Screen journeys | Paths on `$screen` | JvF6XUdp | none (-30d) | 12×6 |
| T5 | "Always-fresh directory" heading | text | — | — | 12×1 |
| I13 | Client · Registry refreshes (30 days) | **new** BoldNumber: total `registry_sync_completed`, -30d | derived from 9bYTRJ1d | new query (count, no breakdown) | 6×3 |

13 insight tiles + 6 text tiles → within FR8 (≤14 / ≤6). Internal short_ids are the
duplication map for `dashboards.md` (NFR4).

Why rename: "(7d)" scorecards would lie under a 30-day override, and internal
names ("cohort", "per person", "reported runs") violate D2 plain-English copy.
Descriptions on every copy are rewritten for outsiders (one sentence + caveat).

## 3. Text tile copy (final wording, markdown)

**T0 lead**
```
## Shmooze App Live Analytics
What people actually do inside the Shmooze app — homeowners finding a pro,
contractors signing up, and how often they come back. Every number below covers the
**last 30 days** and updates automatically.

_Live data begins with the production launch build; earlier traffic is internal
testing. Figures are aggregated — no individual user is identifiable here._
```
**T1** `### At a glance` — *Devices that opened the app and total opens, last 30 days.*
**T2** `### Homeowners: Find My Pro` — *Each step of the request flow: started → gave us the basics → submitted. "Completion rate" counts a person who submits within 14 days of starting; "called a pro" counts a tap on a pro's phone number within 7 days of submitting.*
**T3** `### Contractors` — *Contractors who open the sign-up portal and finish the qualification form, where they entered from, and how their applications were classified.*
**T4** `### Engagement` — *How deep people go (card swipes per visit), whether they return week after week, and the screens they move between.*
**T5** `### Always-fresh directory` — *The provider directory re-checks itself around the clock (~144 directory and ~288 profile refreshes per day). This counts completed refreshes in the last 30 days — a steady number means listings stay current.*

## 4. Query specs for non-trivial deltas

- I1/I2: source `TrendsQuery`, `dateRange.date_from` `"-30d"`, `display: BoldNumber`, `interval: day`.
- I5: source `FunnelsQuery` funnelVizType `trends`, `dateRange.date_from "-30d"`, keep `interval: week`, window 14d.
- I8/I9/I10: `dateRange.date_from "-30d"`, keep `interval: week` and breakdown/formula.
- I13 (new):
  ```json
  {"kind":"InsightVizNode","source":{"kind":"TrendsQuery","version":4,
   "series":[{"kind":"EventsNode","math":"total","name":"refreshes","event":"registry_sync_completed"}],
   "interval":"day","dateRange":{"date_from":"-30d"},
   "trendsFilter":{"display":"BoldNumber","aggregationAxisFormat":"numeric"},
   "filterTestAccounts":false}}
  ```
- All copies: `filterTestAccounts: false` (D6 — release checklist flips to true).

## 5. Build sequence (MCP unless noted)

1. `dashboard-create` → name "Shmooze App Live Analytics", description, `pinned: true`,
   `tags: ["shmooze","client"]`, `restriction_level: 21`. Capture `<DID>`.
2. `insight-create` ×13 → `name`, `description`, `tags: ["client"]`,
   `dashboards: [<DID>]`, query per §2/§4. Capture each `short_id`/`id`.
3. `dashboard-create-text-tile` ×6 with explicit `layouts.sm` per §2 rows.
4. `dashboard-reorder-tiles` (or `dashboards-move-tile-partial-update`) to place the
   13 insight tiles at the §2 coordinates (insight tiles land with default layout).
5. `dashboard-update` → `filters: {"date_from": "-30d"}`.
6. Public sharing — no MCP tool. REST:
   `PATCH https://us.posthog.com/api/projects/418261/dashboards/<DID>/sharing/`
   body `{"enabled": true}`, bearer = `POSTHOG_API_KEY` from `.env` (phx_, never
   printed). Response `access_token` → public URL
   `https://us.posthog.com/shared/<access_token>`. Fallback: UI "Share" toggle.
7. Verify: `dashboard-get <DID>` (19 tiles, `is_shared: true`, filters -30d);
   open share URL logged-out; `dashboard-get 2016601..04` tile counts unchanged.
8. Repo: update `claudedocs/analytics/dashboards.md` — new section with dashboard
   id, share URL, source→copy map (short_ids), release checklist (§6); branch
   `docs/client-dashboard` → PR (no session info in body).

## 6. Release checklist (recorded in dashboards.md)

- [ ] Define project test accounts: `$app_namespace = host.exp.Exponent` OR
      `$device_name` icontains "Simulator" (Settings → Project → Filter out internal
      and test users).
- [ ] `insight-update` each `Client ·` copy → `filterTestAccounts: true`.
- [ ] Re-open share link; confirm scorecards drop simulator traffic.
- [ ] Optional: mirror the filter on the 19 internal insights.

## 7. Risks / caveats

- Dashboard date override also clips Retention/Paths; accepted (D5) — retention
  shows ~4 weekly cohorts until traffic ages.
- Funnel tiles will read 0 / empty until the launch build ships; T0 explains.
- Client copies drift from internal insights by design (NFR4); `dashboards.md`
  map is the only link. Any taxonomy change must be applied twice.
- Sharing REST call depends on the `phx_` key's scopes; if 403, do the UI toggle.
- PostHog branding visible (D4, free plan).

## 8. Acceptance mapping

AC1 ← §2 + step 1/5 · AC2 ← step 6/7 · AC3 ← §3 copy + aggregate-only queries ·
AC4 ← step 7 · AC5 ← step 8.
