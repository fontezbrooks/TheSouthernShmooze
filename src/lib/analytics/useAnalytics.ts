import { PostHogPersistedProperty } from "posthog-react-native";
import { useCallback, useContext, useEffect, useState } from "react";
import { AnalyticsContext } from "./AnalyticsProvider";
import type {
	AnalyticsEvent,
	AnalyticsEventName,
	IdentifyProperties,
} from "./events";

export type AnalyticsAudience = IdentifyProperties["user_type"];

export interface Analytics {
	/**
	 * First-party identify (B-D11): distinct id = the email the user typed
	 * into our own form; person props only — never event props.
	 */
	identify: (email: string, properties: IdentifyProperties) => void;
	/**
	 * Drop to a fresh anonymous person (review: PR #44). A NEW
	 * unauthenticated request/application on the same device may belong to
	 * a different human — start it anonymous. If it's the same person, the
	 * next identify merges the anonymous activity back into their email
	 * person, so nothing is lost.
	 */
	resetIdentity: () => void;
	/**
	 * Audience-boundary reset (review: PR #44): entering a funnel drops the
	 * identity ONLY when the device is identified as a DIFFERENT (or
	 * unknown) audience. Same-audience re-entry keeps the person — repeat
	 * usage continuity is the point of identify.
	 */
	resetIdentityForAudience: (entering: AnalyticsAudience) => void;
	/**
	 * The CURRENT PostHog session id (rotates after backgrounding
	 * inactivity), or null when capture is disabled. Session-scoped metrics
	 * (e.g. session_swipe_count) must key on this — app-lifetime tokens
	 * outlive an analytics session (review: PR #43).
	 */
	sessionKey: () => string | null;
	/** Typed capture — event/props pairs come from the AnalyticsEvent map. */
	track: <K extends AnalyticsEventName>(
		event: K,
		properties: AnalyticsEvent[K]
	) => void;
}

/**
 * Track/identify wrappers. Never block or throw on a UI path: with capture
 * disabled both are no-ops; with capture on, the SDK queues in the background.
 */
export function useAnalytics(): Analytics {
	const client = useContext(AnalyticsContext);
	const track = useCallback<Analytics["track"]>(
		(event, properties) => {
			client?.capture(event, properties);
		},
		[client]
	);
	const identify = useCallback<Analytics["identify"]>(
		(email, properties) => {
			if (!client) {
				return;
			}
			// Case-insensitive identity: "Jane@X.com" and "jane@x.com" must
			// merge to ONE person, so the distinct id is normalized here — the
			// single choke point for every identify call.
			const id = email.trim().toLowerCase();
			// Switching directly between two identified persons corrupts both
			// email-linked histories (review: PR #44) — reset to anonymous
			// first. Detection leans on OUR invariant: this wrapper is the
			// only identify caller and always uses an email, while PostHog
			// anonymous ids are UUIDs — so "@" means already identified.
			const current = client.getDistinctId();
			if (current !== id && current.includes("@")) {
				client.reset();
			}
			// distinct id alone doesn't create an `email` person property —
			// the taxonomy's $set email (CSV row 1) must be set explicitly.
			client.identify(id, { ...properties, email: id });
			// Persisted super prop so resetIdentityForAudience can tell WHICH
			// audience this device is identified as, across app restarts.
			// reset() clears it along with the identity. Fire-and-forget —
			// a persistence failure only costs the audience hint.
			client.register({ user_type: properties.user_type }).catch(() => {
				/* best effort */
			});
		},
		[client]
	);
	const resetIdentity = useCallback<Analytics["resetIdentity"]>(() => {
		// No-op while anonymous: rotating the anonymous id would ORPHAN the
		// funnel events already captured under it — they could never merge
		// into a later identify. Only an IDENTIFIED device needs dropping;
		// same email-vs-UUID invariant as the identify guard (review: PR #44).
		if (client?.getDistinctId().includes("@")) {
			client.reset();
		}
	}, [client]);
	const resetIdentityForAudience = useCallback<
		Analytics["resetIdentityForAudience"]
	>(
		(entering) => {
			if (!client?.getDistinctId().includes("@")) {
				return;
			}
			const props = client.getPersistedProperty<Record<string, unknown>>(
				PostHogPersistedProperty.Props
			);
			// An unknown audience (identified before the register call
			// existed, cleared storage) counts as a mismatch — resetting is
			// the safe default for a shared device.
			if (props?.user_type !== entering) {
				client.reset();
			}
		},
		[client]
	);
	const sessionKey = useCallback<Analytics["sessionKey"]>(
		() => (client ? client.getSessionId() : null),
		[client]
	);
	return {
		identify,
		resetIdentity,
		resetIdentityForAudience,
		sessionKey,
		track,
	};
}

/**
 * Feature flag value (B-D5); undefined while loading or when capture is
 * disabled — gate UI with an explicit `=== true` so the off/unknown states
 * collapse to the safe default.
 */
export function useFlag(key: string): boolean | string | undefined {
	const client = useContext(AnalyticsContext);
	const [value, setValue] = useState<boolean | string | undefined>(() =>
		client ? client.getFeatureFlag(key) : undefined
	);
	useEffect(() => {
		if (!client) {
			return;
		}
		setValue(client.getFeatureFlag(key));
		const unsubscribe = client.onFeatureFlags(() => {
			setValue(client.getFeatureFlag(key));
		});
		return typeof unsubscribe === "function" ? unsubscribe : undefined;
	}, [client, key]);
	return value;
}
