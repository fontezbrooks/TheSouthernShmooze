import { fireEvent, render } from "@testing-library/react-native";
import { FaqScreen } from "../FaqScreen";

jest.mock("expo-router", () => ({
	useRouter: () => ({
		back: jest.fn(),
		canGoBack: () => true,
		replace: jest.fn(),
	}),
}));
jest.mock("@/components/ui/AppHeader", () => ({ AppHeader: () => null }));
jest.mock("@/components/ui/StrokedHeading", () => ({
	StrokedHeading: () => null,
}));
jest.mock("@/components/ui/Icon", () => ({ Icon: () => null }));
jest.mock("@/theme/assets", () => ({ daisyBackground: 1 }));
jest.mock("@/theme/ThemeProvider", () => ({
	useTheme: () => ({
		brand: {
			colors: {
				clay: "#a84",
				clayDark: "#843",
				line: "#eee",
				pine: "#264",
				surface: "#fff",
				text: "#000",
				textSoft: "#555",
			},
			radii: { md: 16, pill: 999 },
			shadow: { card: {} },
			typography: { body: {}, bodySemi: {}, caption: {}, chip: {} },
		},
		colors: { white: "#fff" },
		typography: { displayXS: {} },
	}),
}));

describe("FaqScreen (design.md §E6)", () => {
	test("shows homeowner topics by default", async () => {
		const s = await render(<FaqScreen />);
		expect(s.getByText("Finding & Hiring a Pro")).toBeTruthy();
		expect(s.queryByText("Joining & Getting Certified")).toBeNull();
	});

	test("contractor tab switches the topic list", async () => {
		const s = await render(<FaqScreen />);
		await fireEvent.press(s.getByText("For Contractors"));
		expect(s.getByText("Joining & Getting Certified")).toBeTruthy();
		expect(s.queryByText("Finding & Hiring a Pro")).toBeNull();
	});

	test("tapping a topic expands its questions", async () => {
		const s = await render(<FaqScreen />);
		expect(
			s.queryByText("How do I find a trusted contractor in Atlanta?")
		).toBeNull();
		await fireEvent.press(s.getByText("Finding & Hiring a Pro"));
		expect(
			s.getByText("How do I find a trusted contractor in Atlanta?")
		).toBeTruthy();
	});
});
