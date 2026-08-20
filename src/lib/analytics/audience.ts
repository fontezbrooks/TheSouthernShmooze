import type PostHog from "posthog-react-native";
import { PostHogPersistedProperty } from "posthog-react-native";
import type { IdentifyProperties } from "./events";

export type AnalyticsAudience = IdentifyProperties["user_type"];

/** Funnel routes that constitute an audience boundary (review: PR #44). */
const AUDIENCE_ROUTES: readonly (readonly [RegExp, AnalyticsAudience])[] = [
	[/^\/contractor-wizard/, "contractor"],
	[/^\/swipe/, "homeowner"],
	[/^\/match-contact/, "homeowner"],
	[/^\/concierge/, "homeowner"],
];

/** The audience a pathname belongs to, or null for neutral surfaces. */
export function audienceForPathname(
	pathname: string
): AnalyticsAudience | null {
	for (const [pattern, audience] of AUDIENCE_ROUTES) {
		if (pattern.test(pathname)) {
			return audience;
		}
	}
	return null;
}

/**
 * Audience-boundary reset (review: PR #44): drops the identity ONLY when
 * the device is identified as a DIFFERENT (or unknown) audience. Detection
 * leans on our invariant that distinct ids are only ever emails while
 * PostHog anonymous ids are UUIDs. Plain function (not a hook) so
 * ScreenTracker can apply the boundary BEFORE the global $screen capture.
 */
export function crossAudienceReset(
	client: PostHog,
	entering: AnalyticsAudience
): void {
	if (!client.getDistinctId().includes("@")) {
		return;
	}
	const props = client.getPersistedProperty<Record<string, unknown>>(
		PostHogPersistedProperty.Props
	);
	// An unknown audience (identified before the register call existed,
	// cleared storage) counts as a mismatch — resetting is the safe
	// default for a shared device.
	if (props?.user_type !== entering) {
		client.reset();
	}
}
