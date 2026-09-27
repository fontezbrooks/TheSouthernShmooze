# Lead email routing — requirements

Round opened 2026-09-26 via `/sc:brainstorm`. Status: **requirements FINAL 2026-09-26, ready for `/sc:implement`.**

## Goal

Every lead email the app generates lands in the Shmooze owner's official
inbox, `hello@thesouthernshmooze.com`, with a BCC copy to the developer
(`hi@appdaddystudios.com`). Zero app rebuild, zero OTA update, zero store
resubmission. Change is entirely server-side.

## Current state (verified in code + live secrets, 2026-09-26)

| Flow | Trigger | Sender | Recipient today |
|---|---|---|---|
| Concierge lead | DB insert → pg_net → `notify-lead` (`0015`) | Resend | `hi@appdaddystudios.com` (hardcoded fallback) |
| Shmoozer swipe lead | DB insert → pg_net → `notify-swipe-lead` (`0016/0017`) | Resend | same |
| Contractor application | app → `contractor-wizard` → site's Cloudflare Worker `shmooze-worker.jonah-eda.workers.dev` | worker (opaque) | unknown; worker is owned by the site builder, not us |

- Recipient = `LEAD_NOTIFY_TO`, sender = `LEAD_NOTIFY_FROM`. **Neither secret is
  set** in project `udbvtigwvhvxszimqlgj`. Defaults are live:
  `notify-lead/index.ts:28-29`, `notify-swipe-lead/index.ts:19-20`.
- Live sender is therefore still `onboarding@resend.dev` (Resend sandbox,
  delivers only to the Resend account owner). **`appdaddystudios.com` is
  verified in Resend** (owner-confirmed) but nothing uses it yet.
- `reply_to` is already the seeker's address in both functions.
- Both functions send to a single address (`to: [to]`); no BCC support.
- Recipient/sender resolution is duplicated across the two functions.
- Worker source is unavailable; Cloudflare access is a non-starter (owner).
  `contractor-wizard` does receive the full application payload
  (`wizardApi.ts:264 buildApplicationPayload`) before proxying it, so we can
  notify from there without touching the worker.
- Existing edge tests: `_shared/__tests__/{lead-email,swipe-email,posthog-capture}.test.ts`.

## Decisions (owner, 2026-09-26)

