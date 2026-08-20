import { act, renderHook } from "@testing-library/react-native";
import {
	newSubmissionId,
	submitConciergeLead,
	submitPartialLead,
} from "../submitConcierge";
import { useConciergeForm } from "../useConciergeForm";

jest.mock("../submitConcierge", () => {
	let counter = 0;
	return {
		newSubmissionId: jest.fn(() => `uuid-${++counter}`),
		submitConciergeLead: jest.fn(),
		submitPartialLead: jest.fn(),
	};
});

const mockedPartial = submitPartialLead as jest.MockedFunction<
	typeof submitPartialLead
>;
const mockedComplete = submitConciergeLead as jest.MockedFunction<
	typeof submitConciergeLead
>;

const stepOne = { notes: "Heater out", trade: "Plumbing", zip: "30303" };
const stepTwo = {
	email: "jane@example.com",
	firstName: "Jane",
	lastName: "Doe",
	phone: "5551234567",
};

async function fillStepOne(result: {
	current: ReturnType<typeof useConciergeForm>;
}) {
	await act(async () => {
		result.current.stepOneForm.setValue("trade", stepOne.trade);
		result.current.stepOneForm.setValue("zip", stepOne.zip);
		result.current.stepOneForm.setValue("notes", stepOne.notes);
		await result.current.advance();
	});
}

async function fillStepTwo(
	result: { current: ReturnType<typeof useConciergeForm> },
	extra: Record<string, unknown> = {}
) {
	await act(async () => {
		const form = result.current.stepTwoForm;
		for (const [k, v] of Object.entries({ ...stepTwo, ...extra })) {
			form.setValue(k as never, v as never);
		}
		await result.current.submit();
	});
}

beforeEach(() => {
	jest.clearAllMocks();
	mockedPartial.mockResolvedValue({ data: { id: "partial-row" }, ok: true });
	mockedComplete.mockResolvedValue({ data: { id: "complete-row" }, ok: true });
});

