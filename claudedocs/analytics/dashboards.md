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
Conversion rate scorecard (B/A, %) · Partial-lead abandonment ((A-B)/A weekly) ·
Post-submit call CTR (completion-screen partner calls / submissions).

### 3 · Contractor Growth (3 tiles)
Funnel portal_started → qualification_submitted · Qualification outcomes
(stacked bars by instant_qualification_response) · Portal entry points
(home_banner vs registry_footer).

### 4 · Registry Sync & Ops (3 tiles)
Sync success rate (sync_status=success / all, 7d scorecard) · Sync duration
(avg duration_ms by sync_source) · Records changed per day (sum
records_ingested by sync_source; 0 = unchanged directory, normal).

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
