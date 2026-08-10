import { renderHook, act } from "@testing-library/react-native";
import {
  submitPartialLead,
  submitConciergeLead,
  newSubmissionId,
} from "../submitConcierge";
import { useConciergeForm } from "../useConciergeForm";

jest.mock("../submitConcierge", () => {
  let counter = 0;
  return {
    newSubmissionId: jest.fn(() => `uuid-${++counter}`),
    submitPartialLead: jest.fn(),
    submitConciergeLead: jest.fn(),
  };
});

const mockedPartial = submitPartialLead as jest.MockedFunction<
  typeof submitPartialLead
>;
const mockedComplete = submitConciergeLead as jest.MockedFunction<
  typeof submitConciergeLead
>;

const stepOne = { trade: "Plumbing", zip: "30303", notes: "Heater out" };
const stepTwo = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
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
  extra: Record<string, unknown> = {},
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
  mockedPartial.mockResolvedValue({ ok: true, data: { id: "partial-row" } });
  mockedComplete.mockResolvedValue({ ok: true, data: { id: "complete-row" } });
});

describe("useConciergeForm", () => {
  it("advance validates step 1, moves to contact, fires the partial lead", async () => {
    const { result } = await renderHook(() => useConciergeForm());

    await fillStepOne(result);

    expect(result.current.step).toBe("contact");
    expect(mockedPartial).toHaveBeenCalledWith(
      expect.objectContaining({ trade: "Plumbing", zip: "30303" }),
      expect.any(String),
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
    mockedPartial.mockResolvedValue({ ok: false, error: "down" });
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
    mockedComplete.mockResolvedValueOnce({ ok: false, error: "boom" });
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
      }) as never,
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
      resolvePartial({ ok: true, data: { id: "slow-partial" } });
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
      expect.objectContaining({ zip: "30044" }),
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