- **D1** Recipient is one fixed inbox: `hello@thesouthernshmooze.com`
  (confirmed real and live, client's official address).
- **D2** All three flows in scope.
- **D3** Approach = edge-function edit + `supabase functions deploy` + secrets
  (option 2). Not inbox forwarding, not Resend automations.
- **D4** No app rebuild.
- **D5** Sending domain = `appdaddystudios.com`, already verified in Resend.
- **D6** BCC `hi@appdaddystudios.com` on every lead email. Permanent unless
  owner later unsets the secret.
- **D7** Cloudflare Worker is out of reach. Contractor notifications are sent
  by our `contractor-wizard` edge function instead (R7), behind a secret
  toggle because we cannot see whether the worker already emails the client.

## Bedrock constraints

1. Resend sandbox sender only reaches the account owner. Cutover requires
   `LEAD_NOTIFY_FROM` on the verified domain.
2. Edge functions read `Deno.env` per request; secret changes apply without
   redeploy. Code changes need `supabase functions deploy <name>`.
3. Nothing in `app.config.ts`, `eas.json`, `package.json`, `bun.lock` may
   change, or the fingerprint runtime version moves.
4. The worker is a black box. Anything we cannot observe becomes a runtime
   switch, not a code assumption.

## Functional requirements

- **R1 Sender.** `LEAD_NOTIFY_FROM` = `The Southern Shmooze <shmooze@appdaddystudios.com>`
  (exact local part is owner's call; must be on the verified domain).
- **R2 Recipients.** `LEAD_NOTIFY_TO` accepts a comma-separated list, sent as
  an array. `LEAD_NOTIFY_BCC` optional, same format, sent as Resend `bcc`.
- **R3 No silent personal fallback.** Remove hardcoded
  `hi@appdaddystudios.com` and `onboarding@resend.dev` defaults. If
  `LEAD_NOTIFY_TO` or `LEAD_NOTIFY_FROM` is unset: `console.error` + 500.
- **R4 Shared helper.** One `_shared/notify-config.ts` (or similar) resolves
  from/to/bcc and is used by all three senders.
- **R5 Reply-to unchanged.** Seeker's address stays in `reply_to` for
  concierge and swipe; applicant's email for contractor.
- **R6 Secrets.**
  `LEAD_NOTIFY_TO=hello@thesouthernshmooze.com`,
  `LEAD_NOTIFY_FROM=<R1>`,
  `LEAD_NOTIFY_BCC=hi@appdaddystudios.com`.
- **R7 Contractor notification.** On `action: "submit"` and a 2xx from the
  worker, `contractor-wizard` sends a Resend email (new
  `_shared/contractor-email.ts` builder) to the same recipients. Gated by
  `CONTRACTOR_NOTIFY=1`; when unset, behaviour is exactly today's proxy.
  Email failure never changes the response to the app (proxy result wins).
  Toggle exists because the worker may already email the client; duplicate
  vs. none is the client's call after they check their inbox. Migration 0022
  rate-limits sends to 30/hour globally and 3/day per applicant; notification
  fails closed when the limiter is unavailable.
- **R8 Docs.** Header comments in all three functions list the secrets.
  Privacy label and Play Data safety stay valid: recipient is still the app
  operator's inbox, BCC is the developer already named as a processor.

## Non-functional

- No change to app bundle, native config, or fingerprint.
- Failure stays non-blocking: Resend errors never fail the DB insert or the
  contractor submit.
- Deliverability: From on the verified domain (DKIM-aligned). Owner reports
  the domain plumbing works; no further DNS work in scope.
- Rollback = `supabase secrets set LEAD_NOTIFY_TO=hi@appdaddystudios.com`;
  no deploy. R7 rollback = unset `CONTRACTOR_NOTIFY`.

## Acceptance criteria

- **AC1** Concierge form submission → email at `hello@thesouthernshmooze.com`
  within a minute, BCC at developer inbox, From on `appdaddystudios.com`,
  Reply-To = seeker.
- **AC2** Swipe match lead → same.
- **AC3** Contractor application with `CONTRACTOR_NOTIFY=1` → same, Reply-To =
  applicant; with it unset → no email, response unchanged. Replaying the same
  accepted payload 4× in a day yields 3 emails; the 4th is logged as
  rate-limited and the app still gets the worker's 2xx.
- **AC4** `git diff main -- app.config.ts eas.json package.json bun.lock` empty;
  `npx expo-updates fingerprint:generate --platform ios` unchanged.
- **AC5** Resend dashboard shows each test as Delivered, not bounced/rejected.
- **AC6** grep for `appdaddystudios` and `resend.dev` in `supabase/functions`
  returns only comments, no runtime defaults.
- **AC7** Existing `_shared/__tests__` pass. New tests cover: recipient parsing
  (single, list, whitespace, empty → error), missing-secret error path,
  contractor email builder, contractor toggle off = no send.

## Resolved questions

- Q1 BCC → yes, permanent (D6).
- Q2 Worker access → none; R7 replaces it.
- Q3 Domain → `appdaddystudios.com`, verified.
- Q4 Client inbox → real and live.
- Q5 DMARC → owner reports plumbing works; not in scope.

## Remaining owner input (non-blocking, can land after code)

- Exact From local part for R1 (`shmooze@`, `leads@`, …).
- After rollout, client checks whether contractor applications arrive once or
  twice; set/unset `CONTRACTOR_NOTIFY` accordingly.

## Rollout (no build)

1. Merge edge-function PR;
   `supabase db push` (applies migration 0022).
2. `supabase functions deploy notify-lead notify-swipe-lead contractor-wizard`.
3. `supabase secrets set LEAD_NOTIFY_TO=... LEAD_NOTIFY_FROM=... LEAD_NOTIFY_BCC=...`.
4. One real submission for concierge + swipe; confirm AC1/AC2/AC5.
5. Ask client whether site/app contractor applications already reach them.
   Set `CONTRACTOR_NOTIFY=1` if not; test AC3.

Related: `claudedocs/google-play-launch/data-safety-answers.md` §"Shared".
