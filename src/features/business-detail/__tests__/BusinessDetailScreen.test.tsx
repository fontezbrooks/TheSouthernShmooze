import { render } from "@testing-library/react-native";
import { BusinessDetailScreen } from "../BusinessDetailScreen";
import type { BusinessDetail } from "../businessDetailTypes";

jest.mock("expo-router", () => ({
	useRouter: () => ({
		back: jest.fn(),
		canGoBack: () => true,
		push: jest.fn(),
		replace: jest.fn(),
	}),
}));

jest.mock("react-native-safe-area-context", () => ({
	useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
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
	aboutText: "Family-owned roofing since 1980.",
	address: "1 Peachtree St, Atlanta, GA, 30301",
	contactName: null,
	gallery: [],
	isCertified: true,
	logoUrl: null,
	name: "Acme Roofing",
	phones: [{ display: "678-790-4781", raw: "6787904781" }],
	socials: [
		{ key: "bbb", label: "BBB", url: "https://bbb.example.com" },
		{ key: "ylp", label: "Yelp", url: "https://yelp.example.com" },
	],
	sourceUid: "uid-1",
	tagline: "Roofs done right",
	website: "https://acme.example.com",
	...over,
});

const renderScreen = () => render(<BusinessDetailScreen uid="uid-1" />);

beforeEach(() => {
	jest.clearAllMocks();
});

describe("BusinessDetailScreen (E6)", () => {
	it("renders only the links the profile actually has (P6)", async () => {
		mockFetchByUid.mockResolvedValue({ data: makeDetail(), ok: true });
		const { findByText, queryByText } = await renderScreen();

		expect(await findByText("Website")).toBeTruthy();
		expect(queryByText("BBB")).toBeTruthy();
		expect(queryByText("Yelp")).toBeTruthy();
		expect(queryByText("Facebook")).toBeNull();
		expect(queryByText("Instagram")).toBeNull();
	});

	it("hides the Links section entirely when no links exist (P6)", async () => {
		mockFetchByUid.mockResolvedValue({
			data: makeDetail({ socials: [], website: null }),
			ok: true,
		});
		const { findByText, queryByText } = await renderScreen();

		await findByText("Acme Roofing");
		expect(queryByText("Links")).toBeNull();
	});

	it("shows the sticky call bar with the primary phone (P4)", async () => {
		mockFetchByUid.mockResolvedValue({ data: makeDetail(), ok: true });
		const { findByText } = await renderScreen();

		expect(await findByText("Call 678-790-4781")).toBeTruthy();
	});

	it("hides the call bar when the profile has no phone (P4)", async () => {
		mockFetchByUid.mockResolvedValue({
			data: makeDetail({ phones: [] }),
			ok: true,
		});
		const { findByText, queryByText } = await renderScreen();

		await findByText("Acme Roofing");
		expect(queryByText(/^Call /)).toBeNull();
	});

	it("renders the address at the top and the description (P5/P8)", async () => {
		mockFetchByUid.mockResolvedValue({ data: makeDetail(), ok: true });
		const { findByText } = await renderScreen();

		expect(await findByText("1 Peachtree St, Atlanta, GA, 30301")).toBeTruthy();
		expect(await findByText("Family-owned roofing since 1980.")).toBeTruthy();
	});

	it("shows the error state when the profile cannot load", async () => {
		mockFetchByUid.mockResolvedValue({ error: "Not found.", ok: false });
		const { findByText } = await renderScreen();

		expect(await findByText("Not found.")).toBeTruthy();
	});
});
