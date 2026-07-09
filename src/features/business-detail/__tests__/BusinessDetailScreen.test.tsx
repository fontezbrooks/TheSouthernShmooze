import { render } from "@testing-library/react-native";
import { BusinessDetailScreen } from "../BusinessDetailScreen";
import type { BusinessDetail } from "../businessDetailTypes";

jest.mock("expo-router", () => ({
  useRouter: () => ({
    canGoBack: () => true,
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// AppHeader/Icon pull in SVG assets — out of scope for these behavior tests.
jest.mock("@/components/ui/AppHeader", () => ({ AppHeader: () => null }));
jest.mock("@/components/ui/Icon", () => ({ Icon: () => null }));

const mockFetchByUid = jest.fn();
jest.mock("../businessDetailRepository", () => ({
  businessDetailRepository: {
    fetchByUid: (uid: string) => mockFetchByUid(uid),
  },
}));

const makeDetail = (over: Partial<BusinessDetail> = {}): BusinessDetail => ({
  sourceUid: "uid-1",
  name: "Acme Roofing",
  logoUrl: null,
  tagline: "Roofs done right",
  isCertified: true,
  aboutText: "Family-owned roofing since 1980.",
  website: "https://acme.example.com",
  contactName: null,
  address: "1 Peachtree St, Atlanta, GA, 30301",
  socials: [
    { key: "bbb", label: "BBB", url: "https://bbb.example.com" },
    { key: "ylp", label: "Yelp", url: "https://yelp.example.com" },
  ],
  gallery: [],
  phones: [{ raw: "6787904781", display: "678-790-4781" }],
  ...over,
});

const renderScreen = () => render(<BusinessDetailScreen uid="uid-1" />);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("BusinessDetailScreen (E6)", () => {
  it("renders only the links the profile actually has (P6)", async () => {
    mockFetchByUid.mockResolvedValue({ ok: true, data: makeDetail() });
    const { findByText, queryByText } = await renderScreen();

    expect(await findByText("Website")).toBeTruthy();
    expect(queryByText("BBB")).toBeTruthy();
    expect(queryByText("Yelp")).toBeTruthy();
    expect(queryByText("Facebook")).toBeNull();
    expect(queryByText("Instagram")).toBeNull();
  });

  it("hides the Links section entirely when no links exist (P6)", async () => {
    mockFetchByUid.mockResolvedValue({
      ok: true,
      data: makeDetail({ website: null, socials: [] }),
    });
    const { findByText, queryByText } = await renderScreen();

    await findByText("Acme Roofing");
    expect(queryByText("Links")).toBeNull();
  });

  it("shows the sticky call bar with the primary phone (P4)", async () => {
    mockFetchByUid.mockResolvedValue({ ok: true, data: makeDetail() });
    const { findByText } = await renderScreen();

    expect(await findByText("Call 678-790-4781")).toBeTruthy();
  });

  it("hides the call bar when the profile has no phone (P4)", async () => {
    mockFetchByUid.mockResolvedValue({
      ok: true,
      data: makeDetail({ phones: [] }),
    });
    const { findByText, queryByText } = await renderScreen();

    await findByText("Acme Roofing");
    expect(queryByText(/^Call /)).toBeNull();
  });

  it("renders the address at the top and the description (P5/P8)", async () => {
    mockFetchByUid.mockResolvedValue({ ok: true, data: makeDetail() });
    const { findByText } = await renderScreen();

    expect(await findByText("1 Peachtree St, Atlanta, GA, 30301")).toBeTruthy();
    expect(await findByText("Family-owned roofing since 1980.")).toBeTruthy();
  });

  it("shows the error state when the profile cannot load", async () => {
    mockFetchByUid.mockResolvedValue({ ok: false, error: "Not found." });
    const { findByText } = await renderScreen();

    expect(await findByText("Not found.")).toBeTruthy();
  });
});
