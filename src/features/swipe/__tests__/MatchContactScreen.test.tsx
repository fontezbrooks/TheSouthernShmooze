import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { MatchContactScreen } from "../MatchContactScreen";
import type { SwipeSessionValue } from "../SwipeSessionProvider";
import type { DeckCard, SwipeTask } from "../swipeTypes";

const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
    push: jest.fn(),
    canGoBack: () => true,
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
  keyword: "roofing",
  originLat: null,
  originLng: null,
  radiusKm: 25,
  budget: null,
  timing: null,
};

const card = {
  id: "c1",
  sourceUid: "uid-1",
  name: "Roof Co",
  tagline: "",
  logoUrl: null,
  phone: null,
  phoneDisplay: null,
  hasCoupon: false,
  isCertified: false,
  recommended: false,
  latitude: null,
  longitude: null,
  confidence: 87,
  distanceKm: null,
  isFeatured: false,
  matchedTerms: [],
} satisfies DeckCard;

const makeSession = (
  over: Partial<SwipeSessionValue> = {},
): SwipeSessionValue => ({
  ready: true,
  sessionToken: "sess",
  task,
  contact: {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "6787904781",
    verified: false,
  },
  hasMatched: false,
  pending: { card, taskId: "task-1" },
  matchResult: null,
  setTask: jest.fn(),
  clearTask: jest.fn(),
  setContact: jest.fn(),
  markVerified: jest.fn(),
  markMatched: jest.fn(),
  setPending: jest.fn(),
  clearPending: jest.fn(),
  setMatchResult: jest.fn(),
  clearMatchResult: jest.fn(),
  ...over,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSaveContact.mockResolvedValue({ ok: true, data: undefined });
  mockSubmitLead.mockResolvedValue({ ok: true, data: "ok" });
});

describe("MatchContactScreen (CP1–CP3)", () => {
  it("renders the match copy and the task keyword chip", async () => {
    mockSession = makeSession();
    const { getByText } = await render(<MatchContactScreen />);

    expect(getByText("It’s a match!")).toBeTruthy();
    expect(
      getByText(
        "Share your details and your Shmooze preferred partner will reach out to you.",
      ),
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
      name: "Roof Co",
      first: true,
    });
    expect(mockSession.markMatched).toHaveBeenCalled();
    expect(mockSession.clearPending).toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalled();
  });

  it("shows the send error and keeps the page when the lead fails", async () => {
    mockSession = makeSession();
    mockSubmitLead.mockResolvedValue({ ok: false, error: "send failed" });
    const { getByText, findByText } = await render(<MatchContactScreen />);

    await fireEvent.press(getByText("Send request"));

    expect(await findByText("send failed")).toBeTruthy();
    expect(mockSession.setMatchResult).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });
});
