import { fireEvent, render } from "@testing-library/react-native";
import { AboutScreen } from "../AboutScreen";

jest.mock("expo-router", () => ({
	useRouter: () => ({
		back: jest.fn(),
		canGoBack: () => true,
		replace: jest.fn(),
	}),
}));
const mockHeader = jest.fn();
jest.mock("@/components/ui/AppHeader", () => ({
	AppHeader: (props: Record<string, unknown>) => {
		mockHeader(props);
		return null;
	},
}));
jest.mock("@/components/ui/Icon", () => ({ Icon: () => null }));
const mockOpenLink = jest.fn();
jest.mock("@/lib/openLink", () => ({
	openLink: (url: string) => mockOpenLink(url),
}));

const HTTP_URL = /^https?:/;

describe("AboutScreen (design.md §E6)", () => {
	test("renders the kicker + title on a brand-surface header", async () => {
		const s = await render(<AboutScreen />);
		expect(s.getByText("Our story")).toBeTruthy();
		expect(s.getByRole("header", { name: "The Shmooze" })).toBeTruthy();
		expect(mockHeader).toHaveBeenCalledWith(
			expect.not.objectContaining({ surface: "legacy" })
		);
	});

	test("press and community rows link out", async () => {
		const s = await render(<AboutScreen />);
		expect(s.getByText("In the press")).toBeTruthy();
		expect(s.getByText("Join the community")).toBeTruthy();
		const links = s.getAllByRole("link");
		expect(links.length).toBeGreaterThan(0);
		await fireEvent.press(links[0]);
		expect(mockOpenLink).toHaveBeenCalledWith(expect.stringMatching(HTTP_URL));
	});
});
