import { fireEvent, render } from "@testing-library/react-native";
import { Button, type ButtonVariant } from "../Button";

jest.mock("../Icon", () => {
	const { Text } = jest.requireActual("react-native");
	return {
		Icon: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>,
	};
});

const VARIANTS: ButtonVariant[] = [
	"primary",
	"solid",
	"pill",
	"wide",
	"outline",
];

const LEADING_ORDER = /icon:phoneFilled|Call/;
const TRAILING_ORDER = /icon:arrowRight|Next/;

describe("Button", () => {
	it.each(VARIANTS)(
		"renders the %s variant with its label",
		async (variant) => {
			const { getByRole } = await render(
				<Button label={`Go ${variant}`} onPress={jest.fn()} variant={variant} />
			);

			expect(getByRole("button", { name: `Go ${variant}` })).toBeTruthy();
		}
	);

	it("calls onPress when pressed", async () => {
		const onPress = jest.fn();
		const { getByRole } = await render(
			<Button label="Send" onPress={onPress} />
		);

		await fireEvent.press(getByRole("button", { name: "Send" }));

		expect(onPress).toHaveBeenCalledTimes(1);
	});

	it("blocks presses and exposes the disabled state to assistive tech", async () => {
		const onPress = jest.fn();
		const { getByRole } = await render(
			<Button disabled label="Send" onPress={onPress} />
		);
		const button = getByRole("button", { name: "Send" });

		await fireEvent.press(button);

		expect(onPress).not.toHaveBeenCalled();
		expect(button.props.accessibilityState).toEqual({ disabled: true });
	});

	it("renders the icon on the requested side of the label", async () => {
		const leading = await render(
			<Button icon="phoneFilled" iconPosition="leading" label="Call" />
		);
		const [first] = leading.getAllByText(LEADING_ORDER);
		expect(first.props.children).toBe("icon:phoneFilled");
		await leading.unmount();

		const trailing = await render(<Button icon="arrowRight" label="Next" />);
		const [firstTrailing] = trailing.getAllByText(TRAILING_ORDER);
		expect(firstTrailing.props.children).toBe("Next");
	});
});
