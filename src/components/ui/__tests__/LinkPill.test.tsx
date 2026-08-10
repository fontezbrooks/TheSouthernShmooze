import { render, fireEvent } from "@testing-library/react-native";
import { LinkPill } from "../LinkPill";

jest.mock("@/theme/ThemeProvider", () => ({
  useTheme: () => ({
    brand: {
      colors: { surface: "#fff", line: "#eee", text: "#000" },
      radii: { pill: 999 },
      shadow: { card: {} },
      typography: { chip: {} },
    },
  }),
}));

describe("LinkPill (footer-link polish)", () => {
  test("renders the label and fires onPress", async () => {
    const onPress = jest.fn();
    const s = await render(<LinkPill label="FAQ" onPress={onPress} />);

    await fireEvent.press(s.getByText("FAQ"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("exposes a button role with the a11y label override", async () => {
    const s = await render(
      <LinkPill
        label="FAQ"
        accessibilityLabel="Frequently asked questions"
        onPress={() => {}}
      />,
    );
    expect(
      s.getByRole("button", { name: "Frequently asked questions" }),
    ).toBeTruthy();
  });
});
