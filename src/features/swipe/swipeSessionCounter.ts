/**
 * Cumulative swipe counter scoped to the SWIPE SESSION, not the screen
 * (review: PR #43): SwipeScreen is a stack route that unmounts when the user
 * backs out, but the session token lives in SwipeSessionProvider for the whole
 * app session. A screen-local ref would restart session_swipe_count at 1 on
 * every reopen, corrupting the power-swiper distribution.
 *
 * Module state keyed by session token; only the current token is retained.
 */
let counterToken: string | null = null;
let counterValue = 0;

/** Increment and return this session's cumulative swipe count. */
export function nextSwipeCount(sessionToken: string): number {
	if (counterToken !== sessionToken) {
		counterToken = sessionToken;
		counterValue = 0;
	}
	counterValue += 1;
	return counterValue;
}

/** Test seam. */
export function resetSwipeCounter(): void {
	counterToken = null;
	counterValue = 0;
}
