import { useCallback, useContext, useEffect, useState } from "react";
import { AnalyticsContext } from "./AnalyticsProvider";
import type {
	AnalyticsEvent,
	AnalyticsEventName,
	IdentifyProperties,
} from "./events";

export interface Analytics {
	/**
	 * First-party identify (B-D11): distinct id = the email the user typed
	 * into our own form; person props only — never event props.
	 */
	identify: (email: string, properties: IdentifyProperties) => void;
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
			// distinct id alone doesn't create an `email` person property —
			// the taxonomy's $set email (CSV row 1) must be set explicitly.
			client?.identify(email, { ...properties, email });
		},
		[client]
	);
	const sessionKey = useCallback<Analytics["sessionKey"]>(
		() => (client ? client.getSessionId() : null),
		[client]
	);
	return { identify, sessionKey, track };
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
