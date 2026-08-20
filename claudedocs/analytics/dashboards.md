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
UNREPORTED — crashed/killed invocations, pre-capture 401s (both handlers
reject a missing/mismatched cron secret BEFORE capture runs), or
telemetry-delivery failures, since capture swallows HTTP/network errors, its
2s timeout, and missing env by design; Supabase function logs identify the
failure domain) · Sync duration
(avg duration_ms by sync_source) · Sync throughput per day (sum
records_ingested by sync_source — semantics differ: sync-directory counts rows
actually added/updated (0 = unchanged directory, normal); sync-profiles counts
profiles REFRESHED on the staleness schedule, including unchanged content).

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
