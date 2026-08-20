import { useCallback, useEffect, useRef, useState } from "react";
import {
	PAGE_SIZE,
	type ProviderRepository,
	providerRepository,
} from "./providerRepository";
import type { DirectoryBusiness } from "./providerTypes";

export interface ProvidersState {
	error: string | null;
	/** Last "See More" page was full → another page may exist. */
	hasMore: boolean;
	/** Initial pinned fetch in flight. */
	loading: boolean;
	/** A "See More" page in flight. */
	loadingMore: boolean;
	/** "See More" handler. */
	loadMore: () => void;
	/** Additional providers appended in pages of PAGE_SIZE via "See More". */
	more: DirectoryBusiness[];
	/** The three guaranteed cards, always rendered first. */
	pinned: DirectoryBusiness[];
}

/**
 * Drives the Certified Providers section: loads the pinned 3 on mount, then
 * pages the remainder on demand. Injectable repo for tests.
 */
export function useProviders(
	repo: ProviderRepository = providerRepository
): ProvidersState {
	const [pinned, setPinned] = useState<DirectoryBusiness[]>([]);
	const [more, setMore] = useState<DirectoryBusiness[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		(async () => {
			const result = await repo.fetchPinned();
			if (!active) {
				return;
			}
			if (result.ok) {
				setPinned(result.data);
			} else {
				setError(result.error);
			}
			setLoading(false);
		})();
		return () => {
			active = false;
		};
	}, [repo]);

	// Synchronous in-flight guard: onEndReached can re-fire before the
	// loadingMore state lands, and every call in that window sees the same
	// stale offset — state alone can't serialize them.
	const pageInFlight = useRef(false);

	const loadMore = useCallback(() => {
		if (pageInFlight.current || !hasMore) {
			return;
		}
		pageInFlight.current = true;
		setLoadingMore(true);
		setError(null);
		(async () => {
			const result = await repo.fetchMore(more.length);
			if (result.ok) {
				setMore((prev) => [...prev, ...result.data]);
				setHasMore(result.data.length === PAGE_SIZE);
			} else {
				setError(result.error);
			}
			pageInFlight.current = false;
			setLoadingMore(false);
		})();
	}, [repo, more.length, hasMore]);

	return { error, hasMore, loading, loadingMore, loadMore, more, pinned };
}
