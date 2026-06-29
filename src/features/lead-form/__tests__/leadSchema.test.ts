import { leadSchema, emptyLeadForm, BUDGET_OPTIONS } from "../leadSchema";

const valid = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "5551234567",
  address: "123 Peachtree St",
  budget: "lt_1000" as const,
  projectDetails: "Need a plumber for a leak.",
  company: "",
};

describe("leadSchema", () => {
  it("accepts a fully valid submission", () => {
    const result = leadSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts an omitted budget selection (optional)", () => {
    const { budget: _omit, ...withoutBudget } = valid;
    const result = leadSchema.safeParse(withoutBudget);
    expect(result.success).toBe(true);
  });

  it("accepts each single budget value", () => {
    for (const value of ["lt_1000", "1000_5000", "gt_5000"] as const) {
      expect(leadSchema.safeParse({ ...valid, budget: value }).success).toBe(
        true,
      );
    }
  });

  it.each([
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "projectDetails",
  ])("rejects when required field %s is empty", (field) => {
    const result = leadSchema.safeParse({ ...valid, [field]: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = leadSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short phone number", () => {
    const result = leadSchema.safeParse({ ...valid, phone: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown budget value", () => {
    const result = leadSchema.safeParse({ ...valid, budget: "nope" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-empty honeypot (company)", () => {
    const result = leadSchema.safeParse({ ...valid, company: "spam-bot" });
    expect(result.success).toBe(false);
  });

  it("exposes three budget options matching the Figma labels", () => {
    expect(BUDGET_OPTIONS.map((o) => o.label)).toEqual([
      "< $1,000",
      "$1,000 – $5,000",
      "> $5,000",
    ]);
  });

  it("emptyLeadForm is a valid starting shape", () => {
    // All-empty fails required checks, but the object shape must be parseable structurally.
    expect(emptyLeadForm.budget).toBeUndefined();
    expect(typeof emptyLeadForm.firstName).toBe("string");
  });
});
