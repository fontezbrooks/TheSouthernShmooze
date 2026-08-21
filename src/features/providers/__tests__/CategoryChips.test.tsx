import { fireEvent, render } from "@testing-library/react-native";
import { CategoryChips } from "../CategoryChips";

describe("CategoryChips", () => {
	it("renders every category as a button and marks the selected one", async () => {
		const { getByRole } = await render(
			<CategoryChips
				categories={["Plumbing", "Roofing"]}
				onSelect={jest.fn()}
				selected="roofing"
			/>
		);

		expect(
			getByRole("button", { name: "Plumbing" }).props.accessibilityState
		).toEqual({ selected: false });
		expect(
			getByRole("button", { name: "Roofing" }).props.accessibilityState
		).toEqual({ selected: true });
	});

	it("reports the tapped category", async () => {
		const onSelect = jest.fn();
		const { getByRole } = await render(
			<CategoryChips
				categories={["Plumbing"]}
				onSelect={onSelect}
				selected=""
			/>
		);

		await fireEvent.press(getByRole("button", { name: "Plumbing" }));

		expect(onSelect).toHaveBeenCalledWith("Plumbing");
	});
});
