import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/lib/useDebounce";
import {
  directoryRepository,
  type DirectoryRepository,
} from "./directoryRepository";
import type { DirectoryBusiness } from "@/features/providers/providerTypes";

/** `directory_search` ignores <2-char queries; don't bother hitting it below that. */
const MIN_QUERY = 2;
const DEBOUNCE_MS = 250;

/** The three body modes the Directory screen renders (the Figma "6 states" collapse to these). */
export type DirectoryMode = "browse" | "results" | "no-results";

export interface DirectorySearchState {
  query: string;
  setQuery: (q: string) => void;
  clear: () => void;
  isFocused: boolean;
  setFocused: (f: boolean) => void;
  mode: DirectoryMode;
  /** Browse list (mode=browse) or search results (mode=results/no-results). */
  items: DirectoryBusiness[];
  /** Initial browse-all fetch in flight. */
  loading: boolean;
  /** A search request in flight (results not yet settled). */
  searching: boolean;
  error: string | null;
}

/**
 * Drives the Directory screen: loads browse-all once, then runs a debounced
 * search as the query changes (≥2 chars). Derives the browse/results/no-results
 * mode from `(debouncedQuery, results, searching)`; focus only restyles the bar.
 * Stale responses are dropped. Injectable repo for tests.
 */
export function useDirectorySearch(
  repo: DirectoryRepository = directoryRepository,
  delayMs: number = DEBOUNCE_MS,
): DirectorySearchState {
  const [query, setQuery] = useState("");
  const [isFocused, setFocused] = useState(false);
  const [browse, setBrowse] = useState<DirectoryBusiness[]>([]);
  const [results, setResults] = useState<DirectoryBusiness[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebounce(query.trim(), delayMs);
  const active = debounced.length >= MIN_QUERY;

  // Initial browse-all load.
  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await repo.browseAll();
      if (!alive) return;
      if (res.ok) setBrowse(res.data);
      else setError(res.error);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [repo]);

  // Search on the debounced query; drop results when the query is too short.
  const latest = useRef("");
  useEffect(() => {
    if (!active) {
      setResults(null);
      setSearching(false);
      return;
    }
    latest.current = debounced;
    setSearching(true);
    let alive = true;
    (async () => {
      const res = await repo.search(debounced);
      // Ignore if unmounted or superseded by a newer query.
      if (!alive || latest.current !== debounced) return;
      if (res.ok) {
        setResults(res.data);
        setError(null);
      } else {
        // Keep results null (NOT []) so a failure renders the error rather than
        // misreporting an outage as an empty "no results" search.
        setResults(null);
        setError(res.error);
      }
      setSearching(false);
    })();
    return () => {
      alive = false;
    };
  }, [debounced, active, repo]);

  const clear = useCallback(() => setQuery(""), []);

  const mode: DirectoryMode = !active
    ? "browse"
    : results !== null && results.length === 0 && !searching
      ? "no-results"
      : "results";

  const items = mode === "browse" ? browse : (results ?? []);

  return {
    query,
    setQuery,
    clear,
    isFocused,
    setFocused,
    mode,
    items,
    loading,
    searching,
    error,
  };
}
