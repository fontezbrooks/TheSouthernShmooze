import { getSupabase } from "@/lib/supabase";
import { submitPartialLead, submitConciergeLead } from "../submitConcierge";
import type {
  ConciergeStepOneValues,
  ConciergeStepTwoValues,
} from "../conciergeSchema";

jest.mock("@/lib/supabase", () => ({ getSupabase: jest.fn() }));
jest.mock("expo-crypto", () => ({ randomUUID: () => "test-uuid" }));

const mockedGetSupabase = getSupabase as jest.MockedFunction<
  typeof getSupabase
>;

function makeClient(opts: { insertError?: unknown } = {}) {
  const insert = jest
    .fn()
    .mockResolvedValue({ error: opts.insertError ?? null });
  const client = { from: jest.fn().mockReturnValue({ insert }) };
  return { client, insert };
}

const stepOne: ConciergeStepOneValues = {
  trade: "Plumbing",
  zip: "30303",
  notes: "Water heater out",
};

const stepTwo: ConciergeStepTwoValues = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "5551234567",
  newsletterOptIn: true,
  company: "",
};

beforeEach(() => jest.clearAllMocks());

describe("submitPartialLead (FR-4.2)", () => {
  it("inserts a partial row with job data and no contact fields", async () => {
    const { client, insert } = makeClient();
    mockedGetSupabase.mockReturnValue(client as never);

    const result = await submitPartialLead(stepOne);

    expect(result).toEqual({ ok: true, data: { id: "test-uuid" } });
    expect(client.from).toHaveBeenCalledWith("leads");
    expect(insert).toHaveBeenCalledWith({
      id: "test-uuid",
      stage: "partial",
      trade: "Plumbing",
      zip: "30303",
      project_details: "Water heater out",
    });
  });

  it("stores null project_details when notes are empty", async () => {
    const { client, insert } = makeClient();
    mockedGetSupabase.mockReturnValue(client as never);

    await submitPartialLead({ ...stepOne, notes: "" });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ project_details: null }),
    );
  });

  it("returns err on insert failure", async () => {
    const { client } = makeClient({ insertError: { message: "boom" } });
    mockedGetSupabase.mockReturnValue(client as never);

    const result = await submitPartialLead(stepOne);

    expect(result.ok).toBe(false);
  });

  it("returns a network error when the client throws", async () => {
    mockedGetSupabase.mockImplementation(() => {
      throw new Error("offline");
    });

    const result = await submitPartialLead(stepOne);

    expect(result).toEqual({
      ok: false,
      error: "Network error. Please check your connection and try again.",
    });
  });
});

describe("submitConciergeLead (FR-4.1 completion)", () => {
  it("inserts a complete row referencing the partial", async () => {
    const { client, insert } = makeClient();
    mockedGetSupabase.mockReturnValue(client as never);

    const result = await submitConciergeLead(stepOne, stepTwo, "partial-id");

    expect(result).toEqual({ ok: true, data: { id: "test-uuid" } });
    expect(insert).toHaveBeenCalledWith({
      id: "test-uuid",
      stage: "complete",
      trade: "Plumbing",
      zip: "30303",
      project_details: "Water heater out",
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      phone: "5551234567",
      newsletter_opt_in: true,
      partial_id: "partial-id",
    });
  });

  it("accepts a null partialId (step-1 save failed earlier)", async () => {
    const { client, insert } = makeClient();
    mockedGetSupabase.mockReturnValue(client as never);

    const result = await submitConciergeLead(stepOne, stepTwo, null);

    expect(result.ok).toBe(true);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ partial_id: null }),
    );
  });

  it("returns err on insert failure", async () => {
    const { client } = makeClient({ insertError: { message: "boom" } });
    mockedGetSupabase.mockReturnValue(client as never);

    const result = await submitConciergeLead(stepOne, stepTwo, null);

    expect(result.ok).toBe(false);
  });
});
