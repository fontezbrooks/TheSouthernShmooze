import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { MatchContactScreen } from "../MatchContactScreen";
import type { SwipeSessionValue } from "../SwipeSessionProvider";
import type { DeckCard, SwipeTask } from "../swipeTypes";

const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
	useRouter: () => ({
		back: mockBack,
		canGoBack: () => true,
		push: jest.fn(),
		replace: mockReplace,
	}),
}));

// AppHeader pulls in the SVG wordmark; expose only the back affordance.
jest.mock("@/components/ui/AppHeader", () => {
	const { Text } = jest.requireActual("react-native");
	return {
		AppHeader: ({ onBack }: { onBack?: () => void }) => (
			<Text onPress={onBack}>header-back</Text>
		),
	};
});
jest.mock("@/components/ui/Icon", () => ({ Icon: () => null }));

// The form fields render reanimated floating labels (no native worklets under
// jest); the RHF state itself still validates the prefilled values on submit.
jest.mock("@/features/lead-form/fields/TextField", () => ({
	TextField: () => null,
}));
jest.mock("@/features/lead-form/fields/BudgetSelect", () => ({
	BudgetSelect: () => null,
}));

const mockSaveContact = jest.fn();
const mockSubmitLead = jest.fn();
jest.mock("../swipeRepository", () => ({
	swipeRepository: {
		saveContact: (...args: unknown[]) => mockSaveContact(...args),
		submitLead: (...args: unknown[]) => mockSubmitLead(...args),
	},
}));

let mockSession: SwipeSessionValue;
jest.mock("../SwipeSessionProvider", () => ({
	useSwipeSession: () => mockSession,
}));

const task: SwipeTask = {
	budget: null,
	keyword: "roofing",
	originLat: null,
	originLng: null,
	radiusKm: 25,
	timing: null,
};

const card = {
	confidence: 87,
	distanceKm: null,
	hasCoupon: false,
	id: "c1",
	isCertified: false,
	isFeatured: false,
	latitude: null,
	logoUrl: null,
	longitude: null,
	matchedTerms: [],
	name: "Roof Co",
	phone: null,
	phoneDisplay: null,
	recommended: false,
	sourceUid: "uid-1",
	tagline: "",
} satisfies DeckCard;

const makeSession = (
	over: Partial<SwipeSessionValue> = {}
): SwipeSessionValue => ({
	clearMatchResult: jest.fn(),
	clearPending: jest.fn(),
	clearTask: jest.fn(),
	contact: {
		email: "jane@example.com",
		name: "Jane Doe",
		phone: "6787904781",
		verified: false,
	},
	hasMatched: false,
	markMatched: jest.fn(),
	markVerified: jest.fn(),
	matchResult: null,
	pending: { card, taskId: "task-1" },
	ready: true,
	sessionToken: "sess",
	setContact: jest.fn(),
	setMatchResult: jest.fn(),
	setPending: jest.fn(),
	setTask: jest.fn(),
	task,
	...over,
});

beforeEach(() => {
	jest.clearAllMocks();
	mockSaveContact.mockResolvedValue({ data: undefined, ok: true });
	mockSubmitLead.mockResolvedValue({ data: "ok", ok: true });
});

describe("MatchContactScreen (CP1–CP3)", () => {
	it("renders the match copy and the task keyword chip", async () => {
		mockSession = makeSession();
		const { getByText } = await render(<MatchContactScreen />);

		expect(getByText("It’s a match!")).toBeTruthy();
		expect(
			getByText(
				"Share your details and your Shmooze preferred partner will reach out to you."
			)
		).toBeTruthy();
		expect(getByText("roofing")).toBeTruthy();
	});

	it("bounces back to the deck when there is no pending match", async () => {
		mockSession = makeSession({ pending: null });
		await render(<MatchContactScreen />);

		expect(mockReplace).toHaveBeenCalledWith("/swipe");
	});

	it("back cancels without sending (CP1)", async () => {
		mockSession = makeSession();
		const { getByText } = await render(<MatchContactScreen />);

		await fireEvent.press(getByText("header-back"));

		expect(mockBack).toHaveBeenCalled();
		expect(mockSubmitLead).not.toHaveBeenCalled();
		expect(mockSession.setMatchResult).not.toHaveBeenCalled();
	});

	it("sends the lead and reports the match result on submit", async () => {
		mockSession = makeSession();
		const { getByText } = await render(<MatchContactScreen />);

		await fireEvent.press(getByText("Send request"));

		await waitFor(() => expect(mockSubmitLead).toHaveBeenCalled());
		expect(mockSaveContact).toHaveBeenCalled();
		expect(mockSubmitLead).toHaveBeenCalledWith("sess", "task-1", "uid-1", 87);
		expect(mockSession.setMatchResult).toHaveBeenCalledWith({
			first: true,
			name: "Roof Co",
		});
		expect(mockSession.markMatched).toHaveBeenCalled();
		expect(mockSession.clearPending).toHaveBeenCalled();
		expect(mockBack).toHaveBeenCalled();
	});

	it("shows the send error and keeps the page when the lead fails", async () => {
		mockSession = makeSession();
		mockSubmitLead.mockResolvedValue({ error: "send failed", ok: false });
		const { getByText, findByText } = await render(<MatchContactScreen />);

		await fireEvent.press(getByText("Send request"));

		expect(await findByText("send failed")).toBeTruthy();
		expect(mockSession.setMatchResult).not.toHaveBeenCalled();
		expect(mockBack).not.toHaveBeenCalled();
	});
});

const mockTrack = jest.fn();
jest.mock("@/lib/analytics/useAnalytics", () => ({
	useAnalytics: () => ({ identify: jest.fn(), track: mockTrack }),
	useFlag: () => undefined,
}));

describe("match analytics (US-4)", () => {
	it("tracks shmoozer_match_triggered when the lead send succeeds", async () => {
		mockSession = makeSession();
		const { getByText } = await render(<MatchContactScreen />);
		await fireEvent.press(getByText("Send request"));
		await waitFor(() =>
			expect(mockTrack).toHaveBeenCalledWith("shmoozer_match_triggered", {
				concierge_request_id: "task-1",
				pro_business_id: "uid-1",
			})
		);
	});

	it("does not track a match when the send fails", async () => {
		mockSession = makeSession();
		mockSubmitLead.mockResolvedValue({ error: "down", ok: false });
		const { getByText } = await render(<MatchContactScreen />);
		await fireEvent.press(getByText("Send request"));
		await waitFor(() => expect(mockSubmitLead).toHaveBeenCalled());
		expect(mockTrack).not.toHaveBeenCalledWith(
			"shmoozer_match_triggered",
			expect.anything()
		);
	});
});
