import { act, renderHook } from "@testing-library/react-native";
import { useContractorWizard } from "../useContractorWizard";
import { type FitVerdict, submitApplication, verifyFit } from "../wizardApi";
import type { WizardValues } from "../wizardSchema";

jest.mock("expo-crypto", () => ({ randomUUID: () => "uuid-1" }));
jest.mock("../wizardApi", () => ({
	...jest.requireActual("../wizardApi"),
	submitApplication: jest.fn().mockResolvedValue(true),
	verifyFit: jest.fn(),
}));

const verifyFitMock = verifyFit as jest.MockedFunction<typeof verifyFit>;
const submitMock = submitApplication as jest.MockedFunction<
	typeof submitApplication
>;

const passVerdict: FitVerdict = {
	offline: false,
	outcome: "verified",
	place: { name: "Smith Plumbing LLC", placeId: "p" },
	rating: 4.8,
	recommendedLevel: "Market Leader",
	reviewCount: 40,
};

const stepValues: Partial<WizardValues>[] = [
	{ contact: "Jonah", email: "j@x.com", phone: "4045550134" },
	{ business: "Smith Plumbing" },
	{ licensedInsured: "yes", trade: "Plumbing", yearsInBusiness: "4-9" },
	{ serviceArea: "Decatur", webLink: "smith.com" },
	{ biggestChallenge: "Not enough leads", leadSource: "Paid ads" },
	{ reviewsRange: "11 to 50", wantHelp: "More leads" },
	{ painPoints: ["reviews"] },
];

// Skip the 700ms analyze floor: consecutive Date.now() calls advance 1s.
let now = 0;
beforeEach(() => {
	verifyFitMock.mockReset().mockResolvedValue(passVerdict);
	submitMock.mockClear();
	submitMock.mockResolvedValue(true);
	now = 0;
	jest.spyOn(Date, "now").mockImplementation(() => (now += 1000));
});
afterEach(() => jest.restoreAllMocks());

async function fillStep(
	result: { current: ReturnType<typeof useContractorWizard> },
	index: number
) {
	await act(async () => {
		for (const [k, v] of Object.entries(stepValues[index])) {
			result.current.form.setValue(k as keyof WizardValues, v as never);
		}
	});
}

