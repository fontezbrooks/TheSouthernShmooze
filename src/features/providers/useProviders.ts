import { useCallback, useEffect, useState } from "react";
import {
  providerRepository,
  PAGE_SIZE,
  type ProviderRepository,
} from "./providerRepository";
import type { DirectoryBusiness } from "./providerTypes";

export interface ProvidersState {
  /** The three guaranteed cards, always rendered first. */
  pinned: DirectoryBusiness[];
  /** Additional providers appended in pages of PAGE_SIZE via "See More". */
  more: DirectoryBusiness[];
  /** Initial pinned fetch in flight. */
  loading: boolean;
  /** A "See More" page in flight. */
  loadingMore: boolean;
  /** Last "See More" page was full → another page may exist. */
  hasMore: boolean;
  error: string | null;
  /** "See More" handler. */
  loadMore: () => void;
}

/**
 * Drives the Certified Providers section: loads the pinned 3 on mount, then
 * pages the remainder on demand. Injectable repo for tests.
 */
export function useProviders(
  repo: ProviderRepository = providerRepository,
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
      if (!active) return;
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

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
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
      setLoadingMore(false);
    })();
  }, [repo, more.length, loadingMore, hasMore]);

  return { pinned, more, loading, loadingMore, hasMore, error, loadMore };
}
