import {
  wizardSchema,
  emptyWizard,
  webLinkMissing,
  STEP_FIELDS,
  STEP_COUNT,
  type WizardValues,
} from "../wizardSchema";

const validValues: WizardValues = {
  contact: "Jonah Smith",
  email: "jonah@example.com",
  phone: "(404) 555-0134",
  business: "Smith Plumbing",
  placeId: "place-1",
  placeAddress: "Decatur, GA",
  placeSession: "sess-1",
  trade: "Plumbing",
  yearsInBusiness: "4-9",
  licensedInsured: "yes",
  serviceArea: "Decatur",
  webLink: "smithplumbing.com",
  noWebsite: false,
  leadSource: "Word of mouth / referrals",
  biggestChallenge: "Not enough leads",
  reviewsRange: "11 to 50",
  wantHelp: "More leads",
  painPoints: ["reviews", "website"],
};

describe("wizardSchema", () => {
  test("accepts a complete valid application", () => {
    const res = wizardSchema.safeParse(validValues);
    expect(res.success).toBe(true);
  });

  test("trims whitespace on text fields", () => {
    const res = wizardSchema.parse({
      ...validValues,
      contact: "  Jonah  ",
      serviceArea: " Decatur ",
    });
    expect(res.contact).toBe("Jonah");
    expect(res.serviceArea).toBe("Decatur");
  });

  test.each([
    ["contact", ""],
    ["business", "  "],
    ["trade", ""],
    ["serviceArea", ""],
  ])("rejects empty %s", (field, value) => {
    const res = wizardSchema.safeParse({ ...validValues, [field]: value });
    expect(res.success).toBe(false);
  });

  test("rejects malformed email", () => {
    expect(
      wizardSchema.safeParse({ ...validValues, email: "not-an-email" }).success,
    ).toBe(false);
  });

  test("rejects short phone", () => {
    expect(
      wizardSchema.safeParse({ ...validValues, phone: "123" }).success,
    ).toBe(false);
  });

  test.each([
    "yearsInBusiness",
    "licensedInsured",
    "leadSource",
    "reviewsRange",
    "wantHelp",
    "biggestChallenge",
  ] as const)("rejects unselected %s", (field) => {
    const res = wizardSchema.safeParse({ ...validValues, [field]: "" });
    expect(res.success).toBe(false);
  });

  test("empty webLink and painPoints are valid (optional fields)", () => {
    const res = wizardSchema.safeParse({
      ...validValues,
      webLink: "",
      painPoints: [],
    });
    expect(res.success).toBe(true);
  });
});

describe("webLinkMissing (cross-field website rule)", () => {
  test("missing when no link and box unchecked", () => {
    expect(webLinkMissing({ webLink: "  ", noWebsite: false })).toBe(true);
  });
  test("ok when box checked", () => {
    expect(webLinkMissing({ webLink: "", noWebsite: true })).toBe(false);
  });
  test("ok when link present", () => {
    expect(webLinkMissing({ webLink: "x.com", noWebsite: false })).toBe(false);
  });
});

describe("STEP_FIELDS", () => {
  test("covers every schema field the user must fill", () => {
    const covered = new Set(STEP_FIELDS.flat());
    const hidden = ["placeId", "placeAddress", "placeSession", "noWebsite"];
    for (const key of Object.keys(emptyWizard)) {
      if (hidden.includes(key)) continue;
      expect(covered.has(key as keyof WizardValues)).toBe(true);
    }
    expect(STEP_COUNT).toBe(7);
  });
});
