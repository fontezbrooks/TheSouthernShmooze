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
				clay: "#a84",
				line: "#eee",
				pine: "#264",
				surface: "#fff",
				text: "#000",
				textSoft: "#555",
			},
			radii: { lg: 28 },
			shadow: { card: {} },
			typography: {
				body: {},
				bodySemi: {},
				caption: {},
				chip: {},
				displayM: {},
			},
		},
	}),
}));

const base: FitVerdict = {
	offline: false,
	outcome: "verified",
	place: { name: "Smith Plumbing LLC", placeId: "p" },
	rating: 4.6,
	recommendedLevel: "Established Business",
	reviewCount: 32,
};

describe("FitResult membership recommendation (design.md §E5, PR #34 review)", () => {
	test("passing verdicts show the recommended level, price-free", async () => {
		const { findByText, queryByText } = await render(
			<FitResult
				businessName="Smith Plumbing"
				joinUrl="https://example.com/join"
				onStartOver={jest.fn()}
				verdict={base}
			/>
		);
		expect(await findByText("Established Business")).toBeTruthy();
		expect(queryByText(/\$/)).toBeNull();
	});

	test("the not-yet rejection shows no membership recommendation", async () => {
		const { queryByText } = await render(
			<FitResult
				businessName="Smith Plumbing"
				joinUrl="https://example.com/join"
				onStartOver={jest.fn()}
				verdict={{
					...base,
					outcome: "not-yet",
					recommendedLevel: "Local Business",
				}}
			/>
		);
		expect(queryByText("Local Business")).toBeNull();
	});
});
