import { fireEvent, render } from "@testing-library/react-native";
import { useForm } from "react-hook-form";
import type { ConciergeStepOneValues } from "../conciergeSchema";
import { TradePicker } from "../TradePicker";

jest.mock("@/components/ui/FloatingLabel", () => {
	const { Text } = jest.requireActual("react-native");
	return {
		FloatingLabel: ({ label }: { label: string }) => <Text>{label}</Text>,
	};
});
jest.mock("@/components/ui/Icon", () => ({ Icon: () => null }));

const CUSTOM_LABEL = "What kind of pro do you need?";

function Harness({ trade }: { trade: string }) {
	const { control } = useForm<ConciergeStepOneValues>({
		defaultValues: { notes: "", trade, zip: "" },
	});
	return <TradePicker control={control} />;
}

describe("TradePicker", () => {
	it("starts in custom mode when the stored trade is not a preset (Back from step 2)", async () => {
		const { getByLabelText, getByRole } = await render(
			<Harness trade="Chimney sweep" />
		);

		expect(getByLabelText(CUSTOM_LABEL).props.value).toBe("Chimney sweep");
		expect(
			getByRole("button", { name: "Something else" }).props.accessibilityState
		).toEqual({ selected: true });
	});

	it("starts on the matching chip when the stored trade is a preset", async () => {
		const { queryByLabelText, getByRole } = await render(
			<Harness trade="Plumbing" />
		);

		expect(queryByLabelText(CUSTOM_LABEL)).toBeNull();
		expect(
			getByRole("button", { name: "Plumbing" }).props.accessibilityState
		).toEqual({ selected: true });
	});

	it("re-tapping Something else while already custom keeps the typed trade", async () => {
		const { getByLabelText, getByRole } = await render(
			<Harness trade="Chimney sweep" />
		);

		await fireEvent.press(getByRole("button", { name: "Something else" }));

		expect(getByLabelText(CUSTOM_LABEL).props.value).toBe("Chimney sweep");
	});
});
