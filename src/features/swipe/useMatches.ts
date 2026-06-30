import { useCallback, useEffect, useState } from "react";
import { swipeRepository, type SwipeRepository } from "./swipeRepository";
import type { SwipeMatch } from "./swipeTypes";

export interface MatchesState {
  matches: SwipeMatch[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Loads the Seeker's sent leads (Sent → Confirmed) by session token — the only read path
 * for anonymous Matches. Injectable repo for tests.
 */
export function useMatches(
  sessionToken: string,
  repo: SwipeRepository = swipeRepository,
): MatchesState {
  const [matches, setMatches] = useState<SwipeMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!sessionToken) return;
    setLoading(true);
    const res = await repo.fetchMatches(sessionToken);
    if (res.ok) {
      setMatches(res.data);
      setError(null);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [sessionToken, repo]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { matches, loading, error, refresh };
}
