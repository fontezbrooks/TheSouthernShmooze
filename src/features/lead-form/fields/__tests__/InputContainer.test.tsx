import { render } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";
import type { ReactTestRendererJSON } from "react-test-renderer";
import { InputContainer } from "../InputContainer";

// Reanimated under jest: the label's float animation is out of scope here.
jest.mock("@/components/ui/FloatingLabel", () => {
	const { Text: T } = jest.requireActual("react-native");
	return { FloatingLabel: ({ label }: { label: string }) => <T>{label}</T> };
});
jest.mock("@/components/ui/Icon", () => ({ Icon: () => null }));

const CLAY = "#A8472B";
const LINE = "#E4D6BE";
const ERROR = "#EE4145";

/** Border colour of the input box — the first child of the wrap. */
const borderOf = (tree: ReactTestRendererJSON) => {
	const box = tree.children?.[0] as ReactTestRendererJSON;
	return StyleSheet.flatten(box.props.style).borderColor;
};

describe("InputContainer", () => {
	it("rests on the warm hairline", async () => {
		const r = await render(
			<InputContainer floated={false} label="Zip code">
				<Text>30303</Text>
			</InputContainer>
		);
		expect(borderOf(r.toJSON() as ReactTestRendererJSON)).toBe(LINE);
	});

	it("shows a clay focus ring while focused", async () => {
		const r = await render(
			<InputContainer floated focused label="Zip code">
				<Text>30303</Text>
			</InputContainer>
		);
		expect(borderOf(r.toJSON() as ReactTestRendererJSON)).toBe(CLAY);
	});

	it("turns red and shows the error instead of the helper", async () => {
		const r = await render(
			<InputContainer
				error="Enter a 5-digit zip code"
				floated
				helperText="We never sell your number."
				label="Zip code"
			>
				<Text>303</Text>
			</InputContainer>
		);
		expect(borderOf(r.toJSON() as ReactTestRendererJSON)).toBe(ERROR);
		expect(r.getByText("Enter a 5-digit zip code")).toBeTruthy();
		expect(r.queryByText("We never sell your number.")).toBeNull();
	});

	it("shows the helper caption when there is no error", async () => {
		const r = await render(
			<InputContainer
				floated={false}
				helperText="We never sell your number."
				label="Phone"
			>
				<Text />
			</InputContainer>
		);
		expect(r.getByText("We never sell your number.")).toBeTruthy();
	});
});
