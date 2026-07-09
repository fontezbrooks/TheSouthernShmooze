import { render, fireEvent } from "@testing-library/react-native";
import { CategoryChips } from "../CategoryChips";
import { SUGGESTED_CATEGORIES } from "../categories";

describe("CategoryChips (D4)", () => {
  it("renders every default category as a chip", async () => {
    const { getByText } = await render(
      <CategoryChips selected="" onSelect={jest.fn()} />,
    );

    for (const category of SUGGESTED_CATEGORIES) {
      expect(getByText(category)).toBeTruthy();
    }
  });

  it("runs the tapped category as the search", async () => {
    const onSelect = jest.fn();
    const { getByText } = await render(
      <CategoryChips selected="" onSelect={onSelect} />,
    );

    await fireEvent.press(getByText("Plumbing"));

    expect(onSelect).toHaveBeenCalledWith("Plumbing");
  });

  it("marks the chip matching the current query as selected (case-insensitive)", async () => {
    const { getByRole } = await render(
      <CategoryChips selected="  plumbing " onSelect={jest.fn()} />,
    );

    expect(getByRole("button", { name: "Plumbing", selected: true })).toBeTruthy();
    expect(getByRole("button", { name: "Roofing", selected: false })).toBeTruthy();
  });

  it("marks nothing selected when the query matches no category", async () => {
    const { queryAllByRole } = await render(
      <CategoryChips selected="gutters" onSelect={jest.fn()} />,
    );

    expect(queryAllByRole("button", { selected: true })).toHaveLength(0);
  });

  it("renders a custom category list when provided", async () => {
    const { getByText, queryByText } = await render(
      <CategoryChips
        selected=""
        onSelect={jest.fn()}
        categories={["Gutters", "Fencing"]}
      />,
    );

    expect(getByText("Gutters")).toBeTruthy();
    expect(getByText("Fencing")).toBeTruthy();
    expect(queryByText("Plumbing")).toBeNull();
  });
});