describe("useContractorWizard", () => {
	test("blocks advance while the current step is invalid", async () => {
		const { result } = await renderHook(() => useContractorWizard());
		await act(async () => {
			await result.current.advance();
		});
		expect(result.current.step).toBe(1);
	});

	test("happy path: 7 steps, then verify + fire-and-forget submit", async () => {
		const { result } = await renderHook(() => useContractorWizard());
		for (let i = 0; i < 7; i++) {
			await fillStep(result, i);
			await act(async () => {
				await result.current.advance();
			});
			if (i < 6) {
				expect(result.current.step).toBe(i + 2);
			}
		}
		expect(result.current.phase).toBe("result");
		expect(result.current.verdict).toEqual(passVerdict);
		// handleSubmit passes resolver-TRANSFORMED values to verify.
		expect(verifyFitMock).toHaveBeenCalledWith(
			expect.objectContaining({ trade: "Plumbing" })
		);
		expect(submitMock).toHaveBeenCalledWith(
			expect.objectContaining({ business: "Smith Plumbing" }),
			passVerdict
		);
	});

	test("double-tapping the final advance runs verify + submit only once", async () => {
		const { result } = await renderHook(() => useContractorWizard());
		for (let i = 0; i < 6; i++) {
			await fillStep(result, i);
			await act(async () => {
				await result.current.advance();
			});
		}
		await fillStep(result, 6);
		await act(async () => {
			await Promise.all([result.current.advance(), result.current.advance()]);
		});
		expect(result.current.phase).toBe("result");
		expect(verifyFitMock).toHaveBeenCalledTimes(1);
		expect(submitMock).toHaveBeenCalledTimes(1);
	});

	test("step 4 requires a website unless the no-website box is checked", async () => {
		const { result } = await renderHook(() => useContractorWizard());
		for (let i = 0; i < 3; i++) {
			await fillStep(result, i);
			await act(async () => {
				await result.current.advance();
			});
		}
		await act(async () => {
			result.current.form.setValue("serviceArea", "Decatur");
		});
		await act(async () => {
			await result.current.advance();
		});
		expect(result.current.step).toBe(4);
		await act(async () => {
			result.current.form.setValue("noWebsite", true);
		});
		await act(async () => {
			await result.current.advance();
		});
		expect(result.current.step).toBe(5);
	});

	test("offline verify still passes (fallback verdict surfaces)", async () => {
		const offline: FitVerdict = {
			offline: true,
			outcome: "unverified",
			place: null,
			rating: null,
			recommendedLevel: "Established Business",
			reviewCount: null,
		};
		verifyFitMock.mockResolvedValue(offline);
		const { result } = await renderHook(() => useContractorWizard());
		for (let i = 0; i < 7; i++) {
			await fillStep(result, i);
			await act(async () => {
				await result.current.advance();
			});
		}
		expect(result.current.phase).toBe("result");
		expect(result.current.verdict?.outcome).toBe("unverified");
		expect(result.current.verdict?.offline).toBe(true);
	});

	test("leaving the screen mid-verification abandons the submit", async () => {
		let resolveVerify!: (v: FitVerdict) => void;
		verifyFitMock.mockReturnValue(
			new Promise<FitVerdict>((r) => {
				resolveVerify = r;
			})
		);
		const { result, unmount } = await renderHook(() => useContractorWizard());
		for (let i = 0; i < 6; i++) {
			await fillStep(result, i);
			await act(async () => {
				await result.current.advance();
			});
		}
		await fillStep(result, 6);
		let advancePromise!: Promise<void>;
		await act(async () => {
			// act drains microtasks, parking the advance at the verify await.
			advancePromise = result.current.advance() as Promise<void>;
		});
		// RNTL v14: unmount is async — must be awaited or cleanup hasn't run.
		await unmount();
		await act(async () => {
			resolveVerify(passVerdict);
			await advancePromise;
		});
		expect(submitMock).not.toHaveBeenCalled();
	});

	test("back is ignored while an advance is in flight", async () => {
		const { result } = await renderHook(() => useContractorWizard());
		await fillStep(result, 0);
		await act(async () => {
			// Back lands in the window where advance is awaiting validation —
			// the in-flight guard must ignore it, so the advance wins.
			const advancing = result.current.advance();
			result.current.back();
			await advancing;
		});
		expect(result.current.step).toBe(2);
	});

	test("back steps down and stops at 1", async () => {
		const { result } = await renderHook(() => useContractorWizard());
		await fillStep(result, 0);
		await act(async () => {
			await result.current.advance();
		});
		expect(result.current.step).toBe(2);
		await act(async () => {
			result.current.back();
		});
		expect(result.current.step).toBe(1);
		await act(async () => {
			result.current.back();
		});
		expect(result.current.step).toBe(1);
	});

	test("pickPlace stores the listing; clearPlace drops it", async () => {
		const { result } = await renderHook(() => useContractorWizard());
		await act(async () => {
			result.current.pickPlace({
				placeId: "p9",
				primary: "Smith Plumbing",
				secondary: "Decatur, GA",
			});
		});
		expect(result.current.form.getValues("placeId")).toBe("p9");
		expect(result.current.form.getValues("business")).toBe("Smith Plumbing");
		await act(async () => {
			result.current.clearPlace();
		});
		expect(result.current.form.getValues("placeId")).toBe("");
	});

	test("reset returns to a blank step 1", async () => {
		const { result } = await renderHook(() => useContractorWizard());
		for (let i = 0; i < 7; i++) {
			await fillStep(result, i);
			await act(async () => {
				await result.current.advance();
			});
		}
		expect(result.current.phase).toBe("result");
		await act(async () => {
			result.current.reset();
		});
		expect(result.current.step).toBe(1);
		expect(result.current.phase).toBe("form");
		expect(result.current.verdict).toBeNull();
		expect(result.current.form.getValues("contact")).toBe("");
	});
});

const mockTrack = jest.fn();
const mockIdentify = jest.fn();
const mockResetIdentity = jest.fn();
jest.mock("@/lib/analytics/useAnalytics", () => ({
	useAnalytics: () => ({
		identify: mockIdentify,
		resetIdentity: mockResetIdentity,
		track: mockTrack,
	}),
	useFlag: () => undefined,
}));

