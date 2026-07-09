import { render, fireEvent } from "@testing-library/react-native";
import { CertifiedProviders } from "../CertifiedProviders";
import type { ProvidersState } from "../useProviders";
import type { DirectoryBusiness } from "../providerTypes";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

let mockState: ProvidersState;
jest.mock("../useProviders", () => ({
  useProviders: () => mockState,
}));

// Card internals (reanimated press physics) are out of scope — the rail test
// only needs each card to be identifiable by name.
jest.mock("../BusinessCard", () => {
  const { Text } = jest.requireActual("react-native");
  return {
    BusinessCard: ({ business }: { business: { name: string } }) => (
      <Text>{business.name}</Text>
    ),
  };
});

const biz = (id: string): DirectoryBusiness => ({
  id,
  sourceUid: id,
  name: id,
  tagline: "",
  logoUrl: null,
  phone: null,
  phoneDisplay: null,
  hasCoupon: false,
  isCertified: true,
  recommended: false,
  latitude: null,
  longitude: null,
});

const makeState = (over: Partial<ProvidersState> = {}): ProvidersState => ({
  pinned: [biz("pinned-1"), biz("pinned-2"), biz("pinned-3")],
  more: [],
  loading: false,
  loadingMore: false,
  hasMore: true,
  error: null,
  loadMore: jest.fn(),
  ...over,
});

const renderRail = () => render(<CertifiedProviders onCallPress={jest.fn()} />);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CertifiedProviders (H6/H7)", () => {
  it("renders pinned cards followed by auto-loaded batches", async () => {
    mockState = makeState({ more: [biz("more-1"), biz("more-2")] });
    const { getByText } = await renderRail();

    for (const name of ["pinned-1", "pinned-3", "more-1", "more-2"]) {
      expect(getByText(name)).toBeTruthy();
    }
  });

  it("loads the next batch when the end of the rail is reached", async () => {
    mockState = makeState();
    const { getByTestId } = await renderRail();

    await fireEvent(getByTestId("providers-rail"), "onEndReached");

    expect(mockState.loadMore).toHaveBeenCalledTimes(1);
  });

  it("shows a footer spinner while a batch is loading", async () => {
    mockState = makeState({ loadingMore: true });
    const { getByLabelText } = await renderRail();

    expect(getByLabelText("Loading more providers")).toBeTruthy();
  });

  it("hides the footer spinner when no batch is in flight", async () => {
    mockState = makeState({ loadingMore: false });
    const { queryByLabelText } = await renderRail();

    expect(queryByLabelText("Loading more providers")).toBeNull();
  });

  it("routes the header View all button to the directory", async () => {
    mockState = makeState();
    const { getByText } = await renderRail();

    await fireEvent.press(getByText("View all"));

    expect(mockPush).toHaveBeenCalledWith("/directory");
  });

  it("shows the empty message when there are no providers", async () => {
    mockState = makeState({ pinned: [], hasMore: false });
    const { getByText, queryByTestId } = await renderRail();

    expect(getByText("No providers to show yet.")).toBeTruthy();
    expect(queryByTestId("providers-rail")).toBeNull();
  });

  it("shows the error message when the initial load fails with no cards", async () => {
    mockState = makeState({
      pinned: [],
      error: "Network error",
      hasMore: false,
    });
    const { getByText } = await renderRail();

    expect(getByText("Network error")).toBeTruthy();
  });
});
