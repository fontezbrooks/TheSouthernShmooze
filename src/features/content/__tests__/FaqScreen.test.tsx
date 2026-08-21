import { fireEvent, render } from "@testing-library/react-native";
import { FaqScreen } from "../FaqScreen";

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

describe("FaqScreen (design.md §E6)", () => {
	test("renders the kicker + title on a brand-surface header", async () => {
		const s = await render(<FaqScreen />);
		expect(s.getByText("Good to know")).toBeTruthy();
		expect(s.getByRole("header", { name: "FAQ" })).toBeTruthy();
		expect(mockHeader).toHaveBeenCalledWith(
			expect.not.objectContaining({ surface: "legacy" })
		);
	});

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
