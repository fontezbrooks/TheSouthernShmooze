import { fireEvent, render } from "@testing-library/react-native";
import { CategoryChips } from "../CategoryChips";
import { SUGGESTED_CATEGORIES } from "../categories";

describe("CategoryChips (D4)", () => {
	it("renders every default category as a chip", async () => {
		const { getByText } = await render(
			<CategoryChips onSelect={jest.fn()} selected="" />
		);

		for (const category of SUGGESTED_CATEGORIES) {
			expect(getByText(category)).toBeTruthy();
		}
	});

	it("runs the tapped category as the search", async () => {
		const onSelect = jest.fn();
		const { getByText } = await render(
			<CategoryChips onSelect={onSelect} selected="" />
		);

		await fireEvent.press(getByText("Plumbing"));

		expect(onSelect).toHaveBeenCalledWith("Plumbing");
	});

	it("marks the chip matching the current query as selected (case-insensitive)", async () => {
		const { getByRole } = await render(
			<CategoryChips onSelect={jest.fn()} selected="  plumbing " />
		);

		expect(
			getByRole("button", { name: "Plumbing", selected: true })
		).toBeTruthy();
		expect(
			getByRole("button", { name: "Roofing", selected: false })
		).toBeTruthy();
	});

	it("marks nothing selected when the query matches no category", async () => {
		const { queryAllByRole } = await render(
			<CategoryChips onSelect={jest.fn()} selected="gutters" />
		);

		expect(queryAllByRole("button", { selected: true })).toHaveLength(0);
	});

	it("renders a custom category list when provided", async () => {
		const { getByText, queryByText } = await render(
			<CategoryChips
				categories={["Gutters", "Fencing"]}
				onSelect={jest.fn()}
				selected=""
			/>
		);

		expect(getByText("Gutters")).toBeTruthy();
		expect(getByText("Fencing")).toBeTruthy();
		expect(queryByText("Plumbing")).toBeNull();
	});
});
