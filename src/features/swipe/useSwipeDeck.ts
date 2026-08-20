import { useEffect, useState } from "react";
import { orderDeck } from "./featured";
import { type SwipeRepository, swipeRepository } from "./swipeRepository";
import type { DeckCard, SwipeTask } from "./swipeTypes";

export interface SwipeDeckState {
	/** The full deck (the swipe engine owns the position, not this hook). */
	cards: DeckCard[];
	current: DeckCard | null;
	/** Deck loaded with ZERO cards — "no matches" (ST5). */
	empty: boolean;
	error: string | null;
	/** Deck had cards and the user swiped through them all — end of deck (ST6). */
	exhausted: boolean;
	loading: boolean;
	/** Mirror of the deck engine's active index — wire to `onActiveIndexChange`. */
	setIndex: (index: number) => void;
	/** The created task id leads attach to (null until the task is registered). */
	taskId: string | null;
}

/**
 * Drives the swipe deck for a given task: registers the task, fetches a confidence-ranked
 * deck (featured interleaved into labeled slots), and mirrors the deck engine's position
 * (the swipeDaddy deck advances itself; this hook only tracks the index it reports).
 * Result-based; injectable repo for tests. A null task leaves the deck idle.
 */
export function useSwipeDeck(
	task: SwipeTask | null,
	sessionToken: string,
	repo: SwipeRepository = swipeRepository
): SwipeDeckState {
	const [cards, setCards] = useState<DeckCard[]>([]);
	const [index, setIndex] = useState(0);
	const [taskId, setTaskId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [settled, setSettled] = useState(false);
	const [hadCards, setHadCards] = useState(false);

	useEffect(() => {
		if (!(task && sessionToken)) {
			return;
		}
		let alive = true;
		(async () => {
			setLoading(true);
			setError(null);
			setSettled(false);
			setCards([]);
			setIndex(0);
			setHadCards(false);
			setTaskId(null);
			const t = await repo.createTask(task, sessionToken);
			if (!alive) {
				return;
			}
			if (!t.ok) {
				setError(t.error);
				setLoading(false);
				setSettled(true);
				return;
			}
			setTaskId(t.data);
			const deck = await repo.fetchDeck(task, sessionToken, []);
			if (!alive) {
				return;
			}
			if (deck.ok) {
				setCards(orderDeck(deck.data));
				setHadCards(deck.data.length > 0);
			} else {
				setError(deck.error);
			}
			setLoading(false);
			setSettled(true);
		})();
		return () => {
			alive = false;
		};
	}, [task, sessionToken, repo]);

	const current = cards[index] ?? null;
	const done = settled && !loading && error === null && current === null;
	const empty = done && !hadCards;
	const exhausted = done && hadCards;

	return { cards, current, empty, error, exhausted, loading, setIndex, taskId };
}
