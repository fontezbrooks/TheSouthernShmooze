import { render } from "@testing-library/react-native";
import { FitResult } from "../FitResult";
import type { FitVerdict } from "../wizardApi";

// Button transitively imports reanimated — mock at the test boundary.
jest.mock("@/components/ui/Button", () => ({
  Button: () => null,
}));
jest.mock("@/lib/openLink", () => ({ openLink: jest.fn() }));
jest.mock("@/theme/ThemeProvider", () => ({
  useTheme: () => ({
    brand: {
      colors: {
        line: "#eee",
        surface: "#fff",
        text: "#000",
        textSoft: "#555",
        clay: "#a84",
        pine: "#264",
      },
      radii: { lg: 28 },
      shadow: { card: {} },
      typography: {
        chip: {},
        caption: {},
        body: {},
        bodySemi: {},
        displayM: {},
      },
    },
  }),
}));

const base: FitVerdict = {
  outcome: "verified",
  rating: 4.6,
  reviewCount: 32,
  recommendedLevel: "Established Business",
  place: { placeId: "p", name: "Smith Plumbing LLC" },
  offline: false,
};

describe("FitResult membership recommendation (design.md §E5, PR #34 review)", () => {
  test("passing verdicts show the recommended level, price-free", async () => {
    const { findByText, queryByText } = await render(
      <FitResult
        verdict={base}
        businessName="Smith Plumbing"
        joinUrl="https://example.com/join"
        onStartOver={jest.fn()}
      />,
    );
    expect(await findByText("Established Business")).toBeTruthy();
    expect(queryByText(/\$/)).toBeNull();
  });

  test("the not-yet rejection shows no membership recommendation", async () => {
    const { queryByText } = await render(
      <FitResult
        verdict={{
          ...base,
          outcome: "not-yet",
          recommendedLevel: "Local Business",
        }}
        businessName="Smith Plumbing"
        joinUrl="https://example.com/join"
        onStartOver={jest.fn()}
      />,
    );
    expect(queryByText("Local Business")).toBeNull();
  });
});
