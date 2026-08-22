# Swipe polish round — requirements (rev 1, 2026-08-22)

Owner report after the brand-migration round (device pass on the Match flow):
three issues. Scope: Match (swipe) flow only. Design truth for visuals = the
`t.brand` system + the registry card; no site surface exists for swipe.

## R1 — Deck card needs a visible edge

**Observed:** card border is `line` (#E4D6BE) at hairline width on a white
surface over magnolia — the card's shape disappears into the page (only the
soft shadow hints at it). The Pass button next to it reads crisply because it
carries a 1 px clay outline.

**Requirement:** the deck card gets the same stroke as the Pass button —
`borderWidth: 1`, `borderColor: t.brand.colors.clay` — on `DeckCardView`.
Radius/shadow unchanged. Stacked (behind) cards inherit it automatically (same
component).

**Acceptance:** card silhouette clearly visible on magnolia; Pass button and
card share stroke colour + weight; contrast of clay on white/magnolia already
measured (5.74:1, fine for a non-text edge).

## R2 — "Keep swiping" must resume where the homeowner left off

**Observed:** swipe left ×10, right on #11, send, "Keep swiping" → deck shows
card #1 again; the homeowner re-swipes the same 11 cards.

**Root cause (code read, not guessed):** `MatchContactScreen` has a
stale-stack guard — `useEffect(() => { if (!pending) router.replace("/swipe") },
[pending])`. On a successful send, `onSubmitted` calls `session.clearPending()`
and then `cancel()` (`router.back()`). The popped screen stays mounted during
the pop transition, the effect re-runs with `pending === null`, and
`router.replace("/swipe")` swaps in a **fresh** `/swipe` route → `SwipeScreen`
remounts → the swipedaddy engine's `activeIndex` (a shared value) restarts at
0, `useSwipeDeck` refetches and `setIndex(0)`. The "keep swiping commits the
matched card through `deckRef`" path never gets the original deck.

(Design intent is already right: `deckKey = JSON.stringify(task)` remounts the
engine only when the task/filters change — that part needs no work.)

**Requirement:** the guard must only fire for a genuine arrival-without-pending
(deep link / cold stack), never on the success path.
- On success: deck position preserved; "Keep swiping" advances exactly one card
  (past the matched one); no refetch.
- On Back (cancel): card stays current (unchanged behaviour).
- New filters applied: deck replaced (unchanged behaviour).
- Deep link to `/match-contact` with no pending: still redirected to `/swipe`.

**Acceptance tests:** MatchContactScreen — success path does NOT call
`router.replace`; no-pending mount DOES. SwipeScreen — after a match result is
cleared via "Keep swiping", `deckRef.swipeRight` called once and the deck is not
remounted (same `deckKey`, no loading state).

## R3 — Match confirmation sits below centre

**Observed:** the "Your first match! / Keep swiping" group is centred in the
space *below* the header + term pill, so on screen it lands ~10 % below true
centre.

**Requirement:** centre the confirmation group on the **screen** (ignore the
top chrome), keeping the header/term pill visible and tappable. Implementation
freedom: measure the top-chrome height (`onLayout`) and pad the bottom of the
centred block by that amount, or equivalent. Also: the Button matches Home's
full-width CTA? — no: keep its intrinsic width; only position changes.

**Acceptance:** group's vertical centre within ±8 pt of screen centre on the
simulator; header + term pill still rendered above.

## Non-goals
- No copy changes, no deck reorder, no new analytics.
- No change to the Pass/Match buttons.

## Open questions (defaults stated; proceed unless overridden)
1. R1 stroke weight: exact Pass match (1 px clay). Default: yes.
2. R3: true screen centre vs optical (slightly above). Default: true centre.

## Delivery
One branch `fix/swipe-polish`, one PR, three commits (one per R). Tests:
DeckCardView style assertion, MatchContactScreen success/no-pending cases,
SwipeScreen keep-swiping case. Owner visual on device for R1/R3.
