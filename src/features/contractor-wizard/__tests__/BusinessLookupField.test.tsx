import { useForm } from "react-hook-form";
import { render } from "@testing-library/react-native";
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
        surface: "#fff",
        text: "#000",
        textSoft: "#555",
        pine: "#264",
      },
      radii: { md: 16 },
      typography: { caption: {}, body: {}, bodySemi: {} },
    },
  }),
}));
jest.mock("../wizardApi", () => ({
  suggestPlaces: jest.fn().mockResolvedValue({ ok: true, data: [] }),
}));

interface HarnessProps {
  defaults: WizardValues;
  clearPlace: () => void;
}

function Harness({ defaults, clearPlace }: HarnessProps) {
  const form = useForm<WizardValues>({ defaultValues: defaults });
  return (
    <View>
      <BusinessLookupField
        control={form.control}
        placeId={defaults.placeId}
        placeAddress={defaults.placeAddress}
        pickPlace={jest.fn()}
        clearPlace={clearPlace}
        getPlaceSession={() => "sess-1"}
      />
    </View>
  );
}

describe("BusinessLookupField remount behavior (PR #34 review)", () => {
  test("keeps a picked listing when the step remounts with untouched text", async () => {
    const clearPlace = jest.fn();
    const { findByText } = await render(
      <Harness
        defaults={{
          ...emptyWizard,
          business: "Smith Plumbing",
          placeId: "p1",
          placeAddress: "Decatur, GA",
        }}
        clearPlace={clearPlace}
      />,
    );
    // Remount simulation IS the fresh mount: form already holds the pick.
    expect(await findByText(/Google listing confirmed/)).toBeTruthy();
    expect(clearPlace).not.toHaveBeenCalled();
  });
});