describe("useConciergeForm", () => {
	it("advance validates step 1, moves to contact, fires the partial lead", async () => {
		const { result } = await renderHook(() => useConciergeForm());

		await fillStepOne(result);

		expect(result.current.step).toBe("contact");
		expect(mockedPartial).toHaveBeenCalledWith(
			expect.objectContaining({ trade: "Plumbing", zip: "30303" }),
			expect.any(String)
		);
	});

	it("does not advance when step 1 is invalid, and fires nothing", async () => {
		const { result } = await renderHook(() => useConciergeForm());

		await act(async () => {
			await result.current.advance();
		});

		expect(result.current.step).toBe("job");
		expect(mockedPartial).not.toHaveBeenCalled();
	});

	it("submit completes with a DIFFERENT id from the partial and references the saved partial row", async () => {
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		await fillStepTwo(result);

		expect(result.current.step).toBe("success");
		const partialIdUsed = mockedPartial.mock.calls[0][1];
		const [, , partialRef, completionId] = mockedComplete.mock.calls[0];
		expect(partialRef).toBe("partial-row");
		expect(completionId).not.toBe(partialIdUsed);
	});

	it("passes null partial reference when the partial insert failed", async () => {
		mockedPartial.mockResolvedValue({ error: "down", ok: false });
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		await fillStepTwo(result);

		expect(mockedComplete.mock.calls[0][2]).toBeNull();
	});

	it("honeypot pretends success without submitting", async () => {
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		await fillStepTwo(result, { company: "totally-a-bot" });

		expect(result.current.step).toBe("success");
		expect(mockedComplete).not.toHaveBeenCalled();
	});

	it("submit failure shows the error and a retry reuses the same completion id", async () => {
		mockedComplete.mockResolvedValueOnce({ error: "boom", ok: false });
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		await fillStepTwo(result);

		expect(result.current.status).toBe("error");
		expect(result.current.errorMessage).toBe("boom");
		expect(result.current.step).toBe("contact");

		await act(async () => {
			await result.current.submit();
		});

		expect(result.current.step).toBe("success");
		const ids = mockedComplete.mock.calls.map((c) => c[3]);
		expect(ids[0]).toBe(ids[1]);
	});

	it("awaits an in-flight partial so a fast submit still links it", async () => {
		let resolvePartial!: (v: { ok: true; data: { id: string } }) => void;
		mockedPartial.mockReturnValue(
			new Promise((r) => {
				resolvePartial = r;
			}) as never
		);
		const { result } = await renderHook(() => useConciergeForm());

		await act(async () => {
			result.current.stepOneForm.setValue("trade", stepOne.trade);
			result.current.stepOneForm.setValue("zip", stepOne.zip);
			// Advance without awaiting — the partial stays in flight.
			result.current.advance();
			await Promise.resolve();
		});

		await act(async () => {
			const form = result.current.stepTwoForm;
			for (const [k, v] of Object.entries(stepTwo)) {
				form.setValue(k as never, v as never);
			}
			const submitting = result.current.submit();
			resolvePartial({ data: { id: "slow-partial" }, ok: true });
			await submitting;
		});

		expect(mockedComplete.mock.calls[0][2]).toBe("slow-partial");
	});

	it("mints a fresh partial id when step-1 values change after going back", async () => {
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		const firstId = mockedPartial.mock.calls[0][1];

		await act(async () => {
			result.current.back();
		});
		await act(async () => {
			result.current.stepOneForm.setValue("zip", "30044");
			await result.current.advance();
		});

		const secondId = mockedPartial.mock.calls[1][1];
		expect(secondId).not.toBe(firstId);
		expect(mockedPartial.mock.calls[1][0]).toEqual(
			expect.objectContaining({ zip: "30044" })
		);
	});

	it("reuses the same partial id when step-1 values are unchanged", async () => {
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		await act(async () => {
			result.current.back();
		});
		await act(async () => {
			await result.current.advance();
		});

		const ids = mockedPartial.mock.calls.map((c) => c[1]);
		expect(ids[0]).toBe(ids[1]);
	});

	it("ignores a stale partial resolving after an edited re-advance superseded it", async () => {
		let resolveFirst!: (v: { ok: true; data: { id: string } }) => void;
		mockedPartial
			.mockReturnValueOnce(
				new Promise((r) => {
					resolveFirst = r;
				}) as never
			)
			.mockResolvedValueOnce({ data: { id: "fresh-partial" }, ok: true });
		const { result } = await renderHook(() => useConciergeForm());

		await act(async () => {
			result.current.stepOneForm.setValue("trade", stepOne.trade);
			result.current.stepOneForm.setValue("zip", stepOne.zip);
			// First advance — its partial stays in flight.
			result.current.advance();
			await Promise.resolve();
		});
		await act(async () => {
			result.current.back();
		});
		await act(async () => {
			result.current.stepOneForm.setValue("zip", "30044");
			await result.current.advance();
		});
		await act(async () => {
			// Stale first insert resolves LAST — must not win.
			resolveFirst({ data: { id: "stale-partial" }, ok: true });
			await Promise.resolve();
		});
		await fillStepTwo(result);

		expect(mockedComplete.mock.calls[0][2]).toBe("fresh-partial");
	});

	it("honeypot filled at step 1 pretends success without a partial insert", async () => {
		const { result } = await renderHook(() => useConciergeForm());

		await act(async () => {
			result.current.stepTwoForm.setValue("company", "bot-filled");
			result.current.stepOneForm.setValue("trade", stepOne.trade);
			result.current.stepOneForm.setValue("zip", stepOne.zip);
			await result.current.advance();
		});

		expect(result.current.step).toBe("success");
		expect(mockedPartial).not.toHaveBeenCalled();
		expect(mockedComplete).not.toHaveBeenCalled();
	});

	it("mints a fresh completion id when values change after a failed submit", async () => {
		mockedComplete.mockResolvedValueOnce({ error: "lost response", ok: false });
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		await fillStepTwo(result);

		await act(async () => {
			result.current.stepTwoForm.setValue("phone", "4045550000");
			await result.current.submit();
		});

		const ids = mockedComplete.mock.calls.map((c) => c[3]);
		expect(ids[0]).not.toBe(ids[1]);
	});

	it("reset returns to the job step with cleared forms and fresh ids on the next flow", async () => {
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		await fillStepTwo(result);
		expect(result.current.step).toBe("success");

		await act(async () => {
			result.current.reset();
		});

		expect(result.current.step).toBe("job");
		expect(result.current.stepOneForm.getValues("zip")).toBe("");
		expect(result.current.stepTwoForm.getValues("email")).toBe("");

		await fillStepOne(result);
		const partialIds = mockedPartial.mock.calls.map((c) => c[1]);
		expect(partialIds[0]).not.toBe(partialIds[1]);
	});

	it("back is a no-op while a submission is in flight", async () => {
		let resolveComplete!: (v: { ok: true; data: { id: string } }) => void;
		mockedComplete.mockReturnValue(
			new Promise((r) => {
				resolveComplete = r;
			}) as never
		);
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);

		await act(async () => {
			const form = result.current.stepTwoForm;
			for (const [k, v] of Object.entries(stepTwo)) {
				form.setValue(k as never, v as never);
			}
			// Submit without resolving — stays in flight.
			result.current.submit();
			await Promise.resolve();
		});
		expect(result.current.status).toBe("submitting");

		await act(async () => {
			result.current.back();
		});
		expect(result.current.step).toBe("contact");

		await act(async () => {
			resolveComplete({ data: { id: "complete-row" }, ok: true });
			await Promise.resolve();
		});
		expect(result.current.step).toBe("success");
	});

	it("completes with the resolver-transformed job values, not raw form state", async () => {
		const { result } = await renderHook(() => useConciergeForm());

		await act(async () => {
			result.current.stepOneForm.setValue("trade", stepOne.trade);
			// Padded paste: zod trims it during advance; raw form state keeps it.
			result.current.stepOneForm.setValue("zip", " 30303 ");
			await result.current.advance();
		});
		await fillStepTwo(result);

		expect(mockedPartial.mock.calls[0][0]).toEqual(
			expect.objectContaining({ zip: "30303" })
		);
		expect(mockedComplete.mock.calls[0][0]).toEqual(
			expect.objectContaining({ zip: "30303" })
		);
	});

	it("back returns to the job step", async () => {
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);

		await act(async () => {
			result.current.back();
		});

		expect(result.current.step).toBe("job");
		expect(newSubmissionId).toHaveBeenCalled();
	});
});

