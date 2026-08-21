import { fireEvent, render } from "@testing-library/react-native";
import type { useForm } from "react-hook-form";
import { ConciergeForm } from "../ConciergeForm";
import type {
	ConciergeStepOneValues,
	ConciergeStepTwoValues,
} from "../conciergeSchema";

jest.mock("@/components/ui/FloatingLabel", () => {
	const { Text } = jest.requireActual("react-native");
	return {
		FloatingLabel: ({ label }: { label: string }) => <Text>{label}</Text>,
	};
});
jest.mock("@/components/ui/Icon", () => ({ Icon: () => null }));
jest.mock("../PartnerReveal", () => {
	const { Text } = jest.requireActual("react-native");
	return { PartnerReveal: () => <Text>partner-reveal</Text> };
});

type Step = "job" | "contact" | "success";
let mockStep: Step = "job";
const mockAdvance = jest.fn();
const mockBack = jest.fn();
const mockSubmit = jest.fn();
const mockReset = jest.fn();

// Real RHF forms so TradePicker / TextField write-through can be asserted;
// the hook's network + analytics behaviour is covered by its own suite.
const mockForms: {
	one?: ReturnType<typeof useForm<ConciergeStepOneValues>>;
	two?: ReturnType<typeof useForm<ConciergeStepTwoValues>>;
} = {};
jest.mock("../useConciergeForm", () => ({
	useConciergeForm: () => {
		const { useForm: rhf } = jest.requireActual("react-hook-form");
		const { emptyStepOne, emptyStepTwo } =
			jest.requireActual("../conciergeSchema");
		mockForms.one = rhf({ defaultValues: emptyStepOne });
		mockForms.two = rhf({ defaultValues: emptyStepTwo });
		return {
			advance: mockAdvance,
			back: mockBack,
			errorMessage: null,
			reset: mockReset,
			status: "idle",
			step: mockStep,
			stepOneForm: mockForms.one,
			stepTwoForm: mockForms.two,
			submit: mockSubmit,
		};
	},
}));

const renderForm = () =>
	render(<ConciergeForm onBackHome={jest.fn()} onSeeDirectory={jest.fn()} />);

beforeEach(() => {
	jest.clearAllMocks();
	mockStep = "job";
});

describe("ConciergeForm", () => {
	it("step 1 speaks in the site's words and advances on Next", async () => {
		const { getByText, getByRole } = await renderForm();

		expect(getByText("Step 1 of 2")).toBeTruthy();
		expect(getByText("What do you need done?")).toBeTruthy();
		expect(
			getByText("Tell us the job and where you are. Takes about a minute.")
		).toBeTruthy();

		await fireEvent.press(getByRole("button", { name: "Next" }));
		expect(mockAdvance).toHaveBeenCalledTimes(1);
	});

	it("a chip writes the trade; Something else reveals a free-text trade field", async () => {
		const { getByRole, getByLabelText, queryByLabelText } = await renderForm();

		await fireEvent.press(getByRole("button", { name: "Plumbing" }));
		expect(mockForms.one?.getValues("trade")).toBe("Plumbing");
		expect(queryByLabelText("What kind of pro do you need?")).toBeNull();

		await fireEvent.press(getByRole("button", { name: "Something else" }));
		expect(mockForms.one?.getValues("trade")).toBe("");
		await fireEvent.changeText(
			getByLabelText("What kind of pro do you need?"),
			"Chimney sweep"
		);
		expect(mockForms.one?.getValues("trade")).toBe("Chimney sweep");

		// Picking a chip again hides the free-text field.
		await fireEvent.press(getByRole("button", { name: "Roofing" }));
		expect(mockForms.one?.getValues("trade")).toBe("Roofing");
		expect(queryByLabelText("What kind of pro do you need?")).toBeNull();
	});

	it("step 2 carries the contact copy, phone help, and submits via See My Match", async () => {
		mockStep = "contact";
		const { getByText, getByRole } = await renderForm();

		expect(getByText("Step 2 of 2")).toBeTruthy();
		expect(getByText("Almost there")).toBeTruthy();
		expect(getByText("How should your pro reach you?")).toBeTruthy();
		expect(
			getByText(
				"The one pro we match you with will use this to reach you. We never sell your number."
			)
		).toBeTruthy();

		await fireEvent.press(getByRole("button", { name: "See My Match" }));
		expect(mockSubmit).toHaveBeenCalledTimes(1);
		await fireEvent.press(getByRole("button", { name: "← Back" }));
		expect(mockBack).toHaveBeenCalledTimes(1);
	});

	it("success renders the partner reveal", async () => {
		mockStep = "success";
		const { getByText } = await renderForm();

		expect(getByText("partner-reveal")).toBeTruthy();
	});
});