describe("qualification analytics (US-5)", () => {
	beforeEach(() => {
		mockTrack.mockClear();
		mockIdentify.mockClear();
	});

	async function walkToSubmit(result: {
		current: ReturnType<typeof useContractorWizard>;
	}) {
		for (let i = 0; i < stepValues.length; i += 1) {
			// biome-ignore lint/performance/noAwaitInLoops: wizard steps must advance sequentially
			await fillStep(result, i);
			await act(async () => {
				await result.current.advance();
			});
		}
	}

	test("verified outcome tracks approved with the applicant trade", async () => {
		const { result } = await renderHook(() => useContractorWizard());
		await walkToSubmit(result);
		expect(mockTrack).toHaveBeenCalledWith(
			"contractor_qualification_submitted",
			{
				applicant_trade: "Plumbing",
				instant_qualification_response: "approved",
			}
		);
	});

	test("identifies the contractor by form email on persisted success (P3)", async () => {
		const { result } = await renderHook(() => useContractorWizard());
		await walkToSubmit(result);
		expect(mockIdentify).toHaveBeenCalledWith("j@x.com", {
			applicant_trade: "Plumbing",
			user_type: "contractor",
		});
	});

	test("reset drops the analytics identity for a fresh application (PR #44)", async () => {
		mockResetIdentity.mockClear();
		const { result } = await renderHook(() => useContractorWizard());
		await walkToSubmit(result);
		await act(async () => {
			result.current.reset();
		});
		expect(mockResetIdentity).toHaveBeenCalledTimes(1);
	});

	test("not-yet outcome tracks flagged", async () => {
		verifyFitMock.mockResolvedValue({ ...passVerdict, outcome: "not-yet" });
		const { result } = await renderHook(() => useContractorWizard());
		await walkToSubmit(result);
		expect(mockTrack).toHaveBeenCalledWith(
			"contractor_qualification_submitted",
			{ applicant_trade: "Plumbing", instant_qualification_response: "flagged" }
		);
	});
});

describe("qualification analytics persistence gate (review PR #43)", () => {
	beforeEach(() => {
		mockTrack.mockClear();
		mockIdentify.mockClear();
	});

	test("no event when the application submit fails to persist", async () => {
		submitMock.mockResolvedValue(false);
		const { result } = await renderHook(() => useContractorWizard());
		for (let i = 0; i < stepValues.length; i += 1) {
			// biome-ignore lint/performance/noAwaitInLoops: wizard steps must advance sequentially
			await fillStep(result, i);
			await act(async () => {
				await result.current.advance();
			});
		}
		expect(result.current.phase).toBe("result");
		expect(mockTrack).not.toHaveBeenCalledWith(
			"contractor_qualification_submitted",
			expect.anything()
		);
		// Identity must gate on the same persistence result (P3).
		expect(mockIdentify).not.toHaveBeenCalled();
	});

	test("stale submit settling after reset restores neither identity nor event (PR #44)", async () => {
		let resolveSubmit: (persisted: boolean) => void = () => {
			/* replaced below */
		};
		submitMock.mockReturnValue(
			new Promise((resolve) => {
				resolveSubmit = resolve;
			})
		);
		const { result } = await renderHook(() => useContractorWizard());
		for (let i = 0; i < stepValues.length; i += 1) {
			// biome-ignore lint/performance/noAwaitInLoops: wizard steps must advance sequentially
			await fillStep(result, i);
			await act(async () => {
				await result.current.advance();
			});
		}
		expect(result.current.phase).toBe("result");
		// "Start over" begins a fresh (anonymous) application... (RNTL v14
		// act is async-only — the inner await keeps it awaited AND lintable.)
		await act(async () => {
			result.current.reset();
			await Promise.resolve();
		});
		// ...then the OLD application's submit finally persists.
		await act(async () => {
			resolveSubmit(true);
			await Promise.resolve();
		});
		expect(mockIdentify).not.toHaveBeenCalled();
		expect(mockTrack).not.toHaveBeenCalledWith(
			"contractor_qualification_submitted",
			expect.anything()
		);
	});

	test("submit settling after UNMOUNT identifies nothing (PR #44)", async () => {
		let resolveSubmit: (persisted: boolean) => void = () => {
			/* replaced below */
		};
		submitMock.mockReturnValue(
			new Promise((resolve) => {
				resolveSubmit = resolve;
			})
		);
		const { result, unmount } = await renderHook(() => useContractorWizard());
		for (let i = 0; i < stepValues.length; i += 1) {
			// biome-ignore lint/performance/noAwaitInLoops: wizard steps must advance sequentially
			await fillStep(result, i);
			await act(async () => {
				await result.current.advance();
			});
		}
		// Back header pops the wizard; another flow may begin on this device.
		await unmount();
		await act(async () => {
			resolveSubmit(true);
			await Promise.resolve();
		});
		expect(mockIdentify).not.toHaveBeenCalled();
		expect(mockTrack).not.toHaveBeenCalledWith(
			"contractor_qualification_submitted",
			expect.anything()
		);
	});
});
