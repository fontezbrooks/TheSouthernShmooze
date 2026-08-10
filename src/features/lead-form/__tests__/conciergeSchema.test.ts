import {
  conciergeStepOneSchema,
  conciergeStepTwoSchema,
  emptyStepOne,
  emptyStepTwo,
} from "../conciergeSchema";

describe("conciergeStepOneSchema (FR-4.1 step 1: the job)", () => {
  const valid = { trade: "Plumbing", zip: "30303", notes: "Water heater out" };

  it("accepts a full step-1 payload", () => {
    expect(conciergeStepOneSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts missing notes (optional)", () => {
    const { notes: _notes, ...rest } = valid;
    expect(conciergeStepOneSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects an empty trade", () => {
    expect(
      conciergeStepOneSchema.safeParse({ ...valid, trade: " " }).success,
    ).toBe(false);
  });

  it.each(["3030", "303030", "abcde", "30 03"])(
    "rejects malformed zip %s",
    (zip) => {
      expect(conciergeStepOneSchema.safeParse({ ...valid, zip }).success).toBe(
        false,
      );
    },
  );

  it("empty defaults fail validation (nothing pre-filled passes)", () => {
    expect(conciergeStepOneSchema.safeParse(emptyStepOne).success).toBe(false);
  });
});

describe("conciergeStepTwoSchema (FR-4.1 step 2: contact)", () => {
  const valid = {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    phone: "5551234567",
    newsletterOptIn: true,
    company: "",
  };

  it("accepts a full step-2 payload", () => {
    expect(conciergeStepTwoSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a malformed email", () => {
    expect(
      conciergeStepTwoSchema.safeParse({ ...valid, email: "not-an-email" })
        .success,
    ).toBe(false);
  });

  it("rejects a too-short phone", () => {
    expect(
      conciergeStepTwoSchema.safeParse({ ...valid, phone: "123" }).success,
    ).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(
      conciergeStepTwoSchema.safeParse({ ...valid, company: "bot" }).success,
    ).toBe(false);
  });

  it("newsletter opt-in is required boolean (defaults object carries false)", () => {
    expect(emptyStepTwo.newsletterOptIn).toBe(false);
    const { newsletterOptIn: _n, ...rest } = valid;
    expect(conciergeStepTwoSchema.safeParse(rest).success).toBe(false);
  });
});
