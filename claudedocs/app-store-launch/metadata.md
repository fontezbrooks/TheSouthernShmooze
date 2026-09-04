# App Store Connect metadata — drafts to fill in

Every field App Store Connect asks for, with a draft you can take, edit, or
throw out. Character limits are Apple's and are counted for each draft.
Anything marked **OWNER** is a fact only you have.

Locale: English (U.S.). Platform: iOS only.

---

## 1. App name — 30 characters

| Draft | Chars |
|---|---|
| **The Southern Shmooze** | 20 |
| Southern Shmooze: Local Pros | 28 |
| The Southern Shmooze: Pros | 26 |

The bare name is the safe pick — it matches the brand, the site, and what
testers already have installed. The longer variants buy a little search
coverage, at the cost of looking like a keyword grab.

**Choose:** ____________________

---

## 2. Subtitle — 30 characters

Shown under the name everywhere. It is indexed for search, so it should carry
words the app name does not.

| Draft | Chars |
|---|---|
| **Find certified local pros** | 25 |
| Certified local pros, matched | 29 |
| Home pros, vetted and matched | 29 |
| Middle TN's certified pros | 26 |

The last one is the most honest about coverage and the most likely to set
correct expectations, but it also tells a browsing user outside the region to
move on. Your call which side of that trade you want.

**Choose:** ____________________

---

## 3. Promotional text — 170 characters

Editable any time **without a new build or review** — the one field you can
change on a whim. Use it for seasonal pushes and new-partner announcements.

> Tell us what you need and we'll match you with a certified local pro — or
> swipe the deck and pick your own. New businesses join the registry every
> week. (152)

Alternate, if you would rather lead with trust:

> Every pro in the registry is vetted before they get in. Tell us about your
> project and we'll put the right one in front of you. (131)

**Choose:** ____________________

---

## 4. Description — 4000 characters

Only the first few lines show before "more", so the opening carries the weight.
The draft below is roughly 1,150 characters, deliberately short of the limit —
nobody reads a wall.

```
Finding someone good to work on your home shouldn't feel like a gamble.

The Southern Shmooze is a registry of local service businesses that have been
vetted before they get listed — not a scraped directory, and not a bidding
war where the loudest ad wins.

FIND MY PRO
Tell us the kind of work you need, your ZIP, and a few details. We match you
with a certified pro and put you in touch. No phone tree, no five contractors
calling you at dinner.

SWIPE THE DECK
Would rather choose yourself? Swipe through pros near you, see their work and
ratings, and reach out to the one you like. Pass on the rest.

THE REGISTRY
Browse every certified business by category. Real photos, real ratings, and a
straight line to their phone number.

FOR CONTRACTORS
Run a local business? Check whether you're a fit for the registry in about two
minutes, and tell us what's holding your growth back.

No account required. No ads. We don't sell your information, and we don't
track you across other apps.
```

**OWNER:** confirm the vetting claim ("vetted before they get listed") matches
how the registry actually admits businesses. It is the strongest claim in the
copy and the one most likely to be challenged.

---

## 5. Keywords — 100 characters, comma-separated, no spaces after commas

Do not repeat words already in the app name or subtitle; Apple indexes those
separately and the repetition wastes the budget.

```
contractor,handyman,plumber,electrician,hvac,roofer,home services,local pros,quotes,vetted
```

90 characters, 10 to spare. Swap in a city name if you want local coverage —
`nashville` costs 10 including the comma, so drop `quotes` to make room.

**OWNER:** decide whether to spend keyword budget on a city or a trade.

---

## 6. Categories

| Field | Recommendation | Why |
|---|---|---|
| Primary | **Lifestyle** | Where home-services marketplaces sit, and where a homeowner browses. Less crowded than Business for this kind of app. |
| Secondary | **Business** | Covers the contractor-application half of the app. |

The reverse (Business primary) is defensible if you decide the contractor
audience matters more than the homeowner one for discovery. Primary category
drives ranking and can be changed later.

