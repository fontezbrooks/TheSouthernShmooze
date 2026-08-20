import { getInitialURL } from "expo-linking";
import { usePathname } from "expo-router";
import type PostHog from "posthog-react-native";
import { PostHogProvider } from "posthog-react-native";
import { createContext, type ReactNode, useEffect, useMemo } from "react";
import { getAnalyticsClient } from "./posthog";
import { initialUtmProps } from "./utm";

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
	// captureScreens OFF: the SDK's screen autocapture hooks a react-navigation
	// container ref that expo-router never hands it — a live device pass
	// produced ZERO $screen events (2026-08-20). ScreenTracker below is the
	// authoritative source instead.
	const autocapture = useMemo(
		() => ({ captureScreens: false, captureTouches: false }),
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
				<ScreenTracker client={client} />
				<UtmTracker client={client} />
				{children}
			</PostHogProvider>
		</AnalyticsContext.Provider>
	);
}

/** Emits a $screen per expo-router pathname change (autocapture fallback). */
function ScreenTracker({ client }: { client: PostHog }) {
	const pathname = usePathname();
	useEffect(() => {
		if (pathname) {
			client.screen(pathname);
		}
	}, [client, pathname]);
	return null;
}

/**
 * Cold-start deep-link UTM capture (B-D14). $set_once keeps only the FIRST
 * touch as `$initial_utm_*` person props; warm-start links are out of scope
 * for v1. Best-effort — a failed URL read just means no attribution.
 */
function UtmTracker({ client }: { client: PostHog }) {
	useEffect(() => {
		let alive = true;
		(async () => {
			const url = await getInitialURL().catch(() => null);
			if (!(alive && url)) {
				return;
			}
			const setOnce = initialUtmProps(url);
			if (setOnce) {
				client.capture("$set", { $set_once: setOnce });
			}
		})();
		return () => {
			alive = false;
		};
	}, [client]);
	return null;
}
