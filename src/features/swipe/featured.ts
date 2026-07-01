import type { DeckCard } from "./swipeTypes";

/** Default cadence: one featured card per N positions (slot at index 0, N, 2N, …). */
export const FEATURED_EVERY_N = 5;

/**
 * Interleave featured providers into labeled slots (T-1): featured cards take positions
 * 0, N, 2N, … while organic cards fill the gaps in their original (confidence) order.
 * Featured cards are BOOSTED in position only — their true confidence is unchanged. Pure
 * and immutable: returns a new array, never mutates the input.
 */
export function interleaveFeatured(
  cards: DeckCard[],
  everyN: number = FEATURED_EVERY_N,
): DeckCard[] {
  const step = Math.max(1, Math.floor(everyN));
  const featured = cards.filter((c) => c.isFeatured);
  if (featured.length === 0) return [...cards];
  const organic = cards.filter((c) => !c.isFeatured);

  const result: DeckCard[] = [];
  let fi = 0;
  let oi = 0;
  let pos = 0;
  while (fi < featured.length || oi < organic.length) {
    const isSlot = pos % step === 0;
    if (isSlot && fi < featured.length) {
      result.push(featured[fi++]);
    } else if (oi < organic.length) {
      result.push(organic[oi++]);
    } else {
      // organic exhausted → append any remaining featured
      result.push(featured[fi++]);
    }
    pos++;
  }
  return result;
}
