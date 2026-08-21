import { render } from "@testing-library/react-native";
import { ConciergeScreen } from "../ConciergeScreen";

jest.mock("expo-router", () => ({
	useRouter: () => ({
		back: jest.fn(),
		canGoBack: () => true,
		push: jest.fn(),
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
jest.mock("@/features/lead-form/ConciergeForm", () => {
	const { Text } = jest.requireActual("react-native");
	return { ConciergeForm: () => <Text>concierge-form</Text> };
});

describe("ConciergeScreen", () => {
	it("renders the kicker + title and a brand-surface header", async () => {
		const { getByText, getByRole } = await render(<ConciergeScreen />);

		expect(getByText("Concierge")).toBeTruthy();
		expect(getByRole("header", { name: "Find My Pro" })).toBeTruthy();
		expect(getByText("concierge-form")).toBeTruthy();
		// No legacy surface override: the page is magnolia now.
		expect(mockHeader).toHaveBeenCalledWith(
			expect.not.objectContaining({ surface: "legacy" })
		);
	});
});
