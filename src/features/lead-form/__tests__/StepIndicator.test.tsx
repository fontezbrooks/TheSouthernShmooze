import { render } from "@testing-library/react-native";
import { StepIndicator } from "../StepIndicator";

describe("StepIndicator", () => {
	it("announces the step as a progressbar and prints it for sighted users", async () => {
		const { getByRole, getByText } = await render(
			<StepIndicator step={2} total={2} />
		);

		expect(getByText("Step 2 of 2")).toBeTruthy();
		expect(getByRole("progressbar").props.accessibilityValue).toEqual({
			max: 2,
			min: 0,
			now: 2,
		});
	});
});
