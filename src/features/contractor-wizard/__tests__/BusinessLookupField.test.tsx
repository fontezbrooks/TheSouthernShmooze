import { render } from "@testing-library/react-native";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { BusinessLookupField } from "../BusinessLookupField";
import { emptyWizard, type WizardValues } from "../wizardSchema";

// TextField transitively imports reanimated — mock at the test boundary.
jest.mock("@/features/lead-form/fields/TextField", () => ({
	TextField: () => null,
}));
jest.mock("@/theme/ThemeProvider", () => ({
	useTheme: () => ({
		brand: {
			colors: {
				line: "#eee",
				pine: "#264",
				surface: "#fff",
				text: "#000",
				textSoft: "#555",
			},
			radii: { md: 16 },
			typography: { body: {}, bodySemi: {}, caption: {} },
		},
	}),
}));
jest.mock("../wizardApi", () => ({
	suggestPlaces: jest.fn().mockResolvedValue({ data: [], ok: true }),
}));

interface HarnessProps {
	clearPlace: () => void;
	defaults: WizardValues;
}

function Harness({ defaults, clearPlace }: HarnessProps) {
	const form = useForm<WizardValues>({ defaultValues: defaults });
	return (
		<View>
			<BusinessLookupField
				clearPlace={clearPlace}
				control={form.control}
				getPlaceSession={() => "sess-1"}
				pickPlace={jest.fn()}
				placeAddress={defaults.placeAddress}
				placeId={defaults.placeId}
			/>
		</View>
	);
}

describe("BusinessLookupField remount behavior (PR #34 review)", () => {
	test("keeps a picked listing when the step remounts with untouched text", async () => {
		const clearPlace = jest.fn();
		const { findByText } = await render(
			<Harness
				clearPlace={clearPlace}
				defaults={{
					...emptyWizard,
					business: "Smith Plumbing",
					placeAddress: "Decatur, GA",
					placeId: "p1",
				}}
			/>
		);
		// Remount simulation IS the fresh mount: form already holds the pick.
		expect(await findByText(/Google listing confirmed/)).toBeTruthy();
		expect(clearPlace).not.toHaveBeenCalled();
	});
});
