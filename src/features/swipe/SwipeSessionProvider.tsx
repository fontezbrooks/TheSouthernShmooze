/**
 * Session-scoped state for "The Shmoozer": an anonymous session token (the read-back key
 * for Matches), the current task, and the captured/verified contact. Mounted once in
 * `app/_layout.tsx`, so the task + contact survive navigation between the swipe subpage
 * and the tabs. Token + verified contact are persisted on-device (best-effort).
 */

import { randomUUID } from "expo-crypto";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { loadSession, saveSession } from "./swipeStorage";
import type {
	MatchResult,
	PendingMatch,
	SeekerContact,
	SwipeTask,
} from "./swipeTypes";

export interface SwipeSessionValue {
	clearMatchResult: () => void;
	clearPending: () => void;
	clearTask: () => void;
	contact: SeekerContact | null;
	/** True once a match has been sent this app session (ST1 vs ST4 copy). */
	hasMatched: boolean;
	markMatched: () => void;
	markVerified: () => void;
	/** Successful send reported by the contact page; the deck consumes it (ST2). */
	matchResult: MatchResult | null;
	/** Right-swiped card handed to the contact page (CP1). */
	pending: PendingMatch | null;
	/** False until the persisted session has loaded. */
	ready: boolean;
	sessionToken: string;
	setContact: (contact: SeekerContact) => void;
	setMatchResult: (result: MatchResult) => void;
	setPending: (pending: PendingMatch) => void;
	setTask: (task: SwipeTask) => void;
	task: SwipeTask | null;
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
			if (!alive) {
				return;
			}
			if (stored) {
				setSessionToken(stored.sessionToken);
				setContactState(
					stored.contact ? { ...stored.contact, verified: false } : null
				);
			} else {
				const token = randomUUID();
				setSessionToken(token);
				await saveSession({ contact: null, sessionToken: token });
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
			if (sessionToken) {
				void saveSession({ contact: next, sessionToken });
			}
		},
		[sessionToken]
	);

	const setContact = useCallback(
		(next: SeekerContact) => persist(next),
		[persist]
	);

	const markVerified = useCallback(
		() => persist(contact ? { ...contact, verified: true } : contact),
		[contact, persist]
	);

	const markMatched = useCallback(() => setHasMatched(true), []);
	const setPending = useCallback(
		(next: PendingMatch) => setPendingState(next),
		[]
	);
	const clearPending = useCallback(() => setPendingState(null), []);
	const setMatchResult = useCallback(
		(next: MatchResult) => setMatchResultState(next),
		[]
	);
	const clearMatchResult = useCallback(() => setMatchResultState(null), []);

	const value = useMemo<SwipeSessionValue>(
		() => ({
			clearMatchResult,
			clearPending,
			clearTask,
			contact,
			hasMatched,
			markMatched,
			markVerified,
			matchResult,
			pending,
			ready,
			sessionToken,
			setContact,
			setMatchResult,
			setPending,
			setTask,
			task,
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
		]
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
			"useSwipeSession must be used within a SwipeSessionProvider"
		);
	}
	return ctx;
}
