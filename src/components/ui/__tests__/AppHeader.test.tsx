import { fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import type { ReactTestRendererJSON } from "react-test-renderer";
import { AppHeader } from "../AppHeader";

jest.mock("react-native-safe-area-context", () => ({
	useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 44 }),
}));
jest.mock("../Icon", () => {
	const { Text } = jest.requireActual("react-native");
	return {
		Icon: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>,
	};
});
// The wordmark is a transformer-imported SVG; only its label matters here.
jest.mock("../../../../assets/ShmoozeLogo-Horizontal.svg", () => {
	const { Text } = jest.requireActual("react-native");
	return ({ accessibilityLabel }: { accessibilityLabel: string }) => (
		<Text>{accessibilityLabel}</Text>
	);
});

describe("AppHeader", () => {
	it("defaults to the brand surface and can opt into the legacy one", async () => {
		const bgOf = (
			tree: ReturnType<typeof render> extends Promise<infer R> ? R : never
		) =>
			StyleSheet.flatten((tree.toJSON() as ReactTestRendererJSON).props.style)
				.backgroundColor;

		const brand = await render(<AppHeader />);
		expect(bgOf(brand)).toBe("#FFFDF8"); // magnolia
		await brand.unmount();

		const legacy = await render(<AppHeader surface="legacy" />);
		expect(bgOf(legacy)).toBe("#FFF8EA"); // vanilla
	});

	it("shows the wordmark and hides the back arrow by default", async () => {
		const { getByText, queryByLabelText } = await render(<AppHeader />);

		expect(getByText("The Southern Shmooze")).toBeTruthy();
		expect(queryByLabelText("Go back")).toBeNull();
	});

	it("shows a back button that calls onBack when showBack is set", async () => {
		const onBack = jest.fn();
		const { getByLabelText } = await render(
			<AppHeader onBack={onBack} showBack />
		);

		await fireEvent.press(getByLabelText("Go back"));

		expect(onBack).toHaveBeenCalledTimes(1);
	});
});
