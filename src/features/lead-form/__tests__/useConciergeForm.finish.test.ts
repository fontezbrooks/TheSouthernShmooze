import { act, renderHook } from "@testing-library/react-native";
import { useConciergeForm } from "../useConciergeForm";

jest.mock("../submitConcierge", () => ({
	newSubmissionId: jest.fn(() => "uuid"),
	submitConciergeLead: jest.fn(async () => ({ data: { id: "c" }, ok: true })),
	submitPartialLead: jest.fn(async () => ({ data: { id: "p" }, ok: true })),
}));

const mockTrack = jest.fn();
const mockResetIdentity = jest.fn();
// Stable references: the hook's mount effect depends on these, so fresh
// functions per render would re-fire it and inflate the initiation count.
const mockAnalytics = {
	identify: jest.fn(),
	resetIdentity: mockResetIdentity,
	resetIdentityForAudience: jest.fn(),
	track: mockTrack,
};
jest.mock("@/lib/analytics/useAnalytics", () => ({
	useAnalytics: () => mockAnalytics,
}));

// Capture the focus callback so the test can "return to the tab".
let mockFocus: (() => void) | null = null;
jest.mock("expo-router", () => ({
	useFocusEffect: (cb: () => void) => {
		mockFocus = cb;
	},
}));

const initiations = () =>
	mockTrack.mock.calls.filter(([name]) => name === "find_my_pro_initiated")
		.length;

const complete = async (result: {
	current: ReturnType<typeof useConciergeForm>;
}) => {
	await act(() => {
		result.current.stepOneForm.setValue("trade", "Plumbing");
		result.current.stepOneForm.setValue("zip", "30303");
	});
	await act(async () => {
		await result.current.advance();
	});
	await act(() => {
		result.current.stepTwoForm.setValue("firstName", "Jane");
		result.current.stepTwoForm.setValue("lastName", "Doe");
		result.current.stepTwoForm.setValue("email", "jane@example.com");
		result.current.stepTwoForm.setValue("phone", "5551234567");
	});
	await act(async () => {
		await result.current.submit();
	});
};

beforeEach(() => {
	jest.clearAllMocks();
	mockFocus = null;
});

describe("useConciergeForm finish (post-success Done) — review: PR #53", () => {
	it("does not start a phantom request or drop the identity on Done", async () => {
		const { result } = await renderHook(() => useConciergeForm());
		const afterMount = initiations(); // the one real initiation, on mount
		await complete(result);
		expect(result.current.step).toBe("success");

		await act(() => {
			result.current.finish();
		});

		expect(result.current.step).toBe("job");
		expect(initiations()).toBe(afterMount);
		expect(mockResetIdentity).not.toHaveBeenCalled();
	});

	it("emits exactly one initiation on the NEXT visit, not on every focus", async () => {
		const { result } = await renderHook(() => useConciergeForm());
		await complete(result);
		await act(() => {
			result.current.finish();
		});
		const before = initiations();

		await act(() => {
			mockFocus?.();
		});
		expect(initiations()).toBe(before + 1);

		await act(() => {
			mockFocus?.();
		});
		expect(initiations()).toBe(before + 1);
	});

	it("reset (stale-success re-entry) still starts a fresh request immediately", async () => {
		const { result } = await renderHook(() => useConciergeForm());
		await complete(result);
		const before = initiations();

		await act(() => {
			result.current.reset();
		});

		expect(initiations()).toBe(before + 1);
		expect(mockResetIdentity).toHaveBeenCalledTimes(1);
	});
});
