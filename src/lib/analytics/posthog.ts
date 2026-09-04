import Constants from "expo-constants";
import PostHog from "posthog-react-native";

interface PosthogExtra {
	posthogHost?: string;
	posthogKey?: string;
}

export interface AnalyticsGateInput {
	apiKey: string;
	debugEnabled: boolean;
	isDev: boolean;
	isTestEnv: boolean;
}

const FLAGS_REQUEST_TIMEOUT_MS = 3000;

/**
 * Pure capture-gate decision (B-FR7): no key → off; jest → off; dev → off
 * unless EXPO_PUBLIC_POSTHOG_DEBUG=1. Split out so the policy is unit-testable
 * without constructing a client.
 */
export function isAnalyticsEnabled(input: AnalyticsGateInput): boolean {
	if (!input.apiKey) {
		return false;
	}
	if (input.isTestEnv) {
		return false;
	}
	if (input.isDev && !input.debugEnabled) {
		return false;
	}
	return true;
}

function readConfig(): { apiKey: string; host: string } {
	const extra = (Constants.expoConfig?.extra ?? {}) as PosthogExtra;
	return {
		apiKey: extra.posthogKey?.trim() ?? "",
		host: extra.posthogHost?.trim() || "https://us.i.posthog.com",
	};
}

let client: PostHog | null | undefined;

/**
 * Lazily-created PostHog singleton, or null when capture is disabled.
 * Construction is synchronous and non-blocking (B-NFR1) — the SDK queues and
 * batches in the background with its own offline persistence (B-NFR2).
 */
export function getAnalyticsClient(): PostHog | null {
	if (client !== undefined) {
		return client;
	}
	const { apiKey, host } = readConfig();
	const enabled = isAnalyticsEnabled({
		apiKey,
		debugEnabled: process.env.EXPO_PUBLIC_POSTHOG_DEBUG === "1",
		isDev: __DEV__,
		isTestEnv: Boolean(process.env.JEST_WORKER_ID),
	});
	client = enabled
		? new PostHog(apiKey, {
				captureAppLifecycleEvents: true,
				/**
				 * Crash reporting (S1). Uncaught errors and unhandled rejections
				 * are captured; `console` autocapture is deliberately OFF.
				 *
				 * The PII guard in events.ts is enforced by TYPE — no free-text
				 * field exists in the event map. Console autocapture would route
				 * around that entirely by shipping arbitrary log strings, which
				 * is exactly where a typed email or ZIP ends up in practice.
				 *
				 * `nativeCrashes` stays off too: it needs
				 * `@posthog/react-native-plugin`, and a native package changes
				 * the fingerprint runtime version, so adding it is a decision to
				 * make deliberately alongside a build, not a side effect here.
				 */
				errorTracking: {
					autocapture: {
						console: false,
						nativeCrashes: false,
						uncaughtExceptions: true,
						unhandledRejections: true,
					},
				},
				featureFlagsRequestTimeoutMs: FLAGS_REQUEST_TIMEOUT_MS,
				host,
			})
		: null;
	return client;
}
