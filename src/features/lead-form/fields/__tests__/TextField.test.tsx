import { fireEvent, render } from "@testing-library/react-native";
import { useForm } from "react-hook-form";
import { TextField } from "../TextField";

jest.mock("@/components/ui/FloatingLabel", () => {
	const { Text } = jest.requireActual("react-native");
	return {
		FloatingLabel: ({ label }: { label: string }) => <Text>{label}</Text>,
	};
});
jest.mock("@/components/ui/Icon", () => ({ Icon: () => null }));

interface Values {
	phone: string;
}

function Harness({
	onValue,
	helperText,
}: {
	onValue: (v: string) => void;
	helperText?: string;
}) {
	const { control, watch } = useForm<Values>({ defaultValues: { phone: "" } });
	onValue(watch("phone"));
	return (
		<TextField
			control={control}
			helperText={helperText}
			label="Phone"
			name="phone"
		/>
	);
}

describe("TextField", () => {
	it("writes typed text into the form field and labels the input for AT", async () => {
		const onValue = jest.fn();
		const { getByLabelText } = await render(<Harness onValue={onValue} />);

		await fireEvent.changeText(getByLabelText("Phone"), "4045551234");

		expect(onValue).toHaveBeenLastCalledWith("4045551234");
	});

	it("passes helper text through to the shell", async () => {
		const { getByText } = await render(
			<Harness helperText="We never sell your number." onValue={jest.fn()} />
		);

		expect(getByText("We never sell your number.")).toBeTruthy();
	});
});
