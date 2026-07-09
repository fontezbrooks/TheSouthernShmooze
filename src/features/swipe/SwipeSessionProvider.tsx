/**
 * Session-scoped state for "The Shmoozer": an anonymous session token (the read-back key
 * for Matches), the current task, and the captured/verified contact. Mounted once in
 * `app/_layout.tsx`, so the task + contact survive navigation between the swipe subpage
 * and the tabs. Token + verified contact are persisted on-device (best-effort).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { randomUUID } from "expo-crypto";
import type {
  MatchResult,
  PendingMatch,
  SeekerContact,
  SwipeTask,
} from "./swipeTypes";
import { loadSession, saveSession } from "./swipeStorage";

export interface SwipeSessionValue {
  /** False until the persisted session has loaded. */
  ready: boolean;
  sessionToken: string;
  task: SwipeTask | null;
  contact: SeekerContact | null;
  /** True once a match has been sent this app session (ST1 vs ST4 copy). */
  hasMatched: boolean;
  /** Right-swiped card handed to the contact page (CP1). */
  pending: PendingMatch | null;
  /** Successful send reported by the contact page; the deck consumes it (ST2). */
  matchResult: MatchResult | null;
  setTask: (task: SwipeTask) => void;
  clearTask: () => void;
  setContact: (contact: SeekerContact) => void;
  markVerified: () => void;
  markMatched: () => void;
  setPending: (pending: PendingMatch) => void;
  clearPending: () => void;
  setMatchResult: (result: MatchResult) => void;
  clearMatchResult: () => void;
}

const SwipeSessionContext = createContext<SwipeSessionValue | null>(null);

export function SwipeSessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [task, setTaskState] = useState<SwipeTask | null>(null);
  const [contact, setContactState] = useState<SeekerContact | null>(null);
  // In-memory only — "first match" celebration resets with each app session.
  const [hasMatched, setHasMatched] = useState(false);
  // Contact-page plumbing (CP1): the pending card + the send result, both
  // in-memory — they only bridge the /swipe ↔ /match-contact hop.
  const [pending, setPendingState] = useState<PendingMatch | null>(null);
  const [matchResult, setMatchResultState] = useState<MatchResult | null>(null);

  // Load or mint the session token + restore the remembered contact. We keep the contact
  // details but reset `verified` to false so the form re-opens on the first Match of each
  // app session (then it prefills and later swipes auto-send within the session).
  useEffect(() => {
    let alive = true;
    (async () => {
      const stored = await loadSession();
      if (!alive) return;
      if (stored) {
        setSessionToken(stored.sessionToken);
        setContactState(
          stored.contact ? { ...stored.contact, verified: false } : null,
        );
      } else {
        const token = randomUUID();
        setSessionToken(token);
        await saveSession({ sessionToken: token, contact: null });
      }
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setTask = useCallback((next: SwipeTask) => setTaskState(next), []);
  const clearTask = useCallback(() => setTaskState(null), []);

  const persist = useCallback(
    (next: SeekerContact | null) => {
      setContactState(next);
      if (sessionToken) void saveSession({ sessionToken, contact: next });
    },
    [sessionToken],
  );

  const setContact = useCallback(
    (next: SeekerContact) => persist(next),
    [persist],
  );

  const markVerified = useCallback(
    () => persist(contact ? { ...contact, verified: true } : contact),
    [contact, persist],
  );

  const markMatched = useCallback(() => setHasMatched(true), []);
  const setPending = useCallback(
    (next: PendingMatch) => setPendingState(next),
    [],
  );
  const clearPending = useCallback(() => setPendingState(null), []);
  const setMatchResult = useCallback(
    (next: MatchResult) => setMatchResultState(next),
    [],
  );
  const clearMatchResult = useCallback(() => setMatchResultState(null), []);

  const value = useMemo<SwipeSessionValue>(
    () => ({
      ready,
      sessionToken,
      task,
      contact,
      hasMatched,
      pending,
      matchResult,
      setTask,
      clearTask,
      setContact,
      markVerified,
      markMatched,
      setPending,
      clearPending,
      setMatchResult,
      clearMatchResult,
    }),
    [
      ready,
      sessionToken,
      task,
      contact,
      hasMatched,
      pending,
      matchResult,
      setTask,
      clearTask,
      setContact,
      markVerified,
      markMatched,
      setPending,
      clearPending,
      setMatchResult,
      clearMatchResult,
    ],
  );

  return (
    <SwipeSessionContext.Provider value={value}>
      {children}
    </SwipeSessionContext.Provider>
  );
}

export function useSwipeSession(): SwipeSessionValue {
  const ctx = useContext(SwipeSessionContext);
  if (!ctx) {
    throw new Error(
      "useSwipeSession must be used within a SwipeSessionProvider",
    );
  }
  return ctx;
}
