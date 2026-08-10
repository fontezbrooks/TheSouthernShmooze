import { renderHook, act } from "@testing-library/react-native";
import { useContractorWizard } from "../useContractorWizard";
import { verifyFit, submitApplication, type FitVerdict } from "../wizardApi";
import type { WizardValues } from "../wizardSchema";

jest.mock("expo-crypto", () => ({ randomUUID: () => "uuid-1" }));
jest.mock("../wizardApi", () => ({
  ...jest.requireActual("../wizardApi"),
  verifyFit: jest.fn(),
  submitApplication: jest.fn().mockResolvedValue(undefined),
}));

const verifyFitMock = verifyFit as jest.MockedFunction<typeof verifyFit>;
const submitMock = submitApplication as jest.MockedFunction<
  typeof submitApplication
>;

const passVerdict: FitVerdict = {
  outcome: "verified",
  rating: 4.8,
  reviewCount: 40,
  recommendedLevel: "Market Leader",
  place: { placeId: "p", name: "Smith Plumbing LLC" },
  offline: false,
};

const stepValues: Partial<WizardValues>[] = [
  { contact: "Jonah", email: "j@x.com", phone: "4045550134" },
  { business: "Smith Plumbing" },
  { trade: "Plumbing", yearsInBusiness: "4-9", licensedInsured: "yes" },
  { serviceArea: "Decatur", webLink: "smith.com" },
  { leadSource: "Paid ads", biggestChallenge: "Not enough leads" },
  { reviewsRange: "11 to 50", wantHelp: "More leads" },
  { painPoints: ["reviews"] },
];

// Skip the 700ms analyze floor: consecutive Date.now() calls advance 1s.
let now = 0;
beforeEach(() => {
  verifyFitMock.mockReset().mockResolvedValue(passVerdict);
  submitMock.mockClear();
  now = 0;
  jest.spyOn(Date, "now").mockImplementation(() => (now += 1000));
});
afterEach(() => jest.restoreAllMocks());

async function fillStep(
  result: { current: ReturnType<typeof useContractorWizard> },
  index: number,
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
      if (i < 6) expect(result.current.step).toBe(i + 2);
    }
    expect(result.current.phase).toBe("result");
    expect(result.current.verdict).toEqual(passVerdict);
    // handleSubmit passes resolver-TRANSFORMED values to verify.
    expect(verifyFitMock).toHaveBeenCalledWith(
      expect.objectContaining({ trade: "Plumbing" }),
    );
    expect(submitMock).toHaveBeenCalledWith(
      expect.objectContaining({ business: "Smith Plumbing" }),
      passVerdict,
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
      outcome: "unverified",
      rating: null,
      reviewCount: null,
      recommendedLevel: "Established Business",
      place: null,
      offline: true,
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
      }),
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
