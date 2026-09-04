import type { ErrorBoundaryProps } from "expo-router";
import { useEffect } from "react";
import { getAnalyticsClient } from "@/lib/analytics/posthog";
import { ErrorStateScreen } from "./ErrorStateScreen";

/**
 * Root crash boundary. Exported from `app/_layout.tsx` as `ErrorBoundary`,
 * the named export expo-router looks for; without it an uncaught render error
 * leaves a white screen with no way out but force-quitting.
 *
 * `retry` re-mounts the segment rather than reloading the app, so a transient
 * failure costs the user a tap instead of a cold start. The error itself is
 * deliberately not shown — a stack trace tells a homeowner nothing, and the
 * crash reporting that makes it actionable for us reports it separately.
 */
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
	// A React error boundary CATCHES the render error, so the SDK's uncaught
	// handler never sees it — without this, the crashes users actually hit are
	// the ones that go unreported. Read the singleton rather than the context:
	// this renders in place of the layout, so the provider above may be gone.
	useEffect(() => {
		getAnalyticsClient()?.captureException(error);
	}, [error]);

	return (
		<ErrorStateScreen
			actionLabel="Try again"
			body="That one is on us, not you. Give it another go — if it keeps happening, we would like to hear about it."
			heading="Something went sideways"
			kicker="Well, shoot"
			onAction={() => {
				retry();
			}}
		/>
	);
}