**Choose:** Primary ____________ Secondary ____________

---

## 7. Age rating questionnaire

Apple's questionnaire, with the answer that matches what the app actually
does. Target rating: **4+**.

| Question | Answer |
|---|---|
| Cartoon or fantasy violence | None |
| Realistic violence | None |
| Prolonged graphic or sadistic violence | None |
| Profanity or crude humor | None |
| Mature or suggestive themes | None |
| Horror or fear themes | None |
| Medical or treatment information | None |
| Alcohol, tobacco, or drug use or references | None |
| Sexual content or nudity | None |
| Gambling | None |
| Contests | None |
| Unrestricted web access | **No** |
| User-generated content | **No** |
| Messaging or chat between users | No |
| Ability to make purchases in app | No |
| Location sharing with other users | No |
| Age assurance / age verification used | No |

Two answers worth understanding rather than just copying:

- **Unrestricted web access — No.** The app opens specific provider websites
  and Google review pages in a Safari view. That is a link-out, not a browser:
  there is no address bar and no way to navigate anywhere you choose. If Apple
  pushes back, the honest description is "opens specific external links."
- **User-generated content — No.** What users type (project details, an
  application) goes to your team privately. Nothing a user writes is published
  to other users, so the moderation obligations under guideline 1.2 do not
  apply. **This answer changes the moment reviews or public profiles ship in
  the app** — the site already has a review form, so revisit this at 1.1.

---

## 8. Remaining App Store Connect fields

| Field | Value |
|---|---|
| Privacy policy URL | `https://fontezbrooks.github.io/TheSouthernShmooze/privacy/` (pending PR #60 merge and Pages enablement) |
| Support URL | **OWNER** — the site's `/contact` page, or a dedicated support page |
| Marketing URL | **OWNER** — optional; the site home page |
| Copyright | `2026 The Southern Shmooze` — **OWNER** confirm the exact legal entity name |
| Version | 1.0.0 |
| Trade representative contact | **OWNER** — required for some storefronts |
| Sign-in required | **No** — the app has no accounts |
| Demo account | Not applicable |

### What's New — 4000 characters

First release, so this can be a single line:

> The first release of The Southern Shmooze. Find a certified local pro, swipe
> the registry, or apply to join it.

### App Review notes

This is the field that heads off a guideline 2.1 rejection. The registry is
regional, and a reviewer in California who searches their own ZIP may see
empty results and conclude the app is incomplete.

```
No account or sign-in is required — every feature is reachable on first launch.

This app serves Middle Tennessee, so please use ZIP 37027 when a ZIP is
requested. Searching a ZIP outside the region will correctly return no nearby
providers.

To see the main flows:
- Find My Pro: Concierge tab -> choose a trade -> ZIP 37027 -> continue ->
  fill in contact details -> submit. You will be matched with a provider.
- Swipe deck: Shmoozer tab -> swipe right on a provider to request contact.
- Registry: Registry tab -> browse or search certified businesses -> tap one
  for its full profile.
- Contractor application: Home -> the contractor banner -> a short wizard.

Submitting a form sends a real notification to our team; test submissions are
expected and will be discarded.

The app collects no advertising identifier and does not track users across
other apps or websites, so no App Tracking Transparency prompt is shown.
```

**OWNER:** confirm 37027 (Brentwood) is a ZIP with good registry coverage, or
replace it with one you know returns a full set of results.

---

## 9. Screenshots — 6.9-inch iPhone, up to 10

iPhone only; the iPad set is not needed now that `supportsTablet` is false.

Suggested order, strongest first:

1. Home — the concierge hero
2. Find My Pro — step one, trade and ZIP
3. The swipe deck mid-swipe
4. A match confirmation
5. The registry list
6. A business profile
7. The contractor application

**OWNER:** decide whether to caption them. Plain device screenshots read as
honest; captioned frames convert better. Either works, but do not mix the two.