const mockTrack = jest.fn();
const mockIdentify = jest.fn();
jest.mock("@/lib/analytics/useAnalytics", () => ({
	useAnalytics: () => ({ identify: mockIdentify, track: mockTrack }),
	useFlag: () => undefined,
}));

describe("find-my-pro analytics (US-2)", () => {
	it("tracks step 1 completion with the zip prefix and partial flag", async () => {
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		expect(mockTrack).toHaveBeenCalledWith("find_my_pro_step_1_completed", {
			partial_lead_recorded: true,
			requested_category: "Plumbing",
			zip_prefix: "303",
		});
	});

	it("reports partial_lead_recorded false when the partial insert fails", async () => {
		mockedPartial.mockResolvedValue({ error: "down", ok: false });
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		expect(mockTrack).toHaveBeenCalledWith("find_my_pro_step_1_completed", {
			partial_lead_recorded: false,
			requested_category: "Plumbing",
			zip_prefix: "303",
		});
	});

	it("tracks find_my_pro_submitted only on completion success", async () => {
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		await fillStepTwo(result);
		expect(mockTrack).toHaveBeenCalledWith("find_my_pro_submitted", {});
	});

	it("does not track submission when the completion insert fails", async () => {
		mockedComplete.mockResolvedValue({ error: "down", ok: false });
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		await fillStepTwo(result);
		expect(mockTrack).not.toHaveBeenCalledWith("find_my_pro_submitted", {});
		// Identity gates on the same completion result (P3).
		expect(mockIdentify).not.toHaveBeenCalled();
	});

	it("identifies the homeowner by form email on completion success (P3)", async () => {
		const { result } = await renderHook(() => useConciergeForm());
		await fillStepOne(result);
		await fillStepTwo(result);
		expect(mockIdentify).toHaveBeenCalledWith("jane@example.com", {
			user_type: "homeowner",
		});
	});
});
