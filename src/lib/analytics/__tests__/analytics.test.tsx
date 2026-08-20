import { render, renderHook, waitFor } from "@testing-library/react-native";
import type PostHog from "posthog-react-native";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { AnalyticsProvider } from "../AnalyticsProvider";
import { zipPrefix } from "../events";
import { isAnalyticsEnabled } from "../posthog";
import { useAnalytics, useFlag } from "../useAnalytics";
import { initialUtmProps } from "../utm";

jest.mock("expo-linking", () => ({
	getInitialURL: jest.fn().mockResolvedValue(null),
}));
const mockGetInitialURL = jest.requireMock("expo-linking")
	.getInitialURL as jest.Mock;

function makeClient(): PostHog {
	return {
		capture: jest.fn(),
		debug: jest.fn(),
		getDistinctId: jest.fn().mockReturnValue("0a1b2c3d-anon-uuid"),
		getFeatureFlag: jest.fn().mockReturnValue(true),
		getSessionId: jest.fn().mockReturnValue("ph-session-1"),
		identify: jest.fn(),
		onFeatureFlags: jest.fn().mockReturnValue(() => {
			/* unsubscribe */
		}),
		reset: jest.fn(),
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
			is_promoted: false,
			pro_business_id: "biz_1",
			session_swipe_count: 3,
			swipe_direction: "right",
		});
		expect(client.capture).toHaveBeenCalledWith("shmoozer_card_swiped", {
			is_promoted: false,
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

	test("identify from anonymous does NOT reset (merge handles linkage)", async () => {
		const client = makeClient();
		const { result } = await renderHook(() => useAnalytics(), {
			wrapper: withClient(client),
		});
		result.current.identify("a@b.com", { user_type: "homeowner" });
		expect(client.reset).not.toHaveBeenCalled();
	});

	test("identify resets first when switching identified persons (PR #44)", async () => {
		const client = makeClient();
		(client.getDistinctId as jest.Mock).mockReturnValue("old@b.com");
		const { result } = await renderHook(() => useAnalytics(), {
			wrapper: withClient(client),
		});
		result.current.identify("new@b.com", { user_type: "homeowner" });
		expect(client.reset).toHaveBeenCalledTimes(1);
		expect(client.identify).toHaveBeenCalledWith("new@b.com", {
			email: "new@b.com",
			user_type: "homeowner",
		});
	});

	test("re-identifying the SAME email does not reset", async () => {
		const client = makeClient();
		(client.getDistinctId as jest.Mock).mockReturnValue("a@b.com");
		const { result } = await renderHook(() => useAnalytics(), {
			wrapper: withClient(client),
		});
		result.current.identify("A@B.com", { user_type: "homeowner" });
		expect(client.reset).not.toHaveBeenCalled();
	});

	test("resetIdentity forwards to client.reset and no-ops without one", async () => {
		const bare = await renderHook(() => useAnalytics(), {
			wrapper: withClient(null),
		});
		expect(() => bare.result.current.resetIdentity()).not.toThrow();

		const client = makeClient();
		const { result } = await renderHook(() => useAnalytics(), {
			wrapper: withClient(client),
		});
		result.current.resetIdentity();
		expect(client.reset).toHaveBeenCalledTimes(1);
	});

	test("identify normalizes the distinct id (trim + lowercase)", async () => {
		const client = makeClient();
		const { result } = await renderHook(() => useAnalytics(), {
			wrapper: withClient(client),
		});
		result.current.identify("  Jane@Example.COM ", {
			user_type: "homeowner",
		});
		expect(client.identify).toHaveBeenCalledWith("jane@example.com", {
			email: "jane@example.com",
			user_type: "homeowner",
		});
	});
});

describe("initialUtmProps (B-D14 deep-link UTM)", () => {
	test("extracts only utm_* params as $initial_ props", () => {
		expect(
			initialUtmProps(
				"shmooze://home?utm_source=facebook&utm_campaign=launch&foo=bar"
			)
		).toEqual({
			$initial_utm_campaign: "launch",
			$initial_utm_source: "facebook",
		});
	});

	test("null when the URL has no query or no utm params", () => {
		expect(initialUtmProps("shmooze://home")).toBeNull();
		expect(initialUtmProps("shmooze://home?foo=bar")).toBeNull();
	});

	test("stops at the fragment and decodes encoded values", () => {
		expect(
			initialUtmProps("https://x.com/p?utm_source=qr%20flyer#utm_medium=nope")
		).toEqual({ $initial_utm_source: "qr flyer" });
	});
});

describe("UtmTracker (cold-start deep link)", () => {
	test("$set_once fires when the initial URL carries utm params", async () => {
		mockGetInitialURL.mockResolvedValueOnce(
			"shmooze://home?utm_source=facebook"
		);
		const client = makeClient();
		await render(
			<AnalyticsProvider client={client}>
				<Text>app</Text>
			</AnalyticsProvider>
		);
		await waitFor(() => {
			expect(client.capture).toHaveBeenCalledWith("$set", {
				$set_once: { $initial_utm_source: "facebook" },
			});
		});
	});

	test("no capture when the app launched without a deep link", async () => {
		mockGetInitialURL.mockResolvedValueOnce(null);
		const client = makeClient();
		await render(
			<AnalyticsProvider client={client}>
				<Text>app</Text>
			</AnalyticsProvider>
		);
		expect(client.capture).not.toHaveBeenCalled();
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

describe("sessionKey", () => {
	test("null without a client; PostHog session id with one", async () => {
		const noClient = await renderHook(() => useAnalytics(), {
			wrapper: ({ children }: { children: ReactNode }) => (
				<AnalyticsProvider client={null}>{children}</AnalyticsProvider>
			),
		});
		expect(noClient.result.current.sessionKey()).toBeNull();

		const client = makeClient();
		const withClient = await renderHook(() => useAnalytics(), {
			wrapper: ({ children }: { children: ReactNode }) => (
				<AnalyticsProvider client={client}>{children}</AnalyticsProvider>
			),
		});
		expect(withClient.result.current.sessionKey()).toBe("ph-session-1");
	});
});
