import { render, renderHook } from "@testing-library/react-native";
import type PostHog from "posthog-react-native";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { AnalyticsProvider } from "../AnalyticsProvider";
import { zipPrefix } from "../events";
import { isAnalyticsEnabled } from "../posthog";
import { useAnalytics, useFlag } from "../useAnalytics";

function makeClient(): PostHog {
	return {
		capture: jest.fn(),
		debug: jest.fn(),
		getFeatureFlag: jest.fn().mockReturnValue(true),
		identify: jest.fn(),
		onFeatureFlags: jest.fn().mockReturnValue(() => {
			/* unsubscribe */
		}),
		screen: jest.fn(),
	} as unknown as PostHog;
}

describe("isAnalyticsEnabled (B-FR7 capture gate)", () => {
	const base = {
		apiKey: "phc_test",
		debugEnabled: false,
		isDev: false,
		isTestEnv: false,
	};

	test("enabled in production builds with a key", () => {
		expect(isAnalyticsEnabled(base)).toBe(true);
	});

	test("disabled when the key is missing", () => {
		expect(isAnalyticsEnabled({ ...base, apiKey: "" })).toBe(false);
	});

	test("disabled under jest even with a key", () => {
		expect(isAnalyticsEnabled({ ...base, isTestEnv: true })).toBe(false);
	});

	test("disabled in dev without the debug flag", () => {
		expect(isAnalyticsEnabled({ ...base, isDev: true })).toBe(false);
	});

	test("enabled in dev when EXPO_PUBLIC_POSTHOG_DEBUG=1", () => {
		expect(
			isAnalyticsEnabled({ ...base, debugEnabled: true, isDev: true })
		).toBe(true);
	});
});

describe("zipPrefix (B-FR6 PII rule)", () => {
	test("truncates a 5-digit zip to 3 digits", () => {
		expect(zipPrefix("30307")).toBe("303");
	});

	test("strips zip+4 punctuation before truncating", () => {
		expect(zipPrefix("30307-1234")).toBe("303");
	});

	test("passes through shorter fragments without padding", () => {
		expect(zipPrefix("30")).toBe("30");
	});

	test("returns empty string for empty/garbage input", () => {
		expect(zipPrefix("")).toBe("");
		expect(zipPrefix("abc")).toBe("");
	});
});

describe("AnalyticsProvider with capture disabled", () => {
	test("renders children bare when the client is null", async () => {
		const { getByText } = await render(
			<AnalyticsProvider client={null}>
				<Text>child content</Text>
			</AnalyticsProvider>
		);
		expect(getByText("child content")).toBeTruthy();
	});
});

describe("useAnalytics", () => {
	const withClient =
		(client: PostHog | null) =>
		({ children }: { children: ReactNode }) => (
			<AnalyticsProvider client={client}>{children}</AnalyticsProvider>
		);

	test("track/identify are safe no-ops without a client", async () => {
		const { result } = await renderHook(() => useAnalytics(), {
			wrapper: withClient(null),
		});
		expect(() => {
			result.current.track("find_my_pro_initiated", {});
			result.current.identify("a@b.com", { user_type: "homeowner" });
		}).not.toThrow();
	});

	test("track forwards typed event + props to client.capture", async () => {
		const client = makeClient();
		const { result } = await renderHook(() => useAnalytics(), {
			wrapper: withClient(client),
		});
		result.current.track("shmoozer_card_swiped", {
			pro_business_id: "biz_1",
			session_swipe_count: 3,
			swipe_direction: "right",
		});
		expect(client.capture).toHaveBeenCalledWith("shmoozer_card_swiped", {
			pro_business_id: "biz_1",
			session_swipe_count: 3,
			swipe_direction: "right",
		});
	});

	test("identify forwards email + person props to client.identify", async () => {
		const client = makeClient();
		const { result } = await renderHook(() => useAnalytics(), {
			wrapper: withClient(client),
		});
		result.current.identify("pro@example.com", {
			applicant_trade: "Electrical",
			user_type: "contractor",
		});
		expect(client.identify).toHaveBeenCalledWith("pro@example.com", {
			applicant_trade: "Electrical",
			email: "pro@example.com",
			user_type: "contractor",
		});
	});
});

describe("useFlag", () => {
	test("undefined when capture is disabled", async () => {
		const { result } = await renderHook(() => useFlag("at-launch-l1-l5"), {
			wrapper: ({ children }: { children: ReactNode }) => (
				<AnalyticsProvider client={null}>{children}</AnalyticsProvider>
			),
		});
		expect(result.current).toBeUndefined();
	});

	test("reads the flag from the client and subscribes for updates", async () => {
		const client = makeClient();
		const { result } = await renderHook(() => useFlag("at-launch-l1-l5"), {
			wrapper: ({ children }: { children: ReactNode }) => (
				<AnalyticsProvider client={client}>{children}</AnalyticsProvider>
			),
		});
		expect(result.current).toBe(true);
		expect(client.onFeatureFlags).toHaveBeenCalled();
	});
});
