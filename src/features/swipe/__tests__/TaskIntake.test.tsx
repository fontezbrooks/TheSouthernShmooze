import { fireEvent, render } from "@testing-library/react-native";
import type { SwipeTask } from "../swipeTypes";
import { TaskIntake } from "../TaskIntake";

describe("TaskIntake (S1/S2 — type-only intake)", () => {
	it("submits the keyword with the default radius and null budget/timing", async () => {
		const onSubmit = jest.fn();
		const { getByPlaceholderText, getByText } = await render(
			<TaskIntake onSubmit={onSubmit} />
		);

		await fireEvent.changeText(
			getByPlaceholderText("e.g. roofing, landscaping…"),
			"  roofing  "
		);
		await fireEvent.press(getByText("Find matches"));

		expect(onSubmit).toHaveBeenCalledWith({
			budget: null,
			keyword: "roofing",
			originLat: null,
			originLng: null,
			radiusKm: 25,
			timing: null,
		});
	});

	it("fills the keyword from a tapped category chip", async () => {
		const onSubmit = jest.fn();
		const { getByText } = await render(<TaskIntake onSubmit={onSubmit} />);

		await fireEvent.press(getByText("Plumbing"));
		await fireEvent.press(getByText("Find matches"));

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ keyword: "Plumbing" })
		);
	});

	it("does not submit an empty keyword", async () => {
		const onSubmit = jest.fn();
		const { getByText } = await render(<TaskIntake onSubmit={onSubmit} />);

		await fireEvent.press(getByText("Find matches"));

		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("preserves an existing task's fields when editing (Filters sheet)", async () => {
		const initial: SwipeTask = {
			budget: "lt_1000",
			keyword: "roofing",
			originLat: 33.7,
			originLng: -84.3,
			radiusKm: 50,
			timing: "asap",
		};
		const onSubmit = jest.fn();
		const { getByText } = await render(
			<TaskIntake initial={initial} onSubmit={onSubmit} submitLabel="Update" />
		);

		await fireEvent.press(getByText("Update"));

		expect(onSubmit).toHaveBeenCalledWith(initial);
	});
});
