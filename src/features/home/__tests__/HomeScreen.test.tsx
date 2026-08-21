import { fireEvent, render } from "@testing-library/react-native";
import { LINKS } from "@/lib/links";
import { HomeScreen } from "../HomeScreen";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
	useRouter: () => ({ push: mockPush }),
}));

// AppHeader pulls in the SVG wordmark; the rail owns its own tested behaviour
// (CertifiedProviders.test) and reaches Supabase through useProviders.
jest.mock("@/components/ui/AppHeader", () => ({ AppHeader: () => null }));
jest.mock("@/features/providers/CertifiedProviders", () => ({
	CertifiedProviders: () => null,
}));
jest.mock("@/components/ui/Icon", () => ({ Icon: () => null }));
jest.mock("../match-cover-logo.svg", () => "MatchCoverLogo");
jest.mock("../smily-peach.svg", () => "SmilyPeachLogo");

const mockOpenLink = jest.fn();
jest.mock("@/lib/openLink", () => ({
	openLink: (url: string) => mockOpenLink(url),
}));

const mockTrack = jest.fn();
const mockResetIdentity = jest.fn();
jest.mock("@/lib/analytics/useAnalytics", () => ({
	useAnalytics: () => ({
		resetIdentityForAudience: (...args: unknown[]) =>
			mockResetIdentity(...args),
		track: (...args: unknown[]) => mockTrack(...args),
	}),
}));

const CONCIERGE =
	"Concierge — we'll email recommendations of trusted local businesses based on your specific needs";
const MATCH = "Find Your Match — Tell us what you need, then swipe.";
const CONTRACTOR = "Are You a Local Pro? — Free, takes about 2 minutes.";
const COMMUNITY =
	"Ask the community — get recommendations and connect with locals";
const NEWSLETTER =
	"The Newsletter — local finds and happenings, delivered straight to your inbox";

beforeEach(() => {
	jest.clearAllMocks();
});

describe("HomeScreen", () => {
	it("renders every entry point on the tiered scroll", async () => {
		const { getByLabelText } = await render(<HomeScreen />);

		for (const label of [
			"Search the registry",
			CONCIERGE,
			MATCH,
			CONTRACTOR,
			COMMUNITY,
			NEWSLETTER,
			"Frequently asked questions",
			"About The Southern Shmooze",
		]) {
			expect(getByLabelText(label)).toBeTruthy();
		}
	});

	it("routes the search bar to the directory with the input focused", async () => {
		const { getByLabelText } = await render(<HomeScreen />);

		await fireEvent.press(getByLabelText("Search the registry"));

		expect(mockPush).toHaveBeenCalledWith("/directory?focus=1&from=home");
	});

	it("routes the concierge hero to the concierge form", async () => {
		const { getByLabelText } = await render(<HomeScreen />);

		await fireEvent.press(getByLabelText(CONCIERGE));

		expect(mockPush).toHaveBeenCalledWith("/concierge");
	});

	it("routes the match fork card to the swipe deck", async () => {
		const { getByLabelText } = await render(<HomeScreen />);

		await fireEvent.press(getByLabelText(MATCH));

		expect(mockPush).toHaveBeenCalledWith("/swipe");
	});

	it("drops to an anonymous contractor identity BEFORE the entry event", async () => {
		const { getByLabelText } = await render(<HomeScreen />);

		await fireEvent.press(getByLabelText(CONTRACTOR));

		// Order matters (review: PR #44) — a device identified as a different
		// audience must not attribute the contractor funnel to that person.
		expect(mockResetIdentity.mock.invocationCallOrder[0]).toBeLessThan(
			mockTrack.mock.invocationCallOrder[0]
		);
		expect(mockResetIdentity).toHaveBeenCalledWith("contractor");
		expect(mockTrack).toHaveBeenCalledWith("contractor_portal_started", {
			entry_point: "home_banner",
		});
		expect(mockPush).toHaveBeenCalledWith("/contractor-wizard");
	});

	it("opens the Facebook group from the community block", async () => {
		const { getByLabelText } = await render(<HomeScreen />);

		await fireEvent.press(getByLabelText(COMMUNITY));

		expect(mockOpenLink).toHaveBeenCalledWith(LINKS.facebook);
		expect(mockPush).not.toHaveBeenCalled();
	});

	it("opens the newsletter signup from the quiet strip", async () => {
		const { getByLabelText } = await render(<HomeScreen />);

		await fireEvent.press(getByLabelText(NEWSLETTER));

		expect(mockOpenLink).toHaveBeenCalledWith(LINKS.newsletter);
	});

	it("routes the footer content links", async () => {
		const { getByLabelText } = await render(<HomeScreen />);

		await fireEvent.press(getByLabelText("Frequently asked questions"));
		expect(mockPush).toHaveBeenCalledWith("/faq");

		await fireEvent.press(getByLabelText("About The Southern Shmooze"));
		expect(mockPush).toHaveBeenCalledWith("/about");
	});
});
