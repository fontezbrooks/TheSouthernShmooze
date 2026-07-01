import { useCallback, useEffect, useState } from "react";
import { swipeRepository, type SwipeRepository } from "./swipeRepository";
import { interleaveFeatured } from "./featured";
import type { DeckCard, SwipeTask } from "./swipeTypes";

export interface SwipeDeckState {
  /** Remaining cards (front = current). */
  cards: DeckCard[];
  current: DeckCard | null;
  /** The created task id leads attach to (null until the task is registered). */
  taskId: string | null;
  loading: boolean;
  error: string | null;
  /** Settled with no card left (distinct from loading / error). */
  empty: boolean;
  /** Drop the current card (after a left or right swipe is resolved). */
  advance: () => void;
}

/**
 * Drives the swipe deck for a given task: registers the task, fetches a confidence-ranked
 * deck (featured interleaved into labeled slots), and pops cards as the Seeker swipes.
 * Result-based; injectable repo for tests. A null task leaves the deck idle.
 */
export function useSwipeDeck(
  task: SwipeTask | null,
  sessionToken: string,
  repo: SwipeRepository = swipeRepository,
): SwipeDeckState {
  const [cards, setCards] = useState<DeckCard[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!task || !sessionToken) return;
    let alive = true;
    setLoading(true);
    setError(null);
    setSettled(false);
    setCards([]);
    setTaskId(null);
    (async () => {
      const t = await repo.createTask(task, sessionToken);
      if (!alive) return;
      if (!t.ok) {
        setError(t.error);
        setLoading(false);
        setSettled(true);
        return;
      }
      setTaskId(t.data);
      const deck = await repo.fetchDeck(task, sessionToken, []);
      if (!alive) return;
      if (deck.ok) setCards(interleaveFeatured(deck.data));
      else setError(deck.error);
      setLoading(false);
      setSettled(true);
    })();
    return () => {
      alive = false;
    };
  }, [task, sessionToken, repo]);

  const advance = useCallback(() => setCards((prev) => prev.slice(1)), []);

  const current = cards[0] ?? null;
  const empty = settled && !loading && error === null && current === null;

  return { cards, current, taskId, loading, error, empty, advance };
}
