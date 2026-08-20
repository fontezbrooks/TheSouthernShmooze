import { getSupabase } from "@/lib/supabase";
import type {
	ConciergeStepOneValues,
	ConciergeStepTwoValues,
} from "../conciergeSchema";
import {
	newSubmissionId,
	submitConciergeLead,
	submitPartialLead,
} from "../submitConcierge";

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
	notes: "Water heater out",
	trade: "Plumbing",
	zip: "30303",
};

const stepTwo: ConciergeStepTwoValues = {
	company: "",
	email: "jane@example.com",
	firstName: "Jane",
	lastName: "Doe",
	newsletterOptIn: true,
	phone: "5551234567",
};

beforeEach(() => jest.clearAllMocks());

describe("submitPartialLead (FR-4.2)", () => {
	it("inserts a partial row with job data and no contact fields", async () => {
		const { client, insert } = makeClient();
		mockedGetSupabase.mockReturnValue(client as never);

		const result = await submitPartialLead(stepOne, "test-uuid");

		expect(result).toEqual({ data: { id: "test-uuid" }, ok: true });
		expect(client.from).toHaveBeenCalledWith("leads");
		expect(insert).toHaveBeenCalledWith({
			id: "test-uuid",
			project_details: "Water heater out",
			stage: "partial",
			trade: "Plumbing",
			zip: "30303",
		});
	});

	it("stores null project_details when notes are empty", async () => {
		const { client, insert } = makeClient();
		mockedGetSupabase.mockReturnValue(client as never);

		await submitPartialLead({ ...stepOne, notes: "" }, "test-uuid");

		expect(insert).toHaveBeenCalledWith(
			expect.objectContaining({ project_details: null })
		);
	});

	it("returns err on insert failure", async () => {
		const { client } = makeClient({ insertError: { message: "boom" } });
		mockedGetSupabase.mockReturnValue(client as never);

		const result = await submitPartialLead(stepOne, "test-uuid");

		expect(result.ok).toBe(false);
	});

	it("returns a network error when the client throws", async () => {
		mockedGetSupabase.mockImplementation(() => {
			throw new Error("offline");
		});

		const result = await submitPartialLead(stepOne, "test-uuid");

		expect(result).toEqual({
			error: "Network error. Please check your connection and try again.",
			ok: false,
		});
	});
});

describe("submitConciergeLead (FR-4.1 completion)", () => {
	it("inserts a complete row referencing the partial", async () => {
		const { client, insert } = makeClient();
		mockedGetSupabase.mockReturnValue(client as never);

		const result = await submitConciergeLead(
			stepOne,
			stepTwo,
			"partial-id",
			"test-uuid"
		);

		expect(result).toEqual({ data: { id: "test-uuid" }, ok: true });
		expect(insert).toHaveBeenCalledWith({
			email: "jane@example.com",
			first_name: "Jane",
			id: "test-uuid",
			last_name: "Doe",
			newsletter_opt_in: true,
			partial_id: "partial-id",
			phone: "5551234567",
			project_details: "Water heater out",
			stage: "complete",
			trade: "Plumbing",
			zip: "30303",
		});
	});

	it("accepts a null partialId (step-1 save failed earlier)", async () => {
		const { client, insert } = makeClient();
		mockedGetSupabase.mockReturnValue(client as never);

		const result = await submitConciergeLead(
			stepOne,
			stepTwo,
			null,
			"test-uuid"
		);

		expect(result.ok).toBe(true);
		expect(insert).toHaveBeenCalledWith(
			expect.objectContaining({ partial_id: null })
		);
	});

	it("returns err on insert failure", async () => {
		const { client } = makeClient({ insertError: { message: "boom" } });
		mockedGetSupabase.mockReturnValue(client as never);

		const result = await submitConciergeLead(
			stepOne,
			stepTwo,
			null,
			"test-uuid"
		);

		expect(result.ok).toBe(false);
	});

	it("treats a duplicate-key retry as success (idempotent completion)", async () => {
		const { client } = makeClient({
			insertError: { code: "23505", message: "duplicate key value" },
		});
		mockedGetSupabase.mockReturnValue(client as never);

		const result = await submitConciergeLead(
			stepOne,
			stepTwo,
			"partial-id",
			"test-uuid"
		);

		expect(result).toEqual({ data: { id: "test-uuid" }, ok: true });
	});

	it("treats a duplicate-key partial retry as success too", async () => {
		const { client } = makeClient({
			insertError: { code: "23505", message: "duplicate key value" },
		});
		mockedGetSupabase.mockReturnValue(client as never);

		const result = await submitPartialLead(stepOne, "test-uuid");

		expect(result).toEqual({ data: { id: "test-uuid" }, ok: true });
	});

	it("newSubmissionId delegates to expo-crypto randomUUID", () => {
		expect(newSubmissionId()).toBe("test-uuid");
	});

	it("rejects a completion id equal to the partial id (would collide with its PK)", async () => {
		const { client, insert } = makeClient();
		mockedGetSupabase.mockReturnValue(client as never);

		const result = await submitConciergeLead(
			stepOne,
			stepTwo,
			"same-id",
			"same-id"
		);

		expect(result.ok).toBe(false);
		expect(insert).not.toHaveBeenCalled();
	});
});
