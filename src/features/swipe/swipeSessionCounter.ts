/**
 * Cumulative swipe counter scoped to the ANALYTICS SESSION, not the screen
 * (review: PR #43 ×2): SwipeScreen is a stack route that unmounts on back-out
 * (a local ref would restart at 1 every reopen), and the swipe session token
 * is restored from storage and never rotates in-process — so the key is the
 * POSTHOG session id (rotates after backgrounding inactivity), with the swipe
 * token only as the capture-disabled fallback.
 *
 * Module state; only the current key is retained.
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
