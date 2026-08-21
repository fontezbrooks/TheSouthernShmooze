# PostHog Dashboards & Flags (P5 — built 2026-08-20)

Project: **The Southern Shmooze** / "Default project" (id 418261, us.posthog.com).
All four dashboards pinned, tagged `shmooze`, each led by an objective text tile.

## Dashboards

| Dashboard | ID | Link |
|---|---|---|
| Shmooze · Homeowner Acquisition & Discovery | 2016601 | https://us.posthog.com/project/418261/dashboard/2016601 |
| Shmooze · Find My Pro Funnel | 2016602 | https://us.posthog.com/project/418261/dashboard/2016602 |
| Shmooze · Contractor Growth | 2016603 | https://us.posthog.com/project/418261/dashboard/2016603 |
| Shmooze · Registry Sync & Ops | 2016604 | https://us.posthog.com/project/418261/dashboard/2016604 |

### 1 · Homeowner Acquisition & Discovery (8 tiles)
Active devices (7d, BoldNumber) · App opens (7d) · Registry searches (weekly) ·
Search empty-state rate (A/B formula, %) · Swipes per session (A/B) ·
Screen paths ($screen) · Weekly retention (Application Opened, first-time,
8 intervals) · User lifecycle (weekly).

### 2 · Find My Pro Funnel (4 tiles)
Funnel initiated → step_1_completed → submitted (14d window) ·
Concierge conversion (cohort funnel initiated → submitted, 14d window — not an event-count ratio) · Step-2 completion per PERSON (funnel
conversion over time, 14d window — abandonment approximated by its complement;
person-level because the events carry no shared request id yet — emitting a
request_key on step-1 + submitted and aggregating by it is a backlog item) ·
Post-submit call-through (cohort funnel submitted → completion-screen call
within 7 days — cohort-based, cannot exceed 100% or straddle range boundaries).

### 3 · Contractor Growth (3 tiles)
Funnel portal_started → qualification_submitted · Qualification outcomes
(stacked bars by instant_qualification_response) · Portal entry points
(home_banner vs registry_footer).

### 4 · Registry Sync & Ops (4 tiles)
Sync success rate of REPORTED runs (sync_status=success / all, 7d scorecard —
blind to runs that never report) · Runs reported per day (count vs the cron
cadence: ~144/day directory + ~288/day profiles; a shortfall means runs went
UNREPORTED — scheduler/dispatch failures (pg_cron disabled or pg_net error:
NO invocation exists, so function logs show nothing — check
cron.job_run_details / net._http_response), pre-capture 401s (both handlers
reject a missing/mismatched cron secret BEFORE capture runs), crashed/killed
invocations, or telemetry-delivery failures, since capture swallows
HTTP/network errors, its 2s timeout, and missing env by design) · Sync duration
(avg duration_ms by sync_source) · Sync throughput per day (sum
records_ingested by sync_source — semantics differ: sync-directory counts rows
actually added/updated (0 = unchanged directory, normal); sync-profiles counts
profiles REFRESHED on the staleness schedule, including unchanged content).

## Client dashboard — "Shmooze App Live Analytics" (built 2026-08-21)

Public, client-facing "greatest hits" dashboard. Spec: `client-dashboard-requirements.md`
(rev 2, D1–D9) and `client-dashboard-design.md` (rev 1).

| Dashboard | ID | Internal link | Public link |
|---|---|---|---|
| Shmooze App Live Analytics | 2017487 | https://us.posthog.com/project/418261/dashboard/2017487 | _pending — owner enables Share (see below)_ |

Pinned, tagged `shmooze` + `client`. Dashboard-level date override **Last 30 days**
(viewers of a shared dashboard cannot change date range or filters). Every insight
tile is an independent **`Client ·` copy** (tagged `client`) of an internal insight —
edits to internal insights do NOT propagate; mirror deliberately using this map.

| # | Client tile (short_id) | Copied from (internal short_id) | Delta vs source |
|---|---|---|---|
| I1 | Client · Active devices (30 days) `PpycoPH5` | hFJSp6Lj | 7d → 30d |
| I2 | Client · App opens (30 days) `O7YLqKAf` | G1bsRj6r | 7d → 30d |
| I3 | Client · Find My Pro journey `Xe5QT9mC` | MOLEjqgY | — |
| I4 | Client · Request completion rate `3iAICF1b` | UkEYVpXc | — |
| I5 | Client · Step 2 → submitted, week by week `9dxacup2` | ARnCyBmH | 8w → 30d |
| I6 | Client · Called a pro after submitting `Hjg3iyLb` | VSt4C2d8 | — |
| I7 | Client · Contractor sign-up journey `NNMU52ji` | dmtMfVpR | — |
| I8 | Client · Where contractors start `qY1po3kJ` | 9MZpXUeo | 8w → 30d |
| I9 | Client · Qualification outcomes `NtoOqbET` | 6rfvukxy | 8w → 30d |
| I10 | Client · Swipes per session `w920oSGN` | YxfEZpzE | 8w → 30d |
| I11 | Client · Weekly return rate `exaqzSOb` | HnVrrMdF | — |
| I12 | Client · Screen journeys `ArBK3q11` | JvF6XUdp | — |
| I13 | Client · Registry refreshes (30 days) `x9CNl8JL` | new (derived from 9bYTRJ1d) | BoldNumber count, no breakdown |

Six markdown text tiles (lead + one heading per section) carry plain-English copy:
At a glance → Homeowners: Find My Pro → Contractors → Engagement → Always-fresh
directory. Layout: two-column 6×5 insight tiles (MCP reorder cannot set per-tile
widths; widen I9/I12 in the UI if desired).

**Enable the public link (owner, one-time):** open the dashboard → `…` → *Share or
embed* → toggle *Share dashboard publicly* → *Copy public link*; paste the link into
the table above. (The `phx_` API key lacks `sharing_configuration:write`, so this
could not be done from the MCP/REST build.)

**Release checklist (before sharing beyond the owner):**
- [ ] Define project test accounts: `$app_namespace = host.exp.Exponent` OR
      `$device_name` contains "Simulator" (Settings → Project → *Filter out internal
      and test users*).
- [ ] Set `filterTestAccounts: true` on all 13 `Client ·` copies (insight-update).
- [ ] Re-open the public link; confirm scorecards drop simulator traffic.
- [ ] Optional: mirror the filter on the 19 internal `Shmooze ·` insights.

## Feature flags

| Key | ID | State | Purpose |
|---|---|---|---|
| `at-launch-l1-l5` | 835199 | **OFF**, 100% when enabled | Gates L1 certified tiers + L2–L5 site-parity UI; the at-launch round flips it when the site goes live. Read in-app via `useFlag("at-launch-l1-l5") === true`. |

## Notes

- `registry_sync_completed` verified arriving in production 2026-08-20 (~21:50Z)
  with sync_status / sync_source / duration_ms / records_ingested — P4 loop closed.
- Client events verified from the owner's 2026-08-20 device pass; events not yet
  seen (searches, submissions, portal, calls) populate their tiles as data arrives.
- Empty-state-rate and success-rate tiles read 100%/0% oddly until their events
  have volume — formulas over zero denominators render as no data.
