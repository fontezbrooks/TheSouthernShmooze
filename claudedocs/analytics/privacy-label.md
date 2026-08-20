# App Store Privacy Label — The Southern Shmooze (draft, P3)

Draft answers for App Store Connect › App Privacy. Reflects the shipped
analytics as of P3 (PRs #42–#43 + identify epic). Re-review before submitting
whenever a new event or person property lands.

## Data Used to Track You

**NONE.**

- All analytics are first-party (our own PostHog project, no ad networks, no
  data brokers, no cross-app/cross-site linkage).
- Therefore NO App Tracking Transparency prompt is required — "tracking" in
  Apple's definition means linking with THIRD-party data for advertising or
  sharing with brokers. First-party identify with a form-typed email is not
  tracking.

## Data Linked to You

| Category | Data type | Collected where | Purposes |
|---|---|---|---|
| Contact Info | Email Address | Contractor wizard submit; Find-My-Pro step 2 | App Functionality, Analytics |
| Identifiers | User ID (PostHog distinct id = email; anonymous device id pre-identify) | SDK | Analytics |
| Usage Data | Product Interaction (screens, swipes, form funnels, calls) | Whole app | Analytics |

Notes:

- Email becomes the PostHog distinct id + `email` person property only after
  the user submits one of our own forms (contractor application, or the
  homeowner concierge completion). Before that the person is anonymous.
- Once identified, this device's earlier anonymous usage merges into the
  identified person — hence Product Interaction is declared "linked".
- Name/phone are collected by the app for lead fulfillment (Supabase) but are
  NOT sent to analytics. If the label must cover ALL app data collection (it
  does), also declare: Contact Info › Name and Phone Number — linked, App
  Functionality only.

## Data Not Linked to You

- None declared separately — pre-identify usage is technically anonymous, but
  Apple guidance says declare by the strictest post-merge state (linked).

## Deliberately NOT collected (guardrails in code)

- No precise or coarse location (zip is reduced to a 3-digit `zip_prefix`
  event property — regional, non-identifying; typed by user, not sensed).
- No session replay (B-D4: replay OFF).
- No advertising identifiers (IDFA never requested).
- No email/phone/name fields exist in the typed event map
  (`src/lib/analytics/events.ts`) — compile-time PII guard; email travels only
  through `identify()` person props.

## Answers to the App Store Connect questionnaire

1. "Do you or your third-party partners collect data from this app?" — **Yes**.
2. Data types: Email Address, Name, Phone Number (app functionality); User ID,
   Product Interaction (analytics).
3. "Is this data linked to the user's identity?" — **Yes** for all of the above.
4. "Do you or your partners use data for tracking?" — **No**.
