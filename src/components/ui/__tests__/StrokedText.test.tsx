import { render } from "@testing-library/react-native";
import { StrokedText } from "../StrokedText";

describe("StrokedText (form-page readability polish)", () => {
  test("exposes the text exactly once to accessibility queries", async () => {
    const s = await render(<StrokedText>Step title</StrokedText>);
    expect(s.getAllByText("Step title")).toHaveLength(1);
  });

  test("thin stroke renders 8 hidden copies behind the fill", async () => {
    const s = await render(<StrokedText>Label</StrokedText>);
    const all = s.getAllByText("Label", { includeHiddenElements: true });
    expect(all).toHaveLength(9);
  });

  test("thick stroke (>2) uses the dense 16-sample ring", async () => {
    const s = await render(
      <StrokedText strokeWidth={4}>Heading</StrokedText>,
    );
    const all = s.getAllByText("Heading", { includeHiddenElements: true });
    expect(all).toHaveLength(17);
  });

  test("forwards TextProps (accessibilityLabel) to the fill copy", async () => {
    const s = await render(
      <StrokedText accessibilityLabel="Step 1 of 7">STEP 1 OF 7</StrokedText>,
    );
    expect(s.getByLabelText("Step 1 of 7")).toBeTruthy();
  });
});
