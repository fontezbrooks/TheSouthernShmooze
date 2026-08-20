import type PostHog from "posthog-react-native";
import { PostHogProvider } from "posthog-react-native";
import { createContext, type ReactNode, useMemo } from "react";
import { getAnalyticsClient } from "./posthog";

/**
 * null = capture disabled (jest, dev without debug flag, missing key).
 * Consumers (useAnalytics) no-op on null — screens never branch on it.
 */
export const AnalyticsContext = createContext<PostHog | null>(null);

interface AnalyticsProviderProps {
	children: ReactNode;
	/** Test seam — defaults to the real singleton factory. */
	client?: PostHog | null;
}

/**
 * Mounts PostHog capture for the whole app (B-FR2). When capture is disabled
 * the children render bare — no SDK provider, no network, no overhead. Screen
 * views are autocaptured ($screen) via the SDK's react-navigation hook, which
 * expo-router drives; touches stay OFF (custom events carry the funnels).
 */
export function AnalyticsProvider({
	children,
	client = getAnalyticsClient(),
}: AnalyticsProviderProps) {
	const autocapture = useMemo(
		() => ({ captureScreens: true, captureTouches: false }),
		[]
	);
	if (!client) {
		return (
			<AnalyticsContext.Provider value={null}>
				{children}
			</AnalyticsContext.Provider>
		);
	}
	return (
		<AnalyticsContext.Provider value={client}>
			<PostHogProvider autocapture={autocapture} client={client}>
				{children}
			</PostHogProvider>
		</AnalyticsContext.Provider>
	);
}
