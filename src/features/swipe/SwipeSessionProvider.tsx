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
import type { SeekerContact, SwipeTask } from "./swipeTypes";
import { loadSession, saveSession } from "./swipeStorage";

export interface SwipeSessionValue {
  /** False until the persisted session has loaded. */
  ready: boolean;
  sessionToken: string;
  task: SwipeTask | null;
  contact: SeekerContact | null;
  setTask: (task: SwipeTask) => void;
  clearTask: () => void;
  setContact: (contact: SeekerContact) => void;
  markVerified: () => void;
}

const SwipeSessionContext = createContext<SwipeSessionValue | null>(null);

export function SwipeSessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [task, setTaskState] = useState<SwipeTask | null>(null);
  const [contact, setContactState] = useState<SeekerContact | null>(null);

  // Load or mint the session token + restore any verified contact.
  useEffect(() => {
    let alive = true;
    (async () => {
      const stored = await loadSession();
      if (!alive) return;
      if (stored) {
        setSessionToken(stored.sessionToken);
        setContactState(stored.contact);
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

  const value = useMemo<SwipeSessionValue>(
    () => ({
      ready,
      sessionToken,
      task,
      contact,
      setTask,
      clearTask,
      setContact,
      markVerified,
    }),
    [
      ready,
      sessionToken,
      task,
      contact,
      setTask,
      clearTask,
      setContact,
      markVerified,
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
